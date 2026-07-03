import { Queue } from "bullmq";

let queue: Queue | undefined;
export function agentQueue() {
  if (!process.env.REDIS_URL) throw new Error("REDIS_URL is required");
  const url = new URL(process.env.REDIS_URL);
  queue ??= new Queue("seoforge-agent-runs", { connection: { host:url.hostname, port:Number(url.port||6379), username:url.username||undefined, password:url.password||undefined, tls:url.protocol==="rediss:"?{}:undefined } });
  return queue;
}
