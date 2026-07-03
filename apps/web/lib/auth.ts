import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "./supabase/server";
import { createClient } from "@supabase/supabase-js";
import { headers } from "next/headers";
import { publicEnv } from "./env";
import { hashApiToken, type AuthPrincipal } from "@seoforge/core";
import { createSupabaseAdminClient } from "./supabase/admin";

function ipv4Number(value:string){const parts=value.split(".").map(Number);if(parts.length!==4||parts.some(part=>!Number.isInteger(part)||part<0||part>255))return null;return parts.reduce((sum,part)=>(sum*256+part)>>>0,0)}
function ipAllowed(ip:string|undefined,rules:string[]){if(!rules.length)return true;if(!ip)return false;return rules.some(rule=>{const[network,bitsRaw]=rule.split("/");if(!network)return false;if(!bitsRaw)return network===ip;const address=ipv4Number(ip),base=ipv4Number(network);if(address===null||base===null)return rule===`${ip}/128`;const bits=Number(bitsRaw);if(bits<0||bits>32)return false;const mask=bits===0?0:(0xffffffff<<(32-bits))>>>0;return(address&mask)===(base&mask)})}

export async function requireUser() {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/login");
  return { supabase, user };
}

export async function apiUser() {
  const authorization = (await headers()).get("authorization");
  if (authorization?.startsWith("Bearer ")) {
    const token = authorization.slice(7);
    if(token.startsWith("sf_test_")||token.startsWith("sf_live_")){
      const admin=createSupabaseAdminClient();const{data,error}=await admin.from("api_tokens").select("*").eq("token_hash",hashApiToken(token)).is("revoked_at",null).gt("expires_at",new Date().toISOString()).maybeSingle();
      const requestHeaders=await headers();const ip=requestHeaders.get("cf-connecting-ip")||requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim();
      if(error||!data||!ipAllowed(ip,data.ip_allowlist||[]))return null;
      const principal:AuthPrincipal={kind:"service_token",subject:data.id,workspaceId:data.workspace_id,environment:data.environment,scopes:data.scopes,siteIds:data.site_ids?.length?data.site_ids:undefined};
      void admin.from("api_tokens").update({last_used_at:new Date().toISOString()}).eq("id",data.id);
      return{supabase:admin,user:{id:data.created_by},tokenPrincipal:principal};
    }
    const env = publicEnv();
    const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, { global: { headers: { Authorization: authorization } }, auth: { persistSession: false } });
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return null;
    return { supabase, user, tokenPrincipal:undefined };
  }
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return { supabase, user, tokenPrincipal:undefined };
}

export async function currentWorkspace() {
  const auth = await requireUser();
  const { data } = await auth.supabase.from("workspace_members").select("workspace_id,role,workspaces(id,name,slug)").order("created_at").limit(1).maybeSingle();
  return { ...auth, membership: data };
}
