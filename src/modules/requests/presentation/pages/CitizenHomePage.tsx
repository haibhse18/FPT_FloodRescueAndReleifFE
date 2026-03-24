"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { GetCurrentUserUseCase } from "@/modules/auth/application/getCurrentUser.usecase";
import { authRepository } from "@/modules/auth/infrastructure/auth.repository.impl";
import { requestRepository } from "@/modules/requests/infrastructure/request.repository.impl";

const getCurrentUserUseCase = new GetCurrentUserUseCase(authRepository);

const ACTIVE_REQUEST_STATUSES = new Set([
  "SUBMITTED",
  "VERIFIED",
  "IN_PROGRESS",
  "FULFILLED",
  "PARTIALLY_FULFILLED",
  "ACCEPTED",
]);

function normalizeStatus(status: unknown): string {
  return String(status ?? "")
    .trim()
    .replace(/\s+/g, "_")
    .toUpperCase();
}

export default function CitizenHomePage() {
  const [userName, setUserName] = useState("Người dùng");
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingActiveRequest, setIsCheckingActiveRequest] = useState(true);
  const [activeRequest, setActiveRequest] = useState<{
    id: string;
    status: string;
  } | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await getCurrentUserUseCase.execute();
        setUserName(user.displayName || "Người dùng");
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const checkActiveRequest = async () => {
      try {
        const requests = await requestRepository.getMyRequests({ page: 1, limit: 20 });
        const sorted = [...(requests || [])].sort((a: any, b: any) => {
          const aTime = new Date(a?.createdAt || 0).getTime();
          const bTime = new Date(b?.createdAt || 0).getTime();
          return bTime - aTime;
        });

        const active = sorted.find((req: any) =>
          ACTIVE_REQUEST_STATUSES.has(normalizeStatus(req?.status)),
        );

        const activeRecord = active as
          | { requestId?: string; _id?: string; id?: string; status?: string }
          | undefined;
        const id = activeRecord?.requestId || activeRecord?._id || activeRecord?.id;
        if (id) {
          setActiveRequest({
            id: String(id),
            status: normalizeStatus(activeRecord?.status),
          });
        } else {
          setActiveRequest(null);
        }
      } catch {
        // Keep SOS in default emergency mode if API fails.
        setActiveRequest(null);
      } finally {
        setIsCheckingActiveRequest(false);
      }
    };

    fetchUser();
    checkActiveRequest();
  }, []);

  const quickActions = [
    {
      id: "danger",
      title: "Đăng ký tình nguyện",
      subtitle: "Tham gia hỗ trợ cộng đồng",
      href: "/volunteer",
      color:
        "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500",
    },
    {
      id: "guide",
      title: "Hướng dẫn an toàn",
      subtitle: "Kỹ năng sinh tồn",
      href: "/guide",
      color:
        "bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-500 hover:to-blue-600",
    },
  ];

  const quickActionCardBaseClass =
    "w-full min-h-[128px] lg:min-h-[156px] rounded-2xl p-6 lg:p-8 border border-white/15 flex items-center justify-center shadow-lg transition-all group";

  return (
    <>
      {/* Fixed Header Banner */}
      <header className="sticky top-0 z-50 p-4 lg:p-6 border-b border-white/10 bg-gradient-to-br from-[var(--color-accent)]/10 to-transparent backdrop-blur-md">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <h1 className="text-white text-xl lg:text-2xl font-extrabold tracking-tight leading-tight uppercase">
                Cứu hộ Lũ lụt
              </h1>
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full w-fit">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                <span className="text-xs font-semibold text-white">
                  Hệ thống trực tuyến
                </span>
              </div>
            </div>
            {/* User Greeting */}
            <div className="flex items-center gap-2 sm:gap-4">
              <Link
                href="/profile"
                className="flex items-center gap-3 rounded-xl px-1 py-1 hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF7700]/50"
                aria-label="Mở trang hồ sơ cá nhân"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-xs text-white/60">Xin chào,</p>
                  <p className="text-sm font-bold text-white truncate max-w-[140px]">
                    {isLoading ?
                      <span className="inline-block w-24 h-4 bg-white/20 rounded animate-pulse" />
                      : userName}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#FF7700]/30 border-2 border-[#FF7700]/50 flex items-center justify-center text-lg font-bold text-white flex-shrink-0">
                  {isLoading ? "?" : userName.charAt(0).toUpperCase()}
                </div>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="pb-24 lg:pb-0 overflow-auto">
        {/* Background Pattern - Removed as it is now in layout */}

        <div className="relative p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
          {/* Hero SOS Section */}
          <div className="flex flex-col items-center justify-center py-8 lg:py-12">
            <div className="text-center mb-8">
              {/* Mobile greeting (hidden on sm+) */}
              <p className="text-white/60 text-sm mb-1 sm:hidden">
                Xin chào,{" "}
                <span className="text-white font-bold">
                  {isLoading ? "..." : userName}
                </span>
              </p>
              <p className="text-[#FF7700] font-bold text-2xl lg:text-3xl mb-2">
                {isCheckingActiveRequest
                  ? "ĐANG KIỂM TRA YÊU CẦU"
                  : activeRequest
                    ? "YÊU CẦU ĐANG ĐƯỢC XỬ LÝ"
                    : "CẦN HỖ TRỢ NGAY?"}
              </p>
              <p className="text-slate-300 text-base lg:text-lg">
                {isCheckingActiveRequest
                  ? "Vui lòng đợi hệ thống kiểm tra yêu cầu hiện tại của bạn"
                  : activeRequest
                    ? "Nhấn nút bên dưới để theo dõi yêu cầu cứu hộ gần nhất của bạn"
                    : "Bấm nút bên dưới để gửi tín hiệu cấp cứu và vị trí của bạn"}
              </p>
            </div>

            {/* SOS Button with Ripple Effect */}
            <div
              className="relative flex items-center justify-center"
              role="group"
              aria-label="Nút cứu hộ khẩn cấp"
            >
              {isCheckingActiveRequest ? (
                <>
                  <div
                    className="absolute w-64 h-64 lg:w-80 lg:h-80 rounded-full border border-slate-400/20 animate-ping-slow"
                    aria-hidden="true"
                  ></div>
                  <div
                    className="relative w-48 h-48 lg:w-56 lg:h-56 rounded-full bg-slate-600/70 border-4 border-white/70 flex flex-col items-center justify-center gap-2 z-20"
                    aria-live="polite"
                  >
                    <div className="w-8 h-8 border-4 border-white/80 border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm lg:text-base font-black tracking-wide text-white text-center px-4">
                      ĐANG KIỂM TRA
                    </span>
                  </div>
                </>
              ) : activeRequest ? (
                <>
                  <div
                    className="absolute w-64 h-64 lg:w-80 lg:h-80 rounded-full border border-orange-400/30 animate-ping-slow"
                    aria-hidden="true"
                  ></div>
                  <div
                    className="absolute w-52 h-52 lg:w-64 lg:h-64 rounded-full border border-orange-400/50 animate-ping"
                    style={{ animationDuration: "3s", animationDelay: "1s" }}
                    aria-hidden="true"
                  ></div>

                  <Link
                    href={`/history/${activeRequest.id}`}
                    className="relative w-48 h-48 lg:w-56 lg:h-56 rounded-full bg-[#FF7700] border-4 border-white/80 shadow-[0_0_40px_rgba(255,119,0,0.6)] flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform z-20 hover:bg-orange-500 focus:outline-none focus:ring-4 focus:ring-orange-400/50"
                    aria-label="Theo dõi yêu cầu cứu hộ đang xử lý"
                  >
                    <span className="text-sm lg:text-base font-black tracking-wide text-white text-center leading-tight px-3">
                      YÊU CẦU
                      <br />
                      ĐANG XỬ LÝ
                    </span>
                    <span className="text-[11px] font-bold text-white/75 tracking-wide uppercase">
                      Theo dõi ngay
                    </span>
                  </Link>
                </>
              ) : (
                <>
                  <div
                    className="absolute w-64 h-64 lg:w-80 lg:h-80 rounded-full border border-red-500/30 animate-ping-slow"
                    aria-hidden="true"
                  ></div>
                  <div
                    className="absolute w-52 h-52 lg:w-64 lg:h-64 rounded-full border border-red-500/50 animate-ping"
                    style={{ animationDuration: "3s", animationDelay: "1s" }}
                    aria-hidden="true"
                  ></div>

                  <Link
                    href="/request"
                    className="sos-pulse relative w-48 h-48 lg:w-56 lg:h-56 rounded-full bg-[#FF3535] border-4 border-white shadow-[0_0_40px_rgba(255,53,53,0.7)] flex flex-col items-center justify-center gap-2 active:scale-95 transition-transform z-20 group cursor-pointer hover:bg-red-600 focus:outline-none focus:ring-4 focus:ring-red-500/50"
                    aria-label="Gửi yêu cầu"
                  >
                    <span className="text-xl lg:text-2xl font-black tracking-wider text-white">
                      GỬI YÊU CẦU
                    </span>
                    <span className="text-sm lg:text-base font-bold tracking-widest text-white/90">
                      Cứu hộ / Cứu trợ
                    </span>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Quick Options Section */}
          <section
            className="space-y-4 w-full"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 items-stretch w-full">
              {quickActions.map((action) => {
                const content = (
                  <>
                    <div className="flex flex-col flex-1 items-center justify-center text-center">
                      <span className="text-white font-extrabold text-xl lg:text-2xl leading-tight tracking-tight">
                        {action.title}
                      </span>
                      <span className="text-white/90 text-base lg:text-lg font-medium mt-2">
                        {action.subtitle}
                      </span>
                    </div>
                  </>
                );

                if (!action.href) {
                  return (
                    <button
                      key={action.id}
                      type="button"
                      className={`${action.color} ${quickActionCardBaseClass} cursor-default focus:outline-none`}
                      aria-label={`${action.title}: ${action.subtitle}`}
                    >
                      {content}
                    </button>
                  );
                }

                return (
                  <Link
                    key={action.id}
                    href={action.href}
                    className={`${action.color} ${quickActionCardBaseClass} cursor-pointer hover:-translate-y-0.5 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[#FF7700]/50`}
                    aria-label={`${action.title}: ${action.subtitle}`}
                  >
                    {content}
                  </Link>
                );
              })}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
