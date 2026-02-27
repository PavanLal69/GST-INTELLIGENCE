import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "#020617", // slate-950
                primary: "#4f46e5", // indigo-600
                "primary-glow": "#818cf8", // indigo-400
                danger: "#e11d48", // rose-600
                "danger-glow": "#fb7185", // rose-400
                warning: "#ea580c", // orange-600
                "warning-glow": "#fb923c", // orange-400
                success: "#059669", // emerald-600
                "success-glow": "#34d399", // emerald-400
            },
            boxShadow: {
                'glow-primary': '0 0 15px -3px rgba(99, 102, 241, 0.4)',
                'glow-danger': '0 0 15px -3px rgba(225, 29, 72, 0.4)',
                'glow-success': '0 0 15px -3px rgba(5, 150, 105, 0.4)',
                'glow-warning': '0 0 15px -3px rgba(234, 88, 12, 0.4)',
            },
            animation: {
                'spin-slow': 'spin 8s linear infinite',
                'spin-reverse-slow': 'spin 6s linear infinite reverse',
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }
        },
    },
    plugins: [],
};
export default config;
