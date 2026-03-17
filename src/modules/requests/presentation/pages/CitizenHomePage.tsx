"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import "@openmapvn/openmapvn-gl/dist/maplibre-gl.css";
import { GetCurrentUserUseCase } from "@/modules/auth/application/getCurrentUser.usecase";
import { authRepository } from "@/modules/auth/infrastructure/auth.repository.impl";
import { requestRepository } from "@/modules/requests/infrastructure/request.repository.impl";
import NotificationBell from "@/modules/notifications/presentation/components/NotificationBell";

// Dynamic import cho OpenMap để tránh SSR issues
const OpenMap = dynamic(
  () => import("@/modules/map/presentation/components/OpenMap"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-48 bg-slate-300 rounded-lg animate-pulse flex items-center justify-center text-slate-500">
        Đang tải bản đồ...
      </div>
    ),
  },
);

const getCurrentUserUseCase = new GetCurrentUserUseCase(authRepository);

const ACTIVE_REQUEST_STATUSES = new Set([
  "SUBMITTED",
  "VERIFIED",
  "IN_PROGRESS",
  "PARTIALLY_FULFILLED",
  "ACCEPTED",
]);

function normalizeStatus(status: unknown): string {
  return String(status ?? "")
    .trim()
    .replace(/\s+/g, "_")
    .toUpperCase();
}

// Emergency contacts configuration
const EMERGENCY_CONTACTS = [
  { label: "Cấp cứu", number: "115", icon: "💊", ariaLabel: "Gọi cấp cứu 115" },
  {
    label: "Cảnh sát",
    number: "113",
    icon: "👮",
    ariaLabel: "Gọi cảnh sát 113",
  },
  { label: "Cứu hỏa", number: "114", icon: "🔥", ariaLabel: "Gọi cứu hỏa 114" },
  {
    label: "Cứu nạn",
    number: "1900",
    icon: "⛑️",
    ariaLabel: "Gọi cứu nạn 1900",
  },
] as const;

export default function CitizenHomePage() {
  const [userName, setUserName] = useState("Người dùng");
  const [isLoading, setIsLoading] = useState(true);
  const [currentLocation, setCurrentLocation] = useState("Đang tải vị trí...");
  const [coordinates, setCoordinates] = useState<{
    lat: number;
    lon: number;
  } | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
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
      }
    };

    fetchUser();
    fetchLocation();
    checkActiveRequest();
  }, []);

  const fetchLocation = async () => {
    setIsLoadingLocation(true);
    setLocationError(null);

    if (!("geolocation" in navigator)) {
      setLocationError("Trình duyệt không hỗ trợ định vị");
      setCurrentLocation("Không khả dụng");
      setIsLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCoordinates({ lat: latitude, lon: longitude });

        try {
          // Proxy qua Next.js để tránh CORS (Nominatim)
          const response = await fetch(
            `/api/reverse-geocode?lat=${latitude}&lon=${longitude}`,
          );
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          const data = await response.json();
          // Nominatim field order: road > suburb > city_district > city > county > state
          const location =
            data.address?.road ||
            data.address?.suburb ||
            data.address?.city_district ||
            data.address?.city ||
            data.address?.county ||
            data.address?.state ||
            data.display_name ||
            `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          setCurrentLocation(location);
        } catch (error) {
          if (error instanceof Error && error.name === "AbortError") {
            setLocationError("Lấy địa chỉ hết thời gian chờ");
          }
          setCurrentLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        } finally {
          setIsLoadingLocation(false);
        }
      },
      (error) => {
        setIsLoadingLocation(false);
        setLocationError(error.message || "Không thể truy cập vị trí");
        setCurrentLocation("Không khả dụng");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  };

  const quickActions = [
    {
      id: "rescue",
      title: "Yêu cầu cứu trợ",
      subtitle: "Thực phẩm, thuốc men",
      href: "/request?type=rescue",
      color:
        "bg-gradient-to-r from-[#FF7A1A] to-[#FF8F3A] hover:from-[#FF8A2C] hover:to-[#FFA24F]",
    },
    {
      id: "danger",
      title: "Đăng ký tình nguyện",
      subtitle: "Tham gia hỗ trợ cộng đồng",
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
            {/* User Greeting and Bell */}
            <div className="flex items-center gap-2 sm:gap-4">
              <NotificationBell />
              <div className="flex items-center gap-3">
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
              </div>
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
                {activeRequest ? "YÊU CẦU ĐANG ĐƯỢC XỬ LÝ" : "CẦN HỖ TRỢ NGAY?"}
              </p>
              <p className="text-slate-300 text-base lg:text-lg">
                {activeRequest
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
              {activeRequest ? (
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
                    aria-label="Gửi yêu cầu cứu hộ khẩn cấp"
                  >
                    <span className="text-2xl lg:text-3xl font-black tracking-wider text-white">
                      CỨU HỘ
                    </span>
                    <span className="text-base lg:text-lg font-bold tracking-widest text-white">
                      KHẨN CẤP
                    </span>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Quick Options Section */}
          <section
            className="space-y-4"
            aria-labelledby="quick-actions-heading"
          >
            <h3
              id="quick-actions-heading"
              className="text-white font-bold text-xl lg:text-2xl px-2"
            >
              Lựa chọn nhanh
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {quickActions.map((action) => {
                const content = (
                  <>
                    <div className="flex flex-col flex-1 items-start justify-center min-h-[68px]">
                      <span className="text-white font-extrabold text-lg lg:text-xl leading-tight tracking-tight">
                        {action.title}
                      </span>
                      <span className="text-white/90 text-sm lg:text-[15px] font-medium mt-1">
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
                      className={`${action.color} rounded-xl p-5 lg:p-6 border border-white/15 flex items-center shadow-lg transition-all cursor-default group focus:outline-none`}
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
                    className={`${action.color} rounded-xl p-5 lg:p-6 border border-white/15 flex items-center shadow-lg transition-all cursor-pointer group hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[#FF7700]/50`}
                    aria-label={`${action.title}: ${action.subtitle}`}
                  >
                    {content}
                  </Link>
                );
              })}
            </div>
          </section>

          {/* Location Bar with Mini Map */}
          <div className="bg-slate-200 rounded-xl p-5 shadow-lg border-l-4 border-[#FF7700]">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2 text-slate-600">
                <span className="text-xl" aria-hidden="true">
                  📍
                </span>
                <span className="text-sm font-bold uppercase tracking-wide">
                  Vị trí hiện tại
                </span>
              </div>
              <button
                onClick={fetchLocation}
                disabled={isLoadingLocation}
                className="text-[#FF3535] text-sm font-bold uppercase hover:underline disabled:opacity-50 disabled:cursor-not-allowed transition-opacity focus:outline-none focus:ring-2 focus:ring-[#FF7700]/50 rounded px-2 py-1"
                aria-label="Cập nhật vị trí hiện tại"
              >
                {isLoadingLocation ? "Đang tải..." : "Cập nhật"}
              </button>
            </div>
            {locationError && (
              <div className="text-xs text-red-600 mb-2 flex items-center gap-1">
                <span>⚠️</span>
                <span>{locationError}</span>
              </div>
            )}
            <p className="text-slate-800 text-lg font-bold mb-2">
              {isLoadingLocation ?
                <span className="inline-flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-slate-800 border-t-transparent rounded-full animate-spin"></span>
                  Đang tải...
                </span>
                : currentLocation}
            </p>
            {coordinates && (
              <div className="text-xs text-slate-500 font-mono mb-3">
                Lat: {coordinates.lat.toFixed(4)} • Long:{" "}
                {coordinates.lon.toFixed(4)}
              </div>
            )}

            {/* Mini Map */}
            {coordinates && (
              <div className="mt-4 h-64 rounded-lg overflow-hidden border-2 border-slate-300 shadow-inner">
                <OpenMap
                  latitude={coordinates.lat}
                  longitude={coordinates.lon}
                  address={currentLocation}
                />
              </div>
            )}
          </div>

          {/* Emergency Contacts */}
          <section
            className="bg-white/5 border border-white/10 rounded-xl p-6"
            aria-labelledby="emergency-contacts-heading"
          >
            <h2
              id="emergency-contacts-heading"
              className="text-white font-bold text-xl mb-4 flex items-center gap-2"
            >
              <span aria-hidden="true">📞</span>
              <span>Liên hệ khẩn cấp</span>
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {EMERGENCY_CONTACTS.map((contact) => (
                <a
                  key={contact.number}
                  href={`tel:${contact.number}`}
                  className="bg-white/5 border border-white/10 rounded-xl p-4 text-center hover:bg-white/10 hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-[#FF7700]/50"
                  aria-label={contact.ariaLabel}
                >
                  <div className="text-3xl mb-2" aria-hidden="true">
                    {contact.icon}
                  </div>
                  <div className="text-white font-bold text-lg mb-1">
                    {contact.number}
                  </div>
                  <div className="text-gray-400 text-xs">{contact.label}</div>
                </a>
              ))}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
