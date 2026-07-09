/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Languages, Copy, Check, Sparkles, Volume2 } from "lucide-react";

interface MultilingualHelperProps {
  onTranslate: (text: string, language: string) => Promise<string>;
}

const LANGUAGES = [
  { code: "es", name: "Spanish / Español", flag: "🇪🇸" },
  { code: "fr", name: "French / Français", flag: "🇫🇷" },
  { code: "de", name: "German / Deutsch", flag: "🇩🇪" },
  { code: "pt", name: "Portuguese / Português", flag: "🇵🇹" },
  { code: "ar", name: "Arabic / العربية", flag: "🇸🇦" }
];

export default function MultilingualHelper({ onTranslate }: MultilingualHelperProps) {
  const [inputText, setInputText] = useState(
    "Spectator announcement: Gate B is currently experiencing heavy congestion. Please follow volunteer instructions and detour to Gate D. Thank you for your cooperation."
  );
  const [selectedLang, setSelectedLang] = useState("es");
  const [translation, setTranslation] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleTranslate = async () => {
    if (!inputText.trim() || isTranslating) return;
    setIsTranslating(true);
    setCopied(false);

    try {
      const prompt = `Translate the following FIFA 2026 stadium announcement strictly into ${LANGUAGES.find(l => l.code === selectedLang)?.name || "Spanish"}. Only output the translated text, do not add any introduction or explanations:\n\n"${inputText}"`;
      const result = await onTranslate(prompt, selectedLang);
      
      // Strip outer quotes if returned
      const cleanResult = result.replace(/^["']|["']$/g, "").trim();
      setTranslation(cleanResult);
    } catch (err) {
      console.error(err);
      setTranslation("An error occurred during translation. Please try again.");
    } finally {
      setIsTranslating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(translation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="multilingual-helper" className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-4 border-b border-slate-800/80 pb-3">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Languages className="w-5 h-5 text-indigo-400" />
              Multilingual Broadcast Assistant
            </h2>
            <p className="text-xs text-slate-400">Instant stadium dynamic translation for global fans</p>
          </div>
          <button
            onClick={handleTranslate}
            disabled={isTranslating}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-bold transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {isTranslating ? "Translating..." : "Translate"}
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="inputText" className="block text-[10px] text-slate-500 uppercase tracking-wider mb-1">Source Announcement (English)</label>
            <textarea
              id="inputText"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              rows={3}
              placeholder="Type an announcement to broadcast..."
              className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 leading-relaxed"
            />
          </div>

          <div>
            <span className="block text-[10px] text-slate-500 uppercase tracking-wider mb-2">Target Language</span>
            <div className="flex flex-wrap gap-2" id="target-lang-buttons">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setSelectedLang(lang.code)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${selectedLang === lang.code ? "bg-indigo-600/20 text-indigo-300 border-indigo-500" : "bg-slate-950/30 border-slate-850 text-slate-400 hover:text-slate-300 hover:border-slate-800"}`}
                >
                  <span>{lang.flag}</span>
                  <span>{lang.name.split(" / ")[0]}</span>
                </button>
              ))}
            </div>
          </div>

          {translation && (
            <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-3 relative" id="translation-result">
              <span className="text-[9px] font-mono text-indigo-400 uppercase tracking-wider block mb-1">Live Broadcast Translation</span>
              <p className="text-xs text-slate-200 font-medium italic leading-relaxed pr-8">{translation}</p>
              
              <button
                onClick={handleCopy}
                className="absolute right-3 top-3 p-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition-all"
                title="Copy Translation"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 border-t border-slate-800/60 pt-3 flex items-center justify-between text-[11px] text-slate-500 bg-indigo-500/5 px-3 py-2 rounded-lg border border-indigo-500/10">
        <span className="flex items-center gap-1.5"><Volume2 className="w-4 h-4 text-indigo-400 shrink-0" /> Dynamic Broadcast ready:</span>
        <strong className="text-indigo-400">PA System & Digital Signage Pushable</strong>
      </div>
    </div>
  );
}
