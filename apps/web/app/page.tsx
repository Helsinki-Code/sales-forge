import Link from "next/link";

const agents = [
  ["T", "Technical SEO", "Crawl, schema, CWV, links"],
  ["S", "SERP Analyst", "Rankings, gaps, competitors"],
  ["G", "Content & GEO", "Intent, citations, entities"],
  ["Q", "QA & Policy", "Evidence, tests, guardrails"],
];

export default function LandingPage() {
  return <>
    <header className="shell topbar">
      <Link className="brand" href="/"><span className="brand-mark">S</span>SEOForge</Link>
      <nav className="nav"><a href="#workflow">Workflow</a><a href="#safety">Safety</a><Link href="/login" className="button primary">Start optimizing</Link></nav>
    </header>
    <main>
      <section className="shell hero">
        <div>
          <span className="eyebrow">Autonomous research. Human authority.</span>
          <h1>Your SEO team never clocks out.</h1>
          <p className="hero-copy">Connect a website and GitHub repository. Nine specialists continuously audit search performance, study the SERP, learn your brand, and prepare validated pull requests—without ever taking production away from you.</p>
          <div className="hero-actions"><Link className="button primary" href="/login">Continue with GitHub →</Link><a className="button secondary" href="#workflow">See the workflow</a></div>
        </div>
        <div className="agent-orbit">
          <div className="live-pill"><span className="dot" /> Team active · waiting for evidence</div>
          <h2 style={{fontSize: 30, margin: "26px 0 6px"}}>One site. Nine specialists.<br/>One protected workflow.</h2>
          <div className="agent-stack">{agents.map(([icon,name,detail]) => <div className="agent-row" key={name}><span className="agent-icon">{icon}</span><div><strong>{name}</strong><small>{detail}</small></div><span className="dot" /></div>)}</div>
        </div>
      </section>
      <section className="section" id="workflow" style={{background:"#edf4ee"}}><div className="shell">
        <span className="eyebrow">How work reaches production</span><h2 className="section-title">From signal to safe deployment.</h2><p className="section-copy">Every recommendation carries captured evidence, expected impact, a real code diff, preview checks, and a rollback plan.</p>
        <div className="grid-3">{[
          ["1","Connect","GitHub App, verified site, deployment workflow, analytics, and your DataForSEO account."],
          ["2","Investigate","Scheduled specialists measure technical health, rankings, content, GEO readiness, and competitors."],
          ["3","Approve","Review the preview and evidence. Only your explicit click can satisfy the final merge gate."],
        ].map(([n,t,b]) => <article className="card" key={n}><span className="step-number">{n}</span><h3>{t}</h3><p>{b}</p></article>)}</div>
      </div></section>
      <section className="shell section" id="safety"><span className="eyebrow">Designed to fail closed</span><h2 className="section-title">Autonomy without a production skeleton key.</h2><div className="grid-3">
        <article className="card"><h3>Evidence or silence</h3><p>Claims, statistics, rankings, and recommendations require timestamped sources. Uncertainty stays visible.</p></article>
        <article className="card"><h3>Credentials stay brokered</h3><p>Models never receive GitHub, provider, deployment, or billing secrets. Short-lived tokens remain server-side.</p></article>
        <article className="card"><h3>GitHub remains sovereign</h3><p>Branch protection and required checks are authoritative even after an in-app human approval.</p></article>
      </div></section>
    </main>
  </>;
}
