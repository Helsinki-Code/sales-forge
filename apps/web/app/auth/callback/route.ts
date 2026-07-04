import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { TRIAL_ENTITLEMENTS } from "@seoforge/integrations";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  if (!code) return NextResponse.redirect(new URL("/login?error=missing_code", url));
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.user) return NextResponse.redirect(new URL("/login?error=oauth", url));
  let { data: membership } = await supabase.from("workspace_members").select("workspace_id").limit(1).maybeSingle();
  if (!membership) {
    const base = (data.user.user_metadata.user_name || data.user.email?.split("@")[0] || "workspace").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
    const { data: workspace, error: workspaceError } = await supabase.rpc("create_workspace", { workspace_name: `${data.user.user_metadata.user_name || "My"} Workspace`, workspace_slug: `${base}-${data.user.id.slice(0,6)}` });
    if (workspaceError) return NextResponse.redirect(new URL("/login?error=workspace", url));
    membership = { workspace_id: workspace.id };
  }
  if (membership) {
    await createSupabaseAdminClient().from("subscriptions").upsert({ workspace_id:membership.workspace_id, plan_key:"trial", status:"trialing", entitlements:TRIAL_ENTITLEMENTS }, { onConflict:"workspace_id", ignoreDuplicates:true });
  }
  return NextResponse.redirect(new URL("/dashboard/onboarding", url));
}
