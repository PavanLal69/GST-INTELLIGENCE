"use client";

import { useGraphStore } from "@/store/useGraphStore";
import { motion, AnimatePresence } from "framer-motion";
import { Network, Activity } from "lucide-react";

export const VendorHologram = () => {
    const { vendorRisk } = useGraphStore();

    return (
        <AnimatePresence>
            {vendorRisk && (
                <motion.div
                    initial={{ opacity: 0, x: 50, scale: 0.9, rotateY: -15 }}
                    animate={{ opacity: 1, x: 0, scale: 1, rotateY: 0 }}
                    exit={{ opacity: 0, x: 50, scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                    className="absolute right-8 top-1/2 -translate-y-1/2 w-80 perspective-[1000px] pointer-events-auto"
                >
                    <div className="glass-panel p-6 shadow-[0_0_50px_rgba(59,130,246,0.15)] transform-gpu hover:scale-105 transition-transform duration-500">

                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                            <h2 className="text-white/80 uppercase tracking-[0.2em] text-xs flex items-center gap-2">
                                <Network size={14} className="text-primary-glow" /> Vendor Radar
                            </h2>
                            <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${vendorRisk.risk_bucket === 'High' ? 'bg-danger/20 text-danger-glow border border-danger/50' :
                                    vendorRisk.risk_bucket === 'Medium' ? 'bg-warning/20 text-warning border border-warning/50' :
                                        'bg-primary/20 text-primary-glow border border-primary/50'
                                }`}>
                                {vendorRisk.risk_bucket} Risk
                            </div>
                        </div>

                        {/* Score Radial */}
                        <div className="flex justify-center my-8">
                            <div className="relative w-32 h-32 flex items-center justify-center">
                                {/* Glowing outer rings */}
                                <div className="absolute inset-0 rounded-full border border-primary/20 animate-spin-slow"></div>
                                <div className="absolute inset-2 rounded-full border-t-2 border-primary-glow animate-spin-reverse-slow"></div>

                                {/* Score Content */}
                                <div className="text-center">
                                    <div className="text-4xl font-mono text-white glow-text">{vendorRisk.compliance_risk_score}</div>
                                    <div className="text-[10px] uppercase text-white/50 tracking-widest mt-1">Compliance</div>
                                </div>
                            </div>
                        </div>

                        {/* Features list */}
                        <div className="space-y-4">
                            <h3 className="text-xs text-white/60 flex items-center gap-2 uppercase tracking-wider">
                                <Activity size={12} /> Predictive Features
                            </h3>

                            {Object.entries(vendorRisk.feature_importance).map(([key, value]: [string, any], idx) => (
                                <div key={key} className="relative">
                                    <div className="flex justify-between text-[10px] text-white/80 mb-1 uppercase tracking-wider">
                                        <span>{key.replace(/_/g, ' ')}</span>
                                        <span>{(value * 100).toFixed(0)}%</span>
                                    </div>
                                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${value * 100}%` }}
                                            transition={{ duration: 1, delay: idx * 0.2 }}
                                            className={`h-full ${vendorRisk.risk_bucket === 'High' ? 'bg-danger-glow' : 'bg-primary-glow'}`}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
