/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from "react";
import { 
  ShieldAlert, 
  Users, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  AlertTriangle, 
  Activity, 
  TrendingUp, 
  HelpCircle,
  Sparkles,
  RefreshCw,
  Sliders,
  Volume2,
  Calendar,
  Layers
} from "lucide-react";
import { StadiumStatus, GateStatus, IncidentPriority, AIRecommendation } from "./types";
import DashboardOverview from "./components/DashboardOverview";
import StadiuMap from "./components/StadiuMap";
import IncidentManager from "./components/IncidentManager";
import OperationsCopilot from "./components/OperationsCopilot";
import CrowdPredictor from "./components/CrowdPredictor";
import SustainabilityInsights from "./components/SustainabilityInsights";
import TransportationPlanner from "./components/TransportationPlanner";
import MultilingualHelper from "./components/MultilingualHelper";

export default function App() {
  const [status, setStatus] = useState<StadiumStatus | null>(null);
  const [selectedGateId, setSelectedGateId] = useState<string | null>("gate-b");
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"copilot" | "crowd" | "transit" | "sustainability" | "multilingual">("copilot");
  const [simulationScale, setSimulationScale] = useState(75);

  // Fetch full state on mount
  const fetchStadiumStatus = async () => {
    try {
      const res = await fetch("/api/stadium/status");
      if (!res.ok) throw new Error("Failed to fetch stadium status.");
      const data = await res.json();
      setStatus(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Unknown error occurred fetching status.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStadiumStatus();
    // Auto refresh every 10 seconds to simulate dynamic arena conditions
    const interval = setInterval(fetchStadiumStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  // Update Gate Status Overrides
  const handleUpdateGateStatus = async (gateId: string, gateStatus: GateStatus) => {
    setIsUpdating(true);
    try {
      const res = await fetch("/api/stadium/gate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gateId, status: gateStatus })
      });
      if (!res.ok) throw new Error("Failed to override gate status");
      const data = await res.json();
      if (data.success) {
        setStatus(data.state);
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  // Dispatch volunteers to incidents
  const handleDispatchVolunteers = async (incidentId: string, count: number) => {
    setIsUpdating(true);
    try {
      const res = await fetch("/api/stadium/dispatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ incidentId, volunteerCount: count })
      });
      if (!res.ok) throw new Error("Failed to dispatch volunteers");
      const data = await res.json();
      if (data.success) {
        setStatus(data.state);
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  // Resolve active incidents
  const handleResolveIncident = async (incidentId: string) => {
    setIsUpdating(true);
    try {
      const res = await fetch("/api/stadium/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ incidentId })
      });
      if (!res.ok) throw new Error("Failed to resolve incident");
      const data = await res.json();
      if (data.success) {
        setStatus(data.state);
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  // Create simulated incidents
  const handleCreateIncident = async (newInc: {
    title: string;
    category: "CROWD" | "MEDICAL" | "FACILITY" | "SECURITY" | "TECH";
    location: string;
    priority: IncidentPriority;
    description: string;
  }) => {
    setIsUpdating(true);
    try {
      const res = await fetch("/api/stadium/incident/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newInc)
      });
      if (!res.ok) throw new Error("Failed to report incident");
      const data = await res.json();
      if (data.success) {
        setStatus(data.state);
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  // Run dynamic simulation changes (sliders)
  const handleSimulationSliderChange = async (val: number) => {
    setSimulationScale(val);
    try {
      const res = await fetch("/api/stadium/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ densityScale: val })
      });
      if (res.ok) {
        const data = await res.json();
        setStatus(data.state);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Send message to Gemini Copilot
  const handleSendCopilotMessage = async (messageText: string): Promise<string> => {
    const res = await fetch("/api/gemini/copilot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: messageText })
    });
    if (!res.ok) throw new Error("Gemini Copilot API error");
    const data = await res.json();
    return data.text;
  };

  // Run structured recommendation translator / translator pipeline helper
  const handleTranslateAnnouncement = async (text: string, lang: string): Promise<string> => {
    const res = await fetch("/api/gemini/copilot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text })
    });
    if (!res.ok) throw new Error("Translation API failure");
    const data = await res.json();
    return data.text;
  };

  // Triggers Gemini API model diagnostics re-run
  const handleTriggerModelAnalysis = async () => {
    setIsUpdating(true);
    try {
      const res = await fetch("/api/gemini/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      if (!res.ok) throw new Error("Failed to trigger GenAI analysis model");
      const data = await res.json();
      if (data.recommendations) {
        setStatus(prev => prev ? { ...prev, recommendations: data.recommendations } : null);
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex flex-col justify-center items-center text-slate-300">
        <Activity className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
        <h2 className="text-lg font-bold tracking-tight">Loading Stadium Telemetry...</h2>
        <p className="text-xs text-slate-500 mt-1">Initializing World Cup 2026 operations pipeline</p>
      </div>
    );
  }

  if (error || !status) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex flex-col justify-center items-center text-slate-300 p-4">
        <AlertTriangle className="w-12 h-12 text-red-400 mb-4 animate-bounce" />
        <h2 className="text-lg font-bold tracking-tight text-red-300">Operations Control Disconnected</h2>
        <p className="text-xs text-slate-400 mt-1 max-w-md text-center">{error || "Failed to establish secure container server socket connections."}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-all"
        >
          Re-establish Connection
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] flex flex-col">
      {/* Dynamic Header */}
      <header id="platform-header" className="bg-[#0e1322] border-b border-slate-800 shrink-0 sticky top-0 z-40 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-white text-lg shadow-lg shadow-indigo-950/40 select-none border border-indigo-400/20">
              ⚽
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold tracking-tight text-white uppercase font-mono">FIFA World Cup 2026</h1>
                <span className="text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded font-mono font-bold animate-pulse">
                  STADIUM CONTROL
                </span>
              </div>
              <p className="text-xs text-indigo-200/60 font-semibold">Arena Operations Control Center • Group Matchday 4</p>
            </div>
          </div>

          {/* Real-time Match Telemetry */}
          <div className="flex items-center gap-6 bg-slate-900/60 border border-slate-800/80 px-4 py-2 rounded-xl">
            <div className="text-center md:text-left">
              <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wider">Live Match</span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-sm font-extrabold text-white">{status.currentMatch.homeTeam}</span>
                <span className="text-xs px-2 py-0.5 bg-slate-950 text-indigo-400 font-mono font-black border border-slate-850 rounded">
                  {status.currentMatch.score}
                </span>
                <span className="text-sm font-extrabold text-white">{status.currentMatch.awayTeam}</span>
              </div>
            </div>

            <div className="w-px h-8 bg-slate-800" />

            <div>
              <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wider block">Match Time</span>
              <span className="text-sm font-bold text-emerald-400 font-mono mt-0.5 block">{status.currentMatch.minute}</span>
            </div>

            <div className="w-px h-8 bg-slate-800" />

            <div className="hidden sm:block">
              <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wider block">Est. Gate Wait</span>
              <span className="text-sm font-bold text-amber-400 font-mono mt-0.5 block">14 mins avg</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Grid Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
        {/* KPI Dashboard Overview row */}
        <DashboardOverview status={status} />

        {/* Executive AI recommendation block (High priority item) */}
        <div id="executive-ai-recommendation-panel" className="bg-indigo-950/10 border border-indigo-500/25 rounded-2xl p-5 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-indigo-500/15 pb-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
                <Sparkles className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
                  Executive AI Recommendation
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono font-bold">
                    Confidence: 96%
                  </span>
                </h2>
                <p className="text-xs text-indigo-200/60 mt-0.5">Automated crowd mitigation & safety guidance</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 w-full md:w-auto">
              <button
                onClick={() => handleUpdateGateStatus("gate-b", GateStatus.REDIRECTING)}
                className="w-full md:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-indigo-950/40"
              >
                Authorize Redirection Override
              </button>
              <button
                onClick={handleTriggerModelAnalysis}
                className="p-2 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-xl hover:border-slate-700 transition-all"
                title="Re-run GenAI Diagnostics"
              >
                <RefreshCw className={`w-4 h-4 ${isUpdating ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs leading-relaxed">
            <div className="space-y-1.5 border-r border-indigo-500/10 pr-2">
              <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider font-semibold">Reason</span>
              <p className="text-slate-300 font-medium">
                Crowd density at <strong className="text-white">Gate B</strong> exceeded safe threshold (current: <strong className="text-red-400">92%</strong>).
              </p>
            </div>
            <div className="space-y-1.5 border-r border-indigo-500/10 pr-2">
              <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider font-semibold">Suggested Action</span>
              <p className="text-slate-300">
                Redirect outbound spectators from East concourse toward <strong className="text-emerald-400">Gate D</strong> (VIP Entrance). Update dynamic concourse wayfinding.
              </p>
            </div>
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider font-semibold">Expected Result</span>
              <p className="text-emerald-300 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                Reduce waiting times by 35%
              </p>
            </div>
          </div>
        </div>

        {/* Middle row: Twin Arena map and Decision Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <StadiuMap 
              status={status} 
              onUpdateGateStatus={handleUpdateGateStatus}
              selectedGateId={selectedGateId}
              setSelectedGateId={setSelectedGateId}
            />
          </div>

          {/* AI Decision Feed & Timeline */}
          <div id="ai-decision-feed-panel" className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 flex flex-col h-full justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 border-b border-slate-800/80 pb-3">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Layers className="w-5 h-5 text-indigo-400" />
                    AI Decision Feed
                  </h2>
                  <p className="text-xs text-slate-400">Chronological list of automated decisions and interventions</p>
                </div>
              </div>

              {/* Dynamic timeline flow */}
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1" id="decision-feed-timeline">
                {status.decisionFeed.map((item, index) => (
                  <div key={item.id} className="relative flex gap-3 pb-2 group">
                    {index < status.decisionFeed.length - 1 && (
                      <span className="absolute left-[17px] top-6 bottom-0 w-0.5 bg-slate-800 group-hover:bg-slate-700" />
                    )}
                    <span className="text-[11px] font-mono text-indigo-400 font-extrabold w-8 pt-0.5 text-right select-none shrink-0">
                      {item.timestamp}
                    </span>
                    <span className={`w-9 h-9 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 ${item.type === "congestion" ? "text-amber-400 border-amber-500/20 bg-amber-500/5" : item.type === "gate_update" ? "text-indigo-400 border-indigo-500/20 bg-indigo-500/5" : item.type === "volunteer_dispatch" ? "text-cyan-400 border-cyan-500/20 bg-cyan-500/5" : item.type === "congestion_reduced" ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/5" : "text-slate-400"}`}>
                      {item.type === "congestion" ? "⚠️" : item.type === "gate_update" ? "🔄" : item.type === "volunteer_dispatch" ? "👥" : item.type === "congestion_reduced" ? "✅" : "📢"}
                    </span>
                    <div className="pt-0.5">
                      <h4 className="text-xs font-bold text-slate-200">{item.title}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Operator Live Simulator Slider */}
            <div className="border-t border-slate-800/80 pt-4 mt-4 bg-slate-950/20 p-3 rounded-lg border border-slate-850">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">Pedestrian Flow Scale Simulator</span>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={simulationScale}
                  onChange={(e) => handleSimulationSliderChange(Number(e.target.value))}
                  aria-label="Simulation scale slider"
                  className="w-full accent-indigo-500 cursor-pointer"
                />
                <span className="text-xs font-mono font-bold text-indigo-300 shrink-0 w-8 text-right">{simulationScale}%</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1 leading-normal">
                Scale crowd density to simulate normal entry (30%), game progress (60%), and peak game exit rush (95%).
              </p>
            </div>
          </div>
        </div>

        {/* Lower row: Tabbed layout for advanced subcomponents */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Operations and Incident Manager columns */}
          <div className="lg:col-span-1">
            <IncidentManager 
              incidents={status.incidents} 
              onDispatchVolunteers={handleDispatchVolunteers}
              onResolveIncident={handleResolveIncident}
              onCreateIncident={handleCreateIncident}
            />
          </div>

          <div className="lg:col-span-2 bg-[#0e1322] border border-slate-800 rounded-xl p-5 flex flex-col h-full min-h-[580px]">
            {/* Tabs Selector row */}
            <div className="flex flex-wrap border-b border-slate-800 pb-3 mb-4 gap-1 shrink-0">
              <button
                onClick={() => setActiveTab("copilot")}
                className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 ${activeTab === "copilot" ? "bg-indigo-600/10 text-indigo-400 border-indigo-500" : "bg-slate-950/30 border-slate-850 text-slate-400 hover:text-slate-300"}`}
              >
                🤖 Operations Copilot
              </button>
              <button
                onClick={() => setActiveTab("crowd")}
                className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 ${activeTab === "crowd" ? "bg-indigo-600/10 text-indigo-400 border-indigo-500" : "bg-slate-950/30 border-slate-850 text-slate-400 hover:text-slate-300"}`}
              >
                📈 Crowd Forecasting
              </button>
              <button
                onClick={() => setActiveTab("transit")}
                className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 ${activeTab === "transit" ? "bg-indigo-600/10 text-indigo-400 border-indigo-500" : "bg-slate-950/30 border-slate-850 text-slate-400 hover:text-slate-300"}`}
              >
                🚇 Transportation & Transit
              </button>
              <button
                onClick={() => setActiveTab("sustainability")}
                className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 ${activeTab === "sustainability" ? "bg-indigo-600/10 text-indigo-400 border-indigo-500" : "bg-slate-950/30 border-slate-850 text-slate-400 hover:text-slate-300"}`}
              >
                🌿 Sustainability Core
              </button>
              <button
                onClick={() => setActiveTab("multilingual")}
                className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 ${activeTab === "multilingual" ? "bg-indigo-600/10 text-indigo-400 border-indigo-500" : "bg-slate-950/30 border-slate-850 text-slate-400 hover:text-slate-300"}`}
              >
                🌐 Translator Broadcast
              </button>
            </div>

            {/* Dynamic Tab Panels */}
            <div className="flex-1 min-h-0">
              {activeTab === "copilot" && <OperationsCopilot onSendMessage={handleSendCopilotMessage} />}
              {activeTab === "crowd" && <CrowdPredictor status={status} />}
              {activeTab === "transit" && <TransportationPlanner transit={status.transit} />}
              {activeTab === "sustainability" && <SustainabilityInsights metrics={status.sustainability} />}
              {activeTab === "multilingual" && <MultilingualHelper onTranslate={handleTranslateAnnouncement} />}
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-[#0b0f19] border-t border-slate-800 text-slate-500 text-xs py-6 px-6 shrink-0 mt-auto text-center font-mono">
        <p>© FIFA World Cup 2026 Stadium Operations Control. Powered by Google Gemini Enterprise AI & Arena Twin Systems.</p>
      </footer>
    </div>
  );
}
