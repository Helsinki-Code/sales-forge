import { GoogleGenAI } from "@google/genai";
import { agentReportSchema, redactSecrets, type AgentReport, type AgentRole } from "@seoforge/core";
import { REPORT_JSON_SCHEMA, systemInstruction } from "./prompts.js";

export type AgentContext = {
  site: { id: string; name: string; url: string; repository: string };
  runId: string;
  evidence: unknown[];
  objective: string;
};

function client() {
  if (!process.env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is required");
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}

export async function runSpecialist(role: AgentRole, context: AgentContext): Promise<{ report: AgentReport; interactionId?: string; usage?: unknown }> {
  const ai = client();
  const response = await ai.interactions.create({
    model: role === "repository_engineer" || role === "qa_policy" || role === "supervisor"
      ? process.env.GEMINI_REASONING_MODEL || "gemini-3.1-pro-preview"
      : process.env.GEMINI_FAST_MODEL || "gemini-3.5-flash",
    store: false,
    system_instruction: systemInstruction(role),
    input: redactSecrets(JSON.stringify(context)),
    response_format: { type: "text", mime_type: "application/json", schema: REPORT_JSON_SCHEMA },
  } as never);
  const output = response.output_text;
  if (!output) throw new Error(`${role} returned no structured output`);
  return { report: agentReportSchema.parse(JSON.parse(output)), interactionId: response.id, usage: response.usage };
}

export async function startDeepResearch(input: string) {
  const ai = client();
  return ai.interactions.create({
    agent: "deep-research-preview-04-2026",
    input: redactSecrets(input),
    background: true,
  } as never);
}

export async function getBackgroundInteraction(id: string) {
  return client().interactions.get(id);
}

const PATCH_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    title: { type: "string" },
    summary: { type: "string" },
    risk: { type: "string", enum: ["low", "medium", "high", "critical"] },
    expectedImpact: { type: "string" },
    rollbackPlan: { type: "string" },
    patches: { type: "array", maxItems: 40, items: { type: "object", additionalProperties: false, properties: { path: { type: "string" }, content: { type: "string" } }, required: ["path", "content"] } },
  },
  required: ["title", "summary", "risk", "expectedImpact", "rollbackPlan", "patches"],
} as const;

export async function generateRepositoryPatch(input: { site: AgentContext["site"]; findings: unknown[]; files: { path: string; content: string }[] }) {
  const ai = client();
  const response = await ai.interactions.create({
    model: process.env.GEMINI_REASONING_MODEL || "gemini-3.1-pro-preview",
    store: false,
    system_instruction: systemInstruction("repository_engineer"),
    input: redactSecrets(JSON.stringify({ objective: "Create the smallest safe patch addressing the supplied findings. Preserve behavior and existing style. Never add unverifiable claims.", ...input })),
    response_format: { type: "text", mime_type: "application/json", schema: PATCH_SCHEMA },
  } as never);
  if (!response.output_text) throw new Error("Repository engineer returned no patch");
  return JSON.parse(response.output_text) as { title:string; summary:string; risk:"low"|"medium"|"high"|"critical"; expectedImpact:string; rollbackPlan:string; patches:{path:string;content:string}[] };
}

export async function createLiveToken(userId: string, workspaceId: string) {
  const ai = client();
  const expireTime = new Date(Date.now() + 30 * 60 * 1000).toISOString();
  const newSessionExpireTime = new Date(Date.now() + 60 * 1000).toISOString();
  const token = await ai.authTokens.create({
    config: {
      uses: 1,
      expireTime,
      newSessionExpireTime,
      liveConnectConstraints: {
        model: process.env.GEMINI_LIVE_MODEL || "gemini-3.1-flash-live-preview",
        config: {
          responseModalities: ["AUDIO"],
          sessionResumption: {},
          contextWindowCompression: { slidingWindow: {} },
          systemInstruction: {
            parts: [{ text: `You explain SEOForge evidence for user ${userId} in workspace ${workspaceId}. You may inspect or stage actions, but you cannot approve, merge, deploy, or roll back.` }],
          },
        },
      },
      httpOptions: { apiVersion: "v1alpha" },
    },
  } as never);
  return { token: token.name, expireTime, model: process.env.GEMINI_LIVE_MODEL || "gemini-3.1-flash-live-preview" };
}
