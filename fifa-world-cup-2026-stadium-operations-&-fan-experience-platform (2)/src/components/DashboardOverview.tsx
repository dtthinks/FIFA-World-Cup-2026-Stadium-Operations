/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { 
  Users, 
  Clock, 
  AlertTriangle, 
  Sun, 
  Volume2, 
  ShieldAlert, 
  Activity 
} from "lucide-react";
import { StadiumStatus } from "../types";

interface DashboardOverviewProps {
  status: StadiumStatus;
}

export default function DashboardOverview({ status }: DashboardOverviewProps) {
  const activeIncidentsCount = status.incidents.filter(i => i.status !== "RESOLVED").length;
  
  // Calculate average queue time for open gates
  const openGates = status.gates.filter(g => g.status !== "CLOSED");
  const avgQueueTime = openGates.length > 0 
    ? Math.round(openGates.reduce((acc, curr) => acc + curr.queueTime, 0) / openGates.length)
    : 0;

  const attendancePercentage = Math.round(
    (status.currentMatch.attendance / status.currentMatch.maxCapacity) * 100
  );

  return (
    <div id="dashboard-overview" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* Attendance KPI Card */}
      <div id="kpi-attendance" className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col justify-between transition-all hover:border-slate-700 hover:shadow-lg hover:shadow-slate-950/20">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-mono text-slate-400 uppercase tracking-wider">Attendance</p>
            <h3 className="text-2xl font-bold tracking-tight text-white mt-1">
              {status.currentMatch.attendance.toLocaleString()}
            </h3>
          </div>
          <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-indigo-400">
            <Users className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-4">
          <div className="flex justify-between items-center text-xs mb-1">
            <span className="text-slate-400">Stadium Capacity ({attendancePercentage}%)</span>
            <span className="font-mono text-slate-300">{status.currentMatch.maxCapacity.toLocaleString()}</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-indigo-500 h-1.5 rounded-full transition-all duration-500" 
              style={{ width: `${attendancePercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Average Gate Queue Card */}
      <div id="kpi-queue" className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col justify-between transition-all hover:border-slate-700 hover:shadow-lg hover:shadow-slate-950/20">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-mono text-slate-400 uppercase tracking-wider">Avg. Gate Wait</p>
            <h3 className="text-2xl font-bold tracking-tight text-white mt-1">
              {avgQueueTime} <span className="text-sm font-normal text-slate-400">mins</span>
            </h3>
          </div>
          <div className={`p-2 rounded-lg text-amber-400 border bg-amber-500/10 border-amber-500/20`}>
            <Clock className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-4">
          <div className="flex justify-between items-center text-xs mb-1">
            <span className="text-slate-400">Bottleneck Zone</span>
            <span className="font-mono text-red-400 font-semibold">Gate B (38 min)</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-amber-500 h-1.5 rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(100, (avgQueueTime / 40) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Active Incidents Card */}
      <div id="kpi-incidents" className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col justify-between transition-all hover:border-slate-700 hover:shadow-lg hover:shadow-slate-950/20">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-mono text-slate-400 uppercase tracking-wider">Active Alerts</p>
            <h3 className="text-2xl font-bold tracking-tight text-white mt-1">
              {activeIncidentsCount}
            </h3>
          </div>
          <div className={`p-2 rounded-lg ${activeIncidentsCount > 0 ? "bg-red-500/10 border border-red-500/20 text-red-400" : "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"}`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between text-xs">
          <span className="text-slate-400">Dispatched Teams</span>
          <span className="font-mono text-slate-300 font-semibold">
            {status.incidents.filter(i => i.status === "DISPATCHED").length} Active
          </span>
        </div>
      </div>

      {/* Sound Pressure Level Card */}
      <div id="kpi-sound" className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col justify-between transition-all hover:border-slate-700 hover:shadow-lg hover:shadow-slate-950/20">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-mono text-slate-400 uppercase tracking-wider">Ambient Noise</p>
            <h3 className="text-2xl font-bold tracking-tight text-white mt-1">
              {status.soundLevelDb} <span className="text-sm font-normal text-slate-400">dB</span>
            </h3>
          </div>
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400">
            <Volume2 className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-4">
          <div className="flex justify-between items-center text-xs mb-1">
            <span className="text-slate-400">Atmosphere</span>
            <span className="font-semibold text-emerald-400">Roaring Crowd</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-emerald-500 h-1.5 rounded-full" 
              style={{ width: `${Math.min(100, (status.soundLevelDb / 120) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Sustainability Metrics (Solar output) Card */}
      <div id="kpi-solar" className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col justify-between transition-all hover:border-slate-700 hover:shadow-lg hover:shadow-slate-950/20">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-mono text-slate-400 uppercase tracking-wider">Clean Generation</p>
            <h3 className="text-2xl font-bold tracking-tight text-white mt-1">
              {status.sustainability.solarPowerKw} <span className="text-sm font-normal text-slate-400">kW</span>
            </h3>
          </div>
          <div className="p-2 bg-cyan-500/10 border border-cyan-500/20 rounded-lg text-cyan-400">
            <Sun className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between text-xs">
          <span className="text-slate-400">Carbon Saved Today</span>
          <span className="font-mono text-cyan-400 font-semibold">{status.sustainability.carbonOffsetKg} kg</span>
        </div>
      </div>
    </div>
  );
}
