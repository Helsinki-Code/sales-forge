"use client";
import { useState } from "react";

export function SiteActions({ siteId, status }: { siteId: string; status: string }) {
  const [message, setMessage] = useState("");
  async function audit() {
    const response = await fetch("/api/v1/audits", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ siteId, dryRun: status !== "active" }) });
    const json = await response.json(); setMessage(response.ok ? "Audit queued." : json.error?.message || "Audit failed");
  }
  async function verify(confirm = false) {
    const response = await fetch(`/api/v1/sites/${siteId}/verify${confirm ? "?confirm=1" : ""}`, { method: "POST" });
    const json = await response.json();
    if (response.ok && json.data?.path) setMessage(`Deploy ${json.data.path} containing: ${json.data.content}`);
    else setMessage(response.ok ? "Site verified and activated." : json.error?.message || "Verification failed");
  }
  return <div><div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}><button className="button secondary" style={{ padding: "7px 9px", fontSize: 11 }} onClick={audit}>Audit</button>{status !== "active" && <><button className="button secondary" style={{ padding: "7px 9px", fontSize: 11 }} onClick={() => verify(false)}>Challenge</button><button className="button secondary" style={{ padding: "7px 9px", fontSize: 11 }} onClick={() => verify(true)}>Confirm</button></>}</div>{message && <small style={{ display: "block", maxWidth: 300, marginTop: 5 }}>{message}</small>}</div>;
}
