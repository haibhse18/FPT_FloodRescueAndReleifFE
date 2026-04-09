"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Heart, ShieldCheck, MapPin, Crosshair } from "phosphor-react";
import { GetCurrentUserUseCase } from "@/modules/auth/application/getCurrentUser.usecase";
import { authRepository } from "@/modules/auth/infrastructure/auth.repository.impl";
import { requestRepository } from "@/modules/requests/infrastructure/request.repository.impl";

const getCurrentUserUseCase = new GetCurrentUserUseCase(authRepository);

const OpenMap = dynamic(
  () => import("@/modules/map/presentation/components/OpenMap"),
  {
    ssr: false,
    loading: () => (
      <div className="h-[300px] w-full bg-[#0f2f44]/70 border border-white/20 rounded-lg flex items-center justify-center">
        <p className="text-white/70 text-sm">Đang tải bản đồ...</p>
      </div>
    ),
  },
);

const ACTIVE_REQUEST_STATUSES = new Set([
  "SUBMITTED",
  "VERIFIED",
  "IN_PROGRESS",
  "FULFILLED",
  "PARTIALLY_FULFILLED",
  "ACCEPTED",
]);

const HOME_BACKGROUND_URL = "/images/flood-rescue2.jpg";

function normalizeStatus(status: unknown): string {
  return String(status ?? "")
    .trim()
    .replace(/\s+/g, "_")
    .toUpperCase();
}

export default function CitizenHomePage() {
  const [userName, setUserName] = useState("Người dùng");
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingActiveRequest, setIsCheckingActiveRequest] = useState(true);
  const [gpsStatus, setGpsStatus] = useState<
    "loading" | "ready" | "unsupported" | "denied" | "error"
  >("loading");
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lon: number } | null>(
    null,
  );
  const [gpsAddress, setGpsAddress] = useState("Đang xác định vị trí...");
  const [activeRequest, setActiveRequest] = useState<{
    id: string;
    status: string;
  } | null>(null);

  const requestCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGpsStatus("unsupported");
      setGpsAddress("Thiết bị không hỗ trợ GPS.");
      return;
    }

    setGpsStatus("loading");
    setGpsAddress("Đang xác định vị trí...");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        setGpsCoords({ lat, lon });
        setGpsStatus("ready");

        try {
          const query = new URLSearchParams({
            lat: String(lat),
            lon: String(lon),
          });
          const response = await fetch(`/api/reverse-geocode?${query.toString()}`);
          const data = await response.json();

          if (response.ok && data?.display_name) {
            setGpsAddress(String(data.display_name));
          } else {
            setGpsAddress(`Vị trí hiện tại: ${lat.toFixed(5)}, ${lon.toFixed(5)}`);
          }
        } catch {
          setGpsAddress(`Vị trí hiện tại: ${lat.toFixed(5)}, ${lon.toFixed(5)}`);
        }
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setGpsStatus("denied");
          setGpsAddress("Bạn đã từ chối quyền truy cập vị trí.");
          return;
        }
        setGpsStatus("error");
        setGpsAddress("Không thể lấy vị trí GPS. Vui lòng thử lại.");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      },
    );
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await getCurrentUserUseCase.execute();
        setUserName(user.displayName || "Người dùng");
        setUserAvatar(user.avatar || null);
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
    requestCurrentLocation();
  }, []);

  const quickActions = [
    {
      id: "danger",
      title: "Đăng ký tình nguyện",
      subtitle: "Tham gia hỗ trợ",
      href: "/volunteer",
      icon: <Heart weight="bold" size={18} />,
    },
    {
      id: "guide",
      title: "Hướng dẫn an toàn",
      subtitle: "Kỹ năng sinh tồn",
      href: "/guide",
      icon: <ShieldCheck weight="bold" size={18} />,
    },
  ];

  const keyframeStyles = `
    @keyframes flare {
      0%, 100% { 
        box-shadow: 0 0 0 0 rgba(255, 119, 0, 0.4), 0 0 20px rgba(255, 119, 0, 0.2);
      }
      50% { 
        box-shadow: 0 0 0 12px rgba(255, 119, 0, 0), 0 0 30px rgba(255, 119, 0, 0.3);
      }
    }
    @keyframes flare-red {
      0%, 100% { 
        box-shadow: 0 0 0 0 rgba(255, 53, 53, 0.4), 0 0 20px rgba(255, 53, 53, 0.2);
      }
      50% { 
        box-shadow: 0 0 0 12px rgba(255, 53, 53, 0), 0 0 30px rgba(255, 53, 53, 0.3);
      }
    }
  `;

  return (
    <>
      <style>{keyframeStyles}</style>
      <main className="relative h-[100dvh] overflow-y-auto lg:overflow-hidden flex flex-col">
        <div
          className="absolute inset-0 bg-center bg-cover bg-no-repeat"
          style={{ backgroundImage: `url(${HOME_BACKGROUND_URL})` }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-[#0b2233]/68" aria-hidden="true" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,119,0,0.2),transparent_45%)]" aria-hidden="true" />

        <header className="lg:hidden relative z-20 border-b border-white/10 bg-[#0f2f44]/90 backdrop-blur-sm px-4 py-3 flex items-center justify-between">
          <div className="text-white font-semibold text-sm">FPT Rescue & Relief</div>
          <Link
            href="/profile"
            className="w-10 h-10 rounded-full border border-white/20 bg-[#FF7700]/20 flex items-center justify-center hover:bg-[#FF7700]/30 transition-colors overflow-hidden flex-shrink-0"
            aria-label="Đi tới trang hồ sơ"
          >
            {userAvatar ? (
              <img
                src={userAvatar}
                alt={userName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#FF7700] to-[#FFD1A0] flex items-center justify-center text-white font-bold text-sm">
                {userName.charAt(0).toUpperCase()}
              </div>
            )}
          </Link>
        </header>

        <div className="relative z-10 flex-1 min-h-0 p-3 lg:p-5 pb-20 lg:pb-5 flex flex-col lg:justify-center">
          <div className="w-full lg:max-h-[82dvh] max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-5 items-stretch">
            <div className="lg:col-span-7 w-full min-h-0">
              <section className="h-full lg:min-h-[68dvh] rounded-xl border border-white/20 bg-[#0f2f44]/70 p-3 lg:p-4 flex flex-col overflow-hidden">
                <div className="flex flex-col items-center text-center">
                  <h1 className="text-[#FF7700] font-bold text-xl lg:text-2xl tracking-tight mb-2">
                    {isCheckingActiveRequest
                      ? "Đang kiểm tra"
                      : activeRequest
                        ? "Yêu cầu đang xử lý!"
                        : "Cần hỗ trợ ?"}
                  </h1>
                  <p className="text-white/75 text-xs lg:text-sm leading-relaxed">
                    {isCheckingActiveRequest
                      ? "Hệ thống đang kiểm tra yêu cầu..."
                      : activeRequest
                        ? "Bấm vào hình tròn để theo dõi"
                        : ""}
                  </p>
                </div>

                <div className="flex-1 min-h-0 flex justify-center items-center py-1.5 lg:py-2.5">
                  {isCheckingActiveRequest ? (
                    <div className="w-40 h-40 md:w-48 md:h-48 lg:w-56 lg:h-56 rounded-full border-2 border-white/30 bg-white/15 flex items-center justify-center">
                      <span className="inline-block w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    </div>
                  ) : activeRequest ? (
                    <Link
                      href={`/history/${activeRequest.id}`}
                      className="w-40 h-40 md:w-48 md:h-48 lg:w-56 lg:h-56 rounded-full border-2 border-[#FF7700]/60 bg-[#FF7700] hover:bg-[#e66a00] flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-[#FF7700]/50 hover:scale-95"
                      style={{ animation: "flare 2s ease-in-out infinite" }}
                      aria-label="Theo dõi yêu cầu cứu hộ đang xử lý"
                    >
                      <span className="text-white font-bold text-sm lg:text-base text-center px-6">
                        Theo dõi yêu cầu đang xử lý
                      </span>
                    </Link>
                  ) : (
                    <Link
                      href="/request"
                      className="w-40 h-40 md:w-48 md:h-48 lg:w-56 lg:h-56 rounded-full border-2 border-red-400/60 bg-[#FF3535] hover:bg-red-600 flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-red-500/50 hover:scale-95"
                      style={{ animation: "flare-red 2s ease-in-out infinite" }}
                      aria-label="Gửi yêu cầu cứu hộ/cứu trợ"
                    >
                      <span className="text-white font-bold text-sm lg:text-base text-center px-6">
                        Gửi yêu cầu cứu hộ / cứu trợ
                      </span>
                    </Link>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 w-full mt-auto">
                  {quickActions.map((action) => (
                    <Link
                      key={action.id}
                      href={action.href}
                      className="w-full px-3 py-3 rounded-lg border border-white/15 bg-[#0f2f44]/70 hover:bg-[#1a3a52]/80 transition-all flex flex-col items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#FF7700]/50 group"
                      aria-label={`${action.title}: ${action.subtitle}`}
                      title={`${action.title} - ${action.subtitle}`}
                    >
                      <span className="w-10 h-10 rounded-lg bg-[#FF7700]/20 text-[#FFD1A0] flex items-center justify-center group-hover:bg-[#FF7700]/30 transition-colors flex-shrink-0">
                        {action.icon}
                      </span>
                      <div className="text-center min-w-0">
                        <span className="block text-white text-xs lg:text-sm font-semibold leading-tight truncate">
                          {action.title}
                        </span>
                        <span className="block text-white/60 text-[10px] lg:text-xs leading-tight truncate">
                          {action.subtitle}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            </div>

            <aside className="lg:col-span-5 w-full min-h-0">
              <section className="h-full lg:min-h-[68dvh] rounded-xl border border-white/20 bg-[#0f2f44]/70 p-3 lg:p-4 flex flex-col min-h-0">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <h2 className="text-white font-semibold text-sm lg:text-base inline-flex items-center gap-2">
                    <MapPin weight="fill" size={18} className="text-[#FF7700]" />
                    Vị trí GPS của bạn
                  </h2>
                  <button
                    type="button"
                    onClick={requestCurrentLocation}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-white/20 bg-white/10 hover:bg-white/20 text-white transition-colors"
                  >
                    <Crosshair size={14} weight="bold" />
                    Định vị lại
                  </button>
                </div>

                <div className="rounded-lg overflow-hidden border border-white/20 flex-1 min-h-0">
                  {gpsCoords ? (
                    <OpenMap
                      latitude={gpsCoords.lat}
                      longitude={gpsCoords.lon}
                      address={gpsAddress}
                    />
                  ) : (
                    <div className="h-full bg-[#0f2f44]/80 flex items-center justify-center px-4 text-center">
                      <p className="text-white/75 text-sm">
                        {gpsStatus === "loading" && "Đang lấy vị trí GPS..."}
                        {gpsStatus === "unsupported" && "Thiết bị không hỗ trợ định vị GPS."}
                        {gpsStatus === "denied" && "Bạn đã từ chối quyền truy cập vị trí."}
                        {gpsStatus === "error" && "Không thể lấy vị trí hiện tại."}
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-2 rounded-lg border border-white/20 bg-[#0f2f44]/70 p-3 space-y-1.5">
                  <p className="text-white/90 text-xs lg:text-sm font-medium line-clamp-2">
                    {gpsAddress}
                  </p>
                  {gpsCoords && (
                    <p className="text-white/70 text-[11px] lg:text-xs font-mono">
                      {gpsCoords.lat.toFixed(6)}, {gpsCoords.lon.toFixed(6)}
                    </p>
                  )}
                </div>
              </section>
            </aside>
          </div>
        </div>
      </main>
    </>
  );
}
