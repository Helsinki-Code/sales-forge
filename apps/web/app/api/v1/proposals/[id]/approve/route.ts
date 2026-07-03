import { decryptSecret, type EncryptedSecret } from "@seoforge/core";
import { approveAndMergePullRequest } from "@seoforge/integrations";
import { apiUser } from "@/lib/auth";
import { apiError, ok } from "@/lib/api-response";
import { requireWorkspace } from "@/lib/workspace";

export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){
  try{
    const auth=await apiUser();if(!auth)throw new Error("Authentication required");
    if(auth.tokenPrincipal)throw new Error("Approval and merge require an authenticated human UI session");
    const workspace=await requireWorkspace(auth.supabase,auth.user,"editor");
    const body=await request.json() as {explicitUiConfirmation?:boolean};
    if(body.explicitUiConfirmation!==true)throw new Error("Explicit UI confirmation is required");
    const {id}=await params;
    const {data:proposal}=await auth.supabase.from("proposals").select("*,sites!inner(*)").eq("id",id).eq("sites.workspace_id",workspace.workspace_id).single();
    if(!proposal)throw new Error("Proposal not found");
    if(proposal.state!=="ready")throw new Error("Proposal is not ready for approval");
    if(!proposal.pull_number||!proposal.head_sha)throw new Error("Proposal has no validated pull request");
    const{data:fileReviews=[]}=await auth.supabase.from("proposal_file_reviews").select("path,approved").eq("proposal_id",id);const approvedPaths=new Set((fileReviews||[]).filter(review=>review.approved).map(review=>review.path));const unreviewed=(proposal.changed_paths||[]).filter((path:string)=>!approvedPaths.has(path));if(unreviewed.length)throw new Error(`Review and approve every changed file first (${unreviewed.length} remaining)`);
    const {data:connection}=await auth.supabase.from("provider_connections").select("encrypted_credentials,label").eq("workspace_id",workspace.workspace_id).eq("provider","github").eq("status","active").limit(1).single();
    if(!connection)throw new Error("GitHub OAuth connection not found");
    const creds=decryptSecret<{token:string}>(connection.encrypted_credentials as EncryptedSecret,`${workspace.workspace_id}:github:${connection.label.toLowerCase().includes("oauth")?"oauth":connection.label}`);
    const site=proposal.sites as any;
    const {data:claimed,error:claimError}=await auth.supabase.from("proposals").update({state:"approved",updated_at:new Date().toISOString()}).eq("id",id).eq("state","ready").select("id").maybeSingle();
    if(claimError||!claimed)throw claimError||new Error("Proposal was already claimed for approval");
    const {error:approvalError}=await auth.supabase.from("approvals").insert({proposal_id:id,user_id:auth.user.id,decision:"approved",explicit_ui_confirmation:true,checks_snapshot:proposal.checks});
    if(approvalError){await auth.supabase.from("proposals").update({state:"ready",updated_at:new Date().toISOString()}).eq("id",id).eq("state","approved");throw approvalError;}
    try{
      const merge=await approveAndMergePullRequest({userToken:creds.token,userId:auth.user.id,owner:site.repository_owner,repo:site.repository_name,base:site.default_branch,headSha:proposal.head_sha,pullNumber:proposal.pull_number,state:"ready",explicitUiConfirmation:true});
      await auth.supabase.from("proposals").update({state:"merged",updated_at:new Date().toISOString()}).eq("id",id);
      await auth.supabase.from("audit_events").insert({workspace_id:workspace.workspace_id,actor_user_id:auth.user.id,action:"proposal.merged",target_type:"proposal",target_id:id,metadata:{pullNumber:proposal.pull_number,sha:merge.sha}});
      return ok({merged:true,sha:merge.sha,message:merge.message});
    }catch(error){
      await auth.supabase.from("proposals").update({state:"ready",updated_at:new Date().toISOString()}).eq("id",id).eq("state","approved");
      await auth.supabase.from("audit_events").insert({workspace_id:workspace.workspace_id,actor_user_id:auth.user.id,action:"proposal.merge_blocked",target_type:"proposal",target_id:id,metadata:{pullNumber:proposal.pull_number,reason:error instanceof Error?error.message:"GitHub rejected the merge"}});
      throw error;
    }
  }catch(error){return apiError(error);}
}
