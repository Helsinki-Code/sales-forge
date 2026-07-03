import type { AgentReport, AgentRole } from "@seoforge/core";
import { runSpecialist, type AgentContext } from "./gemini.js";

export const FULL_AUDIT_ROLES: AgentRole[] = [
  "site_cartographer", "technical_seo", "serp_competitor", "content_geo", "media_studio", "analytics_experiment", "qa_policy",
];

export type AgentExecutionState = Record<string,{status:"queued"|"running"|"completed"|"failed";summary?:string;tool?:string;currentTarget?:string;inputTokens?:number;outputTokens?:number;estimatedCost?:number;retryNumber?:number}>;

function usageNumbers(value:unknown){const usage=(value||{})as Record<string,unknown>;const input=Number(usage.inputTokens??usage.input_tokens??usage.promptTokenCount??usage.prompt_token_count??0),output=Number(usage.outputTokens??usage.output_tokens??usage.candidatesTokenCount??usage.candidates_token_count??0);const inputRate=Number(process.env.GEMINI_INPUT_COST_PER_MILLION||0),outputRate=Number(process.env.GEMINI_OUTPUT_COST_PER_MILLION||0);return{inputTokens:input,outputTokens:output,estimatedCost:(input*inputRate+output*outputRate)/1_000_000};}

export async function runAgentTeam(context: AgentContext, roles = FULL_AUDIT_ROLES, concurrency = 3, onProgress?: (state:AgentExecutionState)=>Promise<void>|void): Promise<AgentReport[]> {
  const output: AgentReport[] = [];
  const states:AgentExecutionState=Object.fromEntries(roles.map(role=>[role,{status:"queued",tool:"gemini_interactions",currentTarget:context.site.url,retryNumber:0}]));
  await onProgress?.({...states});
  for (let index = 0; index < roles.length; index += concurrency) {
    const batch = roles.slice(index, index + concurrency);
    batch.forEach(role=>{states[role]={...states[role],status:"running"};});
    await onProgress?.({...states});
    const settled = await Promise.allSettled(batch.map((role) => runSpecialist(role, context)));
    for (let offset=0;offset<settled.length;offset++) {
      const result=settled[offset]!;
      const role = batch[offset];
      if (result.status === "fulfilled") { output.push(result.value.report); states[role!]={...states[role!],status:"completed",summary:result.value.report.summary,...usageNumbers(result.value.usage)}; }
      else { const summary=`Agent failed: ${result.reason instanceof Error ? result.reason.message : String(result.reason)}`;output.push({ role: role!, summary, findings: [], proposals: [], warnings: ["Partial audit: specialist unavailable"], sources: [] });states[role!]={...states[role!],status:"failed",summary}; }
      await onProgress?.({...states});
    }
  }
  return output;
}
