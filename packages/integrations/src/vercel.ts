export function vercelAuthorizationUrl(state: string, redirectUri: string) {
  const clientId = process.env.SEOFORGE_VERCEL_CLIENT_ID;
  const slug = process.env.SEOFORGE_VERCEL_INTEGRATION_SLUG;
  if (!clientId) throw new Error("SEOFORGE_VERCEL_CLIENT_ID is required");
  if (!slug) throw new Error("SEOFORGE_VERCEL_INTEGRATION_SLUG is required");
  const params = new URLSearchParams({ client_id: clientId, redirect_uri: redirectUri, state });
  return `https://vercel.com/integrations/${encodeURIComponent(slug)}/new?${params}`;
}

export async function exchangeVercelCode(code: string, redirectUri: string) {
  const response = await fetch("https://api.vercel.com/v2/oauth/access_token", {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ client_id: process.env.SEOFORGE_VERCEL_CLIENT_ID, client_secret: process.env.SEOFORGE_VERCEL_CLIENT_SECRET, code, redirect_uri: redirectUri }),
  });
  if (!response.ok) throw new Error(`Vercel OAuth failed (${response.status})`);
  return response.json() as Promise<{ access_token: string; team_id?: string; user_id: string }>;
}

export async function listVercelProjects(token: string, teamId?: string) {
  const params = teamId ? `?teamId=${encodeURIComponent(teamId)}` : "";
  const response = await fetch(`https://api.vercel.com/v9/projects${params}`, { headers: { authorization: `Bearer ${token}` } });
  if (!response.ok) throw new Error(`Vercel project listing failed (${response.status})`);
  return response.json();
}
