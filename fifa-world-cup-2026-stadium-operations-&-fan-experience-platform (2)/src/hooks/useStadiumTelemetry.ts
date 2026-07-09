/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from "react";
import { StadiumStatus, GateStatus, IncidentPriority, IncidentCategory } from "../types";
import { apiService } from "../services/apiService";

export interface UseStadiumTelemetryReturn {
  status: StadiumStatus | null;
  isLoading: boolean;
  isUpdating: boolean;
  error: string | null;
  simulationScale: number;
  selectedGateId: string | null;
  setSelectedGateId: (id: string | null) => void;
  fetchStadiumStatus: () => Promise<void>;
  updateGateStatus: (gateId: string, gateStatus: GateStatus) => Promise<void>;
  dispatchVolunteers: (incidentId: string, count: number) => Promise<void>;
  resolveIncident: (incidentId: string) => Promise<void>;
  createIncident: (newIncident: {
    title: string;
    category: IncidentCategory;
    location: string;
    priority: IncidentPriority;
    description: string;
  }) => Promise<void>;
  runSimulationScale: (scale: number) => Promise<void>;
  triggerModelAnalysis: () => Promise<void>;
  translateAnnouncement: (text: string, lang: string) => Promise<string>;
  sendCopilotMessage: (text: string) => Promise<string>;
}

/**
 * Custom hook to manage the stadium's real-time telemetry pipelines and interaction methods.
 * Centralizes state syncing, simulation overrides, and LLM orchestration calls.
 * 
 * @returns An object with stadium state, loading flags, error tracking, and callback methods.
 */
export function useStadiumTelemetry(): UseStadiumTelemetryReturn {
  const [status, setStatus] = useState<StadiumStatus | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [simulationScale, setSimulationScale] = useState<number>(75);
  const [selectedGateId, setSelectedGateId] = useState<string | null>("gate-b");

  // Fetch full state from backend
  const fetchStadiumStatus = useCallback(async () => {
    try {
      const data = await apiService.getStadiumStatus();
      setStatus(data);
      setError(null);
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unknown error occurred while connecting to the telemetry server.");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Sync / poll status every 10s
  useEffect(() => {
    fetchStadiumStatus();
    const interval = setInterval(fetchStadiumStatus, 10000);
    return () => clearInterval(interval);
  }, [fetchStadiumStatus]);

  // Update Gate Status Overrides
  const updateGateStatus = useCallback(async (gateId: string, gateStatus: GateStatus) => {
    setIsUpdating(true);
    try {
      const result = await apiService.updateGateStatus(gateId, gateStatus);
      if (result.success && result.state) {
        setStatus(result.state);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error updating gate status.";
      console.error(msg);
    } finally {
      setIsUpdating(false);
    }
  }, []);

  // Dispatch volunteers to incidents
  const dispatchVolunteers = useCallback(async (incidentId: string, count: number) => {
    setIsUpdating(true);
    try {
      const result = await apiService.dispatchVolunteers(incidentId, count);
      if (result.success && result.state) {
        setStatus(result.state);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error dispatching volunteers.";
      console.error(msg);
    } finally {
      setIsUpdating(false);
    }
  }, []);

  // Resolve active incidents
  const resolveIncident = useCallback(async (incidentId: string) => {
    setIsUpdating(true);
    try {
      const result = await apiService.resolveIncident(incidentId);
      if (result.success && result.state) {
        setStatus(result.state);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error resolving incident.";
      console.error(msg);
    } finally {
      setIsUpdating(false);
    }
  }, []);

  // Create simulated incidents
  const createIncident = useCallback(async (newInc: {
    title: string;
    category: IncidentCategory;
    location: string;
    priority: IncidentPriority;
    description: string;
  }) => {
    setIsUpdating(true);
    try {
      const result = await apiService.createIncident(newInc);
      if (result.success && result.state) {
        setStatus(result.state);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error creating incident report.";
      console.error(msg);
    } finally {
      setIsUpdating(false);
    }
  }, []);

  // Run dynamic simulation changes (sliders)
  const runSimulationScale = useCallback(async (val: number) => {
    setSimulationScale(val);
    try {
      const result = await apiService.runSimulationScale(val);
      if (result.state) {
        setStatus(result.state);
      }
    } catch (err) {
      console.error("Simulation update failed:", err);
    }
  }, []);

  // Triggers Gemini API model diagnostics re-run
  const triggerModelAnalysis = useCallback(async () => {
    setIsUpdating(true);
    try {
      const result = await apiService.triggerModelAnalysis();
      if (result.recommendations) {
        setStatus(prev => prev ? { ...prev, recommendations: result.recommendations } : null);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error triggering GenAI model analysis.";
      console.error(msg);
    } finally {
      setIsUpdating(false);
    }
  }, []);

  // Run structured recommendation translator / translator pipeline helper
  const translateAnnouncement = useCallback(async (text: string, lang: string): Promise<string> => {
    try {
      const result = await apiService.sendCopilotMessage(`Translate this announcement to ${lang}: "${text}"`);
      return result.text;
    } catch (err) {
      console.error("AI translation system failed:", err);
      throw err;
    }
  }, []);

  // Send message to Gemini Copilot
  const sendCopilotMessage = useCallback(async (messageText: string): Promise<string> => {
    try {
      const result = await apiService.sendCopilotMessage(messageText);
      return result.text;
    } catch (err) {
      console.error("Gemini Copilot engine returned an error:", err);
      throw err;
    }
  }, []);

  return {
    status,
    isLoading,
    isUpdating,
    error,
    simulationScale,
    selectedGateId,
    setSelectedGateId,
    fetchStadiumStatus,
    updateGateStatus,
    dispatchVolunteers,
    resolveIncident,
    createIncident,
    runSimulationScale,
    triggerModelAnalysis,
    translateAnnouncement,
    sendCopilotMessage
  };
}
