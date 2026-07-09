/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from "react";
import { 
  Users, 
  Clock, 
  AlertTriangle, 
  Volume2, 
  Sun, 
  Activity, 
  Sparkles, 
  ShieldAlert, 
  Compass, 
  Heart,
  TrendingUp,
  Layers,
  CheckCircle2
} from "lucide-react";
import { StadiumStatus, IncidentStatus, IncidentPriority } from "../types";

interface ExecutiveDashboardProps {
  status: StadiumStatus;
  simulationScale: number;
  onUpdateGateStatus?: (gateId: string, status: any) => void;
  onTriggerModelAnalysis?: () => void;
}

/**
 * ExecutiveDashboard Component
 * 
 * Renders a high-level operational command overview of the World Cup Stadium:
 * - Dynamic Risk Score calculation based on active threats and capacity scales.
 * - Resource Utilization monitoring (dispatched vs standby volunteer forces).
 * - KPI summary cards with visual bar charts.
 * - Live Automated Decision feeds and a simulated Predictive Recommendations Timeline.
 */
export default function ExecutiveDashboard({ 
  status, 
  simulationScale,
  onUpdateGateStatus,
  onTriggerModelAnalysis
}: ExecutiveDashboardProps) {

  // 1. KPI Computations
  const activeIncidents = useMemo(() => {
    return status.incidents.filter(i => i.status !== IncidentStatus.RESOLVED);
  }, [status.incidents]);

  const avgQueueTime = useMemo(() => {
    const openGates = status.gates.filter(g => g.status !== "CLOSED");
    return openGates.length > 0 
      ? Math.round(openGates.reduce((acc, curr) => acc + curr.queueTime, 0) / openGates.length)
      : 0;
  }, [status.gates]);

  const attendancePercentage = useMemo(() => {
    return Math.round((status.currentMatch.attendance / status.currentMatch.maxCapacity) * 100);
  }, [status.currentMatch]);

  // 2. Risk Score Calculation (Derived organically from active incidents + density scale)
  const riskScore = useMemo(() => {
    let base = Math.min(45, Math.round(simulationScale / 2));
    // High priority incidents add heavily to risk
    const highAlerts = activeIncidents.filter(i => i.priority === IncidentPriority.HIGH).length;
    const medAlerts = activeIncidents.filter(i => i.priority === IncidentPriority.MEDIUM).length;
    
    base += (highAlerts * 15) + (medAlerts * 7);
    return Math.min(100, Math.max(12, base));
  }, [activeIncidents, simulationScale]);

  // Risk Score Styling Utilities
  const riskColorClass = useMemo(() => {
    if (riskScore < 35) return "text-emerald-400 border-emerald-500/25 bg-emerald-500/5";
    if (riskScore < 65) return "text-amber-400 border-amber-500/25 bg-amber-500/5";
    return "text-red-400 border-red-500/25 bg-red-500/5";
  }, [riskScore]);

  // 3. Resource Utilization (Active Volunteers Dispatched vs Available Standby Pool)
  const totalVolunteersDispatched = useMemo(() => {
    return status.incidents.reduce((acc, curr) => acc + (curr.volunteersDispatched || 0), 0);
  }, [status.incidents]);

  const volunteerRosterSize = 60; // Max available standby force
  const volunteerUtilizationPct = Math.round((totalVolunteersDispatched / volunteerRosterSize) * 100);

  // 4. Dynamic AI Highlights & Insights text block
  const dynamicAiInsight = useMemo(() => {
    const bottleneckGate = [...status.gates].sort((a, b) => b.density - a.density)[0];
    if (bottleneckGate && bottleneckGate.density > 80) {
      return `AI Model Insight: Pedestrian saturation at ${bottleneckGate.name} is reaching critical levels (${bottleneckGate.density}%). Gate redirections are highly advised.`;
    }
    if (activeIncidents.length > 0) {
      return `AI Model Insight: ${activeIncidents.length} unresolved stadium incidents. Resource recommendation: dispatch standby helpers immediately.`;
    }
    return "AI Model Insight: Stadium circulation is optimal. All gate throughput metrics currently reside in safe operational green zone.";
  }, [status.gates, activeIncidents]);

  return (
    <div id="executive-dashboard-container" className="space-y-6" aria-label="Executive Operations Dashboard">
      {/* Risk Score & Resource Utilization Header */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Risk Score Gauge */}
        <div id="risk-score-panel" className={`border rounded-2xl p-5 flex items-center justify-between transition-all ${riskColorClass}`} tabIndex={0} aria-label={`Current Stadium Risk Score is ${riskScore} percent`}>
          <div>
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              <h3 className="text-sm font-extrabold uppercase font-mono tracking-tight text-white">Dynamic Arena Risk Score</h3>
            </div>
            <p className="text-xs text-slate-400 mt-2 max-w-[180px] leading-relaxed">
              Synthesized from gate congestion peaks, crowd density scale, and active incident response feeds.
            </p>
          </div>
          <div className="relative flex items-center justify-center shrink-0 w-24 h-24">
            {/* Simple SVG Circular Gauge */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="48"
                cy="48"
                r="38"
                stroke="#1e293b"
                strokeWidth="8"
                fill="transparent"
              />
              <circle
                cx="48"
                cy="48"
                r="38"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={`${2 * Math.PI * 38}`}
                strokeDashoffset={`${2 * Math.PI * 38 * (1 - riskScore / 100)}`}
                className="transition-all duration-700"
              />
            </svg>
            <span className="absolute text-xl font-black text-white font-mono">{riskScore}%</span>
          </div>
        </div>

        {/* Resource Utilization Tracker */}
        <div id="resource-utilization-panel" className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between" tabIndex={0} aria-label={`Standby force utilization is ${volunteerUtilizationPct} percent`}>
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold uppercase font-mono tracking-tight text-slate-200">Workforce & Volunteer Status</h3>
              <span className="text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded">
                Active Staff
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Tracking dispatched crowd management teams and stadium volunteer guides out of our {volunteerRosterSize}-staff pool.
            </p>
          </div>
          <div className="mt-4">
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="text-slate-400">Roster Capacity ({volunteerUtilizationPct}%)</span>
              <span className="font-mono text-slate-200 font-bold">{totalVolunteersDispatched} / {volunteerRosterSize} deployed</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
              <div 
                className="bg-indigo-500 h-2.5 rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(100, volunteerUtilizationPct)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Real-time AI Insight Highlight Block */}
        <div id="ai-insight-block" className="bg-indigo-950/10 border border-indigo-500/20 rounded-2xl p-5 flex flex-col justify-between" tabIndex={0} aria-label="AI Model Insight Banner">
          <div>
            <div className="flex items-center gap-2 text-indigo-400">
              <Sparkles className="w-4 h-4 animate-bounce" />
              <span className="text-xs font-black uppercase font-mono tracking-wider">Live AI Diagnostics Insight</span>
            </div>
            <p className="text-xs text-slate-200 mt-2.5 leading-relaxed font-medium">
              "{dynamicAiInsight}"
            </p>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wider">Analysis Engine</span>
            <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 font-mono">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> SYSTEM HEALTHY
            </span>
          </div>
        </div>

      </div>

      {/* KPI dashboard core stats row */}
      <div id="kpi-dashboard-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Attendance */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">SPECTATOR COUNT</p>
              <h4 className="text-xl font-black text-white mt-1">{status.currentMatch.attendance.toLocaleString()}</h4>
            </div>
            <div className="p-1.5 bg-indigo-500/10 rounded-lg text-indigo-400 border border-indigo-500/25">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex justify-between items-center text-[10px] text-slate-400 mb-1">
              <span>Arena Fill ({attendancePercentage}%)</span>
              <span>{status.currentMatch.maxCapacity.toLocaleString()} max</span>
            </div>
            <div className="w-full bg-slate-850 rounded-full h-1 overflow-hidden">
              <div className="bg-indigo-500 h-1 rounded-full" style={{ width: `${attendancePercentage}%` }} />
            </div>
          </div>
        </div>

        {/* Avg Wait */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">AVG. GATE WAIT</p>
              <h4 className="text-xl font-black text-white mt-1">
                {avgQueueTime} <span className="text-xs font-normal text-slate-400">mins</span>
              </h4>
            </div>
            <div className="p-1.5 bg-amber-500/10 rounded-lg text-amber-400 border border-amber-500/25">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex justify-between items-center text-[10px] text-slate-400 mb-1">
              <span>Max Bottleneck</span>
              <span className="text-amber-400 font-bold">Gate B</span>
            </div>
            <div className="w-full bg-slate-850 rounded-full h-1 overflow-hidden">
              <div className="bg-amber-500 h-1 rounded-full" style={{ width: `${Math.min(100, (avgQueueTime / 30) * 100)}%` }} />
            </div>
          </div>
        </div>

        {/* Active Incidents alerts */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">ACTIVE INCIDENTS</p>
              <h4 className="text-xl font-black text-white mt-1">{activeIncidents.length}</h4>
            </div>
            <div className={`p-1.5 rounded-lg border ${activeIncidents.length > 0 ? "bg-red-500/10 text-red-400 border-red-500/25" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"}`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-[10px] text-slate-400">
            <span>Critical Severity</span>
            <span className="font-bold text-red-400">
              {activeIncidents.filter(i => i.priority === IncidentPriority.HIGH).length} Urgent
            </span>
          </div>
        </div>

        {/* Sound Level */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">NOISE EXPOSURE</p>
              <h4 className="text-xl font-black text-white mt-1">
                {status.soundLevelDb} <span className="text-xs font-normal text-slate-400">dB</span>
              </h4>
            </div>
            <div className="p-1.5 bg-emerald-500/10 rounded-lg text-emerald-400 border border-emerald-500/25">
              <Volume2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex justify-between items-center text-[10px] text-slate-400 mb-1">
              <span>Limit Threshold</span>
              <span>120 dB Max</span>
            </div>
            <div className="w-full bg-slate-850 rounded-full h-1 overflow-hidden">
              <div className="bg-emerald-500 h-1 rounded-full" style={{ width: `${Math.min(100, (status.soundLevelDb / 120) * 100)}%` }} />
            </div>
          </div>
        </div>

        {/* Solar Generation */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">SOLAR INPUT</p>
              <h4 className="text-xl font-black text-white mt-1">
                {status.sustainability.solarPowerKw} <span className="text-xs font-normal text-slate-400">kW</span>
              </h4>
            </div>
            <div className="p-1.5 bg-cyan-500/10 rounded-lg text-cyan-400 border border-cyan-500/25">
              <Sun className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-[10px] text-slate-400">
            <span>Co2 Offset</span>
            <span className="text-cyan-400 font-bold font-mono">{status.sustainability.carbonOffsetKg} kg</span>
          </div>
        </div>

      </div>

      {/* Decision Feed & Predictive Timeline Block */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Live Decision Feed */}
        <div id="exec-decision-feed" className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <h3 className="text-xs font-black uppercase font-mono tracking-tight text-white">Live Decision & Override Log</h3>
            </div>
            <span className="text-[9px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded">
              SYNCED REAL-TIME
            </span>
          </div>

          <div className="space-y-4 max-h-[220px] overflow-y-auto pr-2" id="exec-decision-scroll">
            {status.decisionFeed.slice(0, 5).map((item) => (
              <div key={item.id} className="flex gap-3 text-xs">
                <span className="text-[10px] font-mono text-indigo-400 font-extrabold w-8 pt-0.5 shrink-0">
                  {item.timestamp}
                </span>
                <div>
                  <h4 className="font-bold text-slate-200">{item.title}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Recommendations Timeline */}
        <div id="ai-rec-timeline" className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-pink-400" />
              <h3 className="text-xs font-black uppercase font-mono tracking-tight text-white">AI Recommendations Timeline</h3>
            </div>
            {onTriggerModelAnalysis && (
              <button 
                onClick={onTriggerModelAnalysis}
                className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition-all flex items-center gap-1 uppercase font-mono"
              >
                Re-Analyze
              </button>
            )}
          </div>

          <div className="space-y-4 max-h-[220px] overflow-y-auto pr-2" id="exec-timeline-scroll">
            {status.recommendations.map((rec) => (
              <div key={rec.id} className="relative pl-4 border-l-2 border-indigo-500/30 text-xs">
                <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-indigo-500" />
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-indigo-300 uppercase font-mono text-[11px]">{rec.title}</h4>
                  <span className="text-[9px] font-mono text-slate-500">{rec.timestamp || "PREDICTED"}</span>
                </div>
                <p className="text-slate-300 mt-1">{rec.why}</p>
                <div className="bg-slate-950/40 p-2 rounded border border-slate-850 mt-2 text-[11px] leading-relaxed">
                  <span className="text-[9px] font-mono font-extrabold text-emerald-400 uppercase block">Suggested Action</span>
                  <p className="text-slate-200 mt-0.5">{rec.suggestedAction}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
