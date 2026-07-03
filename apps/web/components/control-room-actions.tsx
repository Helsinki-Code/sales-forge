"use client";

import { useState } from "react";

const workflows = [
  { key: "weekly_audit", label: "Launch full audit", roles: ["site_cartographer","technical_seo","serp_competitor","content_geo","media_studio","qa_policy","analytics_experiment"] },
  { key: "daily_rank", label: "Check rankings", roles: ["supervisor","serp_competitor","analytics_experiment"] },
  { key: "monthly_strategy", label: "Build strategy", roles: ["supervisor","serp_competitor","content_geo","analytics_experiment"] },
];

export function ControlRoomActions({ sites }: { sites: { id:string; name:string; status:string }[] }) {
  const [siteId,setSiteId]=useState(sites[0]?.id||"");
  const [message,setMessage]=useState("");
  const [busy,setBusy]=useState("");
  async function launch(workflow:typeof workflows[number]){
    if(!siteId)return;
    setBusy(workflow.key);setMessage("");
    const response=await fetch("/api/v1/runs",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({siteId,kind:workflow.key,roles:workflow.roles,dryRun:sites.find(s=>s.id===siteId)?.status!=="active"})});
    const json=await response.json();setBusy("");
    setMessage(response.ok?`${workflow.label} queued — watch the team below.`:json.error?.message||"Could not start workflow");
  }
  return <div className="command-bar"><div><span className="eyebrow">Command center</span><h2>Put the team to work</h2><p>Agents investigate continuously. Launch an extra cycle whenever the market moves.</p></div><div className="command-controls">
    <select value={siteId} onChange={e=>setSiteId(e.target.value)} aria-label="Site">{sites.map(site=><option value={site.id} key={site.id}>{site.name}</option>)}</select>
    <div className="command-buttons">{workflows.map(workflow=><button className={workflow.key==="weekly_audit"?"button primary":"button secondary"} disabled={!siteId||Boolean(busy)} onClick={()=>launch(workflow)} key={workflow.key}>{busy===workflow.key?"Queuing…":workflow.label}</button>)}</div>
    {message&&<small>{message}</small>}
  </div></div>;
}
