import { entitlementsFromPrice, parseStripeWebhook, stripe } from "@seoforge/integrations";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { apiError, ok } from "@/lib/api-response";
import { sha256 } from "@seoforge/core";

export async function POST(request:Request){try{const raw=await request.text();const signature=request.headers.get("stripe-signature");if(!signature)throw new Error("Missing Stripe signature");const event=parseStripeWebhook(raw,signature);const admin=createSupabaseAdminClient();const id=`stripe:${event.id}`;const {error:duplicate}=await admin.from("webhook_events").insert({id,provider:"stripe",event_type:event.type,payload_hash:sha256(raw)});if(duplicate?.code==="23505")return ok({duplicate:true});
  if(event.type.startsWith("customer.subscription.")){
    const subscription=event.data.object as any;const workspaceId=subscription.metadata?.workspaceId;const item=subscription.items?.data?.[0];if(workspaceId&&item?.price){const price=await stripe!.prices.retrieve(item.price.id);await admin.from("subscriptions").upsert({workspace_id:workspaceId,stripe_customer_id:String(subscription.customer),stripe_subscription_id:subscription.id,stripe_price_id:price.id,plan_key:price.metadata.planKey||"starter",status:subscription.status,entitlements:entitlementsFromPrice(price),current_period_start:new Date(subscription.current_period_start*1000).toISOString(),current_period_end:new Date(subscription.current_period_end*1000).toISOString(),updated_at:new Date().toISOString()});}
  }
  await admin.from("webhook_events").update({processed_at:new Date().toISOString()}).eq("id",id);return ok({received:true});}catch(error){return apiError(error);}}
