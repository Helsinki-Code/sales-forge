import { z } from "zod";

export const idSchema = z.string().uuid();
export const urlSchema = z.string().url().refine((value) => /^https?:\/\//i.test(value), "HTTP(S) URL required");

export const roleSchema = z.enum([
  "supervisor",
  "site_cartographer",
  "technical_seo",
  "serp_competitor",
  "content_geo",
  "media_studio",
  "repository_engineer",
  "qa_policy",
  "analytics_experiment",
]);

export type AgentRole = z.infer<typeof roleSchema>;

export const prioritySchema = z.enum(["critical", "high", "medium", "low", "info"]);
export const riskSchema = z.enum(["low", "medium", "high", "critical"]);
export const runStatusSchema = z.enum([
  "queued",
  "running",
  "awaiting_approval",
  "completed",
  "failed",
  "cancelled",
]);

export const evidenceSchema = z.object({
  kind: z.enum(["crawl", "serp", "search_console", "analytics", "repository", "performance", "citation", "user"]),
  sourceUrl: urlSchema.optional(),
  sourcePath: z.string().max(1024).optional(),
  capturedAt: z.string().datetime(),
  summary: z.string().min(1).max(4000),
  contentHash: z.string().min(16).max(128),
  payload: z.record(z.string(), z.unknown()).default({}),
});

export const findingSchema = z.object({
  title: z.string().min(3).max(180),
  description: z.string().min(1).max(8000),
  category: z.enum(["technical", "content", "schema", "performance", "serp", "geo", "media", "security", "analytics"]),
  priority: prioritySchema,
  confidence: z.number().min(0).max(1),
  affectedUrls: z.array(urlSchema).max(500).default([]),
  evidence: z.array(evidenceSchema).min(1),
  recommendation: z.string().min(1).max(8000),
  expectedImpact: z.string().max(2000),
});

export const proposalSchema = z.object({
  title: z.string().min(3).max(180),
  summary: z.string().min(1).max(8000),
  risk: riskSchema,
  findingIds: z.array(idSchema).default([]),
  changedPaths: z.array(z.string().min(1).max(1024)).max(500),
  validationCommands: z.array(z.string().min(1).max(500)).max(30),
  expectedImpact: z.string().max(2000),
  rollbackPlan: z.string().min(1).max(4000),
  requiresHumanApproval: z.literal(true),
});

export const agentReportSchema = z.object({
  role: roleSchema,
  summary: z.string().min(1).max(8000),
  findings: z.array(findingSchema).max(100),
  proposals: z.array(proposalSchema).max(30),
  warnings: z.array(z.string().max(2000)).max(100),
  sources: z.array(urlSchema).max(200),
});

export type Evidence = z.infer<typeof evidenceSchema>;
export type Finding = z.infer<typeof findingSchema>;
export type Proposal = z.infer<typeof proposalSchema>;
export type AgentReport = z.infer<typeof agentReportSchema>;

export const siteCreateSchema = z.object({
  workspaceId: idSchema,
  name: z.string().min(2).max(100),
  url: urlSchema,
  publishingTarget: z.discriminatedUnion("type", [
    z.object({
      type: z.literal("github"),
      repositoryOwner: z.string().min(1).max(100),
      repositoryName: z.string().min(1).max(100),
      defaultBranch: z.string().min(1).max(255).default("main"),
      githubInstallationId: z.coerce.number().int().positive(),
    }),
    z.object({
      type: z.literal("wordpress"),
      apiUrl: urlSchema,
      username: z.string().min(1).max(200),
      applicationPassword: z.string().min(8).max(1000),
    }),
  ]),
});

export const runCreateSchema = z.object({
  siteId: idSchema,
  kind: z.enum(["post_deploy", "daily_rank", "weekly_audit", "monthly_strategy", "manual"]),
  roles: z.array(roleSchema).min(1).default(["supervisor"]),
  dryRun: z.boolean().default(true),
});

export const providerConnectionSchema = z.object({
  workspaceId: idSchema,
  provider: z.enum(["dataforseo", "google", "bing", "github", "wordpress"]),
  label: z.string().min(1).max(100),
  credentials: z.record(z.string(), z.string().max(10000)),
});

export const usageDimensionSchema = z.enum([
  "site",
  "tracked_query",
  "crawl_page",
  "agent_run",
  "image",
  "audio_second",
  "video_second",
  "storage_byte",
]);

export const mediaManifestSchema = z.object({
  id: idSchema,
  siteId: idSchema,
  kind: z.enum(["image", "audio", "video"]),
  sourceArticleUrl: urlSchema.optional(),
  storageUrl: urlSchema,
  mimeType: z.string(),
  bytes: z.number().int().nonnegative(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  durationSeconds: z.number().positive().optional(),
  altText: z.string().max(125).optional(),
  transcriptUrl: urlSchema.optional(),
  promptHash: z.string().min(16),
  contentHash: z.string().min(16),
  model: z.string(),
  createdAt: z.string().datetime(),
});

export type SiteCreateInput = z.infer<typeof siteCreateSchema>;
export type RunCreateInput = z.infer<typeof runCreateSchema>;
export type ProviderConnectionInput = z.infer<typeof providerConnectionSchema>;
export type MediaManifest = z.infer<typeof mediaManifestSchema>;
