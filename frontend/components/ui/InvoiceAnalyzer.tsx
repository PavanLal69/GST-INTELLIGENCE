"use client";

import { useGraphStore } from "@/store/useGraphStore";
import { useState } from "react";
import axios from "axios";
import { Search, ShieldAlert, Cpu, Activity, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const InvoiceAnalyzer = () => {
    const [invoiceId, setInvoiceId] = useState("INV-BD-1");
    const { isAnalyzing, setIsAnalyzing, setAuditData, setVendorRisk, setFocusedNodeId } = useGraphStore();

    const handleAnalyze = async () => {
        if (!invoiceId) return;
        setIsAnalyzing(true);
        setAuditData(null);
        setVendorRisk(null);

        // Trigger Camera Movement (Demo purposes, node 1)
        setFocusedNodeId(`Invoice:${invoiceId}`);

        try {
            // 1. Fetch analyze
            const res = await axios.post("http://localhost:8000/analyze-invoice", {
                invoice_id: invoiceId,
                period: "2024-09"
            });
            console.log(res.data);

            // Wait for dramatic effect
            setTimeout(() => {
                setAuditData(res.data);
                setIsAnalyzing(false);
            }, 2000);

            // 2. We can also fetch vendor risk directly if needed, but orchestrator returns overall_risk
            // Assuming vendor is GSTIN_B for INV-BD-1 just to show the separate chart panel
            setTimeout(async () => {
                const vRes = await axios.get("http://localhost:8000/vendor-risk/GSTIN_B");
                setVendorRisk(vRes.data);
            }, 3500);

        } catch (error) {
            console.error(error);
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="absolute left-8 top-1/2 -translate-y-1/2 w-96 flex flex-col gap-6 z-10 pointer-events-auto">

            {/* Search Header */}
            <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="glass-panel p-6 flex flex-col gap-4"
            >
                <div className="flex items-center gap-3 text-primary-glow font-bold uppercase tracking-widest text-sm">
                    <Cpu size={18} /> Intelligence Orchestrator
                </div>

                <div className="relative">
                    <input
                        className="w-full bg-black/50 border border-primary/30 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary-glow transition-all text-white font-mono placeholder-gray-600"
                        placeholder="Enter Invoice ID or GSTIN..."
                        value={invoiceId}
                        onChange={(e) => setInvoiceId(e.target.value)}
                    />
                    <button
                        onClick={handleAnalyze}
                        disabled={isAnalyzing}
                        className="absolute right-2 top-2 p-1.5 bg-primary/20 hover:bg-primary/40 rounded-md transition-colors text-primary-glow"
                    >
                        {isAnalyzing ? <Activity className="animate-spin" size={18} /> : <Search size={18} />}
                    </button>
                </div>
            </motion.div>

            {/* Audit Trail Results */}
            <AnimatePresence>
                {useGraphStore.getState().auditData && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="glass-panel p-6 overflow-hidden relative"
                    >
                        {/* Background glow based on risk */}
                        <div className={`absolute inset-0 opacity-10 blur-xl ${useGraphStore.getState().auditData!.mismatches.length > 0 ? 'bg-danger' : 'bg-primary'}`} />

                        <div className="relative z-10">
                            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                                {useGraphStore.getState().auditData!.mismatches.length > 0 ? <ShieldAlert className="text-danger-glow" size={16} /> : <CheckCircle2 className="text-primary-glow" size={16} />}
                                Deterministic Audit
                            </h3>

                            {/* Financial Exposure Stat */}
                            {useGraphStore.getState().auditData!.total_exposure > 0 && (
                                <div className="my-4 p-3 bg-danger/10 border border-danger/20 rounded-md">
                                    <div className="text-xs text-danger-glow uppercase tracking-wider mb-1">Total ITC Exposure</div>
                                    <div className="text-2xl font-mono text-white">₹{useGraphStore.getState().auditData!.total_exposure.toLocaleString()}</div>
                                </div>
                            )}

                            {/* Typewriter Explanation */}
                            <div className="text-gray-300 text-sm leading-relaxed font-mono whitespace-pre-wrap mt-4 border-l-2 border-primary/50 pl-3">
                                {useGraphStore.getState().auditData!.explanation.split('\n').map((line: string, i: number) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.4 }}
                                        className="mb-2"
                                    >
                                        {line}
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
