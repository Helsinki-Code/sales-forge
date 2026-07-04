import { safeFetch } from "@seoforge/core";

export type WordPressCredentials = { apiUrl: string; username: string; applicationPassword: string };

function endpoint(apiUrl: string, path: string) {
  const root = apiUrl.replace(/\/$/, "").replace(/\/wp-json\/wp\/v2$/, "");
  return `${root}/wp-json/wp/v2/${path.replace(/^\//, "")}`;
}

function auth(credentials: WordPressCredentials) {
  return `Basic ${Buffer.from(`${credentials.username}:${credentials.applicationPassword}`).toString("base64")}`;
}

export async function verifyWordPressConnection(credentials: WordPressCredentials) {
  const response = await safeFetch(endpoint(credentials.apiUrl, "users/me?context=edit"), {
    headers: { authorization: auth(credentials), accept: "application/json" },
  });
  if (!response.ok) throw new Error(`WordPress authentication failed (HTTP ${response.status})`);
  const user = await response.json() as { id?: number; name?: string; roles?: string[] };
  if (!user.id) throw new Error("WordPress did not return an authenticated user");
  return { userId: user.id, name: user.name || credentials.username, roles: user.roles || [] };
}

export async function listWordPressContent(credentials: WordPressCredentials, limit = 50) {
  const response = await safeFetch(endpoint(credentials.apiUrl, `posts?context=edit&per_page=${Math.min(limit, 100)}`), {
    headers: { authorization: auth(credentials), accept: "application/json" },
  }, 5_000_000);
  if (!response.ok) throw new Error(`WordPress content retrieval failed (HTTP ${response.status})`);
  return response.json();
}
