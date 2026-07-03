import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { detectFramework, repositoryJobSchema } from "./runner.js";

describe("repository runner", () => {
  it("rejects non-GitHub repositories", () => {
    expect(() => repositoryJobSchema.parse({ repositoryUrl: "file:///etc", token: "x".repeat(30), baseBranch: "main", proposalId: crypto.randomUUID(), commitMessage: "test", patches: [] })).toThrow();
  });
  it("detects a validated Next.js repository", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "runner-test-"));
    try {
      await writeFile(path.join(root, "package.json"), JSON.stringify({ scripts: { build: "next build" }, dependencies: { next: "16" } }));
      expect((await detectFramework(root)).framework).toBe("nextjs");
    } finally { await rm(root, { recursive: true, force: true }); }
  });
});
