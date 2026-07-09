/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Sun, Leaf, Flame, Sparkles, RefreshCw, Droplet } from "lucide-react";
import { SustainabilityMetrics } from "../types";

interface SustainabilityInsightsProps {
  metrics: SustainabilityMetrics;
}

export default function SustainabilityInsights({ metrics }: SustainabilityInsightsProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiTip, setAiTip] = useState<string | null>(null);

  const handleGenerateTip = async () => {
    setIsGenerating(true);
    // Simple mock or API suggestion
    setTimeout(() => {
      setAiTip(
        "Based on current peak solar output of 840 kW, stadium operations can transition concourse and scoreboard lighting completely to 100% solar arrays, cutting grid usage by 18% for the remainder of the match."
      );
      setIsGenerating(false);
    }, 800);
  };

  return (
    <div id="sustainability-insights" className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-4 border-b border-slate-800/80 pb-3">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Leaf className="w-5 h-5 text-emerald-400" />
              Sustainability & Carbon Guard
            </h2>
            <p className="text-xs text-slate-400">Green matchday metrics & eco intelligence</p>
          </div>
          <button
            onClick={handleGenerateTip}
            disabled={isGenerating}
            className="flex items-center gap-1 text-[10px] px-2.5 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 font-bold transition-all"
          >
            <Sparkles className="w-3 h-3" />
            {isGenerating ? "Analyzing..." : "AI Eco Tip"}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3" id="sustainability-grid">
          <div className="bg-slate-950/20 border border-slate-850 p-3 rounded-lg">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Recycled waste</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-base font-bold text-slate-200 font-mono">{metrics.wasteRecycledKg.toLocaleString()} kg</span>
              <RefreshCw className="w-4 h-4 text-emerald-400 shrink-0" />
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1 mt-2">
              <div className="bg-emerald-500 h-1 rounded-full" style={{ width: `${Math.min(100, (metrics.wasteRecycledKg / 5000) * 100)}%` }}></div>
            </div>
          </div>

          <div className="bg-slate-950/20 border border-slate-850 p-3 rounded-lg">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Greywater Recycled</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-base font-bold text-slate-200 font-mono">{metrics.waterSavedLitres.toLocaleString()} L</span>
              <Droplet className="w-4 h-4 text-blue-400 shrink-0" />
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1 mt-2">
              <div className="bg-blue-500 h-1 rounded-full" style={{ width: "72%" }}></div>
            </div>
          </div>
        </div>

        {aiTip && (
          <div className="mt-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3 flex gap-2 items-start" id="sustainability-tip">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider">AI Recommendation</h4>
              <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">{aiTip}</p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 border-t border-slate-800/60 pt-3 flex items-center justify-between text-xs text-slate-500">
        <span>Stadium carbon savings score:</span>
        <span className="font-bold text-emerald-400 font-mono flex items-center gap-1">
          <Flame className="w-4 h-4 text-emerald-500 shrink-0" /> A+ (98.4%)
        </span>
      </div>
    </div>
  );
}
