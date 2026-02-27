"use client";

import { Network, Search, Filter, Layers, AlertCircle, ShieldAlert, ZoomIn, ZoomOut, Maximize } from "lucide-react";
import { useIntelligenceStore } from "@/store/intelligenceStore";
import { useState } from "react";

export function GraphExplorer() {
    const { hasResults, invoiceId, results } = useIntelligenceStore();
    const [runningLayout, setRunningLayout] = useState(false);

    const handleRunLayout = () => {
        setRunningLayout(true);
        setTimeout(() => setRunningLayout(false), 1200);
    };

    return (
        <div className="flex flex-col gap-6 h-full min-h-[calc(100vh-6rem)]">
            <div className="flex justify-between items-center mb-4 shrink-0">
                <h1 className="text-2xl font-bold text-white tracking-wide">Network Graph Explorer</h1>
                <div className="flex items-center gap-4">
                    <button className="glass-panel hover:bg-slate-800/60 hover:text-white text-slate-300 px-4 py-2 rounded-lg transition-all border-slate-700/50 flex items-center gap-2 text-sm shadow-sm group">
                        <Filter size={16} className="text-indigo-400 group-hover:text-indigo-300" /> Filter Nodes
                    </button>
                    <button
                        onClick={handleRunLayout}
                        disabled={!hasResults || runningLayout}
                        className={`px-5 py-2 rounded-lg transition-all duration-300 text-sm font-semibold tracking-wide text-white shadow-lg ${runningLayout ? "bg-purple-900/50 border border-purple-500/30 cursor-not-allowed shadow-glow-primary animate-pulse" : "bg-purple-600 hover:bg-purple-500 hover:shadow-glow-primary hover:scale-105 border border-purple-500/50"} ${(!hasResults && !runningLayout) ? "opacity-30 cursor-not-allowed grayscale" : ""}`}
                    >
                        {runningLayout ? "Synthesizing Layout..." : "Run Layout"}
                    </button>
                </div>
            </div>

            <div className="glass-panel rounded-2xl border-slate-700/50 flex flex-col items-center justify-center min-h-[500px] mt-2 relative p-6 flex-1 overflow-hidden shadow-glow-primary group">
                {/* Subtle Grid Background Pattern */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

                {hasResults ? (
                    <div className="w-full h-full flex flex-col justify-center items-center gap-8 relative z-10">
                        {/* Fake SVG Graph implementation to show network */}
                        <div className={`relative w-[600px] h-[450px] transition-all duration-1000 ${runningLayout ? "scale-90 opacity-40 blur-sm" : "scale-100 opacity-100 blur-0"}`}>
                            {/* Dynamically draw lines from origin to mismatch entities */}
                            <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }}>
                                {results?.mismatches?.map((mismatch: any, idx: number) => {
                                    const yEnd = 80;
                                    const xEnd = 20 + (idx * 30);
                                    return (
                                        <line
                                            key={`line-${idx}`}
                                            x1="50%" y1="20%"
                                            x2={`${xEnd}%`} y2={`${yEnd}%`}
                                            stroke="rgba(244, 63, 94, 0.4)" strokeWidth="2" strokeDasharray="6 4"
                                            className="animate-pulse-slow"
                                        />
                                    );
                                })}
                            </svg>

                            {/* Origin Node (The Uploaded Invoice) */}
                            <div className="absolute top-[20%] left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900/80 backdrop-blur-md border-2 border-emerald-500/80 rounded-xl p-4 z-10 text-center shadow-glow-success hover:scale-110 transition-transform cursor-pointer">
                                <div className="absolute -inset-2 bg-emerald-500/20 blur-xl rounded-full z-0 pointer-events-none"></div>
                                <ShieldAlert size={24} className="text-emerald-400 mx-auto mb-2 relative z-10" />
                                <span className="text-white text-xs font-bold block tracking-wider relative z-10">{invoiceId}</span>
                                <span className="text-emerald-400/80 text-[10px] uppercase tracking-widest block mt-1 relative z-10">Origin Node</span>
                            </div>

                            {/* Map through the actual anomalies detected by the backend */}
                            {results?.mismatches?.map((mismatch: any, idx: number) => {
                                const yPos = 80;
                                const xPos = 20 + (idx * 30);
                                return (
                                    <div
                                        key={`node-${idx}`}
                                        className="absolute bg-slate-900/80 backdrop-blur-md border-2 border-rose-500/80 rounded-xl p-4 z-10 text-center w-40 shadow-glow-danger hover:scale-110 transition-transform cursor-pointer"
                                        style={{ top: `${yPos}%`, left: `${xPos}%`, transform: 'translate(-50%, -50%)' }}
                                    >
                                        <div className="absolute -inset-2 bg-rose-500/20 blur-xl rounded-full z-0 pointer-events-none animate-pulse"></div>
                                        <AlertCircle size={24} className="text-rose-400 mx-auto mb-2 relative z-10" />
                                        <h4 className="text-white font-semibold text-sm tracking-wide relative z-10">Anomaly Flag</h4>
                                        <p className="text-slate-400 text-xs mt-1 relative z-10 font-medium">{mismatch.root_cause || mismatch.issue}</p>
                                        <span className="text-rose-300 text-[10px] block truncate mt-2 bg-rose-950/50 px-2 py-0.5 rounded uppercase tracking-wider font-bold relative z-10 border border-rose-500/20">
                                            {mismatch.supporting_evidence?.gstr2b_value ? `Ref: ${mismatch.supporting_evidence.gstr2b_value}` : "Missing Target"}
                                        </span>
                                    </div>
                                )
                            })}
                        </div>
                        <div className="flex flex-col text-center max-w-lg mt-4 z-20 glass-panel p-5 rounded-2xl border-rose-500/30 shadow-glow-danger bg-rose-950/20 backdrop-blur-xl">
                            <span className="text-rose-400 font-bold tracking-wide uppercase text-sm mb-2 flex items-center justify-center gap-2"><Network size={16} /> Extracted Sub-Graph</span>
                            <span className="text-slate-300 text-sm leading-relaxed mb-3">{results?.explanation || "The downstream nodes associated with this supply chain graph show significant variance from declared values."}</span>
                            <span className="text-white font-mono bg-rose-900/40 px-3 py-1.5 rounded-lg border border-rose-500/40 shadow-sm inline-block self-center tracking-wider text-xs">PATH SUMMARY: {results?.mismatches?.length || 0} CRITICAL EDGES</span>
                        </div>
                    </div>
                ) : (
                    <div className="text-center relative z-10 flex flex-col items-center">
                        <div className="p-5 bg-slate-800/40 rounded-full mb-6 border border-slate-700/50 shadow-glow-primary">
                            <Network size={48} className="text-indigo-400/50" />
                        </div>
                        <h4 className="text-slate-300 font-bold text-xl mb-3 tracking-wide">Graph Canvas Empty</h4>
                        <p className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed">Upload an invoice dataset on the System Dashboard, or provision an entity target to synthesize the multi-hop supply chain network.</p>
                    </div>
                )}

                <div className="absolute bottom-6 right-6 glass-panel rounded-xl overflow-hidden flex shadow-glow-primary border-slate-700/50 z-20">
                    <button className="p-3 hover:bg-slate-800/60 text-slate-400 hover:text-indigo-400 transition-colors border-r border-slate-700/50" title="Zoom In">
                        <ZoomIn size={20} />
                    </button>
                    <button className="p-3 hover:bg-slate-800/60 text-slate-400 hover:text-indigo-400 transition-colors border-r border-slate-700/50" title="Zoom Out">
                        <ZoomOut size={20} />
                    </button>
                    <button className="p-3 hover:bg-slate-800/60 text-slate-400 hover:text-indigo-400 transition-colors" title="Fit to Screen">
                        <Maximize size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
}
