"use monitoring";

import { Activity, ShieldAlert, LineChart, MoveUpRight, ArrowDownRight, AlertTriangle } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useIntelligenceStore } from "@/store/intelligenceStore";

const data = [
    { name: 'Mon', featureDrift: 4.2, predictionDrift: 2.1 },
    { name: 'Tue', featureDrift: 4.8, predictionDrift: 2.3 },
    { name: 'Wed', featureDrift: 6.1, predictionDrift: 2.5 },
    { name: 'Thu', featureDrift: 5.9, predictionDrift: 2.8 },
    { name: 'Fri', featureDrift: 8.4, predictionDrift: 3.2 },
    { name: 'Sat', featureDrift: 11.2, predictionDrift: 3.8 },
    { name: 'Sun', featureDrift: 12.4, predictionDrift: 4.2 },
];

export function DriftMonitoring() {
    const { hasResults, invoiceId } = useIntelligenceStore();

    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-white">Drift Monitoring</h1>
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-900/60 px-4 py-2 rounded-full border border-slate-700/50 shadow-inner flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shadow-glow-primary"></div>
                    Target: <span className="text-blue-400 ml-1">{hasResults ? invoiceId : "System Baseline"}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-panel rounded-2xl border-slate-700/50 p-5 flex flex-col gap-3 group hover:bg-amber-900/10 transition-all duration-300 shadow-glow-primary hover:shadow-glow-warning hover:border-amber-500/30">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-slate-400 text-sm font-medium tracking-wide">Feature Drift</span>
                        <div className="p-2 bg-slate-900/50 rounded-lg group-hover:scale-110 transition-transform"><Activity size={18} className={hasResults ? "text-rose-400" : "text-amber-400"} /></div>
                    </div>
                    <div className="flex items-end gap-3">
                        <span className="text-3xl font-bold text-white tracking-tight drop-shadow-md">{hasResults ? "24.1%" : "12.4%"}</span>
                        <span className={`text-xs flex items-center mb-1.5 font-bold tracking-wider bg-slate-900/60 px-2 py-0.5 rounded border ${hasResults ? "text-rose-400 border-rose-500/30" : "text-amber-400 border-amber-500/30"}`}>
                            {hasResults ? <><MoveUpRight size={12} className="mr-1" /> +11.7%</> : <><MoveUpRight size={12} className="mr-1" /> +2.1%</>}
                        </span>
                    </div>
                </div>

                <div className="glass-panel rounded-2xl border-slate-700/50 p-5 flex flex-col gap-3 group hover:bg-blue-900/10 transition-all duration-300 shadow-glow-primary hover:border-blue-500/30">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-slate-400 text-sm font-medium tracking-wide">Prediction Drift</span>
                        <div className="p-2 bg-slate-900/50 rounded-lg group-hover:scale-110 transition-transform"><LineChart size={18} className="text-blue-400" /></div>
                    </div>
                    <div className="flex items-end gap-3">
                        <span className="text-3xl font-bold text-white tracking-tight drop-shadow-md">{hasResults ? "8.7%" : "4.2%"}</span>
                        <span className="text-xs text-rose-400 flex items-center mb-1.5 font-bold tracking-wider bg-slate-900/60 px-2 py-0.5 rounded border border-rose-500/30"><MoveUpRight size={12} className="mr-1" /> +4.5%</span>
                    </div>
                </div>

                <div className={`glass-panel rounded-2xl p-5 flex flex-col gap-3 transition-all duration-300 group ${hasResults ? "border-rose-500/50 bg-rose-950/20 shadow-glow-danger" : "border-slate-700/50 hover:bg-amber-900/10 hover:border-amber-500/30"}`}>
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-slate-400 text-sm font-medium tracking-wide">Alert Status</span>
                        <div className="p-2 bg-slate-900/50 rounded-lg group-hover:scale-110 transition-transform">{hasResults ? <ShieldAlert size={18} className="text-rose-400 drop-shadow-[0_0_8px_rgba(225,29,72,0.8)]" /> : <AlertTriangle size={18} className="text-amber-400" />}</div>
                    </div>
                    <span className={`text-lg font-bold mt-1 tracking-wide ${hasResults ? "text-rose-400 drop-shadow-[0_0_8px_rgba(225,29,72,0.5)]" : "text-amber-400"}`}>
                        {hasResults ? "Critical Threshold Exceeded" : "Warning Level Activity"}
                    </span>
                    {hasResults && <div className="w-full bg-slate-900 rounded-full h-1 mt-1 overflow-hidden"><div className="bg-rose-500 h-full w-[85%] shadow-[0_0_8px_rgba(225,29,72,1)]"></div></div>}
                </div>
            </div>

            <div className={`glass-panel rounded-2xl mt-4 p-8 min-h-[400px] flex flex-col transition-all duration-300 ${hasResults ? "border-rose-500/30 shadow-glow-danger" : "border-slate-700/50 shadow-glow-primary"}`}>
                <h3 className="text-slate-100 font-semibold mb-6 flex items-center gap-2 tracking-wide"><LineChart className="text-indigo-400" size={20} /> 7-Day Drift Trajectory</h3>
                <div className="flex-1 w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorFeature" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#facc15" stopOpacity={0.4} />
                                    <stop offset="95%" stopColor="#facc15" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorPrediction" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.4} />
                                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} vertical={false} />
                            <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} dy={10} fontWeight={500} />
                            <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}%`} dx={-10} fontWeight={500} />
                            <Tooltip
                                contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.8)', borderColor: 'rgba(51, 65, 85, 0.5)', borderRadius: '12px', color: '#f8fafc', backdropFilter: 'blur(8px)', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}
                                itemStyle={{ color: '#f8fafc', fontWeight: 600, fontSize: '13px' }}
                            />
                            <Area type="monotone" dataKey="featureDrift" name="Feature Drift" stroke="#facc15" strokeWidth={3} fillOpacity={1} fill="url(#colorFeature)" />
                            <Area type="monotone" dataKey="predictionDrift" name="Prediction Drift" stroke="#818cf8" strokeWidth={3} fillOpacity={1} fill="url(#colorPrediction)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
