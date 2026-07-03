import type { SupabaseClient } from "@supabase/supabase-js";

export async function requireWorkspace(supabase: SupabaseClient, user: {id:string}, minimum: "viewer"|"editor"|"admin"|"owner" = "viewer") {
  const { data, error } = await supabase.from("workspace_members").select("workspace_id,role").eq("user_id",user.id).order("created_at").limit(1).single();
  if (error || !data) throw new Error("Workspace not found");
  const levels = { viewer:0, editor:1, admin:2, owner:3 };
  if (levels[data.role as keyof typeof levels] < levels[minimum]) throw new Error("Forbidden: insufficient workspace role");
  return data as { workspace_id:string; role:keyof typeof levels };
}
