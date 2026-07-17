export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-stone-50 text-slate-900 antialiased dark:bg-[#0B0D12] dark:text-slate-100">
            {children}
        </div>
    );
}
