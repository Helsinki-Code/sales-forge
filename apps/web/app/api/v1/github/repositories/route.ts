import { listInstallationRepositories } from "@seoforge/integrations";
import { apiUser } from "@/lib/auth";
import { apiError, ok } from "@/lib/api-response";
export async function GET(request:Request){try{if(!await apiUser())throw new Error("Authentication required");const id=Number(new URL(request.url).searchParams.get("installationId"));if(!Number.isInteger(id)||id<=0)throw new Error("Valid installationId required");return ok(await listInstallationRepositories(id));}catch(error){return apiError(error);}}
