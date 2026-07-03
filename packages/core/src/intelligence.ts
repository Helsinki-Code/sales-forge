import { z } from "zod";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

export const HEALTH_WEIGHTS={technical:.22,content:.23,onPage:.20,schema:.10,performance:.10,aiReadiness:.10,images:.05} as const;
export type HealthCategory=keyof typeof HEALTH_WEIGHTS;
export function calculateHealthScore(scores:Record<HealthCategory,number>){const categories=Object.fromEntries(Object.entries(HEALTH_WEIGHTS).map(([key,weight])=>[key,Math.max(0,Math.min(100,Number(scores[key as HealthCategory]||0)))*weight]));return{score:Math.round(Object.values(categories).reduce((sum,value)=>sum+value,0)*10)/10,weightedCategories:categories};}

export function linearForecast(points:{x:number;y:number}[],futureX:number){if(points.length<2)return{estimate:points[0]?.y||0,lower:0,upper:0,confidence:"insufficient" as const};const n=points.length;const sx=points.reduce((s,p)=>s+p.x,0),sy=points.reduce((s,p)=>s+p.y,0),sxy=points.reduce((s,p)=>s+p.x*p.y,0),sxx=points.reduce((s,p)=>s+p.x*p.x,0);const slope=(n*sxy-sx*sy)/(n*sxx-sx*sx||1);const intercept=(sy-slope*sx)/n;const estimate=intercept+slope*futureX;const variance=points.reduce((s,p)=>s+(p.y-(intercept+slope*p.x))**2,0)/Math.max(1,n-2);const margin=1.96*Math.sqrt(variance);return{estimate,lower:estimate-margin,upper:estimate+margin,confidence:n>=8?"moderate" as const:"low" as const};}

export const integrationEnvironmentSchema=z.enum(["test","live"]);
export const apiScopeSchema=z.enum(["sites:read","sites:write","runs:read","runs:write","findings:read","proposals:read","media:write","usage:read","webhooks:manage"]);
export type ApiScope=z.infer<typeof apiScopeSchema>;
export const authPrincipalSchema=z.object({kind:z.enum(["user","oauth_client","service_token"]),subject:z.string(),workspaceId:z.string().uuid(),environment:integrationEnvironmentSchema,scopes:z.array(apiScopeSchema),siteIds:z.array(z.string().uuid()).optional()});
export type AuthPrincipal=z.infer<typeof authPrincipalSchema>;
export function hasScope(principal:AuthPrincipal,scope:ApiScope,siteId?:string){return principal.scopes.includes(scope)&&(!siteId||!principal.siteIds||principal.siteIds.includes(siteId));}

function tokenPepper(){const value=process.env.API_TOKEN_PEPPER;if(!value||value.length<32)throw new Error("API_TOKEN_PEPPER must contain at least 32 characters");return value;}
export function createApiToken(environment:"test"|"live"){const secret=randomBytes(32).toString("base64url");const token=`sf_${environment}_${secret}`;return{token,prefix:`sf_${environment}_`,lastFour:token.slice(-4),hash:hashApiToken(token)};}
export function hashApiToken(token:string){return createHmac("sha256",tokenPepper()).update(token).digest("hex");}
export function safeTokenHashMatch(token:string,expectedHash:string){const actual=Buffer.from(hashApiToken(token),"hex"),expected=Buffer.from(expectedHash,"hex");return actual.length===expected.length&&timingSafeEqual(actual,expected);}
