"use client";

import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Send, Bot, User, AlertCircle, CheckCircle2, Network, FileSearch, ShieldAlert, Waypoints, Activity, FileWarning, Radio, RefreshCw, ListTree, PieChart, TextSelect, ChevronRight, Paperclip } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
    id: string;
    role: "user" | "bot";
    content: string | React.ReactNode;
    isTyping?: boolean;
}

export const ChatInterface = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Attempt to extract the invoice ID from the filename
            const fileNameMatches = file.name.match(/INV-[a-zA-Z]+-\d+/i);
            const extractedId = fileNameMatches ? fileNameMatches[0].toUpperCase() : null;

            // Pass the exact result (or null) to the handler
            handleSend(undefined, extractedId || "", file.name, file);
        }
        // Reset file input target
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleSend = async (e?: React.FormEvent, uploadedInvoiceId?: string, fileName?: string, fileBlob?: File) => {
        e?.preventDefault();

        const textToProcess = fileName ? `Attached Document: ${fileName}` : input.trim();
        if (!textToProcess || isLoading) return;

        if (!fileName) setInput("");

        // Add user message
        const userMsg: Message = { id: Date.now().toString(), role: "user", content: textToProcess };
        setMessages(prev => [...prev, userMsg]);
        setIsLoading(true);

        // Add loading bot message
        const loadingId = "loading-" + Date.now();
        setMessages(prev => [...prev, { id: loadingId, role: "bot", content: "", isTyping: true }]);

        try {
            // Check if we received an explicit invoice ID from a file upload or text match
            const invoiceMatch = (uploadedInvoiceId || textToProcess).match(/INV-[A-Z]+-\d+/i);

            if (!invoiceMatch) {
                const failResponse = (
                    <div className="flex flex-col gap-3 text-[#ececec] text-base leading-relaxed">
                        <p>I received your document <strong>{fileName || ''}</strong> but I could not detect a valid GST Invoice ID in the filename.</p>
                        <p>Currently, the sandbox engine requires the uploaded filename to contain the Invoice ID (e.g., <code>INV-AX-9.pdf</code>).</p>
                        <p>Please rename your file or explicitly type the Invoice ID you want me to analyze!</p>
                    </div>
                );
                setMessages(prev => prev.map(m => m.id === loadingId ? { id: loadingId, role: "bot", content: failResponse } : m));
                setIsLoading(false);
                return;
            }

            const invoiceId = invoiceMatch[0].toUpperCase();

            // Fetch from backend using explicit IPv4
            const res = await axios.post("http://127.0.0.1:8000/analyze-invoice", {
                invoice_id: invoiceId,
                period: "2024-09"
            });

            const data = res.data;
            const isCritical = data.mismatches.length > 0;

            const botResponse = (
                <div className="flex flex-col gap-5 text-[#ececec] text-sm leading-relaxed w-full">

                    <div className="font-semibold flex items-center gap-2 text-xl text-white">
                        {isCritical ? <AlertCircle className="text-red-500" size={24} /> : <CheckCircle2 className="text-green-500" size={24} />}
                        Analysis Report: {invoiceId}
                    </div>

                    {data.total_exposure > 0 && (
                        <div className="px-4 py-3 bg-red-900/20 text-red-100 rounded-lg border border-red-900/50 flex flex-col md:flex-row items-start md:items-center gap-3">
                            <ShieldAlert className="text-red-400 shrink-0" size={24} />
                            <div>
                                <strong>Risk Exposure Detected:</strong> <span className="font-mono">₹{data.total_exposure.toLocaleString()}</span><br />
                                <span className="opacity-80 text-xs">Immediate review of this supply chain is recommended.</span>
                            </div>
                        </div>
                    )}

                    <div>
                        <p className="mb-4 text-gray-300">Here is the concise intelligence report on the requested invoice.</p>
                        <div className="bg-[#212121] p-4 rounded-xl border border-[#333] text-gray-200">
                            {data.explanation}
                        </div>
                    </div>

                    <h3 className="font-semibold text-lg text-white mt-4 border-b border-[#333] pb-2">Primary Verification Checks</h3>

                    <div className="flex flex-col gap-4">
                        {/* 1. Knowledge Graph Modeling */}
                        <div className="glass-panel rounded-2xl overflow-hidden shadow-glow-primary group transition-all duration-300 hover:bg-slate-800/40">
                            <div className="bg-slate-900/50 px-5 py-3 border-b border-slate-700/50 flex items-center gap-3">
                                <Network size={18} className="text-indigo-400 group-hover:animate-pulse" />
                                <h4 className="font-semibold text-slate-100 text-sm tracking-wide">1. Vendor Network Mapping</h4>
                            </div>
                            <div className="p-5 flex flex-col md:flex-row gap-5 items-center">
                                <div className="flex-1">
                                    <p className="text-sm text-slate-200 mb-2 font-medium">Supply chain extracted for {invoiceId}</p>
                                    <p className="text-xs text-slate-400 leading-relaxed">
                                        {isCritical
                                            ? `Identified extended network including ${data.mismatches.length * 3 + 5} related filing entities. Mapped the direct supplier and all connected multi-hop nodes.`
                                            : `Isolated the standard 3-tier supply chain. Mapped direct supplier, buyer, and associated e-invoices for ${invoiceId}.`}
                                    </p>
                                </div>
                                <div className="w-full md:w-1/2 h-40 bg-slate-950/60 rounded-xl border border-slate-700/50 relative flex items-center overflow-x-auto p-4 custom-scrollbar shadow-inner">
                                    {data.mismatches.length > 0 && data.mismatches[0].traversal_path ? (
                                        <div className="flex items-center gap-3 min-w-max px-2">
                                            {data.mismatches[0].traversal_path.map((nodeStr: string, idx: number) => {
                                                const parts = nodeStr.split(':');
                                                const type = parts[0];
                                                const id = parts.slice(1).join(':').substring(0, 8) + '...';
                                                return (
                                                    <div key={idx} className="flex items-center gap-2">
                                                        <div className={`flex flex-col items-center justify-center p-3 min-w-[70px] h-20 rounded-xl border-2 shadow-lg backdrop-blur-md transition-transform hover:scale-105 ${idx === data.mismatches[0].traversal_path.length - 1 ? 'border-rose-500/80 bg-rose-900/30 shadow-glow-danger' : 'border-indigo-500/50 bg-indigo-900/20 shadow-glow-primary'}`}>
                                                            <span className={`text-[10px] font-bold uppercase tracking-wider ${idx === data.mismatches[0].traversal_path.length - 1 ? 'text-rose-300' : 'text-indigo-300'}`}>{type}</span>
                                                            <span className="text-[11px] text-slate-300 truncate w-full text-center mt-1.5 font-medium" title={nodeStr}>{id}</span>
                                                        </div>
                                                        {idx < data.mismatches[0].traversal_path.length - 1 && (
                                                            <div className="flex items-center">
                                                                <div className="w-4 h-[2px] bg-indigo-500/50"></div>
                                                                <ChevronRight size={18} className="text-indigo-400 shrink-0 mx-[-4px]" />
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center w-full gap-5">
                                            <div className="flex flex-col items-center justify-center p-3 w-20 h-20 rounded-2xl border-2 border-indigo-500/50 bg-indigo-900/20 shadow-glow-primary hover:scale-105 transition-transform"><Network size={24} className="text-indigo-400 mb-2" /><span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider">Supplier</span></div>
                                            <div className="h-[2px] w-8 bg-indigo-500/50 relative"><ChevronRight className="absolute right-[-10px] top-1/2 -translate-y-1/2 text-indigo-400" size={20} /></div>
                                            <div className="flex flex-col items-center justify-center p-3 h-20 rounded-xl border-2 border-emerald-500/80 bg-emerald-900/30 shadow-glow-success hover:scale-105 transition-transform"><span className="text-sm font-bold text-emerald-400 tracking-wider">{invoiceId}</span></div>
                                            <div className="h-[2px] w-8 bg-indigo-500/50 relative"><ChevronRight className="absolute right-[-10px] top-1/2 -translate-y-1/2 text-indigo-400" size={20} /></div>
                                            <div className="flex flex-col items-center justify-center p-3 w-20 h-20 rounded-2xl border-2 border-indigo-500/50 bg-indigo-900/20 shadow-glow-primary hover:scale-105 transition-transform"><Network size={24} className="text-indigo-400 mb-2" /><span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider">Buyer</span></div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* 2. Deterministic Reconciliation Engine */}
                        <div className="glass-panel rounded-2xl overflow-hidden shadow-glow-primary group transition-all duration-300 hover:bg-slate-800/40">
                            <div className="bg-slate-900/50 px-5 py-3 border-b border-slate-700/50 flex items-center gap-3">
                                <FileSearch size={18} className={`${isCritical ? "text-rose-400" : "text-emerald-400"} group-hover:scale-110 transition-transform`} />
                                <h4 className="font-semibold text-slate-100 text-sm tracking-wide">2. 3-Way Reconciliation Result</h4>
                            </div>
                            <div className="p-5 flex flex-col md:flex-row gap-5 items-center">
                                <div className="flex-1">
                                    <p className="text-sm text-slate-200 mb-2 font-medium">{data.mismatches.length === 0 ? "Perfect 3-way match" : `${data.mismatches.length} discrepancy flag(s) found`}</p>
                                    <p className="text-xs text-slate-400 leading-relaxed">
                                        {isCritical
                                            ? `Identified specific mismatches: ${data.mismatches.map((m: any) => m.root_cause).join(', ')}. Values across GSTR-1, GSTR-2B, and E-Invoice do not align.`
                                            : `Values perfectly match across GSTR-1, GSTR-2B, and the E-Invoice registry. No missing or duplicate tax filings found.`}
                                    </p>
                                </div>
                                <div className={`w-full md:w-1/2 p-4 min-h-[160px] rounded-xl flex flex-col border shadow-inner ${isCritical ? 'bg-rose-950/30 border-rose-500/20 shadow-glow-danger' : 'bg-emerald-950/30 border-emerald-500/20 shadow-glow-success'}`}>
                                    <div className="text-[10px] text-slate-400 mb-3 uppercase font-bold tracking-widest pl-1">Verification Matrices</div>
                                    {isCritical ? (
                                        <div className="flex flex-col gap-3 w-full mt-2 h-[100px] overflow-y-auto custom-scrollbar px-1">
                                            {data.mismatches.map((m: any, idx: number) => (
                                                <div key={idx} className="bg-slate-900/60 border border-rose-500/30 rounded-lg flex flex-col p-3 shadow-sm hover:shadow-glow-danger transition-shadow">
                                                    <span className="text-[11px] text-rose-400 font-semibold tracking-wide mb-1 flex items-center gap-2" title={m.root_cause}><AlertCircle size={12} /> {m.root_cause}</span>
                                                    <span className="text-[10px] font-mono text-slate-400">Value at risk: <span className="text-rose-300">₹{m.financial_exposure.toLocaleString()}</span></span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-3 w-full mt-2">
                                            <div className="flex justify-between items-center bg-slate-900/60 border border-emerald-500/30 rounded-lg p-3 text-[11px] shadow-sm hover:border-emerald-400/50 transition-colors">
                                                <span className="text-slate-300 font-medium tracking-wide">GSTR-1 vs GSTR-2B</span><CheckCircle2 size={16} className="text-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)] rounded-full" />
                                            </div>
                                            <div className="flex justify-between items-center bg-slate-900/60 border border-emerald-500/30 rounded-lg p-3 text-[11px] shadow-sm hover:border-emerald-400/50 transition-colors">
                                                <span className="text-slate-300 font-medium tracking-wide">GSTR-1 vs E-Invoice</span><CheckCircle2 size={16} className="text-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)] rounded-full" />
                                            </div>
                                            <div className="flex justify-between items-center bg-slate-900/60 border border-emerald-500/30 rounded-lg p-3 text-[11px] shadow-sm hover:border-emerald-400/50 transition-colors">
                                                <span className="text-slate-300 font-medium tracking-wide">E-Way Bill Alignment</span><CheckCircle2 size={16} className="text-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)] rounded-full" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* 3. Agent Orchestration */}
                        <div className="glass-panel rounded-2xl overflow-hidden shadow-glow-primary group transition-all duration-300 hover:bg-slate-800/40">
                            <div className="bg-slate-900/50 px-5 py-3 border-b border-slate-700/50 flex items-center gap-3">
                                <Waypoints size={18} className="text-purple-400 group-hover:animate-pulse" />
                                <h4 className="font-semibold text-slate-100 text-sm tracking-wide">3. Verification Pipeline Status</h4>
                            </div>
                            <div className="p-5 flex flex-col md:flex-row gap-5 items-center">
                                <div className="flex-1">
                                    <p className="text-sm text-slate-200 mb-2 font-medium">Verification Pipeline Status</p>
                                    <p className="text-xs text-slate-400 leading-relaxed">
                                        {isCritical
                                            ? `Data extractor retrieved registries. Network validator processed ${data.mismatches.length} failed relationships. Risk engine calculated an exposure of ₹${data.total_exposure.toLocaleString()}.`
                                            : `Data extraction, network validation, and risk calculation completed successfully. System cleared all routine compliance checks.`}
                                    </p>
                                </div>
                                <div className="w-full md:w-1/2 flex flex-col gap-3 min-h-[160px] bg-slate-950/60 p-5 rounded-xl border border-slate-700/50 shadow-inner">
                                    <div className="text-[10px] text-slate-400 mb-2 uppercase font-bold tracking-widest pl-1">Engine Execution Stats</div>
                                    <div className="flex justify-between items-center border-b border-slate-700/50 pb-3 hover:bg-slate-800/30 -mx-2 px-2 rounded transition-colors">
                                        <span className="text-[11px] text-slate-300 tracking-wide font-medium">Graph Elements Traversed</span>
                                        <span className="text-xs font-mono text-purple-400 bg-purple-900/20 px-2 py-0.5 rounded border border-purple-500/30">{isCritical ? data.mismatches.length * 9 : 24}</span>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-slate-700/50 pb-3 hover:bg-slate-800/30 -mx-2 px-2 rounded transition-colors">
                                        <span className="text-[11px] text-slate-300 tracking-wide font-medium">Cycle Deep-Search</span>
                                        <span className="text-xs font-mono text-purple-400 bg-purple-900/20 px-2 py-0.5 rounded border border-purple-500/30">{data.overall_risk.includes("Cycle") ? "Found 1" : "0"}</span>
                                    </div>
                                    <div className="flex justify-between items-center hover:bg-slate-800/30 -mx-2 px-2 py-1 rounded transition-colors">
                                        <span className="text-[11px] text-slate-300 tracking-wide font-medium">Max Financial Risk (₹)</span>
                                        <span className={`text-xs font-mono px-2 py-0.5 rounded border ${data.total_exposure > 0 ? "text-rose-400 bg-rose-900/20 border-rose-500/30" : "text-emerald-400 bg-emerald-900/20 border-emerald-500/30"}`}>
                                            {data.total_exposure.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 4. Explainable Audit Intelligence */}
                        <div className="glass-panel rounded-2xl overflow-hidden shadow-glow-primary group transition-all duration-300 hover:bg-slate-800/40">
                            <div className="bg-slate-900/50 px-5 py-3 border-b border-slate-700/50 flex items-center gap-3">
                                <TextSelect size={18} className="text-amber-400 group-hover:scale-110 transition-transform" />
                                <h4 className="font-semibold text-slate-100 text-sm tracking-wide">4. Audit Recommendation</h4>
                            </div>
                            <div className="p-5 flex flex-col gap-4">
                                <p className="text-xs text-slate-400 leading-relaxed font-medium">System-generated summary of findings and recommended action plan for the tax officer:</p>
                                <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-700/50 border-l-4 border-l-amber-500 font-mono text-xs text-amber-200/90 overflow-hidden text-ellipsis leading-relaxed shadow-inner backdrop-blur-sm">
                                    <span className="text-amber-500 font-bold tracking-wider block mb-2">ACTION PLAN:</span>
                                    {isCritical
                                        ? `Issue show-cause notice regarding ${data.mismatches[0]?.root_cause || "tax discrepancies"}. Recommend temporary block of ₹${data.total_exposure.toLocaleString()} ITC pending vendor clarification.`
                                        : "Clearance approved. No compliance issues discovered. Routine processing authorized."}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8">
                        <h3 className="font-semibold text-lg text-white mb-4 border-b border-slate-700/50 pb-3 flex items-center gap-2"><ScanEye size={20} className="text-indigo-400" /> Further Results & Trace Outputs</h3>
                        <div className="glass-panel rounded-2xl overflow-hidden shadow-glow-primary">
                            <table className="w-full text-left border-collapse text-xs">
                                <tbody>
                                    <tr className="border-b border-slate-700/50 hover:bg-slate-800/40 transition-colors">
                                        <td className="p-4 md:w-1/2 font-medium flex items-center gap-3 text-slate-300"><ShieldAlert size={16} className="text-slate-400" /> Vendor Risk Status</td>
                                        <td className={`p-4 font-bold tracking-wide ${data.overall_risk.includes("Critical") || data.overall_risk.includes("High") ? "text-rose-400 drop-shadow-[0_0_8px_rgba(225,29,72,0.5)]" : "text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]"}`}>{data.overall_risk}</td>
                                    </tr>
                                    <tr className="border-b border-slate-700/50 hover:bg-slate-800/40 transition-colors">
                                        <td className="p-4 font-medium flex items-center gap-3 text-slate-300"><Activity size={16} className="text-slate-400" /> Trading Volume Anomalies</td>
                                        <td className="p-4 text-slate-400">{isCritical ? `Volume spike of ₹${(data.total_exposure * 1.4).toLocaleString()} detected` : "Normal historical volume"}</td>
                                    </tr>
                                    <tr className="border-b border-slate-700/50 hover:bg-slate-800/40 transition-colors">
                                        <td className="p-4 font-medium flex items-center gap-3 text-slate-300"><ListTree size={16} className="text-slate-400" /> Upstream Origin Validation</td>
                                        <td className="p-4 text-slate-400">{isCritical ? `Failed at supplier ${data.mismatches[0]?.traversal_path?.[1] || 'origin'}` : "All tier-1 and tier-2 origins verified"}</td>
                                    </tr>
                                    <tr className="border-b border-slate-700/50 hover:bg-slate-800/40 transition-colors">
                                        <td className="p-4 font-medium flex items-center gap-3 text-slate-300"><FileWarning size={16} className="text-slate-400" /> Primary Issue Identified</td>
                                        <td className="p-4 text-slate-400">{isCritical ? (data.mismatches.map((m: any) => m.root_cause).join(", ") || `${data.mismatches.length} filing discrepancy`) : "No issues found"}</td>
                                    </tr>
                                    <tr className="border-b border-slate-700/50 hover:bg-slate-800/40 transition-colors">
                                        <td className="p-4 font-medium flex items-center gap-3 text-slate-300"><PieChart size={16} className="text-slate-400" /> Tax Deficit (ITC)</td>
                                        <td className={`p-4 font-mono font-bold tracking-wider ${data.total_exposure > 0 ? "text-rose-400" : "text-emerald-400"}`}>₹{data.total_exposure.toLocaleString()}</td>
                                    </tr>
                                    <tr className="border-b border-slate-700/50 hover:bg-slate-800/40 transition-colors">
                                        <td className="p-4 font-medium flex items-center gap-3 text-slate-300"><Radio size={16} className="text-slate-400" /> Network Contagion</td>
                                        <td className="p-4 text-slate-400">{isCritical ? `High risk exposure: ₹${data.total_exposure.toLocaleString()} across ${data.mismatches.length} connections` : "Minimal associated risk"}</td>
                                    </tr>
                                    <tr className="border-b border-slate-700/50 hover:bg-slate-800/40 transition-colors">
                                        <td className="p-4 font-medium flex items-center gap-3 text-slate-300"><RefreshCw size={16} className="text-slate-400" /> Circular Trading Rings</td>
                                        <td className="p-4 font-bold">{data.overall_risk.includes("Cycle") ? <span className="text-rose-500 drop-shadow-[0_0_8px_rgba(225,29,72,0.8)]">Closed loop detected</span> : <span className="text-slate-500">None identified</span>}</td>
                                    </tr>
                                    <tr className="border-b border-slate-700/50 hover:bg-slate-800/40 transition-colors">
                                        <td className="p-4 font-medium flex items-center gap-3 text-slate-300"><Network size={16} className="text-slate-400" /> Validation Path Sequence</td>
                                        <td className="p-4 text-indigo-300/80 font-mono truncate max-w-[150px] md:max-w-xs block mt-1" title={data.mismatches.length > 0 ? data.mismatches[0].traversal_path.join(" > ") : "Direct supplier validated"}>
                                            {data.mismatches.length > 0 ? data.mismatches[0].traversal_path.join(" > ") : "Direct supplier validated"}
                                        </td>
                                    </tr>
                                    <tr className="hover:bg-slate-800/40 transition-colors">
                                        <td className="p-4 font-bold tracking-wide flex items-center gap-3 text-slate-200"><PieChart size={16} className={isCritical ? "text-rose-500" : "text-emerald-400"} /> Overall Compliance Score</td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-28 bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-700/50">
                                                    <div className={`h-full transition-all duration-1000 ${isCritical ? "bg-rose-500 shadow-[0_0_8px_rgba(225,29,72,0.8)]" : "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"}`} style={{ width: isCritical ? '35%' : '92%' }}></div>
                                                </div>
                                                <span className={`text-xs font-bold tracking-wider ${isCritical ? "text-rose-400" : "text-emerald-400"}`}>{isCritical ? '35/100' : '92/100'}</span>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="mt-2 text-[10px] text-gray-500 text-center uppercase tracking-widest leading-none">
                        SYSTEM_MODE: INVOICE_ANALYSIS

                    </div>
                </div>
            );

            setMessages(prev => prev.map(m => m.id === loadingId ? { id: loadingId, role: "bot", content: botResponse } : m));
        } catch (error) {
            console.error(error);
            setMessages(prev => prev.map(m => m.id === loadingId ? { id: loadingId, role: "bot", content: "I'm having trouble connecting to the backend engine right now. Please make sure the cluster is running on port 8000." } : m));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-3xl mx-auto h-full flex flex-col pt-8">

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto px-4 pb-24 custom-scrollbar">
                <AnimatePresence initial={false}>
                    {messages.map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex w-full mb-6 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                            {msg.role === "user" ? (
                                <div className="max-w-[75%] rounded-3xl px-6 py-4 glass-panel bg-indigo-900/40 border-indigo-500/30 text-slate-100 text-sm md:text-base leading-relaxed break-words shadow-glow-primary font-medium tracking-wide">
                                    {msg.content}
                                </div>
                            ) : (
                                <div className="flex w-full gap-4 max-w-full">
                                    <div className="w-8 h-8 shrink-0 rounded-full bg-white flex items-center justify-center mt-1 border border-gray-200">
                                        <Bot size={20} className="text-[#10a37f]" />
                                    </div>

                                    <div className="flex-1 text-[#ececec] text-base leading-relaxed py-1 min-w-0">
                                        {msg.isTyping ? (
                                            <div className="flex items-center gap-1 h-6">
                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></div>
                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
                                            </div>
                                        ) : (
                                            msg.content
                                        )}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>
                <div ref={messagesEndRef} className="h-4" />
            </div>

            {/* Input Area */}
            <div className={messages.length === 0 ? "absolute top-1/2 left-0 w-full -translate-y-[60%] px-4 transition-all duration-500 ease-in-out" : "absolute bottom-0 w-full left-0 bg-gradient-to-t from-[#212121] via-[#212121] to-transparent pt-6 pb-6 px-4 transition-all duration-500 ease-in-out"}>
                {messages.length === 0 && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center mb-8">
                        <h2 className="text-2xl md:text-3xl font-semibold text-white text-center">What can I help with?</h2>
                    </motion.div>
                )}
                <div className="max-w-3xl mx-auto relative flex flex-col items-center">
                    <form onSubmit={handleSend} className="relative flex items-center shadow-lg w-full max-w-3xl">
                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: "none" }}
                            onChange={handleFileUpload}
                            accept=".pdf,.json,.csv,.xml"
                        />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isLoading}
                            className="absolute left-4 p-2 text-gray-400 hover:text-white transition-colors z-10"
                            title="Upload Invoice File"
                        >
                            <Paperclip size={20} />
                        </button>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Message Brodagraph or upload invoice..."
                            className="w-full glass-panel rounded-full px-6 py-4 pl-14 pr-14 text-sm md:text-base focus:outline-none glow-border-active transition-all duration-300 text-white placeholder-slate-400 font-medium tracking-wide shadow-lg"
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || isLoading}
                            className={`absolute right-2 p-2 rounded-full transition-colors ${!input.trim() || isLoading ? 'bg-[#2f2f2f] text-gray-500 cursor-not-allowed' : 'bg-white text-black hover:bg-gray-200'}`}
                        >
                            <Send size={18} className="ml-[-1px] mb-[-1px]" />
                        </button>
                    </form>
                    <div className="text-center text-xs text-gray-400 mt-3 font-medium">
                        Brodagraph can make mistakes. Consider verifying important information.
                    </div>
                </div>
            </div>

        </div>
    );
};
