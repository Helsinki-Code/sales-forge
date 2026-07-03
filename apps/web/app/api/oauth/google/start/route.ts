import { randomBytes } from "node:crypto";
import { googleAuthorizationUrl } from "@seoforge/integrations";
import { apiUser } from "@/lib/auth";
import { apiError } from "@/lib/api-response";
import { requireWorkspace } from "@/lib/workspace";
export async function GET(){try{const auth=await apiUser();if(!auth)throw new Error("Authentication required");const workspace=await requireWorkspace(auth.supabase,auth.user,"admin");const state=`${workspace.workspace_id}.${randomBytes(16).toString("hex")}`;return Response.redirect(googleAuthorizationUrl(state));}catch(error){return apiError(error);}}
