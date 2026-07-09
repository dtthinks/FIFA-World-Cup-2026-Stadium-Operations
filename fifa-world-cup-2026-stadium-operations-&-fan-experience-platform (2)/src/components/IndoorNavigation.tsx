/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { 
  Map, 
  Sparkles, 
  ShieldCheck, 
  Compass, 
  Activity, 
  HelpCircle,
  Clock,
  ArrowRight,
  User,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import { StadiumStatus, GateStatus } from "../types";

interface IndoorNavigationProps {
  status: StadiumStatus;
}

interface Waypoint {
  id: string;
  name: string;
  type: "entrance" | "section" | "amenity" | "prm";
}

const START_POINTS: Waypoint[] = [
  { id: "gate-a", name: "Gate A (North Plaza)", type: "entrance" },
  { id: "gate-b", name: "Gate B (East Concourse)", type: "entrance" },
  { id: "gate-c", name: "Gate C (South Plaza)", type: "entrance" },
  { id: "gate-d", name: "Gate D (West VIP)", type: "entrance" },
];

const END_POINTS: Waypoint[] = [
  { id: "sec-114", name: "Section 114 (East Stands)", type: "section" },
  { id: "sec-102", name: "Section 102 (North Stands)", type: "section" },
  { id: "med-b", name: "Medical Station B (Concourse)", type: "amenity" },
  { id: "elev-east", name: "Elevator Bank East-3 (PRM)", type: "prm" },
  { id: "rest-south", name: "South Concourse Food Court", type: "amenity" }
];

export default function IndoorNavigation({ status }: IndoorNavigationProps) {
  const [startPoint, setStartPoint] = useState<string>("gate-b");
  const [endPoint, setEndPoint] = useState<string>("sec-114");
  const [accessibilityFirst, setAccessibilityFirst] = useState<boolean>(true);

  // Check if there is an active incident related to Ramp 4B
  const isRampBlocked = useMemo(() => {
    return status.incidents.some(
      inc => inc.location.toLowerCase().includes("ramp 4b") && inc.status !== "RESOLVED"
    );
  }, [status.incidents]);

  // Route calculation simulator
  const activeRoute = useMemo(() => {
    const isGateB = startPoint === "gate-b";
    const isSec114 = endPoint === "sec-114";
    
    let pathNodes: string[] = [];
    let distanceMeters = 180;
    let estTimeMins = 3;
    let warning: string | null = null;
    let accessibilityRating = "Excellent";

    if (isGateB && isSec114) {
      if (accessibilityFirst) {
        if (isRampBlocked) {
          pathNodes = ["Gate B Lobby", "Elevator East-3", "Upper Concourse Corridor B", "Section 114 ADA Deck"];
          distanceMeters = 240;
          estTimeMins = 5;
          warning = "Dynamic Detour Active: Ramp 4B is blocked. Route adjusted via Elevator East-3.";
          accessibilityRating = "Fully Accessible (Zero Steps)";
        } else {
          pathNodes = ["Gate B Lobby", "Ramp 4B (Disabled Access)", "Section 114 VIP Box"];
          distanceMeters = 120;
          estTimeMins = 2;
          accessibilityRating = "Accessible Ramp Route";
        }
      } else {
        pathNodes = ["Gate B Lobby", "East Concourse Stairs A", "Concourse Corridor B", "Section 114 Entrance"];
        distanceMeters = 110;
        estTimeMins = 2;
        accessibilityRating = "Standard Stair Route";
      }
    } else {
      // General pathways
      pathNodes = [
        START_POINTS.find(p => p.id === startPoint)?.name || "Entrance Lobby",
        "Central Walkway",
        accessibilityFirst ? "Concourse Access Ramp 2" : "Concourse Stairs 2",
        END_POINTS.find(p => p.id === endPoint)?.name || "Destination Section"
      ];
      distanceMeters = accessibilityFirst ? 280 : 190;
      estTimeMins = accessibilityFirst ? 6 : 4;
    }

    return {
      pathNodes,
      distanceMeters,
      estTimeMins,
      warning,
      accessibilityRating
    };
  }, [startPoint, endPoint, accessibilityFirst, isRampBlocked]);

  // AI indoor routing decision metrics
  const aiRecommendation = useMemo(() => {
    if (isRampBlocked && accessibilityFirst && startPoint === "gate-b" && endPoint === "sec-114") {
      return {
        confidenceScore: 97,
        reasoning: "Wheelchair access route Ramp 4B is blocked by construction pallet debris (Incident inc-2). Spectators with limited mobility attempting to traverse from Gate B to Section 114 would experience a total barrier.",
        recommendedAction: "Reroute PRM flow via the newly designated detour: take West-side corridor to Elevator Bank East-3, bypass level 1 stairs, and enter Section 114 from the upper ADA deck.",
        expectedOperationalImpact: "Maintains 100% barrier-free compliance for disabled spectators and prevents queue backup at the Ramp 4B landing zone."
      };
    }

    return {
      confidenceScore: 93,
      reasoning: `Standard indoor flow from ${START_POINTS.find(p => p.id === startPoint)?.name} to ${END_POINTS.find(p => p.id === endPoint)?.name} exhibits optimal crowd flow. Concourse walkways are currently at under 60% capacity.`,
      recommendedAction: "Keep default digital signage indicators and dynamic wayfinding paths active. No overrides required.",
      expectedOperationalImpact: "Maintains balanced indoor pedestrian traffic and average corridor transfer times of under 5 minutes."
    };
  }, [startPoint, endPoint, accessibilityFirst, isRampBlocked]);

  return (
    <div id="indoor-navigation-container" className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 flex flex-col h-full justify-between">
      <div>
        <div className="flex items-center justify-between mb-4 border-b border-slate-800/80 pb-3">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Map className="w-5 h-5 text-indigo-400" />
              AI Indoor Navigation & Wayfinding
            </h2>
            <p className="text-xs text-slate-400">Dynamic route optimization and barrier-free path planner</p>
          </div>
          <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded font-bold">
            ACCESSIBLE WAYFINDING
          </span>
        </div>

        {/* Dynamic Route Form Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 bg-slate-950/30 border border-slate-850 p-4 rounded-xl" id="nav-routing-panel">
          <div>
            <label htmlFor="nav-start" className="block text-[10px] text-slate-500 uppercase tracking-wider mb-1 font-semibold">Start Location</label>
            <select
              id="nav-start"
              value={startPoint}
              onChange={(e) => setStartPoint(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              {START_POINTS.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="nav-end" className="block text-[10px] text-slate-500 uppercase tracking-wider mb-1 font-semibold">Destination</label>
            <select
              id="nav-end"
              value={endPoint}
              onChange={(e) => setEndPoint(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              {END_POINTS.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col justify-end">
            <button
              onClick={() => setAccessibilityFirst(prev => !prev)}
              id="accessibility-mode-toggle"
              className={`w-full py-2 px-3 rounded-lg text-xs font-semibold border transition-all flex items-center justify-center gap-2 ${accessibilityFirst ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20" : "bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-400"}`}
            >
              <span>♿</span>
              <span>Accessibility First (ADA)</span>
              <span className={`w-2 h-2 rounded-full ${accessibilityFirst ? "bg-emerald-400 animate-pulse" : "bg-slate-600"}`}></span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Custom SVG Corridor Map Visualizer */}
          <div className="bg-slate-950/40 rounded-xl border border-slate-800/60 p-4 relative flex flex-col items-center justify-center min-h-[220px]" id="navigation-visual-map">
            <span className="absolute top-2 left-2 text-[9px] font-mono text-slate-500 uppercase tracking-wider">Interactive Path Plotter</span>
            
            <svg viewBox="0 0 300 200" className="w-full h-auto max-h-[180px]">
              {/* Layout Walls / Corridor outlines */}
              <rect x="10" y="10" width="280" height="180" rx="6" className="fill-none stroke-slate-800 stroke-[2]" />
              <line x1="10" y1="70" x2="180" y2="70" className="stroke-slate-800/80 stroke-[2]" />
              <line x1="10" y1="130" x2="210" y2="130" className="stroke-slate-800/80 stroke-[2]" />
              <line x1="220" y1="10" x2="220" y2="130" className="stroke-slate-800/80 stroke-[2]" />
              
              {/* Amenity Icons */}
              <g id="map-elev-node">
                <rect x="235" y="20" width="30" height="30" rx="4" className="fill-slate-900 stroke-indigo-500/40" />
                <text x="250" y="38" textAnchor="middle" className="fill-indigo-300 font-bold text-[10px]">E-3</text>
              </g>

              <g id="map-ramp-node">
                <rect x="70" y="145" width="40" height="20" rx="4" className={`fill-slate-900 stroke-amber-500/30 ${isRampBlocked && accessibilityFirst ? "opacity-30" : ""}`} />
                <text x="90" y="158" textAnchor="middle" className="fill-amber-400 text-[8px]">Ramp 4B</text>
              </g>

              {/* Draw Obstacle Pin if blocked */}
              {isRampBlocked && (
                <g>
                  <circle cx="90" cy="155" r="10" className="fill-red-500/20 stroke-red-500 stroke-[1.5] animate-ping" />
                  <text x="90" y="158" textAnchor="middle" className="fill-red-500 font-bold text-[10px]">⚠️</text>
                </g>
              )}

              {/* Dynamic Path Highlight line based on calculation */}
              {startPoint === "gate-b" && endPoint === "sec-114" ? (
                accessibilityFirst ? (
                  isRampBlocked ? (
                    // Detoured route
                    <path 
                      d="M 280,110 L 250,110 L 250,35 L 180,35 L 140,35" 
                      fill="none" 
                      stroke="#10b981" 
                      strokeWidth="3.5" 
                      strokeLinecap="round"
                      strokeDasharray="5,5"
                      className="animate-[dash_1s_linear_infinite]"
                    />
                  ) : (
                    // Normal access route
                    <path 
                      d="M 280,110 L 90,110 L 90,155 L 40,155" 
                      fill="none" 
                      stroke="#10b981" 
                      strokeWidth="3.5" 
                      strokeLinecap="round"
                    />
                  )
                ) : (
                  // Standard route
                  <path 
                    d="M 280,110 L 150,110 L 150,55 L 40,55" 
                    fill="none" 
                    stroke="#6366f1" 
                    strokeWidth="3" 
                    strokeLinecap="round"
                  />
                )
              ) : (
                // General fallback path
                <path 
                  d="M 20,110 L 140,110 L 140,50 L 260,50" 
                  fill="none" 
                  stroke="#6366f1" 
                  strokeWidth="2.5" 
                  strokeDasharray="4,4" 
                />
              )}

              {/* Destination Point Node */}
              <circle cx="40" cy="55" r="6" className="fill-indigo-500 stroke-slate-900 stroke-[2]" />
              <text x="40" y="44" textAnchor="middle" className="fill-indigo-300 font-mono text-[8px] font-bold">Sec 114</text>

              {/* Entrance Point Node */}
              <circle cx="280" cy="110" r="6" className="fill-emerald-500 stroke-slate-900 stroke-[2]" />
              <text x="280" y="125" textAnchor="middle" className="fill-emerald-300 font-mono text-[8px] font-bold">Gate B</text>
            </svg>

            {/* Warn Overlay */}
            {activeRoute.warning && (
              <div className="absolute bottom-2 left-2 right-2 bg-red-500/10 border border-red-500/20 rounded-lg px-2.5 py-1 text-[10px] text-red-300 flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                <span>{activeRoute.warning}</span>
              </div>
            )}
          </div>

          {/* Planned path node list and stats */}
          <div className="bg-slate-950/20 border border-slate-850 p-4 rounded-xl flex flex-col justify-between" id="navigation-pathway-details">
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold mb-2">Calculated Path Nodes</span>
              <div className="space-y-1.5">
                {activeRoute.pathNodes.map((node, index) => (
                  <div key={index} className="flex items-center gap-2 text-xs">
                    <span className="w-5 h-5 rounded-full bg-slate-900 border border-slate-800 text-slate-400 text-[10px] flex items-center justify-center font-mono">
                      {index + 1}
                    </span>
                    <span className="text-slate-200 font-medium">{node}</span>
                    {index < activeRoute.pathNodes.length - 1 && (
                      <ArrowRight className="w-3.5 h-3.5 text-slate-600 ml-auto" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-850">
              <div className="bg-slate-900/50 p-2 rounded-lg border border-slate-850">
                <span className="text-[9px] text-slate-500 uppercase block font-semibold">Total Distance</span>
                <span className="text-sm font-bold text-white font-mono mt-0.5 block">{activeRoute.distanceMeters} meters</span>
              </div>
              <div className="bg-slate-900/50 p-2 rounded-lg border border-slate-850">
                <span className="text-[9px] text-slate-500 uppercase block font-semibold">Walking Time</span>
                <span className="text-sm font-bold text-indigo-300 font-mono mt-0.5 block">~{activeRoute.estTimeMins} mins</span>
              </div>
            </div>
          </div>
        </div>

        {/* AI-powered wayfinding recommendation box with required pillars */}
        <div className="mt-4 bg-indigo-950/10 border border-indigo-500/15 rounded-xl p-4" id="ai-routing-decision-card">
          <div className="flex items-center justify-between border-b border-indigo-500/10 pb-2 mb-2">
            <span className="text-[11px] font-bold text-indigo-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
              Dynamic Wayfinding Optimizer AI
            </span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-bold">
              Confidence Score: {aiRecommendation.confidenceScore}%
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[11px]">
            <div className="border-r border-slate-800 pr-2">
              <strong className="text-indigo-400 block uppercase font-mono text-[9px] tracking-wider mb-1">Reasoning</strong>
              <p className="text-slate-300 leading-relaxed">{aiRecommendation.reasoning}</p>
            </div>
            <div className="border-r border-slate-800 pr-2">
              <strong className="text-indigo-400 block uppercase font-mono text-[9px] tracking-wider mb-1">Recommended Action</strong>
              <p className="text-slate-300 leading-relaxed">{aiRecommendation.recommendedAction}</p>
            </div>
            <div>
              <strong className="text-indigo-400 block uppercase font-mono text-[9px] tracking-wider mb-1">Expected Operational Impact</strong>
              <p className="text-emerald-300/90 font-semibold leading-relaxed">{aiRecommendation.expectedOperationalImpact}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
