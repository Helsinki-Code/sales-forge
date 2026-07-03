const GOOGLE_SCOPES = [
  "https://www.googleapis.com/auth/webmasters.readonly",
  "https://www.googleapis.com/auth/analytics.readonly",
  "openid", "email",
];

export function googleAuthorizationUrl(state: string) {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID || "", redirect_uri: process.env.GOOGLE_REDIRECT_URI || "", response_type: "code",
    access_type: "offline", prompt: "consent", scope: GOOGLE_SCOPES.join(" "), state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

export async function exchangeGoogleCode(code: string) {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ code, client_id: process.env.GOOGLE_CLIENT_ID || "", client_secret: process.env.GOOGLE_CLIENT_SECRET || "", redirect_uri: process.env.GOOGLE_REDIRECT_URI || "", grant_type: "authorization_code" }),
  });
  if (!response.ok) throw new Error(`Google OAuth failed (${response.status})`);
  return response.json() as Promise<{ access_token: string; refresh_token?: string; expires_in: number; scope: string }>;
}

export async function refreshGoogleAccessToken(refreshToken:string){const response=await fetch("https://oauth2.googleapis.com/token",{method:"POST",headers:{"content-type":"application/x-www-form-urlencoded"},body:new URLSearchParams({refresh_token:refreshToken,client_id:process.env.GOOGLE_CLIENT_ID||"",client_secret:process.env.GOOGLE_CLIENT_SECRET||"",grant_type:"refresh_token"})});if(!response.ok)throw new Error(`Google token refresh failed (${response.status})`);return response.json()as Promise<{access_token:string;expires_in:number;scope?:string}>}

export async function listSearchConsoleSites(accessToken: string) {
  const response = await fetch("https://www.googleapis.com/webmasters/v3/sites", { headers: { authorization: `Bearer ${accessToken}` } });
  if (!response.ok) throw new Error(`Search Console site listing failed (${response.status})`);
  return response.json();
}

export async function querySearchConsole(accessToken: string, siteUrl: string, startDate: string, endDate: string) {
  const response = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`, {
    method: "POST", headers: { authorization: `Bearer ${accessToken}`, "content-type": "application/json" },
    body: JSON.stringify({ startDate, endDate, dimensions: ["query", "page"], rowLimit: 25_000 }),
  });
  if (!response.ok) throw new Error(`Search Console query failed (${response.status})`);
  return response.json();
}
