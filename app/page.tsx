import Button from "@/app/components/ui/Button";

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
                    <Button href="/login" variant="primary" size="lg">
                        Đăng Nhập
                    </Button>
                    <Button href="/register" variant="secondary" size="lg">
                        Đăng Ký
                    </Button>
                </div>
            </div>
        </main>
    );
}
