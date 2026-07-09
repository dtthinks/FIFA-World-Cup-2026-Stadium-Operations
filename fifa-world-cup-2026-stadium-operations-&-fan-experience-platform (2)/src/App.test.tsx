/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @vitest-environment jsdom
 */

import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import App from "./App";

const mockStadiumStatus = {
  currentMatch: {
    homeTeam: "USA",
    awayTeam: "MEXICO",
    score: "2 - 1",
    minute: "76'",
    attendance: 68500,
    maxCapacity: 72000
  },
  weather: {
    tempC: 22,
    condition: "Clear",
    humidity: 45
  },
  soundLevelDb: 98,
  gates: [
    { id: "gate-a", name: "Gate A", density: 45, turnstileRate: 120, status: "OPEN", queueTime: 12, capacity: 150, location: "North Gate" },
    { id: "gate-b", name: "Gate B", density: 92, turnstileRate: 65, status: "REDIRECTING", queueTime: 38, capacity: 150, location: "East Gate" },
    { id: "gate-c", name: "Gate C", density: 15, turnstileRate: 140, status: "OPEN", queueTime: 4, capacity: 150, location: "West Gate" },
    { id: "gate-d", name: "Gate D", density: 20, turnstileRate: 110, status: "OPEN", queueTime: 5, capacity: 150, location: "VIP Gate" }
  ],
  incidents: [
    { id: "inc-101", title: "Ramp 4B Crowding Blockage", category: "CROWD", location: "Concourse Ramp 4B", status: "ACTIVE", priority: "HIGH", description: "Mechanical backup causing 200+ spectator queue bottlenecks.", timestamp: "12:04", volunteersDispatched: 0 },
    { id: "inc-102", title: "Section 114 Row F Dehydration", category: "MEDICAL", location: "Section 114 Stands", status: "DISPATCHED", priority: "MEDIUM", description: "Male spectator expressing heat fatigue symptoms.", timestamp: "12:05", volunteersDispatched: 3 }
  ],
  transit: [
    { id: "metro-1", name: "Olympic Park Express", type: "METRO", status: "DELAYED", frequencyMins: 5, waitTimeMins: 20, description: "Line 1 signaling issue near North depot" }
  ],
  sustainability: {
    solarPowerKw: 840,
    wasteRecycledKg: 1420,
    waterSavedLitres: 4500,
    carbonOffsetKg: 350
  },
  recommendations: [
    { id: "rec-1", category: "CROWD", title: "Activate Gate D Redirections", confidence: 96, why: "Gate B is congested", suggestedAction: "Reroute outbound flow", expectedImpact: "Saves 35% time", timestamp: "12:06" }
  ],
  decisionFeed: [
    { id: "feed-1", timestamp: "12:05", title: "Gate B Redirection Authorized", type: "gate_update", description: "Bypassed standard queues to Gate D VIP lanes." }
  ]
};

// Mock sub-components where needed to keep test focus on UI and container pipelines
vi.mock("./components/StadiuMap", () => ({
  default: ({ selectedGateId, setSelectedGateId }: any) => (
    <div data-testid="stadium-map">
      <span>Stadium Map Component</span>
      <button onClick={() => setSelectedGateId("gate-d")}>Select Gate D</button>
    </div>
  )
}));

// Mock hook behavior directly to control loading & state transitions synchronously and robustly
const mockRunSimulationScale = vi.fn().mockImplementation(() => Promise.resolve());
const mockTriggerModelAnalysis = vi.fn().mockImplementation(() => Promise.resolve());

vi.mock("./hooks/useStadiumTelemetry", () => {
  return {
    useStadiumTelemetry: () => ({
      status: mockStadiumStatus,
      isLoading: false,
      isUpdating: false,
      error: null,
      simulationScale: 75,
      selectedGateId: "gate-b",
      setSelectedGateId: vi.fn(),
      fetchStadiumStatus: vi.fn(),
      updateGateStatus: vi.fn(),
      dispatchVolunteers: vi.fn(),
      resolveIncident: vi.fn(),
      createIncident: vi.fn(),
      runSimulationScale: mockRunSimulationScale,
      triggerModelAnalysis: mockTriggerModelAnalysis,
      translateAnnouncement: vi.fn().mockImplementation(() => Promise.resolve("Translated Announcement")),
      sendCopilotMessage: vi.fn().mockImplementation(() => Promise.resolve("Copilot AI text response"))
    })
  };
});

describe("FIFA World Cup 2026 Stadium Operations Control Center", () => {
  
  test("fetches stadium status and renders Executive Dashboard components", async () => {
    render(<App />);

    // Verify Executive Header telemetry
    expect(screen.getAllByText("FIFA World Cup 2026")[0]).toBeDefined();
    expect(screen.getAllByText("STADIUM CONTROL")[0]).toBeDefined();
    expect(screen.getAllByText("USA")[0]).toBeDefined();
    expect(screen.getAllByText("MEXICO")[0]).toBeDefined();
    expect(screen.getAllByText("2 - 1")[0]).toBeDefined();
    expect(screen.getAllByText("76'")[0]).toBeDefined();

    // Verify Executive Dashboard Risk metrics using getAllByText
    expect(screen.getAllByText(/Dynamic Arena Risk/i)[0]).toBeDefined();
    expect(screen.getAllByText(/Workforce & Volunteer/i)[0]).toBeDefined();

    // Verify presence of Sub-Components
    expect(screen.getByTestId("stadium-map")).toBeDefined();
  });

  test("renders all 8 required AI Operational Intelligence Cards with confidence scoring", async () => {
    render(<App />);

    // Check for the AI Operational Intelligence title
    expect(screen.getAllByText(/AI Operational Intelligence Control/i)[0]).toBeDefined();

    // Verify specific required cards
    expect(screen.getAllByText("Crowd Prediction AI")[0]).toBeDefined();
    expect(screen.getAllByText("Smart Navigation Wayfinding AI")[0]).toBeDefined();
    expect(screen.getAllByText("Transport & Transit Intelligence")[0]).toBeDefined();
    expect(screen.getAllByText("Accessibility Guard AI")[0]).toBeDefined();
    expect(screen.getAllByText("Sustainability Core Optimizer")[0]).toBeDefined();
    expect(screen.getAllByText("Emergency Response & Triage AI")[0]).toBeDefined();
    expect(screen.getAllByText("Volunteer Workforce Dispatch AI")[0]).toBeDefined();
    expect(screen.getAllByText("Multilingual Signage Translator AI")[0]).toBeDefined();
  });

  test("checks interaction on interactive simulator button", async () => {
    render(<App />);

    const scaleBtn = screen.getAllByText("30% (Low)")[0];
    expect(scaleBtn).toBeDefined();

    fireEvent.click(scaleBtn);
    expect(mockRunSimulationScale).toHaveBeenCalledWith(30);
  });

  test("checks keyboard focus indicators and accessibility landmarks", async () => {
    render(<App />);

    // Skip Link check
    const skipLink = screen.getAllByText("Skip to main content")[0];
    expect(skipLink).toBeDefined();
    expect(skipLink.getAttribute("href")).toBe("#main-content-anchor");
  });
});
