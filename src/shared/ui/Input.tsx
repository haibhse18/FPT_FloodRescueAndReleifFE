interface InputProps {
    id: string;
    name?: string;
    type?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    label?: string;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    error?: string;
    className?: string;
}

export default function Input({
    id,
    name,
    type = "text",
    value,
    onChange,
    label,
    placeholder,
    required = false,
    disabled = false,
    error,
    className = "",
}: InputProps) {
    return (
        <div className={className}>
            {label && (
                <label
                    htmlFor={id}
                    className="block text-sm font-medium text-gray-700 mb-2"
                >
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
            <input
                id={id}
                name={name || id}
                type={type}
                value={value}
                onChange={onChange}
                required={required}
                disabled={disabled}
                placeholder={placeholder}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition ${error ? "border-red-500" : "border-gray-300"
                    } ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}`}
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
    );
}
