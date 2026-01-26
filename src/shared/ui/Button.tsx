import Link from "next/link";
import { ReactNode } from "react";

interface ButtonProps {
    children: ReactNode;
    onClick?: () => void;
    href?: string;
    variant?: "primary" | "secondary" | "danger" | "ghost";
    size?: "sm" | "md" | "lg";
    fullWidth?: boolean;
    disabled?: boolean;
    type?: "button" | "submit" | "reset";
    className?: string;
}

export default function Button({
    children,
    onClick,
    href,
    variant = "primary",
    size = "md",
    fullWidth = false,
    disabled = false,
    type = "button",
    className = "",
}: ButtonProps) {
    const baseClasses = "font-semibold rounded-lg transition duration-200 shadow-md hover:shadow-lg inline-flex items-center justify-center gap-2";

    const variantClasses = {
        primary: "bg-primary hover:bg-orange-600 text-white",
        secondary: "bg-white hover:bg-gray-100 text-secondary",
        danger: "bg-red-600 hover:bg-red-700 text-white",
        ghost: "bg-white/5 hover:bg-white/10 text-white border border-white/10",
    };

    const sizeClasses = {
        sm: "px-4 py-2 text-sm",
        md: "px-6 py-3 text-base",
        lg: "px-8 py-4 text-lg",
    };

    const widthClass = fullWidth ? "w-full" : "w-auto";

    const finalClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`;

    if (href) {
        return (
            <Link href={href} className={finalClasses}>
                {children}
            </Link>
        );
    }

    return (
        <button type={type} onClick={onClick} disabled={disabled} className={finalClasses}>
            {children}
        </button>
    );
}
