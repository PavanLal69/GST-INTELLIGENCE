import { create } from 'zustand';

interface AnalysisData {
    invoiceId: string | null;
    isAnalyzing: boolean;
    hasResults: boolean;
    results: any | null;
    setAnalyzing: (status: boolean) => void;
    setResults: (invoiceId: string, data: any) => void;
    clearResults: () => void;
}

export const useIntelligenceStore = create<AnalysisData>((set) => ({
    invoiceId: null,
    isAnalyzing: false,
    hasResults: false,
    results: null,

    setAnalyzing: (status) => set({ isAnalyzing: status }),

    setResults: (invoiceId, data) => set({
        invoiceId,
        isAnalyzing: false,
        hasResults: true,
        results: data
    }),

    clearResults: () => set({
        invoiceId: null,
        isAnalyzing: false,
        hasResults: false,
        results: null
    })
}));
