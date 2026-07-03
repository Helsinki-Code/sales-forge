import { apiUser } from "@/lib/auth";
import { requireWorkspace } from "@/lib/workspace";

export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  const auth = await apiUser(); if (!auth||auth.tokenPrincipal) return new Response("Unauthorized",{status:401});
  const workspace = await requireWorkspace(auth.supabase,auth.user);
  const encoder = new TextEncoder(); let closed = false;
  request.signal.addEventListener("abort",()=>{closed=true;});
  const stream = new ReadableStream({ async start(controller) {
    controller.enqueue(encoder.encode("retry: 5000\n\n"));
    while (!closed) {
      const { data } = await auth.supabase.from("agent_runs").select("id,kind,status,progress,queued_at,sites!inner(workspace_id,name)").eq("sites.workspace_id",workspace.workspace_id).order("queued_at",{ascending:false}).limit(20);
      controller.enqueue(encoder.encode(`event: runs\ndata: ${JSON.stringify(data || [])}\n\n`));
      const{data:events}=await auth.supabase.from("agent_events").select("id,run_id,role,event_type,status,tool_name,current_target,decision_summary,evidence_count,input_tokens,output_tokens,estimated_cost,retry_number,error_message,created_at,sites!inner(workspace_id,name)").eq("sites.workspace_id",workspace.workspace_id).order("created_at",{ascending:false}).limit(100);
      controller.enqueue(encoder.encode(`event: agent_events\ndata: ${JSON.stringify(events||[])}\n\n`));
      await new Promise((resolve)=>setTimeout(resolve,5000));
    }
    controller.close();
  }});
  return new Response(stream,{headers:{"content-type":"text/event-stream","cache-control":"no-cache, no-transform","connection":"keep-alive"}});
}
