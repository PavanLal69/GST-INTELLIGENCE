import { create } from "zustand";

interface GraphState {
    focusedNodeId: string | null;
    setFocusedNodeId: (id: string | null) => void;
    isAnalyzing: boolean;
    setIsAnalyzing: (s: boolean) => void;
    auditData: any | null;
    setAuditData: (data: any) => void;
    vendorRisk: any | null;
    setVendorRisk: (data: any) => void;
}

export const useGraphStore = create<GraphState>((set) => ({
    focusedNodeId: null,
    setFocusedNodeId: (id) => set({ focusedNodeId: id }),
    isAnalyzing: false,
    setIsAnalyzing: (s) => set({ isAnalyzing: s }),
    auditData: null,
    setAuditData: (data) => set({ auditData: data }),
    vendorRisk: null,
    setVendorRisk: (data) => set({ vendorRisk: data })
}));
