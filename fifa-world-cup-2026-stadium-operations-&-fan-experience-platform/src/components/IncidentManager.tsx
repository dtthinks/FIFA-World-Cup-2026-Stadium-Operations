/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  ShieldAlert, 
  Plus, 
  Send, 
  CheckCircle2, 
  Users, 
  AlertOctagon, 
  MapPin, 
  Clock 
} from "lucide-react";
import { Incident, IncidentPriority, IncidentStatus } from "../types";

interface IncidentManagerProps {
  incidents: Incident[];
  onDispatchVolunteers: (incidentId: string, count: number) => void;
  onResolveIncident: (incidentId: string) => void;
  onCreateIncident: (incident: {
    title: string;
    category: "CROWD" | "MEDICAL" | "FACILITY" | "SECURITY" | "TECH";
    location: string;
    priority: IncidentPriority;
    description: string;
  }) => void;
}

export default function IncidentManager({ 
  incidents, 
  onDispatchVolunteers, 
  onResolveIncident,
  onCreateIncident
}: IncidentManagerProps) {
  const [showLogForm, setShowLogForm] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState<"CROWD" | "MEDICAL" | "FACILITY" | "SECURITY" | "TECH">("CROWD");
  const [formLocation, setFormLocation] = useState("");
  const [formPriority, setFormPriority] = useState<IncidentPriority>(IncidentPriority.MEDIUM);
  const [formDescription, setFormDescription] = useState("");

  const [dispatchCounts, setDispatchCounts] = useState<Record<string, number>>({});

  const activeIncidents = incidents.filter(i => i.status !== "RESOLVED");
  const resolvedIncidents = incidents.filter(i => i.status === "RESOLVED");

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formLocation.trim()) return;

    onCreateIncident({
      title: formTitle,
      category: formCategory,
      location: formLocation,
      priority: formPriority,
      description: formDescription
    });

    // Reset Form
    setFormTitle("");
    setFormLocation("");
    setFormDescription("");
    setFormPriority(IncidentPriority.MEDIUM);
    setFormCategory("CROWD");
    setShowLogForm(false);
  };

  const handleDispatchClick = (id: string) => {
    const count = dispatchCounts[id] || 3;
    onDispatchVolunteers(id, count);
  };

  const getPriorityBadge = (priority: IncidentPriority) => {
    switch (priority) {
      case IncidentPriority.HIGH:
        return "bg-red-500/10 text-red-400 border-red-500/20";
      case IncidentPriority.MEDIUM:
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case IncidentPriority.LOW:
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    }
  };

  const getCategoryBadgeColor = (cat: string) => {
    switch (cat) {
      case "MEDICAL": return "text-emerald-400 bg-emerald-500/5 border-emerald-500/15";
      case "SECURITY": return "text-red-400 bg-red-500/5 border-red-500/15";
      case "CROWD": return "text-indigo-400 bg-indigo-500/5 border-indigo-500/15";
      case "FACILITY": return "text-yellow-400 bg-yellow-500/5 border-yellow-500/15";
      default: return "text-slate-400 bg-slate-500/5 border-slate-500/15";
    }
  };

  return (
    <div id="incident-manager-container" className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 border-b border-slate-800/80 pb-3">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-400" />
            Incident Intelligence & Dispatch
          </h2>
          <p className="text-xs text-slate-400">Emergency alert monitoring & volunteer mobilization</p>
        </div>
        <button
          onClick={() => setShowLogForm(!showLogForm)}
          className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all font-semibold"
        >
          {showLogForm ? "Cancel" : <><Plus className="w-4 h-4" /> Log New Alert</>}
        </button>
      </div>

      {showLogForm ? (
        <form onSubmit={handleCreateSubmit} id="create-incident-form" className="space-y-4 bg-slate-950/40 border border-slate-800 p-4 rounded-xl">
          <h3 className="text-sm font-semibold text-white">Log Emergency / Operational Alert</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="formTitle" className="block text-xs text-slate-400 mb-1">Alert Title</label>
              <input
                id="formTitle"
                type="text"
                required
                placeholder="e.g. Broken Barrier, Water Leakage"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="formLocation" className="block text-xs text-slate-400 mb-1">Specific Location</label>
              <input
                id="formLocation"
                type="text"
                required
                placeholder="e.g. Gate B ticketing queue"
                value={formLocation}
                onChange={(e) => setFormLocation(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="formCategory" className="block text-xs text-slate-400 mb-1">Category</label>
              <select
                id="formCategory"
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
              >
                <option value="CROWD">Crowd Dynamics</option>
                <option value="MEDICAL">Medical Emergency</option>
                <option value="FACILITY">Facility Maintenance</option>
                <option value="SECURITY">Venue Security</option>
                <option value="TECH">Technology Infrastructure</option>
              </select>
            </div>
            <div>
              <label htmlFor="formPriority" className="block text-xs text-slate-400 mb-1">Priority Level</label>
              <select
                id="formPriority"
                value={formPriority}
                onChange={(e) => setFormPriority(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
              >
                <option value={IncidentPriority.LOW}>Low</option>
                <option value={IncidentPriority.MEDIUM}>Medium</option>
                <option value={IncidentPriority.HIGH}>High</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="formDescription" className="block text-xs text-slate-400 mb-1">Operational Details</label>
            <textarea
              id="formDescription"
              placeholder="Provide a brief description of the incident for responding crews..."
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              rows={2}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-2 rounded-lg transition-all"
          >
            Submit Incident Report
          </button>
        </form>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-3 max-h-[360px] pr-1" id="incident-items-list">
          {activeIncidents.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center p-8 border border-dashed border-slate-800 rounded-xl h-full min-h-[140px]">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-2" />
              <p className="text-sm font-semibold text-slate-300">All Systems Nominal</p>
              <p className="text-xs text-slate-500 mt-1">No outstanding emergency incidents on active log files.</p>
            </div>
          ) : (
            activeIncidents.map((inc) => (
              <div 
                key={inc.id} 
                className={`border rounded-xl p-3.5 bg-slate-950/30 transition-all ${inc.priority === IncidentPriority.HIGH ? "border-red-500/15 hover:border-red-500/25 shadow-lg shadow-red-950/5" : "border-slate-800 hover:border-slate-700"}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${getPriorityBadge(inc.priority)}`}>
                      {inc.priority}
                    </span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${getCategoryBadgeColor(inc.category)}`}>
                      {inc.category}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {inc.timestamp}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-white mt-2 flex items-center gap-1.5">
                  <AlertOctagon className="w-4 h-4 text-red-400 shrink-0" />
                  {inc.title}
                </h4>
                
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{inc.description}</p>
                
                <div className="flex items-center gap-1 mt-2 text-xs font-semibold text-slate-300 bg-slate-900/30 w-fit px-2 py-1 rounded border border-slate-850">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {inc.location}
                </div>

                <div className="border-t border-slate-800/80 mt-3 pt-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-indigo-400" />
                      Crews: <strong className="text-slate-200 font-mono">{inc.volunteersDispatched}</strong>
                    </span>
                    {inc.status === IncidentStatus.ACTIVE && (
                      <div className="flex items-center gap-1">
                        <select
                          value={dispatchCounts[inc.id] || 3}
                          onChange={(e) => setDispatchCounts({ ...dispatchCounts, [inc.id]: Number(e.target.value) })}
                          className="bg-slate-900 border border-slate-800 text-[11px] rounded px-1.5 py-0.5 text-slate-300 outline-none"
                        >
                          <option value="1">1 Vol</option>
                          <option value="2">2 Vols</option>
                          <option value="3">3 Vols</option>
                          <option value="5">5 Vols</option>
                        </select>
                        <button
                          onClick={() => handleDispatchClick(inc.id)}
                          className="bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold px-2 py-0.5 rounded transition-all"
                        >
                          Dispatch
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {inc.status === IncidentStatus.DISPATCHED && (
                      <button
                        onClick={() => onDispatchVolunteers(inc.id, 2)}
                        className="text-xs border border-indigo-500/30 hover:bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-lg transition-all"
                      >
                        +2 Support
                      </button>
                    )}
                    <button
                      onClick={() => onResolveIncident(inc.id)}
                      className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-3 py-1 rounded-lg flex items-center gap-1 transition-all"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Resolve Alert
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}

          {/* Collapsible history of resolved items */}
          {resolvedIncidents.length > 0 && (
            <div className="mt-4 pt-3 border-t border-slate-800/40">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block mb-2">Resolved Logs ({resolvedIncidents.length})</span>
              <div className="space-y-1.5 opacity-60">
                {resolvedIncidents.slice(0, 3).map(inc => (
                  <div key={inc.id} className="flex justify-between items-center text-xs text-slate-400 bg-slate-950/20 border border-slate-850 p-2 rounded-lg">
                    <span className="line-through truncate max-w-[200px]">{inc.title}</span>
                    <span className="text-emerald-500 text-[10px] font-mono">RESOLVED</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
