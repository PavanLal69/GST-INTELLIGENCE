"use client";

import { ScanEye, Fingerprint, PieChart, AlertTriangle, Building2, MapPin, Calendar, FileCheck, ShieldCheck } from "lucide-react";
import { useIntelligenceStore } from "@/store/intelligenceStore";

export function VendorIntelligence() {
    const { hasResults, results, invoiceId } = useIntelligenceStore();

    // Default or dynamically extracted mock vendor details based on invoice ID
    const entityName = hasResults ? (invoiceId?.includes("AX") ? "Apex Supply Chain Ltd." : "Bridgestone Logistics") : "--";
    const jurisdiction = hasResults ? "Maharashtra Central" : "--";
    const regDate = hasResults ? "12 Aug 2017" : "--";
    const riskScore = hasResults ? results?.overall_risk || "35" : "--";
    const riskColor = hasResults ? (parseInt(riskScore) > 70 ? "text-green-400" : "text-red-400") : "text-gray-600";
    const status = hasResults ? (parseInt(riskScore) > 70 ? "Compliant" : "High Risk Watchlist") : "--";

    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center mb-4 shrink-0">
                <h1 className="text-2xl font-bold text-white tracking-wide">Vendor Intelligence Profile</h1>
                <div className="relative w-80">
                    <input
                        type="text"
                        placeholder="Search another GSTIN..."
                        className="w-full glass-panel bg-slate-900/60 border border-slate-700/50 text-sm text-white rounded-full pl-11 pr-5 py-2.5 focus:outline-none focus:border-indigo-500 focus:shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-all shadow-inner placeholder:text-slate-500"
                        defaultValue={hasResults ? "27AADCB2230M1Z2" : ""}
                    />
                    <ScanEye size={18} className="absolute left-4 top-[11px] text-indigo-400/70" />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-1 flex flex-col gap-6">
                    <div className="glass-panel rounded-2xl border-slate-700/50 p-6 shadow-glow-primary group">
                        <div className="flex items-center gap-3 mb-5 border-b border-slate-700/50 pb-4">
                            <Fingerprint size={20} className="text-indigo-400 group-hover:scale-110 transition-transform" />
                            <h3 className="font-semibold text-white tracking-wide">Identity Matcher</h3>
                        </div>
                        <div className="flex flex-col gap-4">
                            <div className="flex justify-between border-b border-slate-800/50 pb-3 hover:bg-slate-800/20 px-2 -mx-2 rounded transition-colors">
                                <span className="text-xs uppercase tracking-wider font-semibold text-slate-500 flex items-center gap-1.5"><Building2 size={14} className="text-slate-400" /> Corporate</span>
                                <span className="text-sm text-slate-200 font-medium">{entityName}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-800/50 pb-3 hover:bg-slate-800/20 px-2 -mx-2 rounded transition-colors">
                                <span className="text-xs uppercase tracking-wider font-semibold text-slate-500 flex items-center gap-1.5"><MapPin size={14} className="text-slate-400" /> Region</span>
                                <span className="text-sm text-slate-300">{jurisdiction}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-800/50 pb-3 hover:bg-slate-800/20 px-2 -mx-2 rounded transition-colors">
                                <span className="text-xs uppercase tracking-wider font-semibold text-slate-500 flex items-center gap-1.5"><Calendar size={14} className="text-slate-400" /> Registered</span>
                                <span className="text-sm text-slate-300">{regDate}</span>
                            </div>
                            <div className="flex justify-between hover:bg-slate-800/20 px-2 -mx-2 rounded py-1 transition-colors">
                                <span className="text-xs uppercase tracking-wider font-semibold text-slate-500 flex items-center gap-1.5"><FileCheck size={14} className="text-slate-400" /> Filer Level</span>
                                <span className="text-sm text-slate-300">Regular</span>
                            </div>
                        </div>
                    </div>

                    <div className="glass-panel rounded-2xl border-slate-700/50 p-6 shadow-glow-primary group">
                        <div className="flex items-center gap-3 mb-5 border-b border-slate-700/50 pb-4">
                            <PieChart size={20} className="text-purple-400 group-hover:scale-110 transition-transform" />
                            <h3 className="font-semibold text-white tracking-wide">Aggregated Risk</h3>
                        </div>
                        <div className="text-center py-6 relative">
                            {hasResults && parseInt(riskScore) <= 70 && <div className="absolute inset-0 bg-rose-500/10 blur-xl rounded-full animate-pulse-slow"></div>}
                            <span className={`text-6xl font-black drop-shadow-md relative z-10 ${hasResults ? (parseInt(riskScore) > 70 ? "text-emerald-400" : "text-rose-400") : "text-slate-600"}`}>{riskScore}</span>
                            <p className="text-xs uppercase tracking-widest text-slate-400 mt-4 font-bold relative z-10">{status}</p>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-3 glass-panel rounded-2xl border-slate-700/50 flex items-center justify-center p-8 min-h-[400px] shadow-glow-primary relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
                    {hasResults ? (
                        <div className="w-full h-full flex flex-col relative z-10">
                            <div className="border-b border-slate-700/50 pb-5 mb-6 flex items-center gap-3">
                                <div className="p-2 bg-slate-800/50 rounded-lg group-hover:scale-110 transition-transform"><ShieldCheck size={24} className="text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" /></div>
                                <h3 className="text-xl font-bold text-white tracking-wide">Intelligence File: <span className="font-mono text-cyan-300">{invoiceId}</span></h3>
                            </div>
                            <div className="glass-panel bg-slate-900/40 rounded-xl p-6 border border-slate-700/30 text-slate-300 text-sm leading-relaxed whitespace-pre-wrap shadow-inner overflow-y-auto">
                                <div className="flex items-center gap-2 mb-3 text-cyan-400 text-xs font-bold uppercase tracking-widest"><AlertTriangle size={14} /> Executive Summary</div>
                                {results?.explanation || "No deep intelligence report generated for this entity."}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center flex flex-col items-center relative z-10">
                            <div className="p-5 bg-slate-800/40 rounded-full mb-6 border border-slate-700/50 shadow-glow-primary">
                                <AlertTriangle size={48} className="text-amber-400/50" />
                            </div>
                            <h4 className="text-slate-300 font-bold text-xl mb-3 tracking-wide">No Entity Provisioned</h4>
                            <p className="text-slate-400 text-sm mt-1 max-w-sm leading-relaxed">Upload an invoice in the System Dashboard to automatically synthesize the historical intelligence summary for its vendor.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
