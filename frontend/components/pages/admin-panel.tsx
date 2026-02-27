"use client";

import { Activity, ShieldAlert, Network, CheckCircle2, UploadCloud, Loader2 } from "lucide-react";
import { useState, useRef } from "react";
import axios from "axios";
import { useIntelligenceStore } from "@/store/intelligenceStore";

export function AdminPanel() {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { setAnalyzing, setResults, isAnalyzing, hasResults, invoiceId } = useIntelligenceStore();
    const [localError, setLocalError] = useState("");

    const handleExport = () => {
        const csvContent = [
            "Invoice ID,Timestamp,Risk Score,Status",
            "INV-BD-1,2 mins ago,35/100,Flagged",
            "INV-AX-9,12 mins ago,96/100,Cleared"
        ].join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "audit_logs_export.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const processUpload = async (file: File) => {
        setLocalError("");

        // Remove extension from filename to use as the ID
        const id = file.name.replace(/\.[^/.]+$/, "");
        setAnalyzing(true);

        try {
            const res = await axios.post("http://127.0.0.1:8000/analyze-invoice", {
                invoice_id: id,
                period: "2024-09"
            });
            setResults(id, res.data);
        } catch (error) {
            console.error("Analysis failed", error);
            setLocalError("Engine offline. Make sure the backend cluster is running.");
            setAnalyzing(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) processUpload(e.dataTransfer.files[0]);
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-white">System Dashboard</h1>
                <button
                    onClick={handleExport}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm transition-colors cursor-pointer"
                >
                    Export Audit Logs
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="glass-panel p-5 rounded-2xl border-slate-700/50 flex flex-col gap-3 group hover:bg-slate-800/40 transition-all duration-300 shadow-glow-primary">
                    <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-sm font-medium tracking-wide">Invoices Processed</span>
                        <div className="p-2 bg-indigo-900/40 rounded-lg group-hover:scale-110 transition-transform"><Activity size={18} className="text-indigo-400" /></div>
                    </div>
                    <span className="text-3xl font-bold text-white tracking-tight drop-shadow-md">1,204</span>
                </div>

                <div className="glass-panel p-5 rounded-2xl border-slate-700/50 flex flex-col gap-3 group hover:bg-rose-900/10 transition-all duration-300 shadow-glow-danger hover:border-rose-500/30">
                    <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-sm font-medium tracking-wide">Critical Anomalies</span>
                        <div className="p-2 bg-rose-900/40 rounded-lg group-hover:scale-110 transition-transform"><ShieldAlert size={18} className="text-rose-400" /></div>
                    </div>
                    <span className="text-3xl font-bold text-rose-400 tracking-tight drop-shadow-[0_0_10px_rgba(225,29,72,0.6)]">42</span>
                </div>

                <div className="glass-panel p-5 rounded-2xl border-slate-700/50 flex flex-col gap-3 group hover:bg-purple-900/10 transition-all duration-300 shadow-lg hover:border-purple-500/30 hover:shadow-[0_0_20px_rgba(168,85,247,0.15)]">
                    <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-sm font-medium tracking-wide">Nodes Mapped</span>
                        <div className="p-2 bg-purple-900/40 rounded-lg group-hover:scale-110 transition-transform"><Network size={18} className="text-purple-400" /></div>
                    </div>
                    <span className="text-3xl font-bold text-white tracking-tight drop-shadow-md">4,890</span>
                </div>

                <div
                    className={`glass-panel rounded-2xl border-2 border-dashed ${isDragging ? "border-indigo-400 bg-indigo-900/20 shadow-[0_0_30px_rgba(99,102,241,0.2)] animate-pulse-slow" : "border-slate-600/50 hover:border-indigo-500/50 hover:bg-slate-800/40"} p-5 flex flex-col justify-center items-center gap-2 cursor-pointer transition-all duration-300 relative overflow-hidden group min-h-[140px]`}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: "none" }}
                        accept=".pdf,.json,.csv,.xml"
                        onChange={(e) => {
                            if (e.target.files?.[0]) processUpload(e.target.files[0]);
                            if (fileInputRef.current) fileInputRef.current.value = "";
                        }}
                    />

                    {isAnalyzing ? (
                        <div className="flex flex-col items-center animate-in fade-in duration-300">
                            <div className="relative mb-2">
                                <div className="absolute inset-0 bg-indigo-500 blur-md opacity-40 rounded-full animate-pulse"></div>
                                <Loader2 size={28} className="text-indigo-400 animate-spin relative z-10" />
                            </div>
                            <span className="text-sm font-semibold text-indigo-300 tracking-wide">Graph Synthesis...</span>
                        </div>
                    ) : hasResults ? (
                        <div className="flex flex-col items-center animate-in zoom-in duration-300">
                            <div className="relative mb-2">
                                <div className="absolute inset-0 bg-emerald-500 blur-md opacity-40 rounded-full animate-pulse"></div>
                                <CheckCircle2 size={28} className="text-emerald-400 relative z-10" />
                            </div>
                            <span className="text-sm font-semibold text-emerald-400 tracking-wide drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]">Data Ingested</span>
                            <span className="text-[11px] text-slate-400 font-mono mt-1 px-2 py-0.5 bg-slate-900/50 rounded-full border border-slate-700/50">{invoiceId}</span>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center group-hover:-translate-y-1 transition-transform duration-300">
                            <div className="p-3 bg-slate-800/50 rounded-full mb-2 group-hover:bg-indigo-900/30 transition-colors group-hover:shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                                <UploadCloud size={28} className="text-slate-400 group-hover:text-indigo-400 transition-colors" />
                            </div>
                            <span className="text-sm font-semibold text-slate-300 group-hover:text-white transition-colors tracking-wide">Drop Invoice Matrix</span>
                            <span className="text-[11px] text-slate-500 mt-1 uppercase tracking-widest font-medium">Auto-Pipeline Engine</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="glass-panel rounded-2xl border-slate-700/50 overflow-hidden mt-6 shadow-glow-primary">
                <div className="bg-slate-900/60 backdrop-blur-md px-6 py-4 border-b border-slate-700/50 flex justify-between items-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"></div>
                    <h3 className="font-semibold text-white tracking-wide">Recent Pipeline Execution Logs</h3>
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                </div>
                <div className="p-0">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-900/30 text-slate-400 text-[11px] uppercase tracking-widest border-b border-slate-700/50">
                                <th className="py-4 px-6 font-semibold">Entity Graph ID</th>
                                <th className="py-4 px-6 font-semibold">Execution Timestamp</th>
                                <th className="py-4 px-6 font-semibold">Calculated Risk</th>
                                <th className="py-4 px-6 font-semibold text-right">Engine Verdict</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            <tr className="border-b border-slate-800/50 hover:bg-slate-800/40 transition-colors group">
                                <td className="py-4 px-6 text-white font-mono text-xs tracking-wider group-hover:text-indigo-300 transition-colors">INV-BD-1</td>
                                <td className="py-4 px-6 text-slate-400 text-xs">2 mins ago</td>
                                <td className="py-4 px-6">
                                    <div className="flex items-center gap-2">
                                        <div className="w-16 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                            <div className="bg-rose-500 h-full w-[35%] shadow-[0_0_5px_rgba(225,29,72,0.8)]"></div>
                                        </div>
                                        <span className="text-rose-400 font-bold text-xs tracking-wider">35/100</span>
                                    </div>
                                </td>
                                <td className="py-4 px-6 text-right">
                                    <span className="bg-rose-900/20 text-rose-400 px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold border border-rose-500/30 inline-flex items-center gap-1.5 shadow-glow-danger">
                                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></div> Flagged
                                    </span>
                                </td>
                            </tr>
                            <tr className="hover:bg-slate-800/40 transition-colors group">
                                <td className="py-4 px-6 text-white font-mono text-xs tracking-wider group-hover:text-indigo-300 transition-colors">INV-AX-9</td>
                                <td className="py-4 px-6 text-slate-400 text-xs">12 mins ago</td>
                                <td className="py-4 px-6">
                                    <div className="flex items-center gap-2">
                                        <div className="w-16 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                            <div className="bg-emerald-400 h-full w-[96%] shadow-[0_0_5px_rgba(52,211,153,0.8)]"></div>
                                        </div>
                                        <span className="text-emerald-400 font-bold text-xs tracking-wider">96/100</span>
                                    </div>
                                </td>
                                <td className="py-4 px-6 text-right">
                                    <span className="bg-emerald-900/20 text-emerald-400 px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold border border-emerald-500/30 inline-flex items-center gap-1.5 shadow-[0_0_10px_rgba(52,211,153,0.1)]">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Cleared
                                    </span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
