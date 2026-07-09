/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Sparkles, ShieldCheck, Activity, Lightbulb } from "lucide-react";

interface AIResponseCardProps {
  text: string;
}

export default function AIResponseCard({ text }: AIResponseCardProps) {
  // Regex to extract the four pillars:
  // - Confidence Score
  // - Reasoning
  // - Recommended Action
  // - Expected Operational Impact

  const confidenceMatch = text.match(/(?:Confidence Score|Confidence):\s*(\d+%?)/i);
  const reasoningMatch = text.match(/(?:Reasoning|Reason):\s*([\s\S]*?)(?=(?:Recommended Action|Suggested Action|Expected Operational Impact|Expected Result|$))/i);
  const actionMatch = text.match(/(?:Recommended Action|Suggested Action|Action):\s*([\s\S]*?)(?=(?:Expected Operational Impact|Expected Result|Reasoning|$))/i);
  const impactMatch = text.match(/(?:Expected Operational Impact|Expected Result|Impact):\s*([\s\S]*?)(?=(?:Confidence Score|Reasoning|$))/i);

  const hasPillars = confidenceMatch || reasoningMatch || actionMatch || impactMatch;

  if (!hasPillars) {
    // Fallback if the raw text is not in structured format
    return (
      <div className="space-y-2 text-slate-300">
        {text.split("\n").map((para, i) => {
          if (!para.trim()) return null;
          return <p key={i} className="text-xs leading-relaxed">{para}</p>;
        })}
      </div>
    );
  }

  const confidence = confidenceMatch ? confidenceMatch[1] : "95%";
  const reasoning = reasoningMatch ? reasoningMatch[1].trim() : "No active reasoning provided.";
  const action = actionMatch ? actionMatch[1].trim() : "Maintain default monitoring guidelines.";
  const impact = impactMatch ? impactMatch[1].trim() : "Maintains balanced arena throughput.";

  return (
    <div className="bg-indigo-950/20 border border-indigo-500/20 rounded-xl p-4 space-y-4" id="executive-ai-response-block">
      {/* Confidence Header */}
      <div className="flex items-center justify-between border-b border-indigo-500/10 pb-2">
        <div className="flex items-center gap-1.5 text-indigo-300 font-bold text-xs uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
          Executive Decision Support
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-400 font-mono">Confidence Score</span>
          <span className="text-xs font-mono font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded">
            {confidence.includes("%") ? confidence : `${confidence}%`}
          </span>
        </div>
      </div>

      {/* Grid of 3 columns or simple stacked blocks for space optimization */}
      <div className="space-y-3 text-[11px] leading-relaxed">
        <div className="bg-slate-900/40 p-2.5 rounded-lg border border-slate-850">
          <span className="font-bold text-indigo-400 uppercase tracking-wider block mb-1 text-[9px]">Reasoning & Telemetry Grounding</span>
          <p className="text-slate-300">{reasoning}</p>
        </div>

        <div className="bg-slate-900/40 p-2.5 rounded-lg border border-slate-850">
          <span className="font-bold text-indigo-400 uppercase tracking-wider block mb-1 text-[9px]">Recommended Operational Action</span>
          <p className="text-slate-300 font-medium">{action}</p>
        </div>

        <div className="bg-emerald-500/5 p-2.5 rounded-lg border border-emerald-500/10">
          <span className="font-bold text-emerald-400 uppercase tracking-wider block mb-1 text-[9px]">Expected Operational Impact</span>
          <p className="text-emerald-300 font-semibold">{impact}</p>
        </div>
      </div>
    </div>
  );
}
