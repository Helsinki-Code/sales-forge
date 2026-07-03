import { randomBytes } from "node:crypto";
import { apiUser } from "@/lib/auth";
import { apiError, ok } from "@/lib/api-response";
import { requireWorkspace } from "@/lib/workspace";
import { safeFetch } from "@seoforge/core";

export async function POST(request: Request, { params }: { params: Promise<{ id:string }> }) {
  try {
    const auth = await apiUser(); if (!auth) throw new Error("Authentication required");
    const workspace = await requireWorkspace(auth.supabase, auth.user, "editor");
    const { id } = await params;
    const { data: site } = await auth.supabase.from("sites").select("*").eq("id",id).eq("workspace_id",workspace.workspace_id).single();
    if (!site) throw new Error("Site not found");
    if (new URL(request.url).searchParams.get("confirm") === "1") {
      const challenge = site.settings?.verificationChallenge;
      if (!challenge) throw new Error("Create a verification challenge first");
      const response = await safeFetch(`${new URL(site.url).origin}/.well-known/seoforge-verification.txt`, {}, 10_000);
      const content = (await response.text()).trim();
      if (!response.ok || content !== challenge) throw new Error("The deployed verification challenge does not match");
      await auth.supabase.from("sites").update({ verified_at:new Date().toISOString(), status:"active" }).eq("id",id);
      return ok({ verified:true, status:"active" });
    }
    const challenge = randomBytes(24).toString("hex");
    await auth.supabase.from("sites").update({ settings: { ...(site.settings || {}), verificationChallenge: challenge }, verification_method: "challenge" }).eq("id",id);
    return ok({ method:"challenge", path:`/.well-known/seoforge-verification.txt`, content:challenge, instructions:"Commit this exact challenge file through your repository, deploy it, then call this endpoint with ?confirm=1." });
  } catch (error) { return apiError(error); }
}
