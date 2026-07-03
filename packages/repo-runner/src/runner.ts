import { mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { z } from "zod";

export const repositoryJobSchema = z.object({
  repositoryUrl: z.string().regex(/^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+(?:\.git)?$/),
  token: z.string().min(20),
  baseBranch: z.string().min(1).max(255),
  proposalId: z.string().uuid(),
  commitMessage: z.string().min(3).max(200),
  patches: z.array(z.object({ path: z.string().min(1).max(1024), content: z.string().max(5_000_000) })).max(500),
});

export type RepositoryJob = z.infer<typeof repositoryJobSchema>;

export type Framework = "nextjs" | "astro" | "nuxt" | "sveltekit" | "gatsby" | "hugo" | "jekyll" | "wordpress" | "generic_node" | "unknown";

async function exec(command: string, args: string[], cwd: string, env: NodeJS.ProcessEnv = {}, timeoutMs = 600_000) {
  return new Promise<{ stdout: string; stderr: string }>((resolve, reject) => {
    const child = spawn(command, args, { cwd, env: { PATH: process.env.PATH, HOME: process.env.HOME, CI: "true", ...env }, shell: false, stdio: ["ignore", "pipe", "pipe"] });
    let stdout = ""; let stderr = "";
    child.stdout.on("data", (chunk) => { stdout += String(chunk).slice(0, 100_000); });
    child.stderr.on("data", (chunk) => { stderr += String(chunk).slice(0, 100_000); });
    const timer = setTimeout(() => { child.kill("SIGKILL"); reject(new Error(`${command} timed out`)); }, timeoutMs);
    child.on("error", reject);
    child.on("close", (code) => { clearTimeout(timer); code === 0 ? resolve({ stdout, stderr }) : reject(new Error(`${command} exited ${code}: ${stderr.slice(-4000)}`)); });
  });
}

async function exists(root: string, relative: string) {
  try { return (await stat(path.join(root, relative))).isFile(); } catch { return false; }
}

export async function detectFramework(root: string): Promise<{ framework: Framework; commands: string[][] }> {
  if (await exists(root, "package.json")) {
    const pkg = JSON.parse(await readFile(path.join(root, "package.json"), "utf8")) as { scripts?: Record<string, string>; dependencies?: Record<string, string>; devDependencies?: Record<string, string> };
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    const framework: Framework = deps.next ? "nextjs" : deps.astro ? "astro" : deps.nuxt ? "nuxt" : deps["@sveltejs/kit"] ? "sveltekit" : deps.gatsby ? "gatsby" : "generic_node";
    const commands: string[][] = [["npm", "ci", "--ignore-scripts"]];
    for (const script of ["lint", "test", "typecheck", "build"]) if (pkg.scripts?.[script]) commands.push(["npm", "run", script]);
    if (!pkg.scripts?.build) return { framework: "unknown", commands: [] };
    return { framework, commands };
  }
  if (await exists(root, "hugo.toml") || await exists(root, "config.toml")) return { framework: "hugo", commands: [["hugo", "--minify"]] };
  if (await exists(root, "_config.yml") && await exists(root, "Gemfile")) return { framework: "jekyll", commands: [["bundle", "exec", "jekyll", "build"]] };
  if (await exists(root, "wp-config.php")) return { framework: "wordpress", commands: [] };
  return { framework: "unknown", commands: [] };
}

function safeTarget(root: string, relative: string): string {
  if (path.isAbsolute(relative) || relative.includes("\0")) throw new Error(`Unsafe patch path: ${relative}`);
  const target = path.resolve(root, relative);
  const prefix = `${path.resolve(root)}${path.sep}`;
  if (!target.startsWith(prefix)) throw new Error(`Patch escapes repository: ${relative}`);
  if (relative === ".git" || relative.startsWith(".git/")) throw new Error("Patches may not modify .git");
  return target;
}

export async function runRepositoryJob(raw: unknown) {
  const job = repositoryJobSchema.parse(raw);
  const root = await mkdtemp(path.join(process.env.RUNNER_WORK_ROOT || tmpdir(), "seoforge-"));
  const branch = `seo-agent/${job.proposalId}`;
  const basic = Buffer.from(`x-access-token:${job.token}`).toString("base64");
  const gitAuthEnv = { GIT_CONFIG_COUNT:"1", GIT_CONFIG_KEY_0:"http.https://github.com/.extraheader", GIT_CONFIG_VALUE_0:`AUTHORIZATION: basic ${basic}` };
  try {
    await exec("git", ["clone", "--depth", "1", "--branch", job.baseBranch, "--", job.repositoryUrl, root], process.cwd(), gitAuthEnv);
    const detected = await detectFramework(root);
    if (detected.framework === "unknown" || detected.commands.length === 0) throw new Error("Repository is analysis-only: no reliable validation adapter was detected");
    await exec("git", ["checkout", "-b", branch], root);
    for (const patch of job.patches) {
      const target = safeTarget(root, patch.path);
      await import("node:fs/promises").then(({ mkdir }) => mkdir(path.dirname(target), { recursive: true }));
      await writeFile(target, patch.content, { encoding: "utf8", flag: "w" });
    }
    const validation: { command: string; ok: boolean; output: string }[] = [];
    for (const [command, ...args] of detected.commands) {
      try { const result = await exec(command!, args, root); validation.push({ command: [command, ...args].join(" "), ok: true, output: `${result.stdout}\n${result.stderr}`.slice(-10_000) }); }
      catch (error) { validation.push({ command: [command, ...args].join(" "), ok: false, output: error instanceof Error ? error.message : String(error) }); throw error; }
    }
    await exec("git", ["add", "--all"], root);
    const diff = await exec("git", ["diff", "--cached", "--stat"], root);
    if (!diff.stdout.trim()) throw new Error("Proposal produced no repository changes");
    await exec("git", ["-c", "user.name=SEOForge Bot", "-c", "user.email=bot@seoforge.app", "commit", "-m", job.commitMessage], root);
    await exec("git", ["push", "origin", `HEAD:refs/heads/${branch}`], root, gitAuthEnv, 120_000);
    const sha = (await exec("git", ["rev-parse", "HEAD"], root)).stdout.trim();
    return { branch, sha, framework: detected.framework, validation, diffStat: diff.stdout };
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}
