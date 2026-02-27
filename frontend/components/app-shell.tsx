export function AppShell({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-[#1a1a1a] text-white flex flex-col">
            <header className="px-6 py-4 border-b border-[#333] flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold">GST</div>
                    <span className="font-semibold text-lg tracking-wide">Intelligence Admin</span>
                </div>
            </header>
            <main className="flex-1 p-6 md:p-8">
                {children}
            </main>
        </div>
    );
}
