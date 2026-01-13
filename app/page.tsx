import Link from "next/link";

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-6 md:p-24">
            <div className="z-10 max-w-3xl w-full text-center space-y-8">
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                    FPT Flood Rescue and Relief
                </h1>
                <p className="text-lg md:text-xl text-gray-300 mb-8">
                    Hệ thống quản lý cứu trợ lũ lụt
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-12">
                    <Link
                        href="/login"
                        className="w-full sm:w-auto px-8 py-3 bg-primary hover:bg-orange-600 text-white font-semibold rounded-lg transition duration-200 shadow-md hover:shadow-lg"
                    >
                        Đăng Nhập
                    </Link>
                    <Link
                        href="/register"
                        className="w-full sm:w-auto px-8 py-3 bg-white hover:bg-gray-100 text-secondary font-semibold rounded-lg transition duration-200 shadow-md hover:shadow-lg"
                    >
                        Đăng Ký
                    </Link>
                </div>
            </div>
        </main>
    );
}
