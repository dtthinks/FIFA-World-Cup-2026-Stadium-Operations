/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import React from "react";
import App from "./App";

// Mock the components so we don't have to worry about sub-rendering issues in basic unit tests
vi.mock("./components/DashboardOverview", () => ({
  default: () => <div data-testid="dashboard-overview">Dashboard Overview Mock</div>
}));
vi.mock("./components/StadiuMap", () => ({
  default: () => <div data-testid="stadium-map">Stadium Map Mock</div>
}));
vi.mock("./components/IncidentManager", () => ({
  default: () => <div data-testid="incident-manager">Incident Manager Mock</div>
}));
vi.mock("./components/OperationsCopilot", () => ({
  default: () => <div data-testid="operations-copilot">Operations Copilot Mock</div>
}));
vi.mock("./components/CrowdPredictor", () => ({
  default: () => <div data-testid="crowd-predictor">Crowd Predictor Mock</div>
}));
vi.mock("./components/SustainabilityInsights", () => ({
  default: () => <div data-testid="sustainability-insights">Sustainability Insights Mock</div>
}));
vi.mock("./components/TransportationPlanner", () => ({
  default: () => <div data-testid="transportation-planner">Transportation Planner Mock</div>
}));
vi.mock("./components/MultilingualHelper", () => ({
  default: () => <div data-testid="multilingual-helper">Multilingual Helper Mock</div>
}));

const mockStadiumStatus = {
  currentMatch: {
    homeTeam: "USA",
    awayTeam: "MEXICO",
    score: "2 - 1",
    minute: "76'",
    attendance: 68450,
    maxCapacity: 72000
  },
  weather: {
    tempC: 24,
    condition: "Clear",
    humidity: 55
  },
  soundLevelDb: 98,
  gates: [],
  incidents: [],
  transit: [],
  sustainability: {
    solarPowerKw: 840,
    wasteRecycledKg: 4210,
    waterSavedLitres: 12450,
    carbonOffsetKg: 312
  },
  recommendations: [
    {
      id: "rec-1",
      category: "CROWD_CONTROL",
      title: "Gate B Congestion Rerouting",
      confidence: 96,
      why: "Crowd density at Gate B has reached 92%, while VIP/General Gate D has ample capacity.",
      suggestedAction: "Reroute outbound pedestrian traffic to Gate D.",
      expectedImpact: "Reduce Gate B queue times by approximately 35%.",
      timestamp: "10:41"
    }
  ],
  decisionFeed: [
    {
      id: "feed-1",
      timestamp: "10:41",
      title: "Congestion predicted",
      type: "congestion",
      description: "Gate B crowd density exceeded 90% threshold."
    }
  ]
};

describe("FIFA World Cup 2026 Stadium Operations Control Center", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockStadiumStatus)
      })
    ));
  });

  test("renders the loading screen initially", () => {
    render(<App />);
    expect(screen.getByText(/Loading Stadium Telemetry/i)).toBeDefined();
  });

  test("fetches stadium status and renders dashboard headers and components", async () => {
    render(<App />);
    
    await waitFor(() => {
      expect(screen.queryByText(/Loading Stadium Telemetry/i)).toBeNull();
    });

    expect(screen.getByText("FIFA World Cup 2026")).toBeDefined();
    expect(screen.getByText("STADIUM CONTROL")).toBeDefined();
    expect(screen.getByText("USA")).toBeDefined();
    expect(screen.getByText("MEXICO")).toBeDefined();
    expect(screen.getByText("2 - 1")).toBeDefined();
    expect(screen.getByText("76'")).toBeDefined();

    // Verify sub-components are rendered
    expect(screen.getByTestId("dashboard-overview")).toBeDefined();
    expect(screen.getByTestId("stadium-map")).toBeDefined();
    expect(screen.getByTestId("incident-manager")).toBeDefined();
  });
});
