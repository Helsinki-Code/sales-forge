interface Env{ENVIRONMENT:"test"|"live";API_ORIGIN:string;AUTHORIZATION_SERVER:string}
type Rpc={jsonrpc:"2.0";id?:string|number|null;method:string;params?:any};
const readTools=["sites","health","rankings","runs","agents","findings","evidence","experiments","proposals","usage","provider_health"]as const;
const controlledTools=["audit","rank_check","strategy_run","brief_prepare","media_prepare","proposal_prepare","agent_retry"]as const;
const toolDescriptions:Record<string,string>={sites:"List authorized sites",health:"Read explainable SEO health",rankings:"Read measured keyword positions",runs:"Read workflow runs",agents:"Read structured agent execution events",findings:"Read evidence-backed findings",evidence:"Read source snapshots and capture times",experiments:"Read measured experiments",proposals:"Read proposals and web-review links",usage:"Read quota and cost usage",provider_health:"Read provider freshness",audit:"Start an evidence audit",rank_check:"Start an on-demand rank check",strategy_run:"Start a strategy investigation",brief_prepare:"Prepare a content brief",media_prepare:"Prepare a media generation job",proposal_prepare:"Prepare a human-reviewed proposal",agent_retry:"Retry a failed specialist"};
function json(value:unknown,status=200,headers:HeadersInit={}){return new Response(JSON.stringify(value),{status,headers:{"content-type":"application/json","cache-control":"no-store",...headers}})}
function rpcResult(id:Rpc["id"],result:unknown){return json({jsonrpc:"2.0",id:id??null,result},200,{"mcp-session-id":crypto.randomUUID()})}
function rpcError(id:Rpc["id"],code:number,message:string,status=200){return json({jsonrpc:"2.0",id:id??null,error:{code,message}},status)}
function bearer(request:Request){const value=request.headers.get("authorization")||"";return value.startsWith("Bearer ")?value.slice(7):null}
async function api(env:Env,token:string,path:string,init?:RequestInit){const response=await fetch(`${env.API_ORIGIN}/api/v1/${path}`,{...init,headers:{authorization:`Bearer ${token}`,"content-type":"application/json",...init?.headers}});const body=await response.json()as any;if(!response.ok)throw new Error(body.error?.message||`SEOForge API ${response.status}`);return body.data}
function resourceMetadata(request:Request,env:Env){const origin=new URL(request.url).origin;return json({resource:`${origin}/mcp`,authorization_servers:[env.AUTHORIZATION_SERVER],bearer_methods_supported:["header"],scopes_supported:["sites:read","runs:read","runs:write","findings:read","proposals:read","media:write","usage:read"]})}
async function callTool(name:string,args:any,env:Env,token:string,_origin:string){if(readTools.includes(name as any)){const mapping:Record<string,string>={health:`sites/${args?.siteId}/health`,rankings:`rankings?siteId=${encodeURIComponent(args?.siteId||"")}`,agents:"agent-events",evidence:"evidence",provider_health:"provider-health",proposals:"proposals/review-links"};return api(env,token,mapping[name]||name)}if(!controlledTools.includes(name as any))throw new Error("Unknown tool");const kind:Record<string,string>={audit:"weekly_audit",rank_check:"daily_rank",strategy_run:"monthly_strategy",agent_retry:"specialist_retry"};if(kind[name])return api(env,token,name==="audit"?"audits":"runs",{method:"POST",body:JSON.stringify({siteId:args.siteId,kind:kind[name],dryRun:args.dryRun!==false,roles:args.roles})});if(name==="media_prepare")return api(env,token,"media/generate",{method:"POST",body:JSON.stringify(args)});throw new Error(`${name} is staged through the web application and is not yet available for this workspace`)}
export default{async fetch(request:Request,env:Env){
  const url=new URL(request.url);
  if(url.pathname==="/.well-known/oauth-protected-resource"||url.pathname==="/.well-known/oauth-protected-resource/mcp")return resourceMetadata(request,env);
  if(url.pathname!=="/mcp")return json({error:"not_found"},404);
  if(request.method==="DELETE")return new Response(null,{status:204});
  if(request.method!=="POST")return json({error:"method_not_allowed"},405,{allow:"POST, DELETE"});
  const token=bearer(request);
  if(!token)return json({error:"invalid_token",error_description:"OAuth bearer token required"},401,{"www-authenticate":`Bearer resource_metadata="${url.origin}/.well-known/oauth-protected-resource/mcp"`});
  if(token.startsWith("sf_")&&!token.startsWith(`sf_${env.ENVIRONMENT}_`))return json({error:"environment_mismatch"},403);
  let body:Rpc;try{body=await request.json()as Rpc}catch{return rpcError(null,-32700,"Parse error",400)}
  try{
    if(body.method==="initialize")return rpcResult(body.id,{protocolVersion:"2025-06-18",capabilities:{tools:{listChanged:false}},serverInfo:{name:"SEOForge Search Intelligence",version:"0.1.0"}});
    if(body.method==="notifications/initialized")return new Response(null,{status:202});
    if(body.method==="tools/list"){const tools=[...readTools,...controlledTools].map(name=>({name,description:toolDescriptions[name],inputSchema:{type:"object",properties:{siteId:{type:"string",format:"uuid"},dryRun:{type:"boolean"},roles:{type:"array",items:{type:"string"}}},additionalProperties:true}}));return rpcResult(body.id,{tools})}
    if(body.method==="tools/call"){const result=await callTool(body.params?.name,body.params?.arguments||{},env,token,env.API_ORIGIN);return rpcResult(body.id,{content:[{type:"text",text:JSON.stringify(result,null,2)}],isError:false})}
    return rpcError(body.id,-32601,"Method not found");
  }catch(error){return rpcResult(body.id,{content:[{type:"text",text:error instanceof Error?error.message:"Tool failed"}],isError:true})}
}};
