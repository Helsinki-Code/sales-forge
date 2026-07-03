import Link from "next/link";
import { currentWorkspace } from "@/lib/auth";
import { VoiceReview } from "@/components/voice-review";
import { LiveRuns } from "@/components/live-runs";
import { ControlRoomActions } from "@/components/control-room-actions";

const agents=[
  ["supervisor","SV","Supervisor","Coordinates priorities, budgets, conflicts, and safe handoffs"],
  ["site_cartographer","SC","Site Cartographer","Maps pages, templates, entities, content relationships, and framework"],
  ["technical_seo","TS","Technical SEO","Audits crawlability, indexability, schema, links, canonicals, and performance"],
  ["serp_competitor","SR","SERP Analyst","Tracks rankings, competitors, SERP features, gaps, and query movement"],
  ["content_geo","CG","Content & GEO","Builds clusters, answer-first pages, citations, entities, and internal links"],
  ["media_studio","MS","Media Studio","Learns brand DNA and produces images, narration, transcripts, and video"],
  ["repository_engineer","RE","Repository Engineer","Turns approved opportunities into framework-aware, tested patches"],
  ["qa_policy","QA","QA & Policy","Challenges evidence, claims, schema, security, builds, and regressions"],
  ["analytics_experiment","AE","Experiment Analyst","Measures baselines, cohorts, conversions, decay, and attributed outcomes"],
] as const;

export default async function DashboardPage(){
  const{supabase,membership}=await currentWorkspace();const workspaceId=membership?.workspace_id;
  const[{data:sites=[]},{data:recentRuns=[]},{data:topFindings=[]},{count:proposalCount},{count:queryCount}]=workspaceId?await Promise.all([
    supabase.from("sites").select("id,name,status,url").eq("workspace_id",workspaceId).order("created_at"),
    supabase.from("agent_runs").select("id,kind,status,progress,roles,queued_at,sites!inner(name,workspace_id)").eq("sites.workspace_id",workspaceId).order("queued_at",{ascending:false}).limit(20),
    supabase.from("findings").select("id,title,description,priority,confidence,category,role,sites!inner(name,workspace_id)").eq("sites.workspace_id",workspaceId).eq("status","open").order("created_at",{ascending:false}).limit(6),
    supabase.from("proposals").select("*,sites!inner(workspace_id)",{count:"exact",head:true}).eq("sites.workspace_id",workspaceId).in("state",["ready","checks_pending"]),
    supabase.from("tracked_queries").select("*,sites!inner(workspace_id)",{count:"exact",head:true}).eq("sites.workspace_id",workspaceId).eq("active",true),
  ]):[{data:[]},{data:[]},{data:[]},{count:0},{count:0}] as any;
  const activeRun=(recentRuns||[]).find((run:any)=>run.status==="running"||run.status==="queued");
  return <>
    <header className="control-header"><div><div className="system-status"><span className="pulse"/>AUTONOMOUS TEAM ONLINE</div><h1>Your search growth control room.</h1><p>Nine specialists monitor, investigate, test, and prepare improvements around the clock. Search engines decide rankings; your team compounds every controllable advantage.</p></div><Link href="/dashboard/onboarding" className="button primary">+ Connect a site</Link></header>
    <ControlRoomActions sites={(sites||[]) as any}/>
    <section className="metric-grid control-metrics">
      <Link className="metric" href="/dashboard/sites"><strong>{sites?.length||0}</strong><span>Sites under watch</span><small>Ownership and deployment connections →</small></Link>
      <Link className="metric" href="/dashboard/runs"><strong>{recentRuns?.length||0}</strong><span>Recent investigations</span><small>{activeRun?`${activeRun.status}: ${activeRun.kind.replaceAll("_"," ")}`:"Next cycle scheduled"} →</small></Link>
      <Link className="metric" href="/dashboard/findings"><strong>{topFindings?.length||0}</strong><span>Open opportunities</span><small>Prioritized by evidence and impact →</small></Link>
      <Link className="metric" href="/dashboard/proposals"><strong>{proposalCount||0}</strong><span>Changes awaiting review</span><small>Nothing merges without your click →</small></Link>
    </section>
    <section className="section-block"><div className="section-heading"><div><span className="eyebrow">Your autonomous team</span><h2>Nine specialists. One shared objective.</h2></div><span>{activeRun?"Investigation in progress":"Monitoring between cycles"}</span></div><div className="agent-grid">{agents.map(([role,initials,name,description])=>{const execution=activeRun?.progress?.agents?.[role];const state=execution?.status||"watching";return <div className="agent-card" key={name}><div className="agent-card-top"><span className="agent-avatar">{initials}</span><span className={`agent-state ${state==="running"?"working":""}`}>{state}</span></div><h3>{name}</h3><p>{description}</p><small>{execution?.summary||(["running","queued"].includes(state)?activeRun?.progress?.stage?.replaceAll("_"," "):"Standing by for scheduled or event-triggered work")}</small></div>})}</div></section>
    <section className="control-columns"><div><div className="section-heading"><div><span className="eyebrow">Live execution</span><h2>What the team is doing</h2></div><Link href="/dashboard/runs">All runs →</Link></div><LiveRuns initialRuns={(recentRuns||[]) as any}/></div>
      <div><div className="section-heading"><div><span className="eyebrow">Opportunity pipeline</span><h2>What deserves attention</h2></div><Link href="/dashboard/findings">All findings →</Link></div><div className="opportunity-stack">{topFindings?.map((finding:any)=><Link href={`/dashboard/findings/${finding.id}`} className="opportunity-mini" key={finding.id}><div><span className={`badge ${finding.priority==="critical"?"critical":finding.priority==="high"?"warn":""}`}>{finding.priority}</span><span>{finding.sites?.name}</span></div><strong>{finding.title}</strong><p>{finding.description}</p><footer>{Math.round(Number(finding.confidence)*100)}% confidence <b>Inspect →</b></footer></Link>)}{!topFindings?.length&&<div className="empty card">No open opportunities yet. Launch a full audit.</div>}</div></div>
    </section>
    <section className="control-columns lower"><div className="card cadence"><span className="eyebrow">Always-on cadence</span><h2>The team does not wait for you to log in.</h2>{[["After every deploy","Crawl, schema, links, performance, smoke tests"],["Daily","Priority rankings, competitors, SERP features, anomalies"],["Weekly","Full technical, content, GEO, and experience audit"],["Monthly","Strategy, content decay, backlinks, and experiment review"]].map(([time,work])=><div className="cadence-row" key={time}><strong>{time}</strong><span>{work}</span></div>)}<p className="fine-print">Currently tracking {queryCount||0} queries. Connect DataForSEO and Google Search Console for live market signals.</p></div><div style={{display:"grid",gap:16}}><div className="card human-gate"><span className="eyebrow">Human gate</span><h2>Agents act. You remain in control.</h2><p>Research, patches, previews, and validation happen autonomously. Production merge still requires your explicit approval and GitHub’s protected checks.</p><Link className="button secondary" href="/dashboard/proposals">Review prepared changes</Link></div><VoiceReview/></div></section>
  </>;
}
