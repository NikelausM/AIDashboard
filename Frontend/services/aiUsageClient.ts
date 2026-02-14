import { AI_BACKEND_API_BASE_URL } from "~/constants/urls";
import { isUsage, type Usage } from "../types/Usage";

/**
 * Frontend client for interacting with AI usage API.
 */
export class AIUsageClient {
  /**
   * Timestamp based cache.
   */
  private cache: Record<number, { timestamp: number; data: Usage[] }> = {};
  /**
   * How long a cached entry remains valid before the client must fetch fresh data again.
   * 
   * Assumes there is only new data every week since the shortest period is a week, 
   * and the weekly data is assumed to be unlikely to change once written.
   */
  private timeToLiveMilliseconds = 7 * 24 * 60 * 60 * 1000;

  /**
   * Gets the usage data.
   * 
   * @param teamId The team id.
   * @returns The usage data.
   */
  async getUsage(teamId: number): Promise<Usage[]> {
    const now = Date.now();
    const entry = this.cache[teamId];

    if (entry && now - entry.timestamp < this.timeToLiveMilliseconds) {
      return entry.data;
    }

    const response = await fetch(`${AI_BACKEND_API_BASE_URL}/${teamId}`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const json = await response.json();

    if (!Array.isArray(json) || !json.every(isUsage)) {
      throw new Error(`API error: response was not in expected Usage format`);
    }

    this.cache[teamId] = { timestamp: now, data: json };
    return json;
  }
}