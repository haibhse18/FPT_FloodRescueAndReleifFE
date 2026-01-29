export default function FormDivider({ text = "Hoặc" }: { text?: string }) {
    return (
        <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[var(--color-border)]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-[var(--color-text-muted)]">{text}</span>
            </div>
        </div>
    );
}
