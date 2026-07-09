/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { 
  Bot, 
  Send, 
  Sparkles, 
  Languages, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle,
  HelpCircle
} from "lucide-react";
import { CopilotMessage } from "../types";
import AIResponseCard from "./AIResponseCard";

interface OperationsCopilotProps {
  onSendMessage: (text: string) => Promise<string>;
}

const PRESET_PROMPTS = [
  {
    label: "Spanish Detour Translation",
    prompt: "Translate this Gate B detour emergency warning to Spanish: 'Attention fans: Gate B is highly congested. Please walk to Gate D West Entrance for a rapid exit.'",
    icon: Languages
  },
  {
    label: "Gate B Diagnostics",
    prompt: "Run safety diagnostics on Gate B current status and suggest crowd redirection steps.",
    icon: Sparkles
  },
  {
    label: "Green Action Plan",
    prompt: "Analyze our solar generation of 840 kW and sustainability records to draft a green stadium recommendation.",
    icon: ShieldCheck
  },
  {
    label: "Ramp 4B Detour Sign",
    prompt: "Generate an accessibility detour announcement for wheelchair users because Ramp 4B is blocked.",
    icon: AlertCircle
  }
];

export default function OperationsCopilot({ onSendMessage }: OperationsCopilotProps) {
  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: "initial-msg",
      role: "assistant",
      text: "Hello! I am your **FIFA 2026 Stadium Operations Copilot**, integrated directly into the Arena Control Center. Ask me to perform real-time incident analysis, multilingual translations, crowd safety routing, or transit optimizations.",
      timestamp: new Date().toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit" })
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof messagesEndRef.current?.scrollIntoView === "function") {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isGenerating]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || isGenerating) return;

    const userMsg: CopilotMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit" })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue("");
    setIsGenerating(true);

    try {
      const reply = await onSendMessage(textToSend);
      
      const assistantMsg: CopilotMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        text: reply,
        timestamp: new Date().toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit" })
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
      const errorMsg: CopilotMessage = {
        id: `assistant-err-${Date.now()}`,
        role: "assistant",
        text: "I experienced an issue generating a response. Please double-check your connection or retry.",
        timestamp: new Date().toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit" })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsGenerating(false);
    }
  };

  const parseMarkdownBold = (text: string) => {
    // Basic formatting helper for bold text (**bold** -> <strong>bold</strong>)
    // and paragraphs
    const parts = text.split(/\n/);
    return parts.map((part, index) => {
      let formatted = part;
      // Replace **bold** with strong elements
      const boldRegex = /\*\*(.*?)\*\*/g;
      const htmlString: React.ReactNode[] = [];
      let lastIndex = 0;
      let match;
      
      while ((match = boldRegex.exec(part)) !== null) {
        if (match.index > lastIndex) {
          htmlString.push(part.substring(lastIndex, match.index));
        }
        htmlString.push(<strong key={match.index} className="font-bold text-indigo-300">{match[1]}</strong>);
        lastIndex = boldRegex.lastIndex;
      }
      
      if (lastIndex < part.length) {
        htmlString.push(part.substring(lastIndex));
      }

      if (part.startsWith("- ")) {
        return (
          <li key={index} className="ml-4 list-disc text-xs text-slate-300 my-0.5">
            {htmlString.length > 0 ? htmlString : part.substring(2)}
          </li>
        );
      }

      return (
        <p key={index} className="text-xs text-slate-300 my-1 leading-relaxed">
          {htmlString.length > 0 ? htmlString : part}
        </p>
      );
    });
  };

  return (
    <div id="operations-copilot-container" className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 flex flex-col h-[520px]">
      <div className="flex items-center justify-between mb-4 border-b border-slate-800/80 pb-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-indigo-400">
            <Bot className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-1.5">
              Operations Copilot
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-1.5 py-0.5 rounded font-mono font-medium">GEMINI AI</span>
            </h2>
            <p className="text-xs text-slate-400">Decision support assistant & dispatch grounding</p>
          </div>
        </div>
      </div>

      {/* Message history panel */}
      <div id="copilot-message-log" className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1 min-h-0">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex gap-3 max-w-[85%] ${msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
          >
            <div className={`p-1.5 rounded-lg shrink-0 h-fit ${msg.role === "user" ? "bg-indigo-600/20 text-indigo-400" : "bg-slate-800 text-indigo-400"}`}>
              {msg.role === "user" ? <HelpCircle className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>
            <div className={`rounded-xl p-3.5 border text-xs ${msg.role === "user" ? "bg-indigo-950/40 border-indigo-800/50" : "bg-slate-950/40 border-slate-800"}`}>
              <div className="flex justify-between items-center mb-1 text-[10px] text-slate-500 font-mono">
                <span>{msg.role === "user" ? "System Operator" : "FIFA Copilot"}</span>
                <span>{msg.timestamp}</span>
              </div>
              <div className="space-y-1">
                {msg.role === "user" ? parseMarkdownBold(msg.text) : <AIResponseCard text={msg.text} />}
              </div>
            </div>
          </div>
        ))}
        {isGenerating && (
          <div className="flex gap-3 max-w-[85%] mr-auto items-center animate-pulse">
            <div className="p-1.5 rounded-lg bg-slate-800 text-indigo-400">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="rounded-xl p-3 border border-slate-800 bg-slate-950/40 text-xs text-slate-400 font-mono flex items-center gap-2">
              <span>Formulating recommendations...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Preset Prompts selection bar */}
      <div id="preset-prompts-bar" className="overflow-x-auto flex gap-2 pb-3 shrink-0 scrollbar-thin">
        {PRESET_PROMPTS.map((p, idx) => {
          const Icon = p.icon;
          return (
            <button
              key={idx}
              onClick={() => handleSend(p.prompt)}
              disabled={isGenerating}
              className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-300 bg-slate-950/30 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 px-3 py-2 rounded-lg shrink-0 transition-all"
            >
              <Icon className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span>{p.label}</span>
            </button>
          );
        })}
      </div>

      {/* Chat input block */}
      <div id="copilot-input-area" className="border-t border-slate-800/80 pt-3 shrink-0">
        <div className="relative">
          <input
            type="text"
            placeholder="Type a query for Gemini (e.g. 'Draft Gate B warning', 'List open incidents')..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend(inputValue)}
            disabled={isGenerating}
            aria-label="Operations copilot query input"
            className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded-xl pl-4 pr-12 py-3 text-xs text-white placeholder-slate-500 focus:outline-none transition-all"
          />
          <button
            onClick={() => handleSend(inputValue)}
            disabled={!inputValue.trim() || isGenerating}
            aria-label="Send query"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800/50 disabled:text-slate-600 text-white rounded-lg transition-all"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
