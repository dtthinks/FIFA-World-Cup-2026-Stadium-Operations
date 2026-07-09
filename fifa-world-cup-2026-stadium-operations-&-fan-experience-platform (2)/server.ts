/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import {
  StadiumStatus,
  Incident,
  IncidentStatus,
  IncidentPriority,
  GateStatus,
  AIRecommendation,
  DecisionFeedItem,
  TransitRoute
} from "./src/types.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini API client
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key === "MY_GEMINI_API_KEY") {
      console.warn("GEMINI_API_KEY is not configured or is using the placeholder. Running in fallback simulation mode.");
      return null;
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// In-memory simulation state
let stadiumState: StadiumStatus = {
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
  gates: [
    {
      id: "gate-a",
      name: "Gate A",
      density: 65,
      turnstileRate: 110,
      status: GateStatus.OPEN,
      queueTime: 12,
      capacity: 150,
      location: "North Gate Plaza"
    },
    {
      id: "gate-b",
      name: "Gate B",
      density: 92, // Congested!
      turnstileRate: 160,
      status: GateStatus.OPEN,
      queueTime: 38,
      capacity: 150,
      location: "East Concourse"
    },
    {
      id: "gate-c",
      name: "Gate C",
      density: 40,
      turnstileRate: 70,
      status: GateStatus.OPEN,
      queueTime: 5,
      capacity: 150,
      location: "South Gate Plaza"
    },
    {
      id: "gate-d",
      name: "Gate D",
      density: 15,
      turnstileRate: 20,
      status: GateStatus.OPEN,
      queueTime: 2,
      capacity: 150,
      location: "West VIP Entrance"
    }
  ],
  incidents: [
    {
      id: "inc-1",
      title: "Turnstile Fault - Gate B",
      category: "TECH",
      location: "Gate B Entry",
      status: IncidentStatus.ACTIVE,
      priority: IncidentPriority.HIGH,
      description: "Two turnstile barcode readers failing to register tickets. Queue backup forming rapidly.",
      timestamp: "10:35",
      volunteersDispatched: 0
    },
    {
      id: "inc-2",
      title: "Debris Blocking Access Ramp",
      category: "FACILITY",
      location: "Ramp 4B (South)",
      status: IncidentStatus.DISPATCHED,
      priority: IncidentPriority.MEDIUM,
      description: "Pallet debris and plastic packaging blocking wheelchair access ramp.",
      timestamp: "10:38",
      volunteersDispatched: 2
    },
    {
      id: "inc-3",
      title: "Heat Exhaustion Support",
      category: "MEDICAL",
      location: "Section 114 Stands",
      status: IncidentStatus.ACTIVE,
      priority: IncidentPriority.HIGH,
      description: "Fan experiencing dizziness and overheating symptoms. Medical response team requested.",
      timestamp: "10:44",
      volunteersDispatched: 0
    }
  ],
  transit: [
    {
      id: "transit-metro",
      name: "Olympic Park Metro (Line 1)",
      type: "METRO",
      status: "CONGESTED",
      frequencyMins: 3,
      waitTimeMins: 20,
      description: "High volume of outbound fans entering platform gates."
    },
    {
      id: "transit-shuttle",
      name: "Tournament Shuttle Bus (West)",
      type: "BUS",
      status: "NORMAL",
      frequencyMins: 5,
      waitTimeMins: 5,
      description: "Express loop to Central Fan Zone running smoothly."
    },
    {
      id: "transit-taxi",
      name: "Official Rideshare Zone (Gate D)",
      type: "TAXI",
      status: "DELAYED",
      frequencyMins: 1,
      waitTimeMins: 15,
      description: "High demand with minor traffic congestion at stadium exit perimeter."
    }
  ],
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
      why: "Crowd density at Gate B has reached 92%, while VIP/General Gate D has ample capacity and extremely low queues.",
      suggestedAction: "Reroute outbound pedestrian traffic from the East Concourse towards Gate D via the outer rings, and update dynamic signage to reflect Gate D availability.",
      expectedImpact: "Reduce Gate B queue times by approximately 35% and equilibrate concourse density.",
      timestamp: "10:41"
    },
    {
      id: "rec-2",
      category: "INCIDENT_MITIGATION",
      title: "Volunteer Relocation for Turnstile Fix",
      confidence: 91,
      why: "Ticket readers at Gate B are offline. Crowds are building up and we need manual ticket scanning.",
      suggestedAction: "Dispatch 4 volunteers from the central staging area with handheld scanning terminals to manually scan tickets at Gate B turnstiles.",
      expectedImpact: "Restore throughput at Gate B within 5 minutes, preventing crowd crush risks at the turnstiles.",
      timestamp: "10:45"
    }
  ],
  decisionFeed: [
    {
      id: "feed-1",
      timestamp: "10:35",
      title: "Turnstile fault logged",
      type: "incident",
      description: "Two ticket scanners at Gate B reporting offline status."
    },
    {
      id: "feed-2",
      timestamp: "10:41",
      title: "Congestion predicted",
      type: "congestion",
      description: "Gate B crowd density exceeded 90% safe threshold."
    },
    {
      id: "feed-3",
      timestamp: "10:42",
      title: "Gate D opened for detour",
      type: "gate_update",
      description: "Operations team activated VIP Gate D to absorb Gate B overflow."
    },
    {
      id: "feed-4",
      timestamp: "10:44",
      title: "3 Volunteers dispatched",
      type: "volunteer_dispatch",
      description: "Support staff sent to Ramp 4B with equipment."
    },
    {
      id: "feed-5",
      timestamp: "10:46",
      title: "Congestion reduced by 31%",
      type: "congestion_reduced",
      description: "Detour routing successful. Crowd flow moving at Gate D."
    }
  ]
};

// Simulation Helpers to update queue times based on density
function updateSimulatedQueueTimes() {
  stadiumState.gates.forEach(g => {
    if (g.status === GateStatus.CLOSED) {
      g.queueTime = 999;
    } else if (g.status === GateStatus.REDIRECTING) {
      g.queueTime = Math.max(1, Math.round(g.density * 0.1));
    } else {
      // Normal flow queues
      g.queueTime = Math.max(1, Math.round((g.density * g.density) / 250));
    }
  });
}

// API Routes

// Get complete status
app.get("/api/stadium/status", (req, res) => {
  updateSimulatedQueueTimes();
  res.json(stadiumState);
});

// Update Simulation parameters (interactivity)
app.post("/api/stadium/simulate", (req, res) => {
  const { densityScale, matchMinute, matchScore, soundLevel } = req.body;
  
  if (densityScale !== undefined) {
    stadiumState.gates.forEach((g, i) => {
      // Add some random variation
      const multiplier = i === 1 ? 1.2 : i === 3 ? 0.4 : 0.8;
      g.density = Math.min(100, Math.max(5, Math.round(densityScale * multiplier)));
      g.turnstileRate = Math.round(g.density * 1.8);
    });
  }
  
  if (matchMinute !== undefined) stadiumState.currentMatch.minute = matchMinute;
  if (matchScore !== undefined) stadiumState.currentMatch.score = matchScore;
  if (soundLevel !== undefined) stadiumState.soundLevelDb = soundLevel;

  // Simulate sustainability accumulation
  stadiumState.sustainability.solarPowerKw = Math.min(1200, Math.max(100, stadiumState.sustainability.solarPowerKw + Math.round(Math.random() * 20 - 10)));
  stadiumState.sustainability.wasteRecycledKg += Math.round(Math.random() * 15);
  stadiumState.sustainability.waterSavedLitres += Math.round(Math.random() * 40);

  updateSimulatedQueueTimes();
  res.json({ success: true, state: stadiumState });
});

// Update Gate status
app.post("/api/stadium/gate", (req, res) => {
  const { gateId, status } = req.body;
  const gate = stadiumState.gates.find(g => g.id === gateId);
  if (!gate) {
    return res.status(404).json({ error: "Gate not found" });
  }

  const oldStatus = gate.status;
  gate.status = status as GateStatus;
  
  if (status === GateStatus.CLOSED) {
    gate.density = 0;
    gate.turnstileRate = 0;
  } else if (status === GateStatus.REDIRECTING) {
    // Distribute density to Gate D
    const gateD = stadiumState.gates.find(g => g.id === "gate-d");
    if (gateD) {
      gateD.density = Math.min(95, gateD.density + Math.round(gate.density * 0.4));
      gate.density = Math.round(gate.density * 0.6);
    }
  }

  updateSimulatedQueueTimes();

  // Create Decision Feed Item
  const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
  const feedItem: DecisionFeedItem = {
    id: `feed-${Date.now()}`,
    timestamp: timeStr,
    title: `${gate.name} status updated`,
    type: status === GateStatus.REDIRECTING ? "gate_update" : status === GateStatus.CLOSED ? "incident" : "congestion_reduced",
    description: `Operator changed status of ${gate.name} from ${oldStatus} to ${status}.`
  };
  stadiumState.decisionFeed.unshift(feedItem);

  res.json({ success: true, state: stadiumState });
});

// Dispatch volunteers to incident
app.post("/api/stadium/dispatch", (req, res) => {
  const { incidentId, volunteerCount } = req.body;
  const incident = stadiumState.incidents.find(inc => inc.id === incidentId);
  if (!incident) {
    return res.status(404).json({ error: "Incident not found" });
  }

  incident.volunteersDispatched += Number(volunteerCount);
  incident.status = IncidentStatus.DISPATCHED;

  // Append decision feed
  const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
  const feedItem: DecisionFeedItem = {
    id: `feed-${Date.now()}`,
    timestamp: timeStr,
    title: `${volunteerCount} Volunteers dispatched`,
    type: "volunteer_dispatch",
    description: `Dispatched support team to ${incident.location} for incident: "${incident.title}".`
  };
  stadiumState.decisionFeed.unshift(feedItem);

  res.json({ success: true, state: stadiumState });
});

// Resolve incident
app.post("/api/stadium/resolve", (req, res) => {
  const { incidentId } = req.body;
  const incident = stadiumState.incidents.find(inc => inc.id === incidentId);
  if (!incident) {
    return res.status(404).json({ error: "Incident not found" });
  }

  incident.status = IncidentStatus.RESOLVED;

  // Append decision feed
  const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
  const feedItem: DecisionFeedItem = {
    id: `feed-${Date.now()}`,
    timestamp: timeStr,
    title: `Incident Resolved`,
    type: "congestion_reduced",
    description: `"${incident.title}" at ${incident.location} has been successfully resolved.`
  };
  stadiumState.decisionFeed.unshift(feedItem);

  // Remove resolved from active view after a simulation interval, or just keep it resolved in memory
  res.json({ success: true, state: stadiumState });
});

// Create new Incident
app.post("/api/stadium/incident/create", (req, res) => {
  const { title, category, location, priority, description } = req.body;
  if (!title || !category || !location || !priority) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
  const newIncident: Incident = {
    id: `inc-${Date.now()}`,
    title,
    category,
    location,
    status: IncidentStatus.ACTIVE,
    priority,
    description: description || "No additional details provided.",
    timestamp: timeStr,
    volunteersDispatched: 0
  };

  stadiumState.incidents.unshift(newIncident);

  // Append decision feed
  const feedItem: DecisionFeedItem = {
    id: `feed-${Date.now()}`,
    timestamp: timeStr,
    title: `New Incident: ${title}`,
    type: "incident",
    description: `Alert logged at ${location} [Priority: ${priority}].`
  };
  stadiumState.decisionFeed.unshift(feedItem);

  res.json({ success: true, state: stadiumState });
});

// Copilot conversation endpoint with Stadium Status grounding
app.post("/api/gemini/copilot", async (req, res) => {
  const { message, chatHistory } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  const ai = getGeminiClient();
  if (!ai) {
    // Graceful fallback if API key is not configured
    return simulateCopilotResponse(message, res);
  }

  try {
    const formattedHistory = (chatHistory || []).map((msg: { role: string; text: string }) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.text }]
    }));

    // Incorporate the entire stadium operations status in system instructions for precise context grounding
    const statusContextString = JSON.stringify(stadiumState, null, 2);
    const systemInstruction = `
You are the Executive AI Operations Copilot for the FIFA World Cup 2026. 
You are deployed inside the Stadium Operations Control Center.
Your role is to support organizers, operations staff, and volunteers in real-time.

You have access to the complete, current, real-time stadium status JSON:
${statusContextString}

Current match is: ${stadiumState.currentMatch.homeTeam} vs ${stadiumState.currentMatch.awayTeam}.
Attendance: ${stadiumState.currentMatch.attendance} / ${stadiumState.currentMatch.maxCapacity}.

Your tone should be: Professional, concise, authoritative, calm, and direct.
Never output markdown headers larger than h3. Keep replies compact.
You must ground your answers in the active gates, incidents, transport routes, or sustainability data.
If the user asks to solve a problem (e.g., Gate B congestion, debris on access ramp), recommend specific actions, and include details on volunteers, detour paths, or multilingual translations if relevant.

You MUST structure EVERY response or recommendation with the following exact labels:
Confidence Score: [A percentage, e.g. 96%]
Reasoning: [1-2 sentences explanation of why the recommendation was generated]
Recommended Action: [Specific step-by-step action guidelines for staff]
Expected Operational Impact: [Expected result/outcome metrics]
`;

    const chat = ai.chats.create({
      model: "gemini-3.5-flash",
      config: {
        systemInstruction,
        temperature: 0.2,
      },
      history: formattedHistory
    });

    const response = await chat.sendMessage({ message });
    res.json({ text: response.text });
  } catch (error: unknown) {
    console.error("Gemini Copilot Error:", error);
    const errMsg = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ 
      error: "Error communicating with Gemini API", 
      details: errMsg,
      fallbackUsed: true,
      text: "I experienced an authentication or API error connecting to Gemini. Running local routing diagnostics: **Turnstile fault at Gate B** remains the primary trigger for the 92% density overflow. Suggested action: Dispatch volunteer manual scanning immediately."
    });
  }
});

// AI analysis and structured recommendation generator
app.post("/api/gemini/analyze", async (req, res) => {
  const ai = getGeminiClient();
  if (!ai) {
    // Generate simulated recommendation list
    return res.json({ recommendations: stadiumState.recommendations });
  }

  try {
    const statusContextString = JSON.stringify(stadiumState, null, 2);
    const prompt = `
Analyze the current stadium status for the FIFA World Cup 2026 and generate a list of 2-3 high-impact AI recommendations to improve Operations, Crowd Safety, Accessibility, Multilingual support, Transport, or Sustainability.

Current Stadium Status:
${statusContextString}

For each recommendation, you MUST provide exactly:
- Category (one of: CROWD_CONTROL, INCIDENT_MITIGATION, TRANSIT_OPTIMIZATION, SUSTAINABILITY, ACCESSIBILITY)
- Title (a short clear title)
- Confidence (a number between 80 and 99 representing confidence score)
- Why (detailed explanation of why this was generated based on the active state)
- SuggestedAction (specific suggested action the operations team should take)
- ExpectedImpact (estimated result or metrics, e.g. "Reduce waiting time by 35%")

Return the response in JSON format.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  category: { type: Type.STRING },
                  title: { type: Type.STRING },
                  confidence: { type: Type.INTEGER },
                  why: { type: Type.STRING },
                  suggestedAction: { type: Type.STRING },
                  expectedImpact: { type: Type.STRING }
                },
                required: ["category", "title", "confidence", "why", "suggestedAction", "expectedImpact"]
              }
            }
          },
          required: ["recommendations"]
        }
      }
    });

    const parsedData = JSON.parse(response.text || "{}");
    
    // Inject generated ids and timestamp
    if (parsedData.recommendations && Array.isArray(parsedData.recommendations)) {
      parsedData.recommendations = parsedData.recommendations.map((rec: Record<string, unknown>, idx: number) => ({
        id: `gemini-rec-${Date.now()}-${idx}`,
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
        ...rec
      }));
      
      // Update our in-memory recommendations
      stadiumState.recommendations = parsedData.recommendations;
    }

    res.json({ recommendations: stadiumState.recommendations });
  } catch (error: unknown) {
    console.error("Gemini Analysis Error:", error);
    const errMsg = error instanceof Error ? error.message : "Unknown error";
    // Return mock data with high quality on failure
    res.json({ recommendations: stadiumState.recommendations, error: errMsg });
  }
});

// Fallback generator for offline/local simulation
function simulateCopilotResponse(message: string, res: express.Response) {
  const query = message.toLowerCase();
  let responseText = "";

  if (query.includes("gate") || query.includes("crowd") || query.includes("congestion")) {
    responseText = `
Confidence Score: 95%
Reasoning: Gate B has reached 92% capacity congestion due to active Turnstile hardware scanner faults.
Recommended Action: Redirect outbound flows to Gate D (currently 15% density, 2 min queue) and dispatch 4 manual-scanning volunteers.
Expected Operational Impact: Restores safe concourse throughput and reduces Gate B wait times by 35% within 10 minutes.
`;
  } else if (query.includes("incident") || query.includes("medical") || query.includes("heat")) {
    responseText = `
Confidence Score: 93%
Reasoning: Heat exhaustion incident in Section 114 is high-priority and requires urgent medical triage.
Recommended Action: Dispatch standby volunteer medical escort to guide the stadium first-aid team to Section 114, Row F.
Expected Operational Impact: Minimizes response time to under 3 minutes, safeguarding spectator health.
`;
  } else if (query.includes("transit") || query.includes("transport") || query.includes("metro")) {
    responseText = `
Confidence Score: 91%
Reasoning: Metro Line 1 is congested with 20-minute waits, whereas the Tournament Shuttle Bus has high throughput and under 5-minute wait times.
Recommended Action: Push dynamic concourse signage warning spectators about Metro delays and highlighting Tournament Shuttle paths.
Expected Operational Impact: Detours up to 4,000 spectators to buses, balancing transit terminal queues.
`;
  } else if (query.includes("sustainability") || query.includes("recycle") || query.includes("solar")) {
    responseText = `
Confidence Score: 94%
Reasoning: Peak solar output has hit 840 kW while recycling collection is 15% behind the matchday target of 5,000 kg.
Recommended Action: Transfer auxiliary scoreboard loads to local battery bank storage and broadcast a half-time recycling challenge on main stadium screens.
Expected Operational Impact: Shaves 18% of grid power load and boosts matchday plastic bottle reclamation rates.
`;
  } else if (query.includes("spanish") || query.includes("translate") || query.includes("multilingual")) {
    responseText = `
Confidence Score: 98%
Reasoning: Crowd density analysis detects over 35% Spanish-speaking cohorts in Sector B.
Recommended Action: Broadcast Spanish translation: "Atención espectadores: Gate B está temporalmente congestionada. Por favor, desvíense hacia Gate D para una salida rápida. Sigan las indicaciones de los voluntarios."
Expected Operational Impact: Directs Spanish-speaking groups smoothly, preventing bottleneck accumulation.
`;
  } else {
    responseText = `
Confidence Score: 90%
Reasoning: General user greeting detected. Standard system operational query response initiated.
Recommended Action: Select any of the interactive dashboard tabs above or input specific queries regarding crowd congestion, volunteer dispatches, transit route detours, or translation needs.
Expected Operational Impact: Activates the full decision-support capabilities of the Arena Copilot.
`;
  }

  return res.json({ text: responseText });
}

// Serve Vite dev / static assets
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`World Cup Operations Server running on http://localhost:${PORT}`);
  });
}

startServer();
