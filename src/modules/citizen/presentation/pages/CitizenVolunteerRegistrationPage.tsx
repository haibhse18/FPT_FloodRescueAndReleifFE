"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { teamsApi } from "@/modules/teams/infrastructure/team.api";

type ApplicationStatus = "PENDING" | "APPROVED" | "REJECTED" | "WITHDRAWN";

type TeamApplication = {
    _id?: string;
    id?: string;
    status?: string;
    motivation?: string;
    submittedPhoneNumber?: string;
    createdAt?: string;
};

const STATUS_META: Record<
    ApplicationStatus,
    { text: string; className: string; hint: string }
> = {
    PENDING: {
        text: "Đang chờ duyệt",
        className: "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30",
        hint: "Đơn của bạn đang được xem xét. Vui lòng chờ phản hồi từ điều phối viên.",
    },
    APPROVED: {
        text: "Đã duyệt",
        className: "bg-green-500/20 text-green-300 border border-green-500/30",
        hint: "Bạn đã được duyệt tham gia. Hệ thống sẽ cập nhật vai trò khi được phân công.",
    },
    REJECTED: {
        text: "Bị từ chối",
        className: "bg-red-500/20 text-red-300 border border-red-500/30",
        hint: "Bạn có thể cập nhật thông tin và gửi lại đơn mới.",
    },
    WITHDRAWN: {
        text: "Đã rút đơn",
        className: "bg-slate-500/20 text-slate-300 border border-slate-500/30",
        hint: "Bạn đã rút đơn trước đó và có thể tạo đơn mới.",
    },
};

function normalizeStatus(status: unknown): ApplicationStatus | null {
    const value = String(status ?? "").trim().toUpperCase();
    if (value === "PENDING") return "PENDING";
    if (value === "APPROVED") return "APPROVED";
    if (value === "REJECTED") return "REJECTED";
    if (value === "WITHDRAWN") return "WITHDRAWN";
    return null;
}

export default function CitizenVolunteerRegistrationPage() {
    const { toast } = useToast();

    const [motivation, setMotivation] = useState("");
    const [confirmPhoneNumber, setConfirmPhoneNumber] = useState("");
    const [applications, setApplications] = useState<TeamApplication[]>([]);
    const [latestApplication, setLatestApplication] = useState<TeamApplication | null>(null);
    const [isLoadingStatus, setIsLoadingStatus] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isWithdrawing, setIsWithdrawing] = useState(false);
    const [historyFilter, setHistoryFilter] = useState<"ALL" | ApplicationStatus>("ALL");

    const latestStatus = useMemo(
        () => normalizeStatus(latestApplication?.status),
        [latestApplication],
    );

    const hasPendingApplication = latestStatus === "PENDING";

    const latestApplicationId = latestApplication?._id || latestApplication?.id || "";

    const fetchMyApplications = async () => {
        setIsLoadingStatus(true);
        try {
            const response = await teamsApi.getMyTeamApplications({ page: 1, limit: 20 });
            const result = response as any;
            const items = Array.isArray(result)
                ? result
                : Array.isArray(result?.data)
                    ? result.data
                    : [];

            const sorted = [...items].sort((a: any, b: any) => {
                const aTime = new Date(a?.createdAt || 0).getTime();
                const bTime = new Date(b?.createdAt || 0).getTime();
                return bTime - aTime;
            });

            setApplications(sorted as TeamApplication[]);
            setLatestApplication((sorted[0] as TeamApplication | undefined) || null);
        } catch {
            setApplications([]);
            setLatestApplication(null);
        } finally {
            setIsLoadingStatus(false);
        }
    };

    useEffect(() => {
        fetchMyApplications();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleWithdrawLatest = async () => {
        if (!latestApplicationId || !hasPendingApplication || isWithdrawing) return;

        setIsWithdrawing(true);
        try {
            await teamsApi.withdrawTeamApplication(latestApplicationId);
            toast({
                title: "Đã rút đơn",
                description: "Đơn tình nguyện của bạn đã được rút thành công.",
            });
            await fetchMyApplications();
        } catch (error: any) {
            const message =
                error?.response?.data?.message ||
                error?.message ||
                "Không thể rút đơn lúc này. Vui lòng thử lại.";

            toast({
                variant: "destructive",
                title: "Rút đơn thất bại",
                description: Array.isArray(message) ? message.join(", ") : message,
            });
        } finally {
            setIsWithdrawing(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const trimmedMotivation = motivation.trim();
        const trimmedPhone = confirmPhoneNumber.trim();

        if (hasPendingApplication) {
            toast({
                variant: "destructive",
                title: "Đơn đang chờ duyệt",
                description: "Bạn đang có một đơn tình nguyện chờ duyệt, chưa thể tạo đơn mới.",
            });
            return;
        }

        if (!trimmedMotivation) {
            toast({
                variant: "destructive",
                title: "Thiếu thông tin",
                description: "Vui lòng nhập lý do đăng ký tình nguyện.",
            });
            return;
        }

        if (trimmedMotivation.length < 20) {
            toast({
                variant: "destructive",
                title: "Nội dung quá ngắn",
                description: "Lý do tham gia cần tối thiểu 20 ký tự để đội ngũ có thể đánh giá.",
            });
            return;
        }

        setIsSubmitting(true);
        try {
            await teamsApi.submitTeamApplication({
                motivation: trimmedMotivation,
                confirmPhoneNumber: trimmedPhone || undefined,
            });

            toast({
                title: "Đăng ký thành công",
                description: "Đơn tình nguyện đã được gửi. Bạn có thể theo dõi trạng thái ngay trên trang này.",
            });

            setMotivation("");
            setConfirmPhoneNumber("");
            await fetchMyApplications();
        } catch (error: any) {
            const message =
                error?.response?.data?.message ||
                error?.message ||
                "Không thể gửi đơn tình nguyện. Vui lòng thử lại.";

            toast({
                variant: "destructive",
                title: "Gửi đơn thất bại",
                description: Array.isArray(message) ? message.join(", ") : message,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredApplications = applications.filter((app) => {
        if (historyFilter === "ALL") return true;
        return normalizeStatus(app.status) === historyFilter;
    });

    return (
        <div className="pb-24 lg:pb-8 overflow-auto">
            <div className="relative p-4 lg:p-8 space-y-6 max-w-5xl mx-auto">
                <section className="bg-white/5 border border-white/10 rounded-2xl p-6 lg:p-8">
                    <div className="flex flex-col gap-2 mb-6">
                        <h1 className="text-white text-2xl lg:text-3xl font-extrabold tracking-tight uppercase">
                            Đăng ký tình nguyện
                        </h1>
                        <p className="text-gray-300 text-sm lg:text-base">
                            Tham gia mạng lưới hỗ trợ cứu hộ cộng đồng khi có thiên tai.
                        </p>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 lg:p-5 mb-6">
                        <p className="text-xs uppercase tracking-wider text-gray-400 mb-2 font-bold">
                            Trạng thái đơn gần nhất
                        </p>
                        {isLoadingStatus ? (
                            <p className="text-gray-300 text-sm">Đang tải trạng thái...</p>
                        ) : latestStatus ? (
                            <div className="space-y-2">
                                <span className={`inline-flex px-3 py-1 rounded-lg text-sm font-bold ${STATUS_META[latestStatus].className}`}>
                                    {STATUS_META[latestStatus].text}
                                </span>
                                <p className="text-gray-300 text-sm">{STATUS_META[latestStatus].hint}</p>
                                {hasPendingApplication && latestApplicationId && (
                                    <button
                                        type="button"
                                        onClick={handleWithdrawLatest}
                                        disabled={isWithdrawing}
                                        className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300 font-semibold text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        {isWithdrawing ? "ĐANG RÚT ĐƠN..." : "RÚT ĐƠN NÀY"}
                                    </button>
                                )}
                            </div>
                        ) : (
                            <p className="text-gray-300 text-sm">Bạn chưa gửi đơn tình nguyện nào.</p>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label htmlFor="motivation" className="text-white text-sm font-semibold">
                                Lý do muốn tham gia
                            </label>
                            <textarea
                                id="motivation"
                                value={motivation}
                                onChange={(e) => setMotivation(e.target.value)}
                                placeholder="Chia sẻ kinh nghiệm, kỹ năng, khu vực bạn có thể hỗ trợ..."
                                className="w-full min-h-[140px] bg-black/20 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF7700]/40 focus:border-[#FF7700]"
                                maxLength={500}
                                disabled={isSubmitting || hasPendingApplication}
                            />
                            <p className="text-xs text-gray-400">
                                {motivation.trim().length}/500 ký tự
                            </p>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="phone" className="text-white text-sm font-semibold">
                                Số điện thoại xác nhận (tuỳ chọn)
                            </label>
                            <input
                                id="phone"
                                type="tel"
                                value={confirmPhoneNumber}
                                onChange={(e) => setConfirmPhoneNumber(e.target.value)}
                                placeholder="Ví dụ: 0901234567"
                                className="w-full h-12 bg-black/20 border border-white/10 rounded-xl px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF7700]/40 focus:border-[#FF7700]"
                                disabled={isSubmitting || hasPendingApplication}
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 pt-2">
                            <button
                                type="submit"
                                disabled={isSubmitting || hasPendingApplication}
                                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? "ĐANG GỬI..." : "GỬI ĐƠN TÌNH NGUYỆN"}
                            </button>

                            <Link
                                href="/home"
                                className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white font-semibold transition-all"
                            >
                                Quay về trang chủ
                            </Link>
                        </div>
                    </form>
                </section>

                <section className="bg-white/5 border border-white/10 rounded-2xl p-6 lg:p-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                        <h2 className="text-white text-xl font-bold">Lịch sử đơn tình nguyện</h2>
                        <div className="flex items-center gap-2 flex-wrap">
                            {(["ALL", "PENDING", "APPROVED", "REJECTED", "WITHDRAWN"] as const).map((status) => (
                                <button
                                    key={status}
                                    type="button"
                                    onClick={() => setHistoryFilter(status)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${historyFilter === status
                                        ? "bg-[#FF7700] text-white"
                                        : "bg-white/5 text-gray-300 hover:bg-white/10"
                                        }`}
                                >
                                    {status === "ALL" ? "TẤT CẢ" : STATUS_META[status].text.toUpperCase()}
                                </button>
                            ))}
                        </div>
                    </div>

                    {isLoadingStatus ? (
                        <p className="text-gray-300 text-sm">Đang tải lịch sử...</p>
                    ) : filteredApplications.length === 0 ? (
                        <p className="text-gray-300 text-sm">Không có đơn phù hợp với bộ lọc hiện tại.</p>
                    ) : (
                        <div className="space-y-3">
                            {filteredApplications.map((app, idx) => {
                                const status = normalizeStatus(app.status);
                                const statusMeta = status ? STATUS_META[status] : null;
                                const createdAtLabel = app.createdAt
                                    ? new Date(app.createdAt).toLocaleString("vi-VN")
                                    : "Không xác định";

                                return (
                                    <div
                                        key={(app._id || app.id || "unknown") + String(idx)}
                                        className="bg-black/20 border border-white/10 rounded-xl p-4"
                                    >
                                        <div className="flex items-center justify-between gap-2 mb-2">
                                            <span className="text-xs text-gray-400 font-mono">
                                                #{String(app._id || app.id || "N/A").slice(-8).toUpperCase()}
                                            </span>
                                            {statusMeta ? (
                                                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${statusMeta.className}`}>
                                                    {statusMeta.text}
                                                </span>
                                            ) : (
                                                <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white/10 text-gray-300">
                                                    Không xác định
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-200 mb-1 line-clamp-2">
                                            {app.motivation || "Không có nội dung"}
                                        </p>
                                        <p className="text-xs text-gray-400">Gửi lúc: {createdAtLabel}</p>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
