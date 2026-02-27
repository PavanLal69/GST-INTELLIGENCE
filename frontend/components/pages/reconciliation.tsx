"use client";

import { FileSearch, CheckCircle, XCircle, AlertTriangle, ArrowRightLeft, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import { useIntelligenceStore } from "@/store/intelligenceStore";

export function Reconciliation() {
    const { hasResults, invoiceId } = useIntelligenceStore();
    const isMatched = hasResults ? false : true;

    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-white">Automated Reconciliation Engine</h1>
                <div className="flex gap-2 text-sm">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors flex items-center gap-2">
                        <RefreshCw size={14} /> Sync Registries
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#1e1e1e] rounded-xl border border-[#333] p-6 flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 text-white font-semibold">
                            <FileSearch size={20} className="text-blue-400" />
                            GSTR-2B vs GSTR-3B Matcher
                        </div>
                        <span className="text-xs bg-green-900/30 text-green-400 px-2 py-1 rounded border border-green-900/50">Running</span>
                    </div>
                    <div className="h-40 flex items-center justify-center border-2 border-dashed border-[#333] rounded-lg">
                        <div className="text-center">
                            <CheckCircle2 size={32} className="text-gray-600 mx-auto mb-2" />
                            <p className="text-gray-500 text-sm">No critical mismatches in current queue.</p>
                        </div>
                    </div>
                </div>

                <div className="bg-[#1e1e1e] rounded-xl border border-[#333] p-6 flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 text-white font-semibold">
                            <AlertCircle size={20} className="text-amber-400" />
                            E-Invoice to GSTR-1 Ledger
                        </div>
                        <span className="text-xs bg-amber-900/30 text-amber-400 px-2 py-1 rounded border border-amber-900/50">3 Flags</span>
                    </div>
                    <div className="h-40 overflow-y-auto custom-scrollbar flex flex-col gap-2">
                        <div className={`bg-[#2f2f2f] border rounded p-3 flex justify-between items-center ${hasResults ? "border-amber-900/50" : "border-[#404040]"}`}>
                            <span className="text-xs text-white font-mono">{hasResults ? invoiceId : "INV-X-491"}</span>
                            <span className="text-xs text-amber-400 border border-amber-900/50 bg-amber-900/20 px-2 py-0.5 rounded">Value Nullified</span>
                        </div>
                        <div className="bg-[#2f2f2f] border border-[#404040] rounded p-3 flex justify-between items-center">
                            <span className="text-xs text-white font-mono">INV-Y-102</span>
                            <span className="text-xs text-amber-400 border border-amber-900/50 bg-amber-900/20 px-2 py-0.5 rounded">B2B Mismatch</span>
                        </div>
                        <div className="bg-[#2f2f2f] border border-[#404040] rounded p-3 flex justify-between items-center">
                            <span className="text-xs text-white font-mono">INV-Z-888</span>
                            <span className="text-xs text-amber-400 border border-amber-900/50 bg-amber-900/20 px-2 py-0.5 rounded">Date Drift</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-[#1e1e1e] rounded-xl border border-[#333] p-5">
                    <h3 className="font-semibold text-white mb-4">GSTR-1 Record</h3>
                    <div className="flex flex-col gap-3">
                        <div className="flex justify-between border-b border-[#333] pb-2">
                            <span className="text-gray-500">Document No.</span>
                            <span className="text-white font-mono">{hasResults ? invoiceId : "INV-2024-892"}</span>
                        </div>
                        <div className="flex justify-between border-b border-[#333] pb-2">
                            <span className="text-gray-500">Taxable Value</span>
                            <span className="text-white font-mono">₹{hasResults ? "8,45,000" : "1,25,000"}</span>
                        </div>
                        <div className="flex justify-between border-b border-[#333] pb-2">
                            <span className="text-gray-500">SGST/CGST</span>
                            <span className="text-white font-mono">₹{hasResults ? "1,52,100" : "22,500"}</span>
                        </div>
                    </div>
                </div>

                <div className={`bg-[#1e1e1e] rounded-xl border p-5 ${hasResults ? "border-red-900/50" : "border-[#333]"}`}>
                    <h3 className="font-semibold text-white mb-4">GSTR-2B Extraction</h3>
                    <div className="flex flex-col gap-3">
                        <div className="flex justify-between border-b border-[#333] pb-2">
                            <span className="text-gray-500">Match Status</span>
                            <span className={isMatched ? "text-green-400 flex items-center gap-1" : "text-red-400 flex items-center gap-1"}>
                                {isMatched ? <><CheckCircle size={14} /> Perfect Match</> : <><XCircle size={14} /> ITC Mismatch</>}
                            </span>
                        </div>
                        <div className="flex justify-between border-b border-[#333] pb-2">
                            <span className="text-gray-500">Claimed Value</span>
                            <span className="text-white font-mono">₹{hasResults ? "9,90,000" : "1,25,000"}</span>
                        </div>
                        <div className="flex justify-between border-b border-[#333] pb-2">
                            <span className="text-gray-500">Variance</span>
                            <span className={`font-mono ${isMatched ? "text-green-400" : "text-red-400"}`}>
                                {isMatched ? "₹0.00" : "₹1,45,000 (17.1%)"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
