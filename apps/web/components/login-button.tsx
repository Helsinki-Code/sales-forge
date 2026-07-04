"use client";
import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function LoginButton() {
  const [loading,setLoading] = useState(false);
  return <button className="button primary" style={{width:"100%"}} disabled={loading} onClick={async () => {
    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signInWithOAuth({ provider: "github", options: { redirectTo: `${location.origin}/auth/callback`, scopes: "read:user user:email" } });
  }}>{loading ? "Redirecting…" : "Continue with GitHub"}</button>;
}
