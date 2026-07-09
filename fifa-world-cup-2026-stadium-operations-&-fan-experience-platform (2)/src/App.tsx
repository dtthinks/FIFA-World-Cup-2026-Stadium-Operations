/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useTransition } from "react";
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
  Layers,
  Map,
  ArrowRight
} from "lucide-react";
import { GateStatus } from "./types";
import ExecutiveDashboard from "./components/ExecutiveDashboard";
import AIOperationalIntelligence from "./components/AIOperationalIntelligence";
import StadiuMap from "./components/StadiuMap";
import IncidentManager from "./components/IncidentManager";
import OperationsCopilot from "./components/OperationsCopilot";
import CrowdPredictor from "./components/CrowdPredictor";
import SustainabilityInsights from "./components/SustainabilityInsights";
import TransportationPlanner from "./components/TransportationPlanner";
import MultilingualHelper from "./components/MultilingualHelper";
import IndoorNavigation from "./components/IndoorNavigation";
import ErrorBoundary from "./components/ErrorBoundary";
import { useStadiumTelemetry } from "./hooks/useStadiumTelemetry";

/**
 * AppContent Component
 * 
 * Orchestrates the full Operations Control Center view.
 * Uses custom useStadiumTelemetry hook to synchronize state and trigger remote overrides.
 * Includes deep keyboard accessibility options ("skip to content") and ARIA labels.
 */
function AppContent() {
  const {
    status,
    isLoading,
    isUpdating,
    error,
    simulationScale,
    selectedGateId,
    setSelectedGateId,
    updateGateStatus,
    dispatchVolunteers,
    resolveIncident,
    createIncident,
    runSimulationScale,
    triggerModelAnalysis,
    translateAnnouncement,
    sendCopilotMessage
  } = useStadiumTelemetry();

  const [activeTab, setActiveTab] = useState<"copilot" | "indoor" | "crowd" | "transit" | "sustainability" | "multilingual">("copilot");
  const [, startTransition] = useTransition();

  const handleTabChange = (tab: "copilot" | "indoor" | "crowd" | "transit" | "sustainability" | "multilingual") => {
    startTransition(() => {
      setActiveTab(tab);
    });
  };

  if (isLoading) {
    return (
      <div id="loading-screen" className="min-h-screen bg-[#0b0f19] flex flex-col justify-center items-center text-slate-300">
        <Activity className="w-12 h-12 text-indigo-500 animate-spin mb-4" aria-hidden="true" />
        <h2 className="text-lg font-bold tracking-tight font-mono">LOADING TELEMETRY ENGINE...</h2>
        <p className="text-xs text-slate-500 mt-1 font-mono">Initializing World Cup 2026 operations pipeline</p>
      </div>
    );
  }

  if (error || !status) {
    return (
      <div id="error-screen" className="min-h-screen bg-[#0b0f19] flex flex-col justify-center items-center text-slate-300 p-4">
        <AlertTriangle className="w-12 h-12 text-red-400 mb-4 animate-bounce" aria-hidden="true" />
        <h2 className="text-lg font-bold tracking-tight text-red-300 font-mono">OPERATIONS PIPELINE DISCONNECTED</h2>
        <p className="text-xs text-slate-400 mt-1 max-w-md text-center">{error || "Failed to establish secure container server socket connections."}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-all focus:ring-2 focus:ring-indigo-500"
        >
          Re-establish Connection
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] flex flex-col" id="app-canvas-container">
      
      {/* Skip to main content link for screen readers (WCAG Accessibility compliance) */}
      <a 
        href="#main-content-anchor" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-indigo-600 focus:text-white focus:rounded-lg focus:font-bold focus:text-xs"
      >
        Skip to main content
      </a>

      {/* Dynamic Header */}
      <header id="platform-header" className="bg-[#0e1322] border-b border-slate-800 shrink-0 sticky top-0 z-40 px-6 py-4" role="banner">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-white text-lg shadow-lg shadow-indigo-950/40 select-none border border-indigo-400/20" aria-hidden="true">
              ⚽
            </span>
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
          <div className="flex items-center gap-6 bg-slate-900/60 border border-slate-800/80 px-4 py-2 rounded-xl" aria-label="Live Match Status Board">
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

            <div className="w-px h-8 bg-slate-800" aria-hidden="true" />

            <div>
              <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wider block">Match Time</span>
              <span className="text-sm font-bold text-emerald-400 font-mono mt-0.5 block">{status.currentMatch.minute}</span>
            </div>

            <div className="w-px h-8 bg-slate-800" aria-hidden="true" />

            <div className="hidden sm:block">
              <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wider block">Est. Gate Wait</span>
              <span className="text-sm font-bold text-amber-400 font-mono mt-0.5 block">14 mins avg</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Grid Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6" id="main-content-anchor" role="main">
        
        {/* Executive Dashboard Section with integrated KPIs, Risk Score & Resource Status */}
        <section aria-label="Executive Operations Summary">
          <ExecutiveDashboard 
            status={status} 
            simulationScale={simulationScale}
            onUpdateGateStatus={updateGateStatus}
            onTriggerModelAnalysis={triggerModelAnalysis}
          />
        </section>

        {/* AI Operational Intelligence control panel (8 live AI response cards) */}
        <section aria-label="AI Operational Intelligence Grid">
          <AIOperationalIntelligence 
            status={status}
            simulationScale={simulationScale}
          />
        </section>

        {/* Middle row: Interactive Arena layout, Map overrides, and simulation tools */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <StadiuMap 
              status={status} 
              onUpdateGateStatus={updateGateStatus}
              selectedGateId={selectedGateId}
              setSelectedGateId={setSelectedGateId}
            />
          </div>

          {/* Interactive Simulation Scale & Control Center Overrides */}
          <div id="simulation-control-card" className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 flex flex-col justify-between" tabIndex={0} aria-label="Pedestrian Simulator Controller">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2 uppercase font-mono">
                <Sliders className="w-5 h-5 text-indigo-400" />
                Live Pedestrian Simulator
              </h2>
              <p className="text-xs text-slate-400 mt-1">Scale arena crowd rates to stress-test predictive AI models.</p>
              
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-300">Inbound Pedestrian Density Flow</span>
                  <span className="font-mono text-indigo-400 font-bold">{simulationScale}%</span>
                </div>
                
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={simulationScale}
                  onChange={(e) => runSimulationScale(Number(e.target.value))}
                  aria-label="Pedestrian flow density rate simulator slider"
                  className="w-full accent-indigo-500 cursor-pointer focus:ring-2 focus:ring-indigo-500 rounded"
                />
                
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => runSimulationScale(30)}
                    className={`px-2 py-1.5 rounded text-[10px] font-mono font-bold transition-all ${simulationScale === 30 ? "bg-indigo-600 text-white" : "bg-slate-950/40 text-slate-400 hover:bg-slate-900"}`}
                  >
                    30% (Low)
                  </button>
                  <button
                    onClick={() => runSimulationScale(65)}
                    className={`px-2 py-1.5 rounded text-[10px] font-mono font-bold transition-all ${simulationScale === 65 ? "bg-indigo-600 text-white" : "bg-slate-950/40 text-slate-400 hover:bg-slate-900"}`}
                  >
                    65% (Med)
                  </button>
                  <button
                    onClick={() => runSimulationScale(95)}
                    className={`px-2 py-1.5 rounded text-[10px] font-mono font-bold transition-all ${simulationScale === 95 ? "bg-indigo-600 text-white" : "bg-slate-950/40 text-slate-400 hover:bg-slate-900"}`}
                  >
                    95% (Peak)
                  </button>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-850 pt-4 mt-6">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Operational Action Banner</span>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                As scale reaches above 85%, AI models will trigger bottleneck warnings at Gate B and recommend active bystander guide dispatches.
              </p>
            </div>
          </div>
        </div>

        {/* Lower row: Tabbed layout for operations subcomponents */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Incident logging and volunteer dispatch portal */}
          <div className="lg:col-span-1">
            <IncidentManager 
              incidents={status.incidents} 
              onDispatchVolunteers={dispatchVolunteers}
              onResolveIncident={resolveIncident}
              onCreateIncident={createIncident}
            />
          </div>

          <div className="lg:col-span-2 bg-[#0e1322] border border-[#1e293b]/60 rounded-xl p-5 flex flex-col h-full min-h-[580px]">
            {/* Tabs Selector row */}
            <div className="flex flex-wrap border-b border-slate-800 pb-3 mb-4 gap-1 shrink-0" role="tablist" aria-label="Control Panel Modules">
              <button
                role="tab"
                aria-selected={activeTab === "copilot"}
                aria-controls="panel-copilot"
                onClick={() => handleTabChange("copilot")}
                className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 ${activeTab === "copilot" ? "bg-indigo-600/10 text-indigo-400 border-indigo-500" : "bg-slate-950/30 border-slate-850 text-slate-400 hover:text-slate-300"}`}
              >
                🤖 Operations Copilot
              </button>
              <button
                role="tab"
                aria-selected={activeTab === "indoor"}
                aria-controls="panel-indoor"
                onClick={() => handleTabChange("indoor")}
                className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 ${activeTab === "indoor" ? "bg-indigo-600/10 text-indigo-400 border-indigo-500" : "bg-slate-950/30 border-slate-850 text-slate-400 hover:text-slate-300"}`}
              >
                🗺️ Indoor Wayfinding
              </button>
              <button
                role="tab"
                aria-selected={activeTab === "crowd"}
                aria-controls="panel-crowd"
                onClick={() => handleTabChange("crowd")}
                className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 ${activeTab === "crowd" ? "bg-indigo-600/10 text-indigo-400 border-indigo-500" : "bg-slate-950/30 border-slate-850 text-slate-400 hover:text-slate-300"}`}
              >
                📈 Crowd Forecasting
              </button>
              <button
                role="tab"
                aria-selected={activeTab === "transit"}
                aria-controls="panel-transit"
                onClick={() => handleTabChange("transit")}
                className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 ${activeTab === "transit" ? "bg-indigo-600/10 text-indigo-400 border-indigo-500" : "bg-slate-950/30 border-slate-850 text-slate-400 hover:text-slate-300"}`}
              >
                🚇 Transportation & Transit
              </button>
              <button
                role="tab"
                aria-selected={activeTab === "sustainability"}
                aria-controls="panel-sustainability"
                onClick={() => handleTabChange("sustainability")}
                className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 ${activeTab === "sustainability" ? "bg-indigo-600/10 text-indigo-400 border-indigo-500" : "bg-slate-950/30 border-slate-850 text-slate-400 hover:text-slate-300"}`}
              >
                🌿 Sustainability Core
              </button>
              <button
                role="tab"
                aria-selected={activeTab === "multilingual"}
                aria-controls="panel-multilingual"
                onClick={() => handleTabChange("multilingual")}
                className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 ${activeTab === "multilingual" ? "bg-indigo-600/10 text-indigo-400 border-indigo-500" : "bg-slate-950/30 border-slate-850 text-slate-400 hover:text-slate-300"}`}
              >
                🌐 Translator Broadcast
              </button>
            </div>

            {/* Dynamic Tab Panels with ARIA label tags */}
            <div className="flex-1 min-h-0">
              {activeTab === "copilot" && (
                <div id="panel-copilot" role="tabpanel" className="h-full">
                  <OperationsCopilot onSendMessage={sendCopilotMessage} />
                </div>
              )}
              {activeTab === "indoor" && (
                <div id="panel-indoor" role="tabpanel" className="h-full">
                  <IndoorNavigation status={status} />
                </div>
              )}
              {activeTab === "crowd" && (
                <div id="panel-crowd" role="tabpanel" className="h-full">
                  <CrowdPredictor status={status} />
                </div>
              )}
              {activeTab === "transit" && (
                <div id="panel-transit" role="tabpanel" className="h-full">
                  <TransportationPlanner transit={status.transit} />
                </div>
              )}
              {activeTab === "sustainability" && (
                <div id="panel-sustainability" role="tabpanel" className="h-full">
                  <SustainabilityInsights metrics={status.sustainability} />
                </div>
              )}
              {activeTab === "multilingual" && (
                <div id="panel-multilingual" role="tabpanel" className="h-full">
                  <MultilingualHelper onTranslate={translateAnnouncement} />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-[#0b0f19] border-t border-slate-800 text-slate-500 text-xs py-6 px-6 shrink-0 mt-auto text-center font-mono" role="contentinfo">
        <p>© FIFA World Cup 2026 Stadium Operations Control. Powered by Google Gemini Enterprise AI & Arena Twin Systems.</p>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}
