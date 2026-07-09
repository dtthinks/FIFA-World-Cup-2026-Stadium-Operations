/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { TrendingUp, Users, AlertTriangle, ShieldCheck, Clock } from "lucide-react";
import { StadiumStatus } from "../types";

interface CrowdPredictorProps {
  status: StadiumStatus;
}

export default function CrowdPredictor({ status }: CrowdPredictorProps) {
  // Let's create an elegant, responsive custom SVG chart plotting historical vs AI predicted crowd levels
  const timeline = ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00"];
  const historical = [12, 35, 68, 88]; // up to 13:00 (actuals)
  const predicted = [12, 35, 68, 88, 95, 20]; // up to 15:00 (match ends around 14:30)

  // Chart coordinates
  const pointsHistorical = historical.map((val, i) => `${i * 70 + 40},${180 - val * 1.5}`).join(" ");
  const pointsPredicted = predicted.map((val, i) => `${i * 70 + 40},${180 - val * 1.5}`).join(" ");

  const maxDensityGate = [...status.gates].sort((a, b) => b.density - a.density)[0];

  return (
    <div id="crowd-predictor-container" className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 flex flex-col h-full justify-between">
      <div>
        <div className="flex items-center justify-between mb-4 border-b border-slate-800/80 pb-3">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
              AI Crowd Flow Forecasting
            </h2>
            <p className="text-xs text-slate-400">Matchday congestion and bottleneck prevention</p>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded font-bold">
            LIVE ANALYTICS
          </span>
        </div>

        {/* Predictive Alert Box */}
        {maxDensityGate && maxDensityGate.density > 80 && (
          <div className="mb-4 bg-red-500/5 border border-red-500/20 rounded-xl p-3 flex gap-3 items-start" id="predictor-alert">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5 animate-bounce" />
            <div>
              <h4 className="text-xs font-bold text-red-300">Congestion Threshold Exceeded</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                AI model predicts overcrowding at <strong>{maxDensityGate.name}</strong> will peak in 20 minutes (estimated wait time: <strong>{maxDensityGate.queueTime} mins</strong>). Initiating Gate D redirection.
              </p>
            </div>
          </div>
        )}

        {/* Custom SVG Area Chart */}
        <div id="prediction-line-chart" className="bg-slate-950/40 rounded-xl border border-slate-800/60 p-4 relative overflow-hidden flex flex-col items-center">
          <div className="w-full flex justify-between items-center text-[10px] text-slate-500 font-mono mb-2">
            <span>Pedestrian Inflow (Thousands / Hr)</span>
            <div className="flex gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-0.5 bg-indigo-500 inline-block"></span> Actual Flow
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-0.5 border-t-2 border-dashed border-indigo-400 inline-block"></span> AI Forecast
              </span>
            </div>
          </div>

          <svg viewBox="0 0 400 200" className="w-full h-auto max-h-[160px]">
            {/* Grid Lines */}
            <line x1="40" y1="30" x2="390" y2="30" className="stroke-slate-800/60" strokeDasharray="3,3" />
            <line x1="40" y1="80" x2="390" y2="80" className="stroke-slate-800/60" strokeDasharray="3,3" />
            <line x1="40" y1="130" x2="390" y2="130" className="stroke-slate-800/60" strokeDasharray="3,3" />
            <line x1="40" y1="180" x2="390" y2="180" className="stroke-slate-800" />

            {/* X Axis labels */}
            {timeline.map((time, idx) => (
              <text key={idx} x={idx * 70 + 40} y="195" textAnchor="middle" className="fill-slate-500 font-mono text-[9px]">
                {time}
              </text>
            ))}

            {/* Y Axis labels */}
            <text x="30" y="34" textAnchor="end" className="fill-slate-600 font-mono text-[8px]">100K</text>
            <text x="30" y="84" textAnchor="end" className="fill-slate-600 font-mono text-[8px]">50K</text>
            <text x="30" y="134" textAnchor="end" className="fill-slate-600 font-mono text-[8px]">10K</text>
            <text x="30" y="184" textAnchor="end" className="fill-slate-600 font-mono text-[8px]">0</text>

            {/* Shaded Area for predicted */}
            <path 
              d={`M 40,180 ${predicted.map((val, i) => `L ${i * 70 + 40},${180 - val * 1.5}`).join(" ")} L 390,180 Z`}
              className="fill-indigo-500/5"
            />

            {/* Predicted Line (Dashed) */}
            <polyline 
              fill="none" 
              stroke="#818cf8" 
              strokeWidth="1.5" 
              strokeDasharray="4,4" 
              points={pointsPredicted} 
            />

            {/* Historical Line (Solid) */}
            <polyline 
              fill="none" 
              stroke="#4f46e5" 
              strokeWidth="2.5" 
              points={pointsHistorical} 
            />

            {/* Dots */}
            {historical.map((val, i) => (
              <circle 
                key={i} 
                cx={i * 70 + 40} 
                cy={180 - val * 1.5} 
                r="3.5" 
                className="fill-indigo-500 stroke-slate-900 stroke-[1.5]" 
              />
            ))}
            
            {/* Forecasted Highlight node */}
            <g>
              <circle 
                cx="320" 
                cy={180 - 95 * 1.5} 
                r="4.5" 
                className="fill-red-500 stroke-slate-950 stroke-[1.5] animate-pulse" 
              />
              <text x="320" y={180 - 95 * 1.5 - 10} textAnchor="middle" className="fill-red-400 font-mono text-[8px] font-bold">MATCH END OUTFLOW PEAK</text>
            </g>
          </svg>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4">
        <div className="bg-slate-950/20 border border-slate-800 p-3 rounded-xl">
          <div className="flex items-center gap-1 text-[10px] font-mono text-slate-500 uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            Peak outflow window
          </div>
          <span className="text-sm font-bold text-white mt-1 block">14:20 - 14:55</span>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Estimated 45,000 fans outbound</span>
        </div>
        <div className="bg-slate-950/20 border border-slate-800 p-3 rounded-xl">
          <div className="flex items-center gap-1 text-[10px] font-mono text-slate-500 uppercase tracking-wider">
            <Users className="w-3.5 h-3.5 text-indigo-400" />
            Redirection target
          </div>
          <span className="text-sm font-bold text-white mt-1 block">Gate D Bypass</span>
          <span className="text-[10px] text-emerald-400 mt-0.5 block">Absorbs 35% outbound volume</span>
        </div>
      </div>
    </div>
  );
}
