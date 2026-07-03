import { randomBytes } from "node:crypto";
import { githubInstallUrl } from "@seoforge/integrations";
import { apiUser } from "@/lib/auth";
import { apiError, ok } from "@/lib/api-response";
import { requireWorkspace } from "@/lib/workspace";

export async function GET() {
  try { const auth=await apiUser(); if(!auth) throw new Error("Authentication required"); const workspace=await requireWorkspace(auth.supabase,auth.user,"admin"); const state=`${workspace.workspace_id}.${randomBytes(16).toString("hex")}`; return ok({url:githubInstallUrl(state)}); }
  catch(error){ return apiError(error); }
}
