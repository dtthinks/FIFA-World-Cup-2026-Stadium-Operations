/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Compass, 
  Users, 
  Clock, 
  MapPin, 
  Settings, 
  AlertOctagon, 
  AlertTriangle,
  Info 
} from "lucide-react";
import { StadiumStatus, GateInfo, GateStatus, Incident } from "../types";

interface StadiuMapProps {
  status: StadiumStatus;
  onUpdateGateStatus: (gateId: string, status: GateStatus) => void;
  selectedGateId: string | null;
  setSelectedGateId: (gateId: string | null) => void;
}

export default function StadiuMap({ 
  status, 
  onUpdateGateStatus,
  selectedGateId,
  setSelectedGateId
}: StadiuMapProps) {
  const [hoveredGate, setHoveredGate] = useState<GateInfo | null>(null);
  const [hoveredIncident, setHoveredIncident] = useState<Incident | null>(null);

  const getDensityColor = (density: number) => {
    if (density < 50) return "fill-emerald-500/20 stroke-emerald-500 hover:fill-emerald-500/30";
    if (density < 80) return "fill-amber-500/20 stroke-amber-500 hover:fill-amber-500/30";
    return "fill-red-500/20 stroke-red-500 hover:fill-red-500/30";
  };

  const getGateBadgeColor = (gateStatus: GateStatus) => {
    switch (gateStatus) {
      case GateStatus.OPEN:
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case GateStatus.REDIRECTING:
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case GateStatus.CLOSED:
        return "bg-red-500/10 text-red-400 border-red-500/20";
    }
  };

  const selectedGate = status.gates.find(g => g.id === selectedGateId);

  // Approximate coordinate mapping for visual representation of stadium features
  const gateCoords: Record<string, { x: number; y: number; textX: number; textY: number }> = {
    "gate-a": { x: 200, y: 55, textX: 200, textY: 40 },   // North Gate
    "gate-b": { x: 345, y: 150, textX: 375, textY: 155 }, // East Gate
    "gate-c": { x: 200, y: 245, textX: 200, textY: 270 }, // South Gate
    "gate-d": { x: 55, y: 150, textX: 25, textY: 155 }    // West Gate
  };

  // Incident coordinate offsets in the layout
  const incidentCoords: Record<string, { x: number; y: number }> = {
    "inc-1": { x: 335, y: 140 }, // Near Gate B
    "inc-2": { x: 170, y: 220 }, // Near ramp south
    "inc-3": { x: 270, y: 110 }  // East Stands section 114
  };

  return (
    <div id="stadium-map-component" className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 border-b border-slate-800/80 pb-3">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Compass className="w-5 h-5 text-indigo-400" />
            Smart Arena Twin
          </h2>
          <p className="text-xs text-slate-400">Interactive live crowd & access telemetry</p>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/30 border border-emerald-500 inline-block"></span>
            &lt;50%
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/30 border border-amber-500 inline-block"></span>
            50-80%
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/30 border border-red-500 inline-block"></span>
            &gt;80%
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 flex-1 items-stretch">
        {/* Interactive SVG Map container */}
        <div id="svg-map-pane" className="lg:col-span-2 bg-slate-950/40 rounded-xl border border-slate-800/60 p-4 flex flex-col justify-center items-center relative overflow-hidden min-h-[320px]">
          {/* Compass Rose accent */}
          <div className="absolute top-3 left-3 flex items-center gap-1 text-[10px] font-mono text-slate-500">
            <Compass className="w-3.5 h-3.5" />
            <span>N</span>
          </div>

          <svg viewBox="0 0 400 300" className="w-full max-w-[420px] h-auto drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
            {/* outer protective loop road */}
            <circle cx="200" cy="150" r="130" className="fill-none stroke-slate-800/50 stroke-[1.5]" />
            <circle cx="200" cy="150" r="115" className="fill-none stroke-slate-800/80 stroke-[1] stroke-dasharray-[4,4]" />

            {/* Stadium outer rings (Interactive sectors) */}
            {/* North Stand Sector */}
            <path 
              d="M 100 80 A 110 90 0 0 1 300 80 L 270 110 A 75 60 0 0 0 130 110 Z" 
              className={getDensityColor(status.gates[0].density)}
              onMouseEnter={() => setHoveredGate(status.gates[0])}
              onMouseLeave={() => setHoveredGate(null)}
              onClick={() => setSelectedGateId(status.gates[0].id)}
              role="button"
              tabIndex={0}
              aria-label="North Sector and Gate A"
            />

            {/* East Stand Sector */}
            <path 
              d="M 300 80 A 110 90 0 0 1 300 220 L 270 190 A 75 60 0 0 0 270 110 Z" 
              className={getDensityColor(status.gates[1].density)}
              onMouseEnter={() => setHoveredGate(status.gates[1])}
              onMouseLeave={() => setHoveredGate(null)}
              onClick={() => setSelectedGateId(status.gates[1].id)}
              role="button"
              tabIndex={0}
              aria-label="East Sector and Gate B"
            />

            {/* South Stand Sector */}
            <path 
              d="M 300 220 A 110 90 0 0 1 100 220 L 130 190 A 75 60 0 0 0 270 190 Z" 
              className={getDensityColor(status.gates[2].density)}
              onMouseEnter={() => setHoveredGate(status.gates[2])}
              onMouseLeave={() => setHoveredGate(null)}
              onClick={() => setSelectedGateId(status.gates[2].id)}
              role="button"
              tabIndex={0}
              aria-label="South Sector and Gate C"
            />

            {/* West Stand Sector */}
            <path 
              d="M 100 220 A 110 90 0 0 1 100 80 L 130 110 A 75 60 0 0 0 130 190 Z" 
              className={getDensityColor(status.gates[3].density)}
              onMouseEnter={() => setHoveredGate(status.gates[3])}
              onMouseLeave={() => setHoveredGate(null)}
              onClick={() => setSelectedGateId(status.gates[3].id)}
              role="button"
              tabIndex={0}
              aria-label="West Sector and Gate D"
            />

            {/* Inner concourse walkway */}
            <ellipse cx="200" cy="150" rx="70" ry="55" className="fill-slate-900 stroke-slate-800 stroke-[2]" />

            {/* Soccer Pitch / Playing field */}
            <rect x="155" y="115" width="90" height="70" rx="3" className="fill-emerald-800/40 stroke-emerald-500/40 stroke-[1]" />
            <line x1="200" y1="115" x2="200" y2="185" className="stroke-emerald-500/30 stroke-[1]" />
            <circle cx="200" cy="150" r="15" className="fill-none stroke-emerald-500/30 stroke-[1]" />

            {/* Gates Indicators (Circles on outer perimeter) */}
            {status.gates.map((g) => {
              const coords = gateCoords[g.id];
              if (!coords) return null;
              
              const isSelected = selectedGateId === g.id;
              const isClosed = g.status === GateStatus.CLOSED;
              let ringColor = "stroke-slate-400";
              let fillColor = "fill-slate-800";
              
              if (g.status === GateStatus.OPEN) {
                ringColor = g.density > 80 ? "stroke-red-500" : g.density > 50 ? "stroke-amber-500" : "stroke-emerald-500";
                fillColor = g.density > 80 ? "fill-red-900" : g.density > 50 ? "fill-amber-900" : "fill-emerald-950";
              } else if (g.status === GateStatus.REDIRECTING) {
                ringColor = "stroke-amber-400";
                fillColor = "fill-amber-950";
              } else {
                ringColor = "stroke-red-600";
                fillColor = "fill-slate-950";
              }

              return (
                <g key={g.id}>
                  {/* Outer breathing ring for hot gates */}
                  {g.density > 80 && g.status === GateStatus.OPEN && (
                    <circle 
                      cx={coords.x} 
                      cy={coords.y} 
                      r="16" 
                      className="fill-none stroke-red-500/40 stroke-[2] animate-pulse-ring origin-center"
                    />
                  )}
                  {/* Gate Core circle node */}
                  <circle 
                    cx={coords.x} 
                    cy={coords.y} 
                    r={isSelected ? "11" : "8"} 
                    className={`${fillColor} ${ringColor} stroke-[2.5] cursor-pointer transition-all`}
                    onClick={() => setSelectedGateId(g.id)}
                    onMouseEnter={() => setHoveredGate(g)}
                    onMouseLeave={() => setHoveredGate(null)}
                  />
                  {/* Label */}
                  <text 
                    x={coords.textX} 
                    y={coords.textY} 
                    textAnchor="middle" 
                    className={`font-mono text-[9px] font-bold ${isSelected ? "fill-white" : "fill-slate-400"} select-none cursor-pointer`}
                    onClick={() => setSelectedGateId(g.id)}
                  >
                    {g.name.split(" ")[1]}
                  </text>
                </g>
              );
            })}

            {/* Active Incident Pinpoints */}
            {status.incidents.filter(inc => inc.status !== "RESOLVED").map((inc) => {
              const coords = incidentCoords[inc.id] || { x: 200, y: 150 };
              const color = inc.priority === "HIGH" ? "fill-red-500" : "fill-amber-500";
              return (
                <g 
                  key={inc.id}
                  onMouseEnter={() => setHoveredIncident(inc)}
                  onMouseLeave={() => setHoveredIncident(null)}
                  className="cursor-pointer"
                >
                  <circle cx={coords.x} cy={coords.y} r="14" className="fill-none stroke-red-500/20 animate-ping" />
                  <path 
                    d={`M ${coords.x} ${coords.y - 7} L ${coords.x + 6} ${coords.y + 3} L ${coords.x - 6} ${coords.y + 3} Z`}
                    className={`${color} stroke-slate-900 stroke-[1]`}
                  />
                </g>
              );
            })}
          </svg>

          {/* Map hover details pane */}
          {hoveredGate && (
            <div id="gate-hover-overlay" className="absolute bottom-3 left-3 right-3 bg-slate-900/95 border border-slate-700/80 rounded-lg p-2.5 text-xs flex justify-between items-center backdrop-blur shadow-2xl">
              <div>
                <span className="font-bold text-white">{hoveredGate.name}</span>
                <span className="text-slate-400 font-mono text-[10px] ml-2">({hoveredGate.location})</span>
                <div className="flex items-center gap-3 mt-1 text-slate-300">
                  <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-slate-400" /> {hoveredGate.density}% flow</span>
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-slate-400" /> {hoveredGate.queueTime}m queue</span>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded border text-[10px] font-mono ${getGateBadgeColor(hoveredGate.status)}`}>
                {hoveredGate.status}
              </span>
            </div>
          )}

          {hoveredIncident && (
            <div id="incident-hover-overlay" className="absolute bottom-3 left-3 right-3 bg-red-950/95 border border-red-700/60 rounded-lg p-2.5 text-xs flex justify-between items-center backdrop-blur shadow-2xl">
              <div className="flex-1 min-w-0 pr-2">
                <div className="flex items-center gap-1.5 text-red-300 font-bold">
                  <AlertOctagon className="w-4 h-4 text-red-400 shrink-0" />
                  <span className="truncate">{hoveredIncident.title}</span>
                </div>
                <p className="text-red-200/80 text-[11px] truncate mt-0.5">{hoveredIncident.description}</p>
              </div>
              <span className="shrink-0 bg-red-900/60 text-red-200 border border-red-700/40 px-2 py-0.5 rounded text-[10px] font-mono">
                {hoveredIncident.status}
              </span>
            </div>
          )}
        </div>

        {/* Selected Gate Control & telemetry details */}
        <div id="gate-controls-pane" className="bg-slate-950/20 rounded-xl border border-slate-800/60 p-4 flex flex-col justify-between">
          <div>
            {selectedGate ? (
              <div id="gate-detail-active">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-white text-base">{selectedGate.name}</h3>
                  <span className={`px-2 py-0.5 text-xs font-mono rounded-full border ${getGateBadgeColor(selectedGate.status)}`}>
                    {selectedGate.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mb-4 font-mono">{selectedGate.location}</p>

                <div className="space-y-3.5">
                  <div>
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>Crowd Density</span>
                      <span className="font-mono text-white font-semibold">{selectedGate.density}%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${selectedGate.density > 80 ? "bg-red-500" : selectedGate.density > 50 ? "bg-amber-500" : "bg-emerald-500"}`}
                        style={{ width: `${selectedGate.density}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 bg-slate-900/40 border border-slate-800/80 rounded-lg p-2.5">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Inflow rate</span>
                      <span className="text-sm font-bold text-slate-300 font-mono mt-0.5 block">{selectedGate.turnstileRate} / min</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Est. Queue</span>
                      <span className={`text-sm font-bold font-mono mt-0.5 block ${selectedGate.queueTime > 25 ? "text-red-400 animate-pulse" : "text-slate-300"}`}>
                        {selectedGate.queueTime} mins
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-900/20 border border-slate-800/50 rounded-lg p-2.5 text-xs text-slate-400">
                    <div className="flex gap-1.5 items-start">
                      <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                      <span>
                        {selectedGate.density > 80 
                          ? "Critical capacity limits. Pedestrian rerouting is highly recommended to prevent bottlenecks." 
                          : "Flow parameters optimal. Maintain monitoring."}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div id="gate-detail-empty" className="h-full flex flex-col justify-center items-center text-center p-4">
                <MapPin className="w-8 h-8 text-slate-600 mb-2" />
                <p className="text-sm font-medium text-slate-300">No Gate Selected</p>
                <p className="text-xs text-slate-500 mt-1">Select a gateway circular node on the map to inspect telemetry and issue manual bypass overrides.</p>
              </div>
            )}
          </div>

          {selectedGate && (
            <div id="gate-actions-block" className="border-t border-slate-800/80 pt-4 mt-4">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-2 block">Operator Override Actions</span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => onUpdateGateStatus(selectedGate.id, GateStatus.OPEN)}
                  className={`py-2 px-1 rounded-lg font-mono text-[10px] font-bold border transition-all ${selectedGate.status === GateStatus.OPEN ? "bg-emerald-500/20 text-emerald-400 border-emerald-500" : "bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300"}`}
                >
                  OPEN
                </button>
                <button
                  onClick={() => onUpdateGateStatus(selectedGate.id, GateStatus.REDIRECTING)}
                  className={`py-2 px-1 rounded-lg font-mono text-[10px] font-bold border transition-all ${selectedGate.status === GateStatus.REDIRECTING ? "bg-amber-500/20 text-amber-400 border-amber-500" : "bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300"}`}
                >
                  DETOUR
                </button>
                <button
                  onClick={() => onUpdateGateStatus(selectedGate.id, GateStatus.CLOSED)}
                  className={`py-2 px-1 rounded-lg font-mono text-[10px] font-bold border transition-all ${selectedGate.status === GateStatus.CLOSED ? "bg-red-500/20 text-red-400 border-red-500" : "bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300"}`}
                >
                  CLOSE
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
