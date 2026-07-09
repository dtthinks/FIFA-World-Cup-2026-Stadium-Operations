/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from "react";
import { 
  TrendingUp, 
  Map, 
  Train, 
  Heart, 
  Compass, 
  Trash2, 
  Users, 
  Languages, 
  Sparkles, 
  ShieldAlert 
} from "lucide-react";
import { StadiumStatus } from "../types";

interface AIOperationalIntelligenceProps {
  status: StadiumStatus;
  simulationScale: number;
}

interface AICard {
  id: string;
  title: string;
  icon: React.ReactNode;
  confidence: number;
  reasoning: string;
  recommendedAction: string;
  expectedImpact: string;
  category: "prediction" | "navigation" | "transit" | "accessibility" | "sustainability" | "emergency" | "volunteer" | "multilingual";
}

export default function AIOperationalIntelligence({ status, simulationScale }: AIOperationalIntelligenceProps) {
  // Compute adaptive operational intelligence data in real-time
  const aiCards = useMemo<AICard[]>(() => {
    const isRampBlocked = status.incidents.some(
      inc => inc.location.toLowerCase().includes("ramp 4b") && inc.status !== "RESOLVED"
    );

    const activeMedicalCount = status.incidents.filter(
      inc => inc.category === "MEDICAL" && inc.status !== "RESOLVED"
    ).length;

    return [
      {
        id: "crowd-pred",
        title: "Crowd Prediction AI",
        icon: <TrendingUp className="w-5 h-5 text-indigo-400" />,
        confidence: Math.min(99, 92 + Math.round((simulationScale % 15))),
        reasoning: `Concourse pedestrian density is simulated at ${simulationScale}%. Predictive algorithms project Gate B will experience a +18% ingress spike in the next 10 minutes.`,
        recommendedAction: "Pre-emptively open auxiliary digital turnstile channels at Gate B and direct overflow to Gate D.",
        expectedImpact: "Prevents queue bottlenecks, shaving an estimated 6.2 minutes off spectator entrance times.",
        category: "prediction"
      },
      {
        id: "smart-nav",
        title: "Smart Navigation Wayfinding AI",
        icon: <Compass className="w-5 h-5 text-emerald-400" />,
        confidence: 96,
        reasoning: isRampBlocked 
          ? "Ramp 4B is physically blocked. Pedestrian route calculations detected wheelchair accessibility barriers."
          : "Corridor circulation flows are normal. Clear routing vectors maintained across all sectors.",
        recommendedAction: isRampBlocked 
          ? "Reroute limited-mobility traffic from Gate B to Section 114 via Elevator East-3 (zero steps)."
          : "Keep default signage configurations active and monitor East concourse stairwells.",
        expectedImpact: isRampBlocked 
          ? "Maintains 100% ADA-compliance and avoids crowd-crush risks at the blocked Ramp 4B landing."
          : "Maintains optimal transfer times under 5 minutes.",
        category: "navigation"
      },
      {
        id: "transit-intel",
        title: "Transport & Transit Intelligence",
        icon: <Train className="w-5 h-5 text-cyan-400" />,
        confidence: 93,
        reasoning: "Olympic Park Metro Line 1 is currently reporting signaling delays resulting in a 20-minute wait time.",
        recommendedAction: "Broadcast shuttle bus alternatives on main stadium scoreboard monitors during game exit.",
        expectedImpact: "Diverts up to 3,500 departing spectators to bus shuttle gates, balancing terminal queues.",
        category: "transit"
      },
      {
        id: "accessibility-ai",
        title: "Accessibility Guard AI",
        icon: <Sparkles className="w-5 h-5 text-pink-400" />,
        confidence: 97,
        reasoning: isRampBlocked
          ? "Projected lift demand at Elevator Bank East-3 will exceed standard capacities by 140% due to Ramp 4B detour."
          : "Elevator and ramp occupancy levels remain within healthy green thresholds.",
        recommendedAction: "Deploy 2 additional accessibility priority helpers to manage the Elevator East-3 queue lines.",
        expectedImpact: "Keeps wheelchair-spectator waiting times to under 3 minutes, upholding high hospitality metrics.",
        category: "accessibility"
      },
      {
        id: "sustainability-ai",
        title: "Sustainability Core Optimizer",
        icon: <Trash2 className="w-5 h-5 text-lime-400" />,
        confidence: 94,
        reasoning: `Matchday solar output is at ${status.sustainability.solarPowerKw} kW. Recyclable bin weight is tracking at ${status.sustainability.wasteRecycledKg} kg.`,
        recommendedAction: "Engage secondary solar battery grid storage during peak arena light display cycles.",
        expectedImpact: "Saves 18.5% of external grid power draw and reduces matching carbon emissions.",
        category: "sustainability"
      },
      {
        id: "emergency-ai",
        title: "Emergency Response & Triage AI",
        icon: <ShieldAlert className="w-5 h-5 text-red-400" />,
        confidence: 98,
        reasoning: activeMedicalCount > 0
          ? `${activeMedicalCount} medical alert(s) currently registered. Rapid dispatcher intervention required.`
          : "Zero active high-risk critical alerts reported in the spectator stands.",
        recommendedAction: activeMedicalCount > 0
          ? "Dispatch first-aid unit 2 to Section 114 immediately, clearing a path through VIP corridor A."
          : "Maintain stand-by status for medical vehicles at the East and West clinical bays.",
        expectedImpact: "Ensures emergency response teams reach the victim in under 3 minutes.",
        category: "emergency"
      },
      {
        id: "volunteer-ai",
        title: "Volunteer Workforce Dispatch AI",
        icon: <Users className="w-5 h-5 text-amber-400" />,
        confidence: 91,
        reasoning: `Gate B congestion levels at 92% have triggered manual scanning alerts. Reserve rosters stand at 14 volunteers.`,
        recommendedAction: "Dispatch 4 volunteers from the South concourse break lounge to manual ticket-validation tasks.",
        expectedImpact: "Boosts turnstile throughput by 45 spectators/minute, relieving entry pressure.",
        category: "volunteer"
      },
      {
        id: "multilingual-ai",
        title: "Multilingual Signage Translator AI",
        icon: <Languages className="w-5 h-5 text-blue-400" />,
        confidence: 95,
        reasoning: "Demographic scanner sensors detect that approx 32% of spectators in Gate B sectors are non-English native speakers.",
        recommendedAction: "Push Spanish and French safety and route-detour translations to dynamic signage screens.",
        expectedImpact: "Prevents confusion and hesitation at detour hubs, keeping circulation fluid.",
        category: "multilingual"
      }
    ];
  }, [status, simulationScale]);

  return (
    <div id="ai-operational-intelligence-section" className="bg-[#0e1322] border border-slate-800 rounded-xl p-6" aria-label="AI Operational Intelligence Panel">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-extrabold text-white uppercase font-mono tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
            AI Operational Intelligence Control
          </h2>
          <p className="text-xs text-slate-400">Real-time deep learning decision support and automated arena overrides</p>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full font-bold">
          LIVE TELEMETRY FEED • ACTIVE
        </div>
      </div>

      {/* Grid of the 8 required AI cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" id="ai-intelligence-grid">
        {aiCards.map(card => (
          <div 
            key={card.id}
            id={`ai-card-${card.id}`}
            className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-all focus-within:ring-2 focus-within:ring-indigo-500"
            tabIndex={0}
            aria-label={`${card.title} card with confidence ${card.confidence} percent`}
          >
            <div>
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-slate-950 rounded-lg border border-slate-800 shrink-0">
                    {card.icon}
                  </div>
                  <h3 className="text-xs font-black text-white leading-tight uppercase font-mono">{card.title}</h3>
                </div>
                <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/15">
                  {card.confidence}%
                </span>
              </div>

              {/* Pillars */}
              <div className="space-y-3 mt-2 text-[11px] leading-relaxed">
                <div>
                  <span className="text-[9px] font-mono font-extrabold text-indigo-400 uppercase tracking-wide block">Reasoning</span>
                  <p className="text-slate-300 font-medium">{card.reasoning}</p>
                </div>
                <div>
                  <span className="text-[9px] font-mono font-extrabold text-indigo-400 uppercase tracking-wide block">Action Plan</span>
                  <p className="text-slate-200">{card.recommendedAction}</p>
                </div>
              </div>
            </div>

            {/* Impact footer */}
            <div className="mt-4 pt-2 border-t border-slate-850 bg-emerald-500/5 p-2 rounded-lg border border-emerald-500/10">
              <span className="text-[9px] font-mono font-extrabold text-emerald-400 uppercase tracking-wide block">Expected Impact</span>
              <p className="text-emerald-300 font-semibold text-[11px] mt-0.5 leading-normal">{card.expectedImpact}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
