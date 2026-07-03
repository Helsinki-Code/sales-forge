import Stripe from "stripe";

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2026-02-25.clover" as Stripe.LatestApiVersion, typescript: true })
  : null;

export const PLAN_KEYS = ["trial", "starter", "pro", "agency"] as const;
export type PlanKey = (typeof PLAN_KEYS)[number];

export type Entitlements = {
  sites: number; trackedQueries: number; crawlPages: number; agentRuns: number; images: number;
  audioSeconds: number; videoSeconds: number; storageBytes: number; concurrency: number;
};

export const TRIAL_ENTITLEMENTS: Entitlements = {
  sites: 1, trackedQueries: 10, crawlPages: 100, agentRuns: 3, images: 2,
  audioSeconds: 60, videoSeconds: 10, storageBytes: 100_000_000, concurrency: 1,
};

export function entitlementsFromPrice(price: Stripe.Price): Entitlements {
  const value = (key: keyof Entitlements, fallback = 0) => Number(price.metadata[key] ?? fallback);
  return {
    sites: value("sites"), trackedQueries: value("trackedQueries"), crawlPages: value("crawlPages"), agentRuns: value("agentRuns"),
    images: value("images"), audioSeconds: value("audioSeconds"), videoSeconds: value("videoSeconds"), storageBytes: value("storageBytes"), concurrency: value("concurrency", 1),
  };
}

export async function createSubscriptionCheckout(input: { customerId?: string; priceId: string; workspaceId: string; successUrl: string; cancelUrl: string }) {
  if (!stripe) throw new Error("STRIPE_SECRET_KEY is required");
  return stripe.checkout.sessions.create({
    mode: "subscription", customer: input.customerId, line_items: [{ price: input.priceId, quantity: 1 }],
    success_url: input.successUrl, cancel_url: input.cancelUrl, allow_promotion_codes: true,
    subscription_data: { metadata: { workspaceId: input.workspaceId } }, metadata: { workspaceId: input.workspaceId },
  });
}

export async function createCustomerPortal(customerId: string, returnUrl: string) {
  if (!stripe) throw new Error("STRIPE_SECRET_KEY is required");
  return stripe.billingPortal.sessions.create({ customer: customerId, return_url: returnUrl });
}

export function parseStripeWebhook(rawBody: string | Buffer, signature: string) {
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) throw new Error("Stripe webhook configuration is missing");
  return stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);
}
