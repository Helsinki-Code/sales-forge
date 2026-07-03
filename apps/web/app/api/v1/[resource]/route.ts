import { encryptSecret, hasScope, type ApiScope } from "@seoforge/core";
import { providerConnectionSchema, runCreateSchema, siteCreateSchema } from "@seoforge/core";
import { apiUser } from "@/lib/auth";
import { apiError, created, ok } from "@/lib/api-response";
import { agentQueue } from "@/lib/queue";
import { requireWorkspace } from "@/lib/workspace";

const tableByResource = {
  sites: "sites", providers: "provider_connections", audits: "agent_runs", runs: "agent_runs", findings: "findings",
  experiments: "experiments", proposals: "proposals", approvals: "approvals", deployments: "deployments", usage: "usage_ledger",
} as const;
const readScopeByResource:Record<string,ApiScope>={sites:"sites:read",audits:"runs:read",runs:"runs:read",findings:"findings:read",experiments:"findings:read",proposals:"proposals:read",approvals:"proposals:read",deployments:"proposals:read",usage:"usage:read"};

export async function GET(request: Request, context: { params: Promise<{ resource: string }> }) {
  try {
    const auth = await apiUser(); if (!auth) throw new Error("Authentication required");
    const { resource } = await context.params;
    const table = tableByResource[resource as keyof typeof tableByResource];
    if (!table) return Response.json({ error: { code: "not_found", message: "Unknown resource" } }, { status: 404 });
    if(auth.tokenPrincipal&&!readScopeByResource[resource])throw new Error("This resource is unavailable to service tokens");
    if(auth.tokenPrincipal&&!hasScope(auth.tokenPrincipal,readScopeByResource[resource]!))throw new Error("Forbidden: token scope is insufficient");
    const workspace = auth.tokenPrincipal?{workspace_id:auth.tokenPrincipal.workspaceId,role:"viewer" as const}:await requireWorkspace(auth.supabase, auth.user);
    const url = new URL(request.url); const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit") || 50)));
    let query: any;
    if (["sites","provider_connections","usage_ledger"].includes(table)) query = auth.supabase.from(table).select("*").eq("workspace_id",workspace.workspace_id);
    else if (table === "approvals") query = auth.supabase.from(table).select("*,proposals!inner(site_id,sites!inner(workspace_id))").eq("proposals.sites.workspace_id",workspace.workspace_id);
    else query = auth.supabase.from(table).select("*,sites!inner(workspace_id,name)").eq("sites.workspace_id",workspace.workspace_id);
    if(auth.tokenPrincipal?.siteIds?.length&&!["sites","provider_connections","usage_ledger"].includes(table))query=query.in("site_id",auth.tokenPrincipal.siteIds);
    const orderColumn=table==="deployments"?"started_at":table==="usage_ledger"?"occurred_at":table==="agent_runs"?"queued_at":"created_at";
    const { data, error } = await query.order(orderColumn,{ascending:false}).limit(limit);
    if (error) throw error;
    return ok(data);
  } catch (error) { return apiError(error); }
}

export async function POST(request: Request, context: { params: Promise<{ resource: string }> }) {
  try {
    const auth = await apiUser(); if (!auth) throw new Error("Authentication required");
    const { resource } = await context.params;
    if(auth.tokenPrincipal&&!["sites","runs","audits"].includes(resource))throw new Error("Service tokens cannot mutate this resource");
    if(auth.tokenPrincipal&&resource==="sites"&&!hasScope(auth.tokenPrincipal,"sites:write"))throw new Error("Forbidden: token scope is insufficient");
    if(auth.tokenPrincipal&&["runs","audits"].includes(resource)&&!hasScope(auth.tokenPrincipal,"runs:write"))throw new Error("Forbidden: token scope is insufficient");
    const workspace = auth.tokenPrincipal?{workspace_id:auth.tokenPrincipal.workspaceId,role:"editor" as const}:await requireWorkspace(auth.supabase, auth.user, resource === "providers" ? "admin" : "editor");
    const body = await request.json();
    if (resource === "sites") {
      const input = siteCreateSchema.parse({ ...body, workspaceId: workspace.workspace_id });
      const { data, error } = await auth.supabase.from("sites").insert({
        workspace_id: input.workspaceId, name: input.name, url: input.url, repository_owner: input.repositoryOwner,
        repository_name: input.repositoryName, default_branch: input.defaultBranch, github_installation_id: input.githubInstallationId,
        deployment_provider: input.deploymentProvider, site_type:body.siteType||"other", readiness:{ready:false,checks:{repositoryPermission:true,ownership:false,providers:false,branchProtection:false,validation:false}}, settings: { autonomousProposals: false, agentConcurrency: 3 },
      }).select().single();
      if (error) throw error;const keywords=Array.isArray(body.initialKeywords)?body.initialKeywords.slice(0,100).filter((x:unknown)=>typeof x==="string"&&x.trim()):[];if(keywords.length)await auth.supabase.from("tracked_queries").insert(keywords.map((query:string,index:number)=>({site_id:data.id,query:query.trim(),priority:index<10?1:3})));const competitors=Array.isArray(body.competitors)?body.competitors.slice(0,50).filter((x:unknown)=>typeof x==="string"&&x.trim()):[];if(competitors.length)await auth.supabase.from("competitors").insert(competitors.map((domain:string)=>({site_id:data.id,domain:domain.replace(/^https?:\/\//,"").replace(/\/$/,"")})));return created(data);
    }
    if (resource === "providers") {
      const input = providerConnectionSchema.parse({ ...body, workspaceId: workspace.workspace_id });
      const encrypted = encryptSecret(input.credentials, `${workspace.workspace_id}:${input.provider}:${input.label}`);
      const { data, error } = await auth.supabase.from("provider_connections").upsert({ workspace_id: workspace.workspace_id, provider: input.provider, label: input.label, encrypted_credentials: encrypted, status: "active", last_verified_at: new Date().toISOString() }, { onConflict: "workspace_id,provider,label" }).select("id,provider,label,status,last_verified_at").single();
      if (error) throw error; return created(data);
    }
    if (resource === "runs" || resource === "audits") {
      const input = runCreateSchema.parse({
        ...body,
        kind: resource === "audits" ? "weekly_audit" : body.kind,
        roles: resource === "audits" && !body.roles ? ["site_cartographer","technical_seo","serp_competitor","content_geo","media_studio","qa_policy","analytics_experiment"] : body.roles,
      });
      const { data: site } = await auth.supabase.from("sites").select("id,workspace_id").eq("id",input.siteId).eq("workspace_id",workspace.workspace_id).single();
      if (!site) throw new Error("Site not found");
      if(auth.tokenPrincipal&&!hasScope(auth.tokenPrincipal,"runs:write",input.siteId))throw new Error("Forbidden: token is not allowed for this site");
      const { data, error } = await auth.supabase.from("agent_runs").insert({ site_id: input.siteId, requested_by: auth.user.id, kind: input.kind, status: "queued", roles: input.roles, dry_run: input.dryRun }).select().single();
      if (error) throw error;
      await agentQueue().add("agent-run", { runId: data.id }, { jobId: data.id, attempts: 3, backoff: { type: "exponential", delay: 10_000 }, removeOnComplete: 100, removeOnFail: 500 });
      return created(data);
    }
    return Response.json({ error: { code: "method_not_allowed", message: "This resource is read-only" } }, { status: 405 });
  } catch (error) { return apiError(error); }
}
