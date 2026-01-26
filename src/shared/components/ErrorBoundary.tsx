"use client";

import React, { Component, ReactNode } from "react";

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("Error Boundary caught an error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                this.props.fallback || (
                    <div className="min-h-screen bg-black flex items-center justify-center p-4">
                        <div className="bg-white/5 border border-red-500/30 rounded-lg p-8 max-w-md w-full">
                            <div className="text-center">
                                <div className="text-6xl mb-4">⚠️</div>
                                <h1 className="text-2xl font-bold text-white mb-4">
                                    Đã xảy ra lỗi
                                </h1>
                                <p className="text-gray-300 mb-6">
                                    Xin lỗi, có lỗi xảy ra trong quá trình xử lý. Vui lòng thử lại sau.
                                </p>
                                {this.state.error && (
                                    <details className="text-left mb-6">
                                        <summary className="text-red-400 cursor-pointer mb-2">
                                            Chi tiết lỗi
                                        </summary>
                                        <pre className="text-xs text-gray-400 bg-black/30 p-4 rounded overflow-auto">
                                            {this.state.error.message}
                                        </pre>
                                    </details>
                                )}
                                <button
                                    onClick={() => window.location.reload()}
                                    className="px-6 py-3 bg-primary hover:bg-orange-600 text-white font-semibold rounded-lg transition duration-200"
                                >
                                    Tải lại trang
                                </button>
                            </div>
                        </div>
                    </div>
                )
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
