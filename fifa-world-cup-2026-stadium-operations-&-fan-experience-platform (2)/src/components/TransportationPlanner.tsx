/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Train, Bus, Car, ArrowRight, RefreshCw, Clock } from "lucide-react";
import { TransitRoute } from "../types";

interface TransportationPlannerProps {
  transit: TransitRoute[];
}

export default function TransportationPlanner({ transit }: TransportationPlannerProps) {
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "CONGESTED": return "bg-red-500/10 text-red-400 border-red-500/20";
      case "DELAYED": return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      default: return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    }
  };

  const getTransitIcon = (type: string) => {
    switch (type) {
      case "METRO": return <Train className="w-4 h-4 text-indigo-400" />;
      case "BUS": return <Bus className="w-4 h-4 text-emerald-400" />;
      default: return <Car className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div id="transportation-planner" className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-4 border-b border-slate-800/80 pb-3">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Train className="w-5 h-5 text-indigo-400" />
              Transportation & Transit Link
            </h2>
            <p className="text-xs text-slate-400">Metro, shuttle, and rideshare queue optimization</p>
          </div>
        </div>

        <div className="space-y-3" id="transit-list">
          {transit.map((route) => (
            <div key={route.id} className="bg-slate-950/30 border border-slate-850 rounded-xl p-3 hover:border-slate-700 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-slate-900 border border-slate-800 rounded-lg">
                    {getTransitIcon(route.type)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">{route.name}</h4>
                    <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                      <Clock className="w-3.5 h-3.5" /> Frequency: {route.frequencyMins} mins
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-0.5 text-[9px] font-mono rounded border ${getStatusBadgeColor(route.status)}`}>
                    {route.status}
                  </span>
                  <span className="block text-xs font-bold text-slate-300 font-mono mt-1">{route.waitTimeMins}m wait</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 mt-2 bg-slate-900/20 px-2 py-1.5 rounded border border-slate-900">{route.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 border-t border-slate-800/60 pt-3 flex items-center justify-between text-xs text-slate-500 bg-slate-950/10 p-2 rounded-lg border border-slate-900">
        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-indigo-400 shrink-0" /> Dynamic Shuttle Bypass Active:</span>
        <strong className="text-emerald-400">Rerouting Central Fans</strong>
      </div>
    </div>
  );
}
