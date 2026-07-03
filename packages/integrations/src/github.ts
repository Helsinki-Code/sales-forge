import { createAppAuth } from "@octokit/auth-app";
import { Octokit } from "@octokit/rest";
import { mayExecuteProductionMutation, type ApprovalState } from "@seoforge/core";

function privateKey(): string {
  const value = process.env.GITHUB_APP_PRIVATE_KEY;
  if (!value) throw new Error("GITHUB_APP_PRIVATE_KEY is required");
  return value.replace(/\\n/g, "\n");
}

export async function installationToken(installationId: number): Promise<string> {
  const appId = process.env.GITHUB_APP_ID;
  if (!appId) throw new Error("GITHUB_APP_ID is required");
  const auth = createAppAuth({ appId, privateKey: privateKey(), installationId });
  const result = await auth({ type: "installation" });
  return result.token;
}

export async function listInstallationRepositories(installationId: number) {
  const token = await installationToken(installationId);
  const octokit = new Octokit({ auth: token });
  const response = await octokit.apps.listReposAccessibleToInstallation({ per_page: 100 });
  return response.data.repositories.map((repo) => ({ id: repo.id, owner: repo.owner.login, name: repo.name, fullName: repo.full_name, private: repo.private, defaultBranch: repo.default_branch }));
}

const REPOSITORY_SNAPSHOT_ALLOW = [
  /(^|\/)package\.json$/, /(^|\/)pyproject\.toml$/, /(^|\/)requirements\.txt$/, /(^|\/)Cargo\.toml$/,
  /(^|\/)(next|astro|nuxt|svelte|vite|gatsby|hugo)\.config\.[a-z]+$/,
  /(^|\/)(layout|page|app|index|root|document|head|metadata|sitemap|robots)\.[jt]sx?$/,
  /(^|\/)(robots\.txt|sitemap\.xml|llms\.txt)$/,
  /(^|\/)(content|pages|posts|blog)\/.*\.(md|mdx)$/,
  /(^|\/)README\.md$/,
];

export async function readRepositorySnapshot(input: { installationId: number; owner: string; repo: string; ref: string; maxFiles?: number; maxBytes?: number }) {
  const token = await installationToken(input.installationId);
  const octokit = new Octokit({ auth: token });
  const tree = await octokit.git.getTree({ owner: input.owner, repo: input.repo, tree_sha: input.ref, recursive: "true" });
  const candidates = tree.data.tree
    .filter((item) => item.type === "blob" && item.path && (item.size || 0) <= 200_000 && REPOSITORY_SNAPSHOT_ALLOW.some((pattern) => pattern.test(item.path!)))
    .slice(0, input.maxFiles ?? 120);
  const files: { path: string; content: string; sha?: string }[] = [];
  let bytes = 0;
  for (const item of candidates) {
    if (!item.sha || !item.path) continue;
    const blob = await octokit.git.getBlob({ owner: input.owner, repo: input.repo, file_sha: item.sha });
    const content = blob.data.encoding === "base64" ? Buffer.from(blob.data.content, "base64").toString("utf8") : blob.data.content;
    bytes += Buffer.byteLength(content);
    if (bytes > (input.maxBytes ?? 1_500_000)) break;
    files.push({ path: item.path, content, sha: item.sha });
  }
  return { truncated: tree.data.truncated || files.length < candidates.length, files, defaultBranch: input.ref };
}

export async function createProposalPullRequest(input: {
  installationId: number; owner: string; repo: string; branch: string; base: string; title: string; body: string;
}) {
  const token = await installationToken(input.installationId);
  const octokit = new Octokit({ auth: token });
  const response = await octokit.pulls.create({ owner: input.owner, repo: input.repo, head: input.branch, base: input.base, title: input.title, body: input.body, draft: false });
  return { number: response.data.number, url: response.data.html_url, nodeId: response.data.node_id };
}

export async function repositorySafetyState(input: { userToken: string; owner: string; repo: string; headSha: string; baseBranch: string; pullNumber: number }) {
  const octokit = new Octokit({ auth: input.userToken });
  const [status, checks, pull, protection] = await Promise.all([
    octokit.repos.getCombinedStatusForRef({ owner: input.owner, repo: input.repo, ref: input.headSha }),
    octokit.checks.listForRef({ owner: input.owner, repo: input.repo, ref: input.headSha, per_page: 100 }),
    octokit.pulls.get({ owner: input.owner, repo: input.repo, pull_number: input.pullNumber }),
    octokit.repos.getBranchProtection({ owner: input.owner, repo: input.repo, branch: input.baseBranch }).catch(() => null),
  ]);
  const checkRuns = checks.data.check_runs;
  const checksSuccessful = checkRuns.length > 0 && checkRuns.every((check) => check.status === "completed" && ["success", "neutral", "skipped"].includes(check.conclusion || ""));
  const commitStatusesSuccessful = status.data.total_count > 0 && status.data.state === "success";
  return {
    checksPassing: (checksSuccessful || commitStatusesSuccessful) && !pull.data.draft && pull.data.mergeable !== false,
    branchProtectionPassing: Boolean(protection),
    mergeable: pull.data.mergeable,
    status: checksSuccessful ? "success" : status.data.state,
  };
}

export async function approveAndMergePullRequest(input: {
  userToken: string; userId: string; owner: string; repo: string; base: string; headSha: string; pullNumber: number;
  state: ApprovalState; explicitUiConfirmation: boolean;
}) {
  const safety = await repositorySafetyState({ userToken: input.userToken, owner: input.owner, repo: input.repo, headSha: input.headSha, baseBranch: input.base, pullNumber: input.pullNumber });
  if (!mayExecuteProductionMutation({ ...safety, explicitUiConfirmation: input.explicitUiConfirmation, authenticatedUserId: input.userId, state: input.state })) {
    throw new Error(`Merge blocked: status=${safety.status}, protected=${safety.branchProtectionPassing}, mergeable=${safety.mergeable}`);
  }
  const octokit = new Octokit({ auth: input.userToken });
  await octokit.pulls.createReview({ owner: input.owner, repo: input.repo, pull_number: input.pullNumber, event: "APPROVE", body: "Approved explicitly through SEOForge after all required checks passed." });
  const merge = await octokit.pulls.merge({ owner: input.owner, repo: input.repo, pull_number: input.pullNumber, merge_method: "squash", sha: input.headSha });
  if (!merge.data.merged) throw new Error(merge.data.message || "GitHub refused to merge the pull request");
  return merge.data;
}

export function githubInstallUrl(state: string): string {
  const slug = process.env.GITHUB_APP_SLUG;
  if (!slug) throw new Error("GITHUB_APP_SLUG is required");
  return `https://github.com/apps/${encodeURIComponent(slug)}/installations/new?state=${encodeURIComponent(state)}`;
}
