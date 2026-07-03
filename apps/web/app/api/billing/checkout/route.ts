import { createSubscriptionCheckout } from "@seoforge/integrations";
import { apiUser } from "@/lib/auth";
import { apiError, ok } from "@/lib/api-response";
import { requireWorkspace } from "@/lib/workspace";

const priceByPlan={starter:process.env.STRIPE_STARTER_PRICE_ID,pro:process.env.STRIPE_PRO_PRICE_ID,agency:process.env.STRIPE_AGENCY_PRICE_ID};
export async function POST(request:Request){try{const auth=await apiUser();if(!auth)throw new Error("Authentication required");const workspace=await requireWorkspace(auth.supabase,auth.user,"admin");const {plan}=await request.json() as {plan:keyof typeof priceByPlan};const priceId=priceByPlan[plan];if(!priceId)throw new Error("Unknown or unconfigured plan");const {data:sub}=await auth.supabase.from("subscriptions").select("stripe_customer_id").eq("workspace_id",workspace.workspace_id).maybeSingle();const origin=new URL(request.url).origin;const session=await createSubscriptionCheckout({customerId:sub?.stripe_customer_id||undefined,priceId,workspaceId:workspace.workspace_id,successUrl:`${origin}/dashboard/billing?checkout=success`,cancelUrl:`${origin}/dashboard/billing?checkout=cancelled`});return ok({url:session.url});}catch(error){return apiError(error);}}
