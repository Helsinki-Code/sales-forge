import { z } from "zod";

export type DataForSeoCredentials = { login: string; password: string };
export type DataForSeoLocation = { locationCode?: number; languageCode?: string };

const taskSchema = z.object({
  status_code: z.number(),
  status_message: z.string().optional(),
  result: z.array(z.unknown()).nullable().optional(),
});

const responseSchema = z.object({ tasks: z.array(taskSchema).optional() });

export class DataForSeoError extends Error {
  constructor(message: string, readonly statusCode?: number) { super(message); }
}

export class DataForSeoClient {
  constructor(private readonly credentials: DataForSeoCredentials, private readonly baseUrl = "https://api.dataforseo.com/v3") {}

  private async post<T>(endpoint: string, tasks: Record<string, unknown>[]): Promise<T[]> {
    const auth = Buffer.from(`${this.credentials.login}:${this.credentials.password}`).toString("base64");
    const response = await fetch(`${this.baseUrl}/${endpoint}`, {
      method: "POST",
      headers: { authorization: `Basic ${auth}`, "content-type": "application/json" },
      body: JSON.stringify(tasks),
      signal: AbortSignal.timeout(60_000),
    });
    if (!response.ok) throw new DataForSeoError(`DataForSEO HTTP ${response.status}`, response.status);
    const body = responseSchema.parse(await response.json());
    const task = body.tasks?.[0];
    if (!task) return [];
    if (task.status_code !== 20000) throw new DataForSeoError(task.status_message || "DataForSEO task failed", task.status_code);
    return (task.result || []) as T[];
  }

  keywordIdeas(keyword: string, options: DataForSeoLocation & { limit?: number } = {}) {
    return this.post("keywords_data/google_ads/keywords_for_keywords/live", [{
      keywords: [keyword], location_code: options.locationCode ?? 2840, language_code: options.languageCode ?? "en", limit: options.limit ?? 50,
    }]);
  }

  autocomplete(keyword: string, options: DataForSeoLocation = {}) {
    return this.post("serp/google/autocomplete/live/advanced", [{
      keyword, location_code: options.locationCode ?? 2840, language_code: options.languageCode ?? "en",
    }]);
  }

  relatedKeywords(keyword: string, options: DataForSeoLocation & { depth?: 1 | 2 | 3; limit?: number } = {}) {
    return this.post("dataforseo_labs/google/related_keywords/live", [{
      keyword, location_code: options.locationCode ?? 2840, language_code: options.languageCode ?? "en", depth: options.depth ?? 1, limit: options.limit ?? 1000,
    }]);
  }

  serp(keyword: string, options: DataForSeoLocation & { depth?: number } = {}) {
    return this.post("serp/google/organic/live/advanced", [{
      keyword, location_code: options.locationCode ?? 2840, language_code: options.languageCode ?? "en", depth: options.depth ?? 20,
    }]);
  }

  backlinks(target: string, limit = 50) {
    return this.post("backlinks/backlinks/live", [{ target, limit, order_by: ["rank,desc"] }]);
  }

  domainOverview(target: string, options: DataForSeoLocation = {}) {
    return this.post("dataforseo_labs/google/ranked_keywords/live", [{
      target, location_code: options.locationCode ?? 2840, language_code: options.languageCode ?? "en", limit: 1,
    }]);
  }

  competitorGap(target: string, competitor: string, options: DataForSeoLocation & { limit?: number } = {}) {
    return this.post("dataforseo_labs/google/domain_intersection/live", [{
      target1: target, target2: competitor, intersections: false,
      location_code: options.locationCode ?? 2840, language_code: options.languageCode ?? "en", limit: options.limit ?? 100,
    }]);
  }
}
