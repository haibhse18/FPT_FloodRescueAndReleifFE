"use client";

import Link from "next/link";
import { Navigation } from "@/shared/ui/components/Navigation";
import { Footer } from "@/shared/ui/components/Footer";
import { Button } from "@/shared/ui/components/Button";
import {
  Shield,
  Heart,
  Users,
  Activity,
  MapPin,
  LifeBuoy,
  AlertTriangle,
  Bell,
  ClipboardList,
  Zap,
  Truck,
  CheckCircle,
  ArrowRight,
  Package,
} from "lucide-react";

export default function Home() {
  return (
    <main className="dark min-h-screen flex flex-col bg-[#0a1f2e] text-foreground font-sans selection:bg-[#FF7700]/30">

      {/* Navigation Layer */}
      <div className="relative z-50">
        <Navigation
          logo={
            <div className="flex items-center gap-2 font-bold text-2xl tracking-tight transition-transform hover:scale-105 text-white">
              <div className="bg-red-600 p-2 rounded-sm shadow-[0_0_15px_rgba(220,38,38,0.5)]">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <span>FloodRescue</span>
            </div>
          }
          variant="transparent"
          actions={
            <>
              <Button variant="ghost" size="sm" href="/login" className="font-semibold text-gray-300 hover:text-white hover:bg-white/10 uppercase tracking-widest text-xs">
                Đăng nhập
              </Button>
              <Button variant="primary" size="sm" href="/register" className="font-semibold bg-[#FF7700] text-white hover:bg-orange-500 rounded-sm uppercase tracking-widest text-xs">
                Đăng ký
              </Button>
            </>
          }
        />
      </div>

      {/* Cinematic Hero Section */}
      <section className="relative min-h-[95vh] flex items-center justify-center overflow-hidden -mt-[80px] pt-[80px]">
        {/* Solemn Background Image & Overlays */}
        <div className="absolute inset-0 z-0 bg-black">
          <img
            src="https://images.unsplash.com/photo-1547683905-f686c993aae5?q=80&w=2000"
            alt="Devastating flood emergency"
            className="w-full h-full object-cover opacity-60 mix-blend-luminosity scale-105 animate-[pulse-slow_20s_ease-in-out_infinite_alternate]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#071520]/90 via-[#071520]/50 to-[#0a1f2e]"></div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-[50vh] bg-red-900/20 blur-[150px] rounded-full point-events-none"></div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center rounded-sm border border-red-500/30 px-5 py-2 text-xs font-bold text-red-400 bg-red-950/40 mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700 backdrop-blur-md uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(220,38,38,0.2)]">
            <AlertTriangle className="w-4 h-4 mr-3 animate-pulse text-red-500" />
            Trạng Thái Khẩn Cấp Mức Độ Cao
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-[6rem] font-black tracking-tighter mb-8 leading-[1.05] text-white animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-200 drop-shadow-2xl">
            SỰ SỐNG <br className="hidden md:block"/>
            <span className="text-gray-300 font-bold">MONG MANH TRƯỚC</span><br className="hidden md:block"/>
            BIỂN NƯỚC.
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 mb-14 leading-relaxed max-w-3xl mx-auto font-light animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-300 drop-shadow-lg text-balance">
            Hàng ngàn gia đình đang mắc kẹt không điện, không thức ăn. Lực lượng cứu hộ phân tán.{" "}
            <strong className="text-white font-medium block mt-2">Mỗi phút chần chừ là một sinh mệnh bị đe dọa.</strong>
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-500">
            <Button size="lg" className="rounded-sm px-10 py-8 text-lg bg-red-600 hover:bg-red-700 text-white shadow-[0_0_40px_rgba(220,38,38,0.4)] transition-all hover:scale-105 font-bold uppercase tracking-widest border border-red-500" href="/login">
              <LifeBuoy className="mr-3 w-6 h-6 animate-pulse" />
              TÔI CẦN CỨU TRỢ NGAY
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="rounded-sm px-10 py-8 text-lg border-2 border-white/30 bg-[#0a1f2e]/60 backdrop-blur-md text-white hover:bg-[#FF7700] hover:border-[#FF7700] hover:text-white transition-all uppercase tracking-widest font-semibold"
              href="/register"
            >
              THAM GIA LỰC LƯỢNG CỨU HỘ
            </Button>
          </div>
        </div>
      </section>

      {/* Key Features Bar — from FR modules */}
      <section className="relative z-20 border-y border-white/5 bg-[#0d2536]/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 divide-y md:divide-y-0 md:divide-x divide-white/10">

            <div className="flex flex-col items-center text-center px-6">
              <ClipboardList className="w-10 h-10 text-red-500 mb-4" />
              <h3 className="font-bold text-2xl text-white mb-2 tracking-tight">Quản Lý Yêu Cầu</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Citizen gửi yêu cầu cứu hộ/cứu trợ với định vị GPS. Coordinator xác minh, phân loại ưu tiên và điều phối xử lý theo thời gian thực.
              </p>
            </div>

            <div className="flex flex-col items-center text-center px-6 pt-10 md:pt-0">
              <Zap className="w-10 h-10 text-[#FF7700] mb-4" />
              <h3 className="font-bold text-2xl text-white mb-2 tracking-tight">Điều Phối Mission</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Lập mission, gán đội cứu hộ, theo dõi lifecycle toàn diện từ DRAFT → PLANNED → IN_PROGRESS → COMPLETED với timeline thực thi chi tiết.
              </p>
            </div>

            <div className="flex flex-col items-center text-center px-6 pt-10 md:pt-0">
              <Bell className="w-10 h-10 text-emerald-500 mb-4" />
              <h3 className="font-bold text-2xl text-white mb-2 tracking-tight">Thông Báo Real-time</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Cập nhật trạng thái tức thì qua WebSocket. Citizen, đội cứu hộ và điều phối viên đồng bộ thông tin không có độ trễ.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Roles Section — 4 roles from FR */}
      <section className="py-24 bg-[#0d2536] relative border-b border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-20 grid grid-cols-1 lg:grid-cols-2 gap-10 items-end">
            <div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-6 text-white uppercase">
                Liên kết <br/> Mọi Lực Lượng
              </h2>
              <div className="h-1 w-20 bg-red-600"></div>
            </div>
            <p className="text-lg text-zinc-400 leading-relaxed font-light">
              Nền tảng hợp nhất 4 vai trò vận hành: từ người dân cần gọi cứu trợ, đội cứu hộ tuyến đầu, bộ chỉ huy điều phối đến quản lý tài nguyên hậu cần.{" "}
              <strong className="text-white font-medium block mt-2">Sự phối hợp không độ trễ chính là chìa khóa giành lại sự sống.</strong>
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

            {/* Citizen */}
            <div className="group flex flex-col h-full bg-zinc-900 rounded-sm overflow-hidden shadow-2xl border border-white/5 hover:border-blue-400/40 transition-all duration-500 hover:-translate-y-2">
              <div className="h-48 w-full relative overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-700">
                <img src="https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?q=80&w=800" alt="Người dân" className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-1000" />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/60 to-transparent"></div>
                <div className="absolute top-3 right-3 bg-blue-600/90 backdrop-blur-sm p-2 rounded-sm">
                  <Users className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col -mt-8 relative z-10">
                <span className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">Citizen</span>
                <h3 className="text-xl font-bold text-white mb-3 uppercase tracking-wider">Người Dân</h3>
                <ul className="text-zinc-400 text-sm leading-relaxed font-light space-y-1.5">
                  <li className="flex items-start gap-2"><span className="text-blue-400 mt-0.5">›</span>Gửi yêu cầu cứu hộ/cứu trợ với định vị GPS</li>
                  <li className="flex items-start gap-2"><span className="text-blue-400 mt-0.5">›</span>Theo dõi tiến độ xử lý và trạng thái mission</li>
                  <li className="flex items-start gap-2"><span className="text-blue-400 mt-0.5">›</span>Nhận thông báo real-time, nộp đơn gia nhập đội cứu hộ</li>
                </ul>
              </div>
            </div>

            {/* Rescue Team */}
            <div className="group flex flex-col h-full bg-zinc-900 rounded-sm overflow-hidden shadow-2xl border border-red-500/20 hover:border-red-500/50 transition-all duration-500 hover:-translate-y-2">
              <div className="h-48 w-full relative overflow-hidden transition-all duration-700">
                <img src="https://images.unsplash.com/photo-1593113514676-c95690b22031?q=80&w=800" alt="Đội cứu hộ" className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-1000" />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-red-950/60 to-transparent"></div>
                <div className="absolute top-3 right-3 bg-red-600 p-2 rounded-sm shadow-[0_0_15px_rgba(220,38,38,0.5)]">
                  <Shield className="w-5 h-5 text-white animate-pulse" />
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col -mt-8 relative z-10">
                <span className="text-xs font-bold text-red-400 uppercase tracking-widest mb-2">Rescue Team</span>
                <h3 className="text-xl font-bold text-white mb-3 uppercase tracking-wider">Lực Lượng Cứu Hộ</h3>
                <ul className="text-zinc-300 text-sm leading-relaxed font-light space-y-1.5">
                  <li className="flex items-start gap-2"><span className="text-red-400 mt-0.5">›</span>Nhận nhiệm vụ, thực thi timeline (accept → arrive → complete)</li>
                  <li className="flex items-start gap-2"><span className="text-red-400 mt-0.5">›</span>Cập nhật tiến độ cứu hộ: số người, nhu yếu phẩm</li>
                  <li className="flex items-start gap-2"><span className="text-red-400 mt-0.5">›</span>Báo cáo kết quả trực tiếp từ hiện trường</li>
                </ul>
              </div>
            </div>

            {/* Coordinator */}
            <div className="group flex flex-col h-full bg-zinc-900 rounded-sm overflow-hidden shadow-2xl border border-amber-500/10 hover:border-amber-500/40 transition-all duration-500 hover:-translate-y-2">
              <div className="h-48 w-full relative overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-700">
                <img src="https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?q=80&w=800" alt="Trung tâm điều phối" className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-1000" />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/60 to-transparent"></div>
                <div className="absolute top-3 right-3 bg-zinc-950/80 backdrop-blur-sm p-2 rounded-sm border border-amber-500/30">
                  <Activity className="w-5 h-5 text-amber-500" />
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col -mt-8 relative z-10">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2">Rescue Coordinator</span>
                <h3 className="text-xl font-bold text-white mb-3 uppercase tracking-wider">Bộ Chỉ Huy</h3>
                <ul className="text-zinc-400 text-sm leading-relaxed font-light space-y-1.5">
                  <li className="flex items-start gap-2"><span className="text-amber-400 mt-0.5">›</span>Xác minh yêu cầu, lập mission và gán đội cứu hộ</li>
                  <li className="flex items-start gap-2"><span className="text-amber-400 mt-0.5">›</span>Điều phối start/pause/resume/abort mission</li>
                  <li className="flex items-start gap-2"><span className="text-amber-400 mt-0.5">›</span>Theo dõi toàn bộ tiến độ fulfillment theo request</li>
                </ul>
              </div>
            </div>

            {/* Manager */}
            <div className="group flex flex-col h-full bg-zinc-900 rounded-sm overflow-hidden shadow-2xl border border-emerald-500/10 hover:border-emerald-500/40 transition-all duration-500 hover:-translate-y-2">
              <div className="h-48 w-full relative overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-700">
                <img src="https://images.unsplash.com/photo-1553413077-190dd305871c?q=80&w=800" alt="Quản lý tài nguyên" className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-1000" />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/60 to-transparent"></div>
                <div className="absolute top-3 right-3 bg-zinc-950/80 backdrop-blur-sm p-2 rounded-sm border border-emerald-500/30">
                  <Package className="w-5 h-5 text-emerald-400" />
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col -mt-8 relative z-10">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-2">Manager</span>
                <h3 className="text-xl font-bold text-white mb-3 uppercase tracking-wider">Quản Lý Hậu Cần</h3>
                <ul className="text-zinc-400 text-sm leading-relaxed font-light space-y-1.5">
                  <li className="flex items-start gap-2"><span className="text-emerald-400 mt-0.5">›</span>Quản lý kho, tồn kho nhu yếu phẩm và thiết bị</li>
                  <li className="flex items-start gap-2"><span className="text-emerald-400 mt-0.5">›</span>Phân phối supplies cho mission, kiểm soát over-delivery</li>
                  <li className="flex items-start gap-2"><span className="text-emerald-400 mt-0.5">›</span>Quản lý phương tiện và tài nguyên cứu hộ</li>
                </ul>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Workflow Section — 7 steps from FR section 3 */}
      <section className="py-24 bg-[#0a1f2e] relative border-b border-white/5">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-4 text-white uppercase">
              Quy Trình Vận Hành
            </h2>
            <div className="h-1 w-20 bg-[#FF7700] mx-auto mb-6"></div>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto font-light">
              Từ tín hiệu SOS đến hoàn thành cứu nạn — mọi bước đều được hệ thống theo dõi và đồng bộ tức thì.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {[
              { step: "01", icon: <LifeBuoy className="w-6 h-6" />, color: "text-red-400 border-red-500/30 bg-red-950/30", title: "Citizen Gửi Yêu Cầu", desc: "Gửi request cứu hộ/cứu trợ kèm định vị GPS, mô tả tình trạng và số người cần hỗ trợ." },
              { step: "02", icon: <CheckCircle className="w-6 h-6" />, color: "text-amber-400 border-amber-500/30 bg-amber-950/30", title: "Coordinator Xác Minh", desc: "Verify/reject request, chuẩn hóa vị trí và phân loại mức độ ưu tiên theo quy tắc nghiệp vụ." },
              { step: "03", icon: <ClipboardList className="w-6 h-6" />, color: "text-blue-400 border-blue-500/30 bg-blue-950/30", title: "Tạo & Lập Mission", desc: "Tạo mission DRAFT, thêm các request vào mission, gán đội cứu hộ với Timeline PLANNED." },
              { step: "04", icon: <Zap className="w-6 h-6" />, color: "text-[#FF7700] border-orange-500/30 bg-orange-950/20", title: "Khởi Động Mission", desc: "Start mission: pre-create TeamRequest matrix, chuyển PLANNED → ASSIGNED, gửi notification." },
            ].map((item) => (
              <div key={item.step} className={`relative p-6 rounded-sm border ${item.color} backdrop-blur-sm group hover:-translate-y-1 transition-transform duration-300`}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="font-black text-3xl opacity-20">{item.step}</span>
                  <div className={`${item.color} p-1.5 rounded-sm`}>{item.icon}</div>
                </div>
                <h4 className="text-white font-bold text-sm uppercase tracking-wide mb-2">{item.title}</h4>
                <p className="text-zinc-500 text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { step: "05", icon: <Truck className="w-6 h-6" />, color: "text-red-400 border-red-500/30 bg-red-950/30", title: "Đội Thực Thi", desc: "Team nhận timeline, thực hiện: accept → EN_ROUTE → ON_SITE → COMPLETED/PARTIAL." },
              { step: "06", icon: <Activity className="w-6 h-6" />, color: "text-emerald-400 border-emerald-500/30 bg-emerald-950/30", title: "Cập Nhật Tiến Độ", desc: "Team cập nhật số người cứu được, supplies đã giao. Hệ thống tổng hợp và sync về MissionRequest." },
              { step: "07", icon: <Bell className="w-6 h-6" />, color: "text-blue-400 border-blue-500/30 bg-blue-950/30", title: "Đồng Bộ Real-time", desc: "Citizen, Team và Coordinator nhận cập nhật tức thì qua Notification & WebSocket suốt quá trình." },
            ].map((item) => (
              <div key={item.step} className={`relative p-6 rounded-sm border ${item.color} backdrop-blur-sm group hover:-translate-y-1 transition-transform duration-300`}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="font-black text-3xl opacity-20">{item.step}</span>
                  <div className={`${item.color} p-1.5 rounded-sm`}>{item.icon}</div>
                </div>
                <h4 className="text-white font-bold text-sm uppercase tracking-wide mb-2">{item.title}</h4>
                <p className="text-zinc-500 text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Capabilities — 6 feature modules from FR */}
      <section className="py-24 bg-[#0d2536] relative border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-4 text-white uppercase">
              Tính Năng Cốt Lõi
            </h2>
            <div className="h-1 w-20 bg-red-600 mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <ClipboardList className="w-7 h-7" />,
                color: "text-red-400",
                accent: "border-red-500/20 hover:border-red-500/40",
                title: "Request Management",
                subtitle: "FR-REQ",
                desc: "Citizen tạo request với ràng buộc 1 active request. Coordinator xác minh, cập nhật priority, xử lý duplicate, đóng request theo state machine.",
              },
              {
                icon: <Zap className="w-7 h-7" />,
                color: "text-amber-400",
                accent: "border-amber-500/20 hover:border-amber-500/40",
                title: "Mission Planning & Control",
                subtitle: "FR-MIS",
                desc: "Tạo mission DRAFT, thêm requests, gán teams. Quản lý lifecycle: start/pause/resume/abort. Pre-create TeamRequest matrix khi start mission.",
              },
              {
                icon: <Truck className="w-7 h-7" />,
                color: "text-[#FF7700]",
                accent: "border-orange-500/20 hover:border-orange-500/40",
                title: "Team Execution Timeline",
                subtitle: "FR-TL",
                desc: "Đội cứu hộ thực thi timeline qua trạng thái ASSIGNED → EN_ROUTE → ON_SITE → COMPLETED. Hỗ trợ partial, fail, withdraw với reason.",
              },
              {
                icon: <Activity className="w-7 h-7" />,
                color: "text-blue-400",
                accent: "border-blue-500/20 hover:border-blue-500/40",
                title: "Progress & Contribution Tracking",
                subtitle: "FR-MR",
                desc: "Cập nhật số người cứu được, supplies giao theo từng mission request. Hệ thống tổng hợp từ TeamRequest, ngăn over-delivery (lỗi 422).",
              },
              {
                icon: <Bell className="w-7 h-7" />,
                color: "text-emerald-400",
                accent: "border-emerald-500/20 hover:border-emerald-500/40",
                title: "Notifications & Realtime",
                subtitle: "FR-NOTI",
                desc: "Nhận event real-time qua WebSocket: mission assigned, request verified, completed. Quản lý danh sách notification, badge unread đồng bộ tức thì.",
              },
              {
                icon: <Package className="w-7 h-7" />,
                color: "text-purple-400",
                accent: "border-purple-500/20 hover:border-purple-500/40",
                title: "Resources & Inventory",
                subtitle: "FR-RSC / FR-INV",
                desc: "Quản lý phương tiện, thiết bị, supplies catalog. Warehouse và tồn kho: reserve/deduct/return theo lifecycle mission và timeline.",
              },
            ].map((f) => (
              <div key={f.title} className={`p-6 bg-zinc-900/50 rounded-sm border ${f.accent} transition-all duration-300 group hover:-translate-y-1`}>
                <div className={`${f.color} mb-4`}>{f.icon}</div>
                <div className="flex items-baseline gap-2 mb-2">
                  <h4 className="text-white font-bold text-base uppercase tracking-wide">{f.title}</h4>
                  <span className="text-xs text-zinc-600 font-mono">{f.subtitle}</span>
                </div>
                <p className="text-zinc-400 text-sm leading-relaxed font-light">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-32 relative overflow-hidden flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#133249] via-[#0a1f2e] to-[#071520]">
        <div className="absolute top-0 right-0 -mr-32 -mt-32 w-[40rem] h-[40rem] bg-red-900/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-[40rem] h-[40rem] bg-[#FF7700]/5 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="max-w-4xl mx-auto px-6 text-center relative z-20">
          <Shield className="w-20 h-20 text-white/20 mx-auto mb-10 drop-shadow-2xl" />
          <h2 className="text-4xl md:text-6xl font-black mb-8 text-white tracking-tighter uppercase">
            Sẵn Sàng Hành Động
          </h2>
          <p className="text-zinc-400 text-xl mb-12 max-w-2xl mx-auto font-light leading-relaxed">
            Đăng ký với tư cách Citizen để gửi yêu cầu cứu trợ, hoặc đăng nhập với tư cách thành viên lực lượng để bắt đầu nhiệm vụ ngay bây giờ.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button size="lg" className="rounded-sm px-14 py-8 text-lg bg-[#FF7700] text-white hover:bg-orange-500 transition-all hover:scale-105 font-bold uppercase tracking-widest shadow-[0_0_30px_rgba(255,119,0,0.3)]" href="/register">
              Ghi Danh Ngay
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="rounded-sm px-14 py-8 text-lg border-2 border-white/30 bg-transparent text-white hover:bg-[#FF7700] hover:border-[#FF7700] transition-all uppercase tracking-widest font-bold"
              href="/login"
            >
              Cổng Đăng Nhập
            </Button>
          </div>
        </div>
      </section>

      {/* State Machines Reference — compact */}
      <section className="py-16 bg-[#071520] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <h3 className="text-xs font-black tracking-[0.3em] text-zinc-600 uppercase mb-10 text-center">
            Trạng Thái Hệ Thống
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Request", states: ["SUBMITTED", "VERIFIED", "IN_PROGRESS", "PARTIALLY_FULFILLED", "FULFILLED", "CLOSED", "CANCELLED"], color: "text-blue-400" },
              { label: "Mission", states: ["DRAFT", "PLANNED", "IN_PROGRESS", "PAUSED", "PARTIAL", "COMPLETED", "ABORTED"], color: "text-amber-400" },
              { label: "Timeline", states: ["PLANNED", "ASSIGNED", "EN_ROUTE", "ON_SITE", "COMPLETED", "FAILED", "WITHDRAWN"], color: "text-red-400" },
              { label: "MissionRequest", states: ["PENDING", "IN_PROGRESS", "PARTIAL", "FULFILLED", "CLOSED", "DROPPED"], color: "text-emerald-400" },
            ].map((sm) => (
              <div key={sm.label} className="bg-zinc-900/30 border border-white/5 rounded-sm p-4">
                <p className={`text-xs font-black tracking-[0.15em] uppercase mb-3 ${sm.color}`}>{sm.label}</p>
                <div className="flex flex-wrap gap-1.5">
                  {sm.states.map((s) => (
                    <span key={s} className="text-[10px] font-mono text-zinc-500 bg-zinc-800/60 px-1.5 py-0.5 rounded border border-white/5">{s}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer variant="dark" />
    </main>
  );
}
