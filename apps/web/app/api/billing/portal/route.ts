import { createCustomerPortal } from "@seoforge/integrations";
import { apiUser } from "@/lib/auth";
import { apiError, ok } from "@/lib/api-response";
import { requireWorkspace } from "@/lib/workspace";
export async function POST(request:Request){try{const auth=await apiUser();if(!auth)throw new Error("Authentication required");const workspace=await requireWorkspace(auth.supabase,auth.user,"admin");const {data:sub}=await auth.supabase.from("subscriptions").select("stripe_customer_id").eq("workspace_id",workspace.workspace_id).single();if(!sub?.stripe_customer_id)throw new Error("No Stripe customer found");return ok({url:(await createCustomerPortal(sub.stripe_customer_id,`${new URL(request.url).origin}/dashboard/billing`)).url});}catch(error){return apiError(error);}}
