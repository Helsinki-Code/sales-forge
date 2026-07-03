import Link from "next/link";
import { LoginButton } from "@/components/login-button";
import { isConfigured } from "@/lib/env";

export default function LoginPage() {
  const configured = isConfigured();
  return <main className="login-wrap"><div className="login-card">
    <Link className="brand" href="/"><span className="brand-mark">S</span>SEOForge</Link>
    <h1>Bring your site.<br/>Meet your team.</h1>
    <p>GitHub signs you in. A separate least-privilege GitHub App controls exactly which repositories SEOForge may inspect and propose changes to.</p>
    {!configured ? <div className="notice">Supabase is not configured yet. Copy <code>.env.example</code> to <code>.env.local</code> and add your project credentials.</div> : <LoginButton />}
    <p style={{fontSize:12}}>Signing in never grants automatic merge or deployment permission.</p>
  </div></main>;
}
