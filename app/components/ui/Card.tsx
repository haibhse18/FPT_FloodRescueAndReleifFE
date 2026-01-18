import { ReactNode } from "react";

interface CardProps {
    children: ReactNode;
    className?: string;
    onClick?: () => void;
    hover?: boolean;
}

export default function Card({ children, className = "", onClick, hover = false }: CardProps) {
    const baseClasses = "bg-white/5 border border-white/10 rounded-xl p-5";
    const hoverClasses = hover ? "hover:bg-white/10 transition-all duration-200 hover:scale-[1.02] cursor-pointer" : "";
    const clickClasses = onClick ? "cursor-pointer" : "";

    return (
        <div
            className={`${baseClasses} ${hoverClasses} ${clickClasses} ${className}`}
            onClick={onClick}
        >
            {children}
        </div>
    );
}
