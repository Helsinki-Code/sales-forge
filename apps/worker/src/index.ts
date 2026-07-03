import { Worker, Queue } from "bullmq";
import { createHmac } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { GoogleAuth } from "google-auth-library";
import { calculateHealthScore, decryptSecret, redactSecrets, sha256, type AgentRole, type EncryptedSecret, type HealthCategory } from "@seoforge/core";
import { auditPage, DataForSeoClient, findingsFromSnapshot, inspectDiscoveryFiles } from "@seoforge/seo-geo";
import { FULL_AUDIT_ROLES, generateImage, generateNarration, generateRepositoryPatch, generateShortVideo, profileBrand, runAgentTeam } from "@seoforge/agent-runtime";
import { createProposalPullRequest, installationToken, putArtifact, querySearchConsole, readRepositorySnapshot, refreshGoogleAccessToken } from "@seoforge/integrations";

if (!process.env.REDIS_URL || !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) throw new Error("Worker requires REDIS_URL, NEXT_PUBLIC_SUPABASE_URL, and SUPABASE_SERVICE_ROLE_KEY");
const redisUrl = new URL(process.env.REDIS_URL);
const connection = { host:redisUrl.hostname, port:Number(redisUrl.port||6379), username:redisUrl.username||undefined, password:redisUrl.password||undefined, tls:redisUrl.protocol==="rediss:"?{}:undefined };
const queue = new Queue("seoforge-agent-runs",{connection});
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false}});
const googleAuth = new GoogleAuth();

async function executeRunner(input:unknown){const url=process.env.RUNNER_URL;const secret=process.env.RUNNER_SHARED_SECRET;if(!url||!secret)throw new Error("Isolated runner service is not configured");const body=JSON.stringify(input);const signature=createHmac("sha256",secret).update(body).digest("hex");const headers:Record<string,string>={"content-type":"application/json","x-seoforge-signature":signature};if(process.env.RUNNER_GOOGLE_AUTH==="true"){const audience=new URL(url).origin;const client=await googleAuth.getIdTokenClient(audience);const identityHeaders=await client.getRequestHeaders();const authorization=identityHeaders.get("authorization");if(!authorization)throw new Error("Cloud Run identity token could not be created");headers.authorization=authorization;}const response=await fetch(`${url.replace(/\/$/,"")}/v1/jobs`,{method:"POST",headers,body,signal:AbortSignal.timeout(900_000)});const result=await response.json() as any;if(!response.ok)throw new Error(result.error||`Runner HTTP ${response.status}`);return result.data;}

async function captureEvidence(siteId:string,runId:string,snapshot:any,kind="crawl"){
  const {data,error}=await db.from("evidence_snapshots").insert({site_id:siteId,run_id:runId,kind,source_url:snapshot.url,captured_at:snapshot.capturedAt||new Date().toISOString(),summary:`HTTP ${snapshot.status}; ${snapshot.bytes} bytes`,content_hash:snapshot.contentHash,payload:{status:snapshot.status,title:snapshot.title,canonical:snapshot.canonical,h1:snapshot.h1}}).select().single();
  if(error)throw error;return data;
}

async function storeFinding(siteId:string,runId:string,role:string,finding:any,evidenceIds:string[]){
  const {data,error}=await db.from("findings").insert({site_id:siteId,run_id:runId,role,title:finding.title,description:finding.description,category:finding.category,priority:finding.priority,confidence:finding.confidence,affected_urls:finding.affectedUrls||[],recommendation:finding.recommendation,expected_impact:finding.expectedImpact,evidence_ids:evidenceIds}).select().single();
  if(error)throw error;return data;
}

async function notify(workspaceId:string,eventType:string,payload:Record<string,unknown>){const{data:destinations=[]}=await db.from("notification_destinations").select("*").eq("workspace_id",workspaceId).eq("active",true).contains("events",[eventType]);for(const destination of destinations||[]){const payloadText=JSON.stringify({id:crypto.randomUUID(),type:eventType,createdAt:new Date().toISOString(),data:payload}),deliveryHash=sha256(payloadText);const{data:delivery}=await db.from("notification_deliveries").insert({destination_id:destination.id,event_type:eventType,payload_hash:deliveryHash,status:"delivering",attempts:1}).select("id").single();try{const config=decryptSecret<any>(destination.encrypted_config as EncryptedSecret,`${workspaceId}:notification:${destination.channel}:${destination.label}`);let response:Response;if(destination.channel==="email"){if(!process.env.RESEND_API_KEY||!process.env.RESEND_FROM)throw new Error("Resend is not configured");response=await fetch("https://api.resend.com/emails",{method:"POST",headers:{authorization:`Bearer ${process.env.RESEND_API_KEY}`,"content-type":"application/json"},body:JSON.stringify({from:process.env.RESEND_FROM,to:[config.email],subject:`SEOForge: ${eventType.replaceAll("_"," ")}`,text:payloadText})})}else if(destination.channel==="slack")response=await fetch(config.webhookUrl,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({text:`SEOForge ${eventType.replaceAll("_"," ")}`,blocks:[{type:"section",text:{type:"mrkdwn",text:`*SEOForge ${eventType.replaceAll("_"," ")}*\n\`${payloadText.slice(0,2500)}\``}}]})});else{const signature=createHmac("sha256",config.signingSecret).update(payloadText).digest("hex");response=await fetch(config.url,{method:"POST",headers:{"content-type":"application/json","x-seoforge-signature":`sha256=${signature}`,"x-seoforge-event":eventType},body:payloadText})}if(!response.ok)throw new Error(`Destination HTTP ${response.status}`);await db.from("notification_deliveries").update({status:"delivered",delivered_at:new Date().toISOString()}).eq("id",delivery?.id)}catch(error){await db.from("notification_deliveries").update({status:"failed",last_error:redactSecrets(error instanceof Error?error.message:String(error))}).eq("id",delivery?.id)}}}

const categoryMap:Record<string,HealthCategory>={technical:"technical",content:"content",on_page:"onPage",schema:"schema",performance:"performance",geo:"aiReadiness",ai_readiness:"aiReadiness",images:"images",accessibility:"technical",links:"onPage"};
async function persistHealthScore(siteId:string,findings:any[]){const scores:Record<HealthCategory,number>={technical:100,content:100,onPage:100,schema:100,performance:100,aiReadiness:100,images:100};const penalty={critical:35,high:20,medium:10,low:4}as Record<string,number>;for(const finding of findings){const category=categoryMap[String(finding.category).toLowerCase()]||"content";scores[category]=Math.max(0,scores[category]-(penalty[finding.priority]||5)*Number(finding.confidence||1))}const result=calculateHealthScore(scores);await db.from("site_health_scores").insert({site_id:siteId,score:result.score,categories:scores,evidence_ids:findings.flatMap(f=>f.evidence_ids||[])});return result.score}

async function runDataForSeo(site:any,run:any,workspaceId:string){
  const {data:connection}=await db.from("provider_connections").select("*").eq("workspace_id",workspaceId).eq("provider","dataforseo").eq("status","active").limit(1).maybeSingle();
  if(!connection)return {warning:"DataForSEO is not connected"};
  const creds=decryptSecret<{login:string;password:string}>(connection.encrypted_credentials as EncryptedSecret,`${workspaceId}:dataforseo:${connection.label}`);
  const client=new DataForSeoClient(creds);const {data:queries=[]}=await db.from("tracked_queries").select("*").eq("site_id",site.id).eq("active",true).order("priority").limit(100);
  for(const query of queries||[]){const result:any[]=await client.serp(query.query,{locationCode:query.location_code,languageCode:query.language_code,depth:20});const first:any=result[0]||{};const items=(first.items||[]).filter((item:any)=>item.type==="organic");const own=items.find((item:any)=>{try{return new URL(item.url).hostname===new URL(site.url).hostname}catch{return false}});await db.from("serp_snapshots").insert({tracked_query_id:query.id,captured_at:new Date().toISOString(),rank:own?.rank_absolute||null,result_url:own?.url||null,serp_features:(first.items||[]).filter((item:any)=>item.type!=="organic").map((item:any)=>item.type),competitors:items.slice(0,10).map((item:any)=>({rank:item.rank_absolute,domain:item.domain,url:item.url})),payload_hash:sha256(JSON.stringify(first))});}
  if(run.kind==="monthly_strategy"){const result:any[]=await client.backlinks(new URL(site.url).hostname,100);const items=(result[0]as any)?.items||[];for(const item of items){if(!item.url_from||!item.url_to)continue;await db.from("backlink_observations").upsert({site_id:site.id,source_url:item.url_from,target_url:item.url_to,anchor:item.anchor||null,domain_rank:item.domain_from_rank||null,first_seen:item.first_seen||null,last_seen:item.last_seen||new Date().toISOString(),status:item.is_lost?"lost":"active",toxicity_score:null,toxicity_evidence:[]},{onConflict:"site_id,source_url,target_url"})}}
  return {tracked:queries?.length||0};
}

async function runGoogleSearchConsole(site:any,workspaceId:string){const{data:connection}=await db.from("provider_connections").select("*").eq("workspace_id",workspaceId).eq("provider","google").eq("status","active").limit(1).maybeSingle();if(!connection)return{warning:"Google is not connected"};const credentials=decryptSecret<{access_token:string;refresh_token?:string}>(connection.encrypted_credentials as EncryptedSecret,`${workspaceId}:google:${connection.label}`);const accessToken=credentials.refresh_token?(await refreshGoogleAccessToken(credentials.refresh_token)).access_token:credentials.access_token;const end=new Date(Date.now()-86400000),start=new Date(end.getTime()-2*86400000),date=(value:Date)=>value.toISOString().slice(0,10),result=await querySearchConsole(accessToken,site.url,date(start),date(end))as any;const rows=result.rows||[],clicks=rows.reduce((sum:number,row:any)=>sum+Number(row.clicks||0),0),impressions=rows.reduce((sum:number,row:any)=>sum+Number(row.impressions||0),0),averagePosition=impressions?rows.reduce((sum:number,row:any)=>sum+Number(row.position||0)*Number(row.impressions||0),0)/impressions:null;await db.from("daily_site_metrics").upsert({site_id:site.id,metric_date:date(end),source:"gsc",clicks,impressions,ctr:impressions?clicks/impressions:0,average_position:averagePosition,payload_hash:sha256(JSON.stringify(result))},{onConflict:"site_id,metric_date,source"});for(const row of rows.slice(0,500)){const page=row.keys?.[1];if(!page)continue;await db.from("page_metrics").upsert({site_id:site.id,url:page,metric_date:date(end),source:"gsc",clicks:Number(row.clicks||0),impressions:Number(row.impressions||0)},{onConflict:"site_id,url,metric_date,source"})}return{clicks,impressions,rows:rows.length}}

async function runPageSpeed(site:any){const endpoint=new URL("https://www.googleapis.com/pagespeedonline/v5/runPagespeed");endpoint.searchParams.set("url",site.url);endpoint.searchParams.set("strategy","mobile");endpoint.searchParams.append("category","performance");if(process.env.PAGESPEED_API_KEY)endpoint.searchParams.set("key",process.env.PAGESPEED_API_KEY);const response=await fetch(endpoint,{signal:AbortSignal.timeout(90_000)});if(!response.ok)return{warning:`PageSpeed HTTP ${response.status}`};const result=await response.json()as any,metrics=result.loadingExperience?.metrics||{},lab=result.lighthouseResult?.audits||{},today=new Date().toISOString().slice(0,10);await db.from("page_metrics").upsert({site_id:site.id,url:site.url,metric_date:today,source:"pagespeed",lcp:Number(metrics.LARGEST_CONTENTFUL_PAINT_MS?.percentile||lab["largest-contentful-paint"]?.numericValue||0),inp:Number(metrics.INTERACTION_TO_NEXT_PAINT?.percentile||0),cls:Number(metrics.CUMULATIVE_LAYOUT_SHIFT_SCORE?.percentile||lab["cumulative-layout-shift"]?.numericValue||0)},{onConflict:"site_id,url,metric_date,source"});return{performance:result.lighthouseResult?.categories?.performance?.score}}

async function createCodeProposal(site:any,run:any,workspaceId:string,storedFindings:any[]){
  if(site.status!=="active"||run.dry_run||!site.settings?.autonomousProposals)return null;
  const snapshot=await readRepositorySnapshot({installationId:Number(site.github_installation_id),owner:site.repository_owner,repo:site.repository_name,ref:site.default_branch});
  const patch=await generateRepositoryPatch({site:{id:site.id,name:site.name,url:site.url,repository:`${site.repository_owner}/${site.repository_name}`},findings:storedFindings.slice(0,12),files:snapshot.files.map(({path,content})=>({path,content:redactSecrets(content)}))});
  if(!patch.patches.length)return null;
  const {data:proposal,error}=await db.from("proposals").insert({site_id:site.id,run_id:run.id,title:patch.title,summary:patch.summary,risk:patch.risk,state:"checks_pending",finding_ids:storedFindings.map(f=>f.id),changed_paths:patch.patches.map(p=>p.path),validation_commands:[],expected_impact:patch.expectedImpact,rollback_plan:patch.rollbackPlan}).select().single();
  if(error)throw error;
  const token=await installationToken(Number(site.github_installation_id));
  const execution=await executeRunner({repositoryUrl:`https://github.com/${site.repository_owner}/${site.repository_name}.git`,token,baseBranch:site.default_branch,proposalId:proposal.id,commitMessage:`seo: ${patch.title}`,patches:patch.patches});
  const body=[patch.summary,"",`Expected impact: ${patch.expectedImpact}`,"",`Risk: ${patch.risk}`,"",`Validation:\n${execution.validation.map((v:{ok:boolean;command:string})=>`- ${v.ok?"✅":"❌"} ${v.command}`).join("\n")}`,"",`Rollback: ${patch.rollbackPlan}`,"","Generated by SEOForge. Human approval and protected checks are mandatory."].join("\n");
  const pr=await createProposalPullRequest({installationId:Number(site.github_installation_id),owner:site.repository_owner,repo:site.repository_name,branch:execution.branch,base:site.default_branch,title:`[SEOForge] ${patch.title}`,body});
  await db.from("proposals").update({branch_name:execution.branch,head_sha:execution.sha,pull_number:pr.number,pull_url:pr.url,validation_commands:execution.validation.map((v:{command:string})=>v.command),checks:{runner:execution.validation},state:"ready",updated_at:new Date().toISOString()}).eq("id",proposal.id);
  return proposal.id;
}

async function processAgentRun(runId:string){
  const {data:run,error}=await db.from("agent_runs").select("*,sites(*)").eq("id",runId).single();if(error||!run)throw error||new Error("Run not found");const site=run.sites as any;const workspaceId=site.workspace_id;
  await db.rpc("reserve_usage",{target_workspace:workspaceId,target_run:run.id,target_dimension:"agent_run",target_units:1,target_key:`run:${run.id}:agent_run`});
  await db.from("agent_runs").update({status:"running",started_at:new Date().toISOString(),progress:{stage:"collecting_evidence"}}).eq("id",run.id);
  try{
    const [snapshot,discovery]=await Promise.all([auditPage(site.url),inspectDiscoveryFiles(site.url)]);const evidence=await captureEvidence(site.id,run.id,snapshot);const deterministic=findingsFromSnapshot(snapshot);const stored:any[]=[];
    for(const finding of deterministic)stored.push(await storeFinding(site.id,run.id,"technical_seo",finding,[evidence.id]));
    if(["daily_rank","weekly_audit","monthly_strategy"].includes(run.kind))await Promise.allSettled([runDataForSeo(site,run,workspaceId),runGoogleSearchConsole(site,workspaceId),runPageSpeed(site)]);
    const roles=(run.roles?.length&&!(run.roles.length===1&&run.roles[0]==="supervisor")?run.roles:FULL_AUDIT_ROLES) as AgentRole[];
    await db.from("agent_runs").update({progress:{stage:"specialists",roles}}).eq("id",run.id);
    let agentStates:Record<string,any>={},previousStates:Record<string,string>={};
    const reports=await runAgentTeam({site:{id:site.id,name:site.name,url:site.url,repository:`${site.repository_owner}/${site.repository_name}`},runId:run.id,evidence:[snapshot,discovery],objective:run.objective||`Execute ${run.kind}`},roles,Number(site.settings?.agentConcurrency||3),async(states)=>{agentStates=states;const transitions=Object.entries(states).filter(([role,state])=>previousStates[role]!==state.status).map(([role,state])=>({run_id:run.id,site_id:site.id,role,event_type:`agent.${state.status}`,status:state.status,tool_name:state.tool,current_target:state.currentTarget,decision_summary:state.summary?redactSecrets(state.summary):null,evidence_count:state.status==="completed"?1:0,input_tokens:state.inputTokens||0,output_tokens:state.outputTokens||0,estimated_cost:state.estimatedCost||0,retry_number:state.retryNumber||0,error_code:state.status==="failed"?"specialist_failed":null,error_message:state.status==="failed"?redactSecrets(state.summary||"Specialist failed"):null}));if(transitions.length)await db.from("agent_events").insert(transitions);previousStates=Object.fromEntries(Object.entries(states).map(([role,state])=>[role,state.status]));await db.from("agent_runs").update({progress:{stage:"specialists",roles,agents:states}}).eq("id",run.id);});
    for(const report of reports)for(const finding of report.findings){const ids:string[]=[];for(const item of finding.evidence){const {data:e}=await db.from("evidence_snapshots").insert({site_id:site.id,run_id:run.id,kind:item.kind,source_url:item.sourceUrl,source_path:item.sourcePath,captured_at:item.capturedAt,summary:item.summary,content_hash:item.contentHash,payload:item.payload}).select("id").single();if(e)ids.push(e.id);}stored.push(await storeFinding(site.id,run.id,report.role,finding,ids));}
    const proposalId=await createCodeProposal(site,run,workspaceId,stored);const healthScore=await persistHealthScore(site.id,stored);if(stored.some(f=>f.priority==="critical"))await notify(workspaceId,"critical_finding",{siteId:site.id,runId:run.id,count:stored.filter(f=>f.priority==="critical").length});if(proposalId)await notify(workspaceId,"proposal_ready",{siteId:site.id,runId:run.id,proposalId});
    await db.from("agent_runs").update({status:"completed",completed_at:new Date().toISOString(),progress:{stage:"completed",findings:stored.length,healthScore,agents:agentStates}}).eq("id",run.id);
  }catch(error){const message=redactSecrets(error instanceof Error?error.message:String(error));await db.from("agent_runs").update({status:"failed",completed_at:new Date().toISOString(),error_code:"run_failed",error_message:message}).eq("id",run.id);await notify(workspaceId,"run_failed",{siteId:site.id,runId:run.id,message});throw error;}
}

async function enqueueScheduled(kind:string){const {data:sites=[]}=await db.from("sites").select("id,settings").eq("status","active");for(const site of sites||[]){const {data:run}=await db.from("agent_runs").insert({site_id:site.id,kind,status:"queued",roles:["supervisor"],dry_run:!site.settings?.autonomousProposals}).select("id").single();if(run)await queue.add("agent-run",{runId:run.id},{jobId:run.id});}}

async function enqueueSiteRun(site:{id:string;settings?:Record<string,unknown>|null},kind:string){
  const {data:run,error}=await db.from("agent_runs").insert({site_id:site.id,kind,status:"queued",roles:["supervisor"],dry_run:!site.settings?.autonomousProposals}).select("id").single();
  if(error)throw error;
  if(run)await queue.add("agent-run",{runId:run.id},{jobId:run.id});
}

async function enqueueRepositoryPush(data:{owner?:string;name?:string}){
  if(!data.owner||!data.name)return;
  const {data:site}=await db.from("sites").select("id,settings").eq("status","active").eq("repository_owner",data.owner).eq("repository_name",data.name).maybeSingle();
  if(site)await enqueueSiteRun(site,"repository_push");
}

async function enqueuePostDeploy(data:any){
  const deployment=data?.deployment||{};
  const projectId=deployment.projectId||deployment.project?.id||deployment.meta?.projectId||deployment.deployment?.projectId;
  if(!projectId)return;
  const {data:site}=await db.from("sites").select("id,settings").eq("status","active").eq("deployment_project_id",String(projectId)).maybeSingle();
  if(site)await enqueueSiteRun(site,"post_deploy");
}

async function enforceRetention(){
  const cutoff=new Date(Date.now()-30*24*60*60*1000).toISOString();
  const {error}=await db.from("audit_events").delete().lt("created_at",cutoff);
  if(error)throw error;
  return {cutoff};
}

async function processMediaJob(jobId:string,data:any){
  const {data:site}=await db.from("sites").select("*").eq("id",data.siteId).eq("workspace_id",data.workspaceId).single();if(!site)throw new Error("Site not found");
  const dimension=data.kind==="image"?"image":data.kind==="audio"?"audio_second":"video_second";const units=data.kind==="image"?1:data.kind==="audio"?60:10;
  await db.rpc("reserve_usage",{target_workspace:data.workspaceId,target_run:null,target_dimension:dimension,target_units:units,target_key:`media:${jobId}:${dimension}`});
  let {data:brand}=await db.from("brand_profiles").select("*").eq("site_id",site.id).maybeSingle();
  if(!brand){const snapshot=await readRepositorySnapshot({installationId:Number(site.github_installation_id),owner:site.repository_owner,repo:site.repository_name,ref:site.default_branch,maxFiles:80,maxBytes:800_000});const profile=await profileBrand(snapshot.files.map(({path,content})=>({path,content:redactSecrets(content)})));const result=await db.from("brand_profiles").upsert({site_id:site.id,palette:profile.palette,typography:profile.typography,editorial_voice:profile.editorialVoice,visual_rules:profile.visualRules,source_hashes:snapshot.files.map(file=>sha256(file.content))}).select().single();brand=result.data;}
  const prompt=`Brand profile: ${JSON.stringify(brand)}\n\nSource article: ${data.sourceArticleUrl||"not supplied"}\n\nCreative request: ${data.prompt}\n\nDo not invent facts, logos, endorsements, statistics, or people. Match the established style without copying third-party assets.`;
  const media=data.kind==="image"?await generateImage(prompt):data.kind==="audio"?await generateNarration(prompt):await generateShortVideo(prompt);
  const extension=media.mimeType.split("/")[1]?.replace("mpeg","mp3")||"bin";const stored=await putArtifact({workspaceId:data.workspaceId,siteId:site.id,kind:data.kind,data:media.data,contentType:media.mimeType,extension});
  const {data:artifact,error}=await db.from("artifacts").insert({site_id:site.id,kind:data.kind,object_key:stored.key,public_url:stored.url,mime_type:media.mimeType,bytes:stored.bytes,content_hash:media.contentHash,prompt_hash:media.promptHash,model:media.model,provenance:{sourceArticleUrl:data.sourceArticleUrl,brandProfileVersion:brand?.version},accessibility:{altText:data.altText}}).select().single();if(error)throw error;return artifact;
}

const worker=new Worker("seoforge-agent-runs",async(job)=>{if(job.name==="agent-run")return processAgentRun(job.data.runId);if(job.name==="media-generate")return processMediaJob(String(job.id),job.data);if(job.name==="schedule")return enqueueScheduled(job.data.kind);if(job.name==="repository-push")return enqueueRepositoryPush(job.data);if(job.name==="post-deploy")return enqueuePostDeploy(job.data);if(job.name==="retention")return enforceRetention();},{connection,concurrency:Number(process.env.WORKER_CONCURRENCY||3),lockDuration:900_000});
worker.on("failed",(job,error)=>console.error(JSON.stringify({event:"job.failed",jobId:job?.id,error:redactSecrets(error.message)})));
worker.on("completed",(job)=>console.info(JSON.stringify({event:"job.completed",jobId:job.id})));

await Promise.all([
  queue.upsertJobScheduler("daily-rank",{pattern:"0 3 * * *"},{name:"schedule",data:{kind:"daily_rank"}}),
  queue.upsertJobScheduler("weekly-audit",{pattern:"0 4 * * 1"},{name:"schedule",data:{kind:"weekly_audit"}}),
  queue.upsertJobScheduler("monthly-strategy",{pattern:"0 5 1 * *"},{name:"schedule",data:{kind:"monthly_strategy"}}),
  queue.upsertJobScheduler("retention",{pattern:"0 2 * * *"},{name:"retention",data:{}}),
]);
console.info(JSON.stringify({event:"worker.ready",concurrency:worker.opts.concurrency}));
