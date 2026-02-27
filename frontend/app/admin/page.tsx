"use client";

import { useState } from "react";
import { AdminPanel } from "@/components/pages/admin-panel";
import { DriftMonitoring } from "@/components/pages/drift-monitoring";
import { GraphExplorer } from "@/components/pages/graph-explorer";
import { PolicySimulation } from "@/components/pages/policy-simulation";
import { Reconciliation } from "@/components/pages/reconciliation";
import { TemporalAnalytics } from "@/components/pages/temporal-analytics";
import { VendorIntelligence } from "@/components/pages/vendor-intelligence";
import { ChatInterface } from "@/components/ui/ChatInterface";
import { LayoutDashboard, Activity, Network, Play, FileSearch, Clock, ScanEye, Bot } from "lucide-react";

const tabs = [
    { id: "admin", name: "System Dashboard", icon: LayoutDashboard, component: AdminPanel },
    { id: "chat", name: "GST Chatbot Assistant", icon: Bot, component: ChatInterface },
    { id: "drift", name: "Drift Monitoring", icon: Activity, component: DriftMonitoring },
    { id: "graph", name: "Graph Explorer", icon: Network, component: GraphExplorer },
    { id: "policy", name: "Policy Simulation", icon: Play, component: PolicySimulation },
    { id: "reconciliation", name: "Reconciliation Engine", icon: FileSearch, component: Reconciliation },
    { id: "temporal", name: "Temporal Analytics", icon: Clock, component: TemporalAnalytics },
    { id: "vendor", name: "Vendor Intelligence", icon: ScanEye, component: VendorIntelligence }
];

export default function UnifiedAdminDashboard() {
    const [activeTab, setActiveTab] = useState(tabs[0].id);

    const ActiveComponent = tabs.find(t => t.id === activeTab)?.component || AdminPanel;

    return (
        <div className="min-h-screen flex p-4 md:p-6 gap-6 relative overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-5%] w-[30%] h-[40%] bg-emerald-600/10 rounded-full blur-[100px] pointer-events-none"></div>

            {/* Sidebar Navigation */}
            <aside className="w-64 glass-panel rounded-2xl flex flex-col hidden md:flex shrink-0 h-[calc(100vh-3rem)] sticky top-6 z-10 overflow-hidden">
                <div className="p-6 border-b border-slate-700/50 flex items-center gap-4">
                    <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center font-bold text-white shadow-glow-primary">
                        GST
                    </div>
                    <span className="font-bold text-sm tracking-wide text-white drop-shadow-md">Command Center</span>
                </div>

                <nav className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-1 custom-scrollbar">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2 px-3">Intelligence Suites</div>

                    {tabs.map((tab) => {
                        const isActive = activeTab === tab.id;
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-300 text-left overflow-hidden group ${isActive
                                    ? "text-white font-medium"
                                    : "text-slate-400 hover:text-white"
                                    }`}
                            >
                                {/* Active State Indicator Background */}
                                {isActive && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-transparent border-l-2 border-indigo-400"></div>
                                )}
                                {/* Hover State Background */}
                                {!isActive && (
                                    <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                )}

                                <Icon size={18} className={`relative z-10 transition-colors duration-300 ${isActive ? "text-indigo-400 drop-shadow-[0_0_8px_rgba(129,140,248,0.8)]" : "text-slate-500 group-hover:text-slate-300"}`} />
                                <span className="relative z-10">{tab.name}</span>
                            </button>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-700/50 flex justify-center items-center">
                    <div className="px-3 py-1.5 rounded-full bg-slate-800/50 border border-slate-700/50 text-[10px] text-slate-400 tracking-widest uppercase flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                        v2.4.0 Engine
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col h-[calc(100vh-3rem)] relative z-10">
                <header className="px-6 py-4 flex items-center justify-end shrink-0 mb-2">
                    <div className="glass-panel px-4 py-2 rounded-full flex items-center gap-4 border-white/5">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse"></span>
                            <span className="text-[11px] text-slate-300 uppercase tracking-widest font-medium">Systems Online</span>
                        </div>
                        <div className="h-4 w-px bg-slate-700"></div>
                        <div className="text-xs text-indigo-400 cursor-pointer hover:text-indigo-300 transition-colors font-medium">Officer Portal</div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto custom-scrollbar relative">
                    <div className="max-w-7xl mx-auto h-full px-2 pb-8">
                        <ActiveComponent />
                    </div>
                </div>
            </main>
        </div>
    );
}
