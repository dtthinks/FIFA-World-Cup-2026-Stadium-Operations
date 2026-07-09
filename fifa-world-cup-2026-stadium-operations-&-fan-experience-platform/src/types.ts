/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum IncidentStatus {
  ACTIVE = "ACTIVE",
  DISPATCHED = "DISPATCHED",
  RESOLVED = "RESOLVED"
}

export enum IncidentPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH"
}

export enum GateStatus {
  OPEN = "OPEN",
  CLOSED = "CLOSED",
  REDIRECTING = "REDIRECTING"
}

export interface GateInfo {
  id: string;
  name: string; // e.g., "Gate A", "Gate B"
  density: number; // percentage (0 - 100)
  turnstileRate: number; // fans per minute
  status: GateStatus;
  queueTime: number; // estimated waiting time in minutes
  capacity: number; // maximum flow capacity/min
  location: string; // e.g., "North Gate", "East Gate"
}

export interface Incident {
  id: string;
  title: string;
  category: "CROWD" | "MEDICAL" | "FACILITY" | "SECURITY" | "TECH";
  location: string;
  status: IncidentStatus;
  priority: IncidentPriority;
  description: string;
  timestamp: string;
  volunteersDispatched: number;
}

export interface AIRecommendation {
  id: string;
  category: string;
  title: string;
  confidence: number; // percentage, e.g., 96
  why: string; // Reason
  suggestedAction: string;
  expectedImpact: string; // Expected Result
  timestamp: string;
}

export interface DecisionFeedItem {
  id: string;
  timestamp: string; // e.g., "10:41"
  title: string;
  type: "congestion" | "gate_update" | "volunteer_dispatch" | "congestion_reduced" | "sustainability" | "incident";
  description: string;
}

export interface TransitRoute {
  id: string;
  name: string;
  type: "METRO" | "SHUTTLE" | "TAXI" | "BUS";
  status: "NORMAL" | "DELAYED" | "CONGESTED";
  frequencyMins: number;
  waitTimeMins: number;
  description: string;
}

export interface SustainabilityMetrics {
  solarPowerKw: number;
  wasteRecycledKg: number;
  waterSavedLitres: number;
  carbonOffsetKg: number;
}

export interface StadiumStatus {
  currentMatch: {
    homeTeam: string;
    awayTeam: string;
    score: string;
    minute: string;
    attendance: number;
    maxCapacity: number;
  };
  weather: {
    tempC: number;
    condition: string;
    humidity: number;
  };
  soundLevelDb: number;
  gates: GateInfo[];
  incidents: Incident[];
  transit: TransitRoute[];
  sustainability: SustainabilityMetrics;
  recommendations: AIRecommendation[];
  decisionFeed: DecisionFeedItem[];
}

export interface CopilotMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: string;
}
