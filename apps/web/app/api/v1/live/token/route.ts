import { createLiveToken } from "@seoforge/agent-runtime";
import { apiUser } from "@/lib/auth";
import { apiError, ok } from "@/lib/api-response";
import { requireWorkspace } from "@/lib/workspace";

export async function POST() {
  try { const auth = await apiUser(); if (!auth) throw new Error("Authentication required"); const workspace = await requireWorkspace(auth.supabase,auth.user); return ok(await createLiveToken(auth.user.id,workspace.workspace_id)); }
  catch (error) { return apiError(error); }
}
