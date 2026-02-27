"use client";

import { Play, Settings2, BarChart3, RotateCcw, Sliders, Loader2 } from "lucide-react";
import { useIntelligenceStore } from "@/store/intelligenceStore";
import { useState } from "react";

export function PolicySimulation() {
    const { hasResults, results } = useIntelligenceStore();
    const [isRunning, setIsRunning] = useState(false);

    const handleRunSimulation = () => {
        setIsRunning(true);
        setTimeout(() => setIsRunning(false), 1500);
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center mb-4 shrink-0">
                <h1 className="text-2xl font-bold text-white tracking-wide">Policy Simulation Sandbox</h1>
                <div className="flex gap-4">
                    <button className="glass-panel p-2 rounded-lg text-slate-400 hover:text-white transition-all border-slate-700/50 shadow-sm hover:bg-slate-800/60" title="Reset Sandbox">
                        <RotateCcw size={18} />
                    </button>
                    <button
                        onClick={handleRunSimulation}
                        disabled={!hasResults || isRunning}
                        className={`px-5 py-2 rounded-lg text-sm transition-all duration-300 font-semibold tracking-wide flex items-center gap-2 text-white shadow-lg ${isRunning ? "bg-indigo-900/50 border border-indigo-500/30 cursor-not-allowed shadow-glow-primary animate-pulse" : "bg-indigo-600 hover:bg-indigo-500 hover:scale-105 hover:shadow-glow-primary border border-indigo-500/50"} ${(!hasResults && !isRunning) ? "opacity-30 cursor-not-allowed grayscale" : ""}`}
                    >
                        {isRunning ? <><Loader2 size={16} className="animate-spin text-indigo-300" /> Simulating...</> : <><Play size={16} /> Run Simulation</>}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-1 glass-panel rounded-2xl border-slate-700/50 p-6 flex flex-col gap-6 shadow-glow-primary group">
                    <div className="flex items-center gap-2 border-b border-slate-700/50 pb-4 text-slate-300">
                        <Settings2 size={18} className="text-indigo-400" /> <h3 className="font-semibold tracking-wide text-white">Parameters</h3>
                    </div>

                    <div className="flex flex-col gap-3">
                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">ITC Threshold Modifier</label>
                        <input type="range" className="w-full accent-indigo-500 cursor-pointer" min="0" max="100" defaultValue={hasResults ? "65" : "50"} />
                    </div>

                    <div className="flex flex-col gap-3 mt-1">
                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Circular Trading Depth Check</label>
                        <select className="bg-slate-900/60 border border-slate-700/50 text-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:border-indigo-400/50 focus:shadow-[0_0_10px_rgba(99,102,241,0.2)] transition-all cursor-pointer">
                            <option>Tier-3 Strict</option>
                            <option>Tier-5 Extended</option>
                            <option>Tier-Max Comprehensive</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-3 mt-3 bg-slate-900/40 p-3 rounded-lg border border-slate-800/50">
                        <input type="checkbox" id="retro" className="accent-indigo-500 w-4 h-4 cursor-pointer" defaultChecked={hasResults} />
                        <label htmlFor="retro" className="text-sm font-medium tracking-wide text-slate-300 cursor-pointer">Apply Retrospectively</label>
                    </div>

                    <div className="flex flex-col gap-3 mt-1">
                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Historical Lookback Window</label>
                        <div className="flex border border-slate-700/50 rounded-lg overflow-hidden mt-1 p-1 bg-slate-900/60 gap-1">
                            <button className="flex-1 bg-transparent hover:bg-slate-800/60 text-slate-400 hover:text-white rounded text-xs py-2 font-medium transition-all">3 Mo</button>
                            <button className="flex-1 bg-indigo-600 text-white rounded text-xs py-2 font-bold cursor-default shadow-sm border border-indigo-500/50">6 Mo</button>
                            <button className="flex-1 bg-transparent hover:bg-slate-800/60 text-slate-400 hover:text-white rounded text-xs py-2 font-medium transition-all">1 Yr</button>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-3 glass-panel rounded-2xl border-slate-700/50 flex flex-col shadow-glow-primary overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"></div>
                    <div className="bg-slate-900/60 backdrop-blur-md px-6 py-4 border-b border-slate-700/50 flex items-center gap-2 text-slate-300">
                        <BarChart3 size={20} className="text-indigo-400" /> <h3 className="font-semibold tracking-wide text-white">Projected Fiscal Impact</h3>
                    </div>
                    <div className={`flex-1 p-8 flex items-center justify-center flex-col min-h-[400px] transition-all duration-1000 ${isRunning ? "opacity-40 blur-sm scale-[0.98]" : "opacity-100 blur-0 scale-100"}`}>
                        {hasResults ? (
                            <div className="w-full grid grid-cols-2 gap-6">
                                <div className="glass-panel p-8 rounded-2xl border-rose-500/30 flex flex-col gap-2 bg-rose-950/10 shadow-glow-danger group hover:bg-rose-950/30 transition-colors">
                                    <span className="text-xs font-semibold uppercase tracking-wider text-rose-300/80">Blocked ITC Projected</span>
                                    <h4 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-rose-400 to-rose-600 mt-2 mb-1 drop-shadow-md">₹{(results?.total_exposure || 1420000).toLocaleString()}</h4>
                                    <span className="text-sm font-medium text-slate-400 mt-3 block border-t border-slate-700/50 pt-3">Based on proposed Tier-5 depth scan</span>
                                </div>
                                <div className="glass-panel p-8 rounded-2xl border-emerald-500/30 flex flex-col gap-2 bg-emerald-950/10 shadow-glow-success group hover:bg-emerald-950/30 transition-colors">
                                    <span className="text-xs font-semibold uppercase tracking-wider text-emerald-300/80">False Positive Reduction</span>
                                    <h4 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-emerald-400 to-emerald-600 mt-2 mb-1 drop-shadow-md">12.4%</h4>
                                    <span className="text-sm font-medium text-slate-400 mt-3 block border-t border-slate-700/50 pt-3">Efficiency gain vs current policy ruleset</span>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center flex flex-col items-center">
                                <div className="p-5 bg-slate-800/40 rounded-full mb-6 border border-slate-700/50 shadow-glow-primary">
                                    <Sliders size={48} className="text-indigo-400/50" />
                                </div>
                                <h4 className="text-slate-300 font-bold text-xl mb-3 tracking-wide">Results Pending</h4>
                                <p className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed">Upload an invoice or start a bulk network execute to see simulated sandbox impacts.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
