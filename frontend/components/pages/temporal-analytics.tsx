"use client";

import { Clock, TrendingUp, CalendarDays, History, AlertCircle } from "lucide-react";
import { useIntelligenceStore } from "@/store/intelligenceStore";

export function TemporalAnalytics() {
    const { hasResults, invoiceId, results } = useIntelligenceStore();

    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center mb-4 shrink-0">
                <h1 className="text-2xl font-bold text-white tracking-wide">Temporal Network Analytics</h1>
                <div className="glass-panel border-slate-700/50 rounded-full px-4 py-2 flex items-center gap-2 shadow-inner bg-slate-900/40">
                    <CalendarDays size={16} className="text-indigo-400" />
                    <span className="text-[11px] uppercase tracking-widest font-bold text-slate-300">Trailing 90 Days</span>
                </div>
            </div>

            <div className="glass-panel rounded-2xl border-slate-700/50 p-8 min-h-[400px] flex flex-col shadow-glow-primary overflow-hidden relative group">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
                <div className="flex gap-8 border-b border-slate-700/50 pb-5 mb-5">
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-500 uppercase tracking-wider mb-1">Time-to-Default Avg</span>
                        <div className="flex items-center gap-2">
                            <Clock size={16} className="text-purple-400" />
                            <span className="text-white font-bold text-xl">{hasResults ? "3.2 Days" : "42 Days"}</span>
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-500 uppercase tracking-wider mb-1">Risk Propagation Velocity</span>
                        <div className="flex items-center gap-2">
                            <TrendingUp size={16} className="text-red-400" />
                            <span className="text-white font-bold text-xl">{hasResults ? "8.4 Nodes/Wk" : "2.4 Nodes/Wk"}</span>
                        </div>
                    </div>
                </div>

                <div className={`flex-1 flex items-center justify-center rounded-xl transition-all duration-300 ${hasResults ? "bg-transparent" : "border-2 border-dashed border-slate-700/50 bg-slate-900/20"}`}>
                    {hasResults ? (
                        <div className="w-full max-w-2xl mt-4 relative z-10 glass-panel p-6 rounded-2xl border-slate-700/30 bg-slate-900/40 shadow-inner">
                            <h3 className="text-slate-100 font-semibold tracking-wide mb-8 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-glow-success"></div>Filing Velocity: <span className="font-mono text-indigo-300">{invoiceId}</span></h3>
                            <div className="relative border-l-2 border-slate-700 ml-4 pl-8 flex flex-col gap-8">
                                <div className="relative group">
                                    <div className="absolute -left-[41px] bg-indigo-500 w-4 h-4 rounded-full border-4 border-slate-900 shadow-[0_0_10px_rgba(99,102,241,0.8)] group-hover:scale-125 transition-transform duration-300"></div>
                                    <span className="text-[10px] uppercase tracking-widest font-bold text-indigo-400 block mb-1">Day 1</span>
                                    <h4 className="text-white font-semibold tracking-wide drop-shadow-md">Invoice Generated</h4>
                                    <p className="text-slate-400 text-sm mt-1">Created via external ERP integration.</p>
                                </div>
                                <div className="relative group">
                                    <div className="absolute -left-[41px] bg-amber-500 w-4 h-4 rounded-full border-4 border-slate-900 shadow-[0_0_10px_rgba(245,158,11,0.8)] group-hover:scale-125 transition-transform duration-300"></div>
                                    <span className="text-[10px] uppercase tracking-widest font-bold text-amber-400 block mb-1">Day 2 (Accelerated)</span>
                                    <h4 className="text-white font-semibold tracking-wide drop-shadow-md">High-Velocity ITC Claim</h4>
                                    <p className="text-slate-400 text-sm mt-1">ITC claimed almost immediately after generation. Flagged as anomalous velocity.</p>
                                </div>
                                {results?.mismatches?.map((mismatch: any, idx: number) => (
                                    <div className="relative group" key={idx}>
                                        <div className="absolute -left-[41px] bg-rose-500 w-4 h-4 rounded-full border-4 border-slate-900 shadow-[0_0_10px_rgba(244,63,94,0.8)] animate-pulse group-hover:scale-125 transition-transform duration-300"></div>
                                        <span className="text-[10px] uppercase tracking-widest font-bold text-rose-400 block mb-1">Day {idx + 3}</span>
                                        <h4 className="text-white font-semibold tracking-wide drop-shadow-md">Downstream Anomaly</h4>
                                        <p className="text-slate-400 text-sm mt-1">{mismatch.root_cause || mismatch.issue}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center flex flex-col items-center">
                            <div className="p-5 bg-slate-800/40 rounded-full mb-6 border border-slate-700/50 shadow-glow-primary">
                                <History size={48} className="text-indigo-400/50" />
                            </div>
                            <h4 className="text-slate-300 font-bold text-xl mb-3 tracking-wide">TimeSeries Graph Pending</h4>
                            <p className="text-slate-500 text-sm mt-1 max-w-sm leading-relaxed">Requires historical batch ingestion via the System Dashboard upload zone.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
