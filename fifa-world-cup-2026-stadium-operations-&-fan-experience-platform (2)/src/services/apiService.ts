/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { StadiumStatus, GateStatus, IncidentCategory, IncidentPriority } from "../types";

const DEFAULT_TIMEOUT_MS = 8000;
const MAX_RETRIES = 3;

interface RequestOptions extends RequestInit {
  timeoutMs?: number;
  retries?: number;
}

/**
 * Executes a fetch request with timeout and automatic retry logic for transient errors.
 * 
 * @param url - The URL to request.
 * @param options - Custom request configuration including optional timeout and retry limits.
 * @returns Responds with the Response object if successful.
 * @throws An error on persistent network failures, timeouts, or non-2xx statuses.
 */
async function fetchWithRetry(url: string, options: RequestOptions = {}): Promise<Response> {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, retries = MAX_RETRIES, ...fetchOpts } = options;
  
  let attempt = 0;
  while (attempt < retries) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    
    try {
      const response = await fetch(url, {
        ...fetchOpts,
        signal: controller.signal
      });
      clearTimeout(id);
      
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
      }
      return response;
    } catch (err: unknown) {
      clearTimeout(id);
      attempt++;
      
      const isTimeout = err instanceof Error && err.name === "AbortError";
      console.warn(`API Request attempt ${attempt}/${retries} failed for URL ${url}. Error:`, err);
      
      if (attempt >= retries) {
        if (isTimeout) {
          throw new Error(`Request to ${url} timed out after ${timeoutMs}ms.`);
        }
        throw err;
      }
      
      // Exponential backoff delay
      await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 200));
    }
  }
  
  throw new Error("Unreachable statement in fetchWithRetry");
}

export const apiService = {
  /**
   * Fetches the current live status and telemetry of the stadium.
   */
  async getStadiumStatus(): Promise<StadiumStatus> {
    const res = await fetchWithRetry("/api/stadium/status", { method: "GET" });
    return res.json() as Promise<StadiumStatus>;
  },

  /**
   * Updates the status overlay of a gate override.
   */
  async updateGateStatus(gateId: string, status: GateStatus): Promise<{ success: boolean; state: StadiumStatus }> {
    const res = await fetchWithRetry("/api/stadium/gate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gateId, status })
    });
    return res.json() as Promise<{ success: boolean; state: StadiumStatus }>;
  },

  /**
   * Dispatches a specific number of volunteers to an active incident.
   */
  async dispatchVolunteers(incidentId: string, volunteerCount: number): Promise<{ success: boolean; state: StadiumStatus }> {
    const res = await fetchWithRetry("/api/stadium/dispatch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ incidentId, volunteerCount })
    });
    return res.json() as Promise<{ success: boolean; state: StadiumStatus }>;
  },

  /**
   * Resolves an active incident in the stadium.
   */
  async resolveIncident(incidentId: string): Promise<{ success: boolean; state: StadiumStatus }> {
    const res = await fetchWithRetry("/api/stadium/resolve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ incidentId })
    });
    return res.json() as Promise<{ success: boolean; state: StadiumStatus }>;
  },

  /**
   * Submits a newly reported incident to operations command.
   */
  async createIncident(incident: {
    title: string;
    category: IncidentCategory;
    location: string;
    priority: IncidentPriority;
    description: string;
  }): Promise<{ success: boolean; state: StadiumStatus }> {
    const res = await fetchWithRetry("/api/stadium/incident/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(incident)
    });
    return res.json() as Promise<{ success: boolean; state: StadiumStatus }>;
  },

  /**
   * Drives the live pedestrian flow simulator scaling.
   */
  async runSimulationScale(densityScale: number): Promise<{ success: boolean; state: StadiumStatus }> {
    const res = await fetchWithRetry("/api/stadium/simulate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ densityScale })
    });
    return res.json() as Promise<{ success: boolean; state: StadiumStatus }>;
  },

  /**
   * Queries the GenAI models for active diagnostic analysis.
   */
  async triggerModelAnalysis(): Promise<{ recommendations: any[] }> {
    const res = await fetchWithRetry("/api/gemini/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    });
    return res.json() as Promise<{ recommendations: any[] }>;
  },

  /**
   * Sends a prompt statement to the Gemini Operations Copilot.
   */
  async sendCopilotMessage(message: string): Promise<{ text: string }> {
    const res = await fetchWithRetry("/api/gemini/copilot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message })
    });
    return res.json() as Promise<{ text: string }>;
  }
};
