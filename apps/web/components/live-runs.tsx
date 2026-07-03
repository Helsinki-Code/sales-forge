"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Run = {
  id: string;
  kind: string;
  status: string;
  progress?: { stage?: string; roles?: string[]; findings?: number } | null;
  queued_at: string;
  sites?: { name?: string } | null;
};

export function LiveRuns({ initialRuns, compact = false }: { initialRuns: Run[]; compact?: boolean }) {
  const [runs, setRuns] = useState(initialRuns);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const events = new EventSource("/api/v1/events");
    const onRuns = (event: MessageEvent) => {
      try { setRuns(JSON.parse(event.data)); setConnected(true); } catch { setConnected(false); }
    };
    events.addEventListener("runs", onRuns as EventListener);
    events.onerror = () => setConnected(false);
    return () => { events.removeEventListener("runs", onRuns as EventListener); events.close(); };
  }, []);

  const visible = compact ? runs.slice(0, 6) : runs;
  return <div className="table-card">
    <header><strong>{compact ? "Recent runs" : "Live agent activity"}</strong><span className="badge">{connected ? "● live" : "connecting…"}</span></header>
    {visible.length ? <table><thead><tr><th>Site</th><th>Workflow</th>{!compact && <th>Stage</th>}{!compact && <th>Specialists</th>}<th>Status</th><th></th></tr></thead>
      <tbody>{visible.map((run) => <tr key={run.id}>
        <td>{run.sites?.name || "Site"}</td><td>{run.kind.replaceAll("_", " ")}</td>
        {!compact && <td>{run.progress?.stage?.replaceAll("_", " ") || "waiting for worker"}</td>}
        {!compact && <td>{run.progress?.roles?.length || "—"}</td>}
        <td><span className="badge">{run.status}</span></td><td><Link className="table-link" href={`/dashboard/runs/${run.id}`}>Open →</Link></td>
      </tr>)}</tbody></table> : <div className="empty">No runs yet. Trigger an audit from Sites.</div>}
  </div>;
}
