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
    <main className="min-h-screen flex flex-col bg-background text-slate-900 font-sans selection:bg-primary/20">

      {/* Navigation Layer */}
      <div className="relative z-50">
        <Navigation
          logo={
            <div className="flex items-center gap-2 font-bold text-2xl tracking-tight transition-transform hover:scale-105 text-primary">
              <div className="bg-primary p-2 rounded-sm shadow-sm">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <span>FloodRescue</span>
            </div>
          }
          variant="transparent"
          actions={
            <>
              <Button variant="ghost" size="sm" href="/login" className="font-bold text-slate-600 hover:text-primary hover:bg-slate-100 uppercase tracking-widest text-xs">
                Đăng nhập
              </Button>
              <Button variant="primary" size="sm" href="/register" className="font-bold bg-primary text-white hover:shadow-lg rounded-sm uppercase tracking-widest text-xs">
                Đăng ký
              </Button>
            </>
          }
        />
      </div>

      {/* Cinematic Hero Section */}
      <section className="relative min-h-[95vh] flex items-center justify-center overflow-hidden -mt-[80px] pt-[80px]">
        {/* Solemn Background Image & Overlays */}
        <div className="absolute inset-0 z-0 bg-background">
          <img
            src="https://images.unsplash.com/photo-1547683905-f686c993aae5?q=80&w=2000"
            alt="Flood relief"
            className="w-full h-full object-cover opacity-10 mix-blend-multiply scale-105 animate-[pulse-slow_20s_ease-in-out_infinite_alternate]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-blue-50/80 via-white/40 to-slate-50"></div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-[50vh] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none"></div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center rounded-sm border border-primary/20 px-5 py-2 text-xs font-bold text-primary bg-blue-50/40 mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700 backdrop-blur-md uppercase tracking-[0.2em] shadow-sm">
            <Activity className="w-4 h-4 mr-3 animate-pulse text-emerald-500" />
            Hệ Thống Phản Ứng Cứu Trợ
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-[6rem] font-black tracking-tighter mb-8 leading-[1.05] text-slate-900 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-200">
            VÌ MỌI <br className="hidden md:block"/>
            <span className="text-primary font-bold">GIA ĐÌNH BÌNH AN</span><br className="hidden md:block"/>
            TRONG LŨ.
          </h1>

          <p className="text-xl md:text-2xl text-slate-600 mb-14 leading-relaxed max-w-3xl mx-auto font-light animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-300 text-balance">
            Kết nối trực tiếp Người Dân và Lực Lượng Cứu Hộ.{" "}
            <strong className="text-slate-900 font-medium block mt-2">Mọi yêu cầu hỗ trợ đều được tiếp nhận và điều phối xử lý kịp thời.</strong>
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-500">
            <Button size="lg" className="rounded-sm px-10 py-8 text-lg bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/10 transition-all hover:scale-105 font-bold uppercase tracking-widest border-none" href="/login">
              <LifeBuoy className="mr-3 w-6 h-6 animate-pulse text-white" />
              TỔNG ĐÀI CỨU TRỢ
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="rounded-sm px-10 py-8 text-lg border-2 border-slate-200 bg-white/60 backdrop-blur-md text-slate-900 hover:bg-slate-50 hover:border-primary transition-all uppercase tracking-widest font-semibold"
              href="/register"
            >
              THAM GIA CỨU HỘ
            </Button>
          </div>
        </div>
      </section>

      {/* Key Features Bar — from FR modules */}
      <section className="relative z-20 border-y border-primary/10 bg-white/40 backdrop-blur-md overflow-hidden shadow-sm">
        {/* Dot Pattern Overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "radial-gradient(#000000 1px, transparent 1px)", backgroundSize: "30px 30px" }}></div>

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
              <h3 className="font-bold text-2xl text-white mb-2 tracking-tight">Điều Phối</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Điều phối lực lượng cứu hộ tức thì
              </p>
            </div>

            <div className="flex flex-col items-center text-center px-6 pt-10 md:pt-0">
              <Bell className="w-10 h-10 text-emerald-500 mb-4" />
              <h3 className="font-bold text-2xl text-white mb-2 tracking-tight">Thông Báo Real-time</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Cập nhật trạng thái tức thì, đội cứu hộ và điều phối viên đồng bộ thông tin không có độ trễ.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Roles Section — 4 roles from FR */}
      <section className="py-24 bg-background relative border-b border-primary/10 overflow-hidden">
        {/* Dot Pattern Overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "radial-gradient(#000000 1px, transparent 1px)", backgroundSize: "24px 24px" }}></div>

        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-20 grid grid-cols-1 lg:grid-cols-2 gap-10 items-end">
            <div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-6 text-slate-900 uppercase">
                Gắn Kết <br/> Vì Cộng Đồng
              </h2>
              <div className="h-1 w-20 bg-primary"></div>
            </div>
            <p className="text-lg text-slate-600 leading-relaxed font-light">
              Nền tảng hợp nhất 4 vai trò vận hành: từ người dân cần gọi cứu trợ, đội cứu hộ tuyến đầu, bộ chỉ huy điều phối đến quản lý tài nguyên hậu cần.{" "}
              <strong className="text-white font-medium block mt-2">Sự phối hợp không độ trễ chính là chìa khóa giành lại sự sống.</strong>
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Citizen */}
            <div className="group flex flex-col h-full bg-white/90 backdrop-blur-md rounded-sm overflow-hidden shadow-lg border border-primary/10 hover:bg-primary transition-all duration-300 hover:-translate-y-1">
              <div className="h-40 w-full relative overflow-hidden">
                <img src="https://media-cdn-v2.laodong.vn/Storage/NewsPortal/2020/10/21/847249/20201021_113857.jpg" alt="Người dân" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-primary/20 group-hover:bg-transparent transition-colors"></div>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-blue-50 p-2 rounded-sm text-primary group-hover:bg-white/20 group-hover:text-white transition-colors">
                    <Users className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-white transition-colors">Người Dân</h3>
                </div>
                <ul className="text-slate-600 text-sm leading-relaxed font-light space-y-2 group-hover:text-blue-50 transition-colors">
                  <li className="flex items-start gap-2"><span>›</span>Gửi yêu cầu cứu hộ/cứu trợ với định vị GPS</li>
                  <li className="flex items-start gap-2"><span>›</span>Theo dõi tiến độ xử lý và trạng thái mission</li>
                </ul>
              </div>
            </div>

            {/* Rescue Team */}
            <div className="group flex flex-col h-full bg-white/90 backdrop-blur-md rounded-sm overflow-hidden shadow-lg border border-primary/10 hover:bg-primary transition-all duration-300 hover:-translate-y-1">
              <div className="h-40 w-full relative overflow-hidden">
                <img src="https://file.qdnd.vn/data/images/0/2017/08/05/tuanson/son14.jpg?w=578" alt="Đội cứu hộ" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-primary/20 group-hover:bg-transparent transition-colors"></div>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-blue-50 p-2 rounded-sm text-primary group-hover:bg-white/20 group-hover:text-white transition-colors">
                    <Shield className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-white transition-colors">Đội Cứu Hộ</h3>
                </div>
                <ul className="text-slate-600 text-sm leading-relaxed font-light space-y-2 group-hover:text-blue-50 transition-colors">
                  <li className="flex items-start gap-2"><span>›</span>Nhận nhiệm vụ và thực thi điều phối</li>
                  <li className="flex items-start gap-2"><span>›</span>Cập nhật tiến độ số người được cứu</li>
                </ul>
              </div>
            </div>

            {/* Coordinator */}
            <div className="group flex flex-col h-full bg-white/90 backdrop-blur-md rounded-sm overflow-hidden shadow-lg border border-primary/10 hover:bg-primary transition-all duration-300 hover:-translate-y-1">
              <div className="h-40 w-full relative overflow-hidden">
                <img src="https://www.mod.gov.vn/wcm/connect/7c54f72a-3355-462b-87e1-8d4447ae20a3/1/image001.jpg?MOD=AJPERES" alt="Điều phối" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-primary/20 group-hover:bg-transparent transition-colors"></div>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-blue-50 p-2 rounded-sm text-primary group-hover:bg-white/20 group-hover:text-white transition-colors">
                    <Activity className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-white transition-colors">Bộ Chỉ Huy</h3>
                </div>
                <ul className="text-slate-600 text-sm leading-relaxed font-light space-y-2 group-hover:text-blue-50 transition-colors">
                  <li className="flex items-start gap-2"><span>›</span>Xác minh yêu cầu và gán đội cứu hộ</li>
                  <li className="flex items-start gap-2"><span>›</span>Theo dõi toàn bộ tiến độ real-time</li>
                </ul>
              </div>
            </div>

            {/* Manager */}
            <div className="group flex flex-col h-full bg-white/90 backdrop-blur-md rounded-sm overflow-hidden shadow-lg border border-primary/10 hover:bg-primary transition-all duration-300 hover:-translate-y-1">
              <div className="h-40 w-full relative overflow-hidden">
                <img src="https://cdn-images.vtv.vn/thumb_w/730/66349b6076cb4dee98746cf1/2025/11/21/cong-an-quan-doi-cuu-dan-vung-lu-73941013977815536745834.webp" alt="Quản lý" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-primary/20 group-hover:bg-transparent transition-colors"></div>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-blue-50 p-2 rounded-sm text-primary group-hover:bg-white/20 group-hover:text-white transition-colors">
                    <Package className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-white transition-colors">Quản Lý Hậu Cần</h3>
                </div>
                <ul className="text-slate-600 text-sm leading-relaxed font-light space-y-2 group-hover:text-blue-50 transition-colors">
                  <li className="flex items-start gap-2"><span>›</span>Quản lý kho bãi và nhu yếu phẩm</li>
                  <li className="flex items-start gap-2"><span>›</span>Điều phối phương tiện cứu trợ</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow Section — 7 steps from FR section 3 */}
      <section className="py-24 bg-white/40 relative border-b border-primary/10 overflow-hidden">
        {/* Dot Pattern Overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "radial-gradient(#000000 1px, transparent 1px)", backgroundSize: "32px 32px" }}></div>

        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[1px] bg-gradient-to-r from-transparent via-primary/10 to-transparent"></div>
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-4 text-slate-900 uppercase">
              Quy Trình Vận Hành
            </h2>
            <div className="h-1 w-20 bg-primary mx-auto mb-6"></div>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto font-light">
              Từ tín hiệu SOS đến hoàn thành cứu nạn — mọi bước đều được hệ thống theo dõi và đồng bộ tức thì.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {[
              { step: "01", icon: <LifeBuoy className="w-6 h-6" />, color: "text-primary border-primary/10 bg-white/60", title: "Citizen Gửi Yêu Cầu", desc: "Gửi request cứu hộ/cứu trợ kèm định vị GPS, mô tả tình trạng và số người cần hỗ trợ." },
              { step: "02", icon: <CheckCircle className="w-6 h-6" />, color: "text-amber-600 border-amber-200 bg-amber-50/50", title: "Coordinator Xác Minh", desc: "Xác minh/ Từ chối yêu cầu, chuẩn hóa vị trí và phân loại mức độ ưu tiên theo quy tắc nghiệp vụ." },
              { step: "03", icon: <ClipboardList className="w-6 h-6" />, color: "text-blue-600 border-blue-200 bg-blue-50/50", title: "Tạo & Lập Mission", desc: "Tạo mission, thêm các yêu cầu vào mission, gán đội cứu hộ với tiến trình đã được lên kế hoạch." },
              { step: "04", icon: <Zap className="w-6 h-6" />, color: "text-orange-600 border-orange-200 bg-orange-50/50", title: "Khởi Động Mission", desc: "Khởi động mission, tạo ma trận TeamRequest, chuyển trạng thái PLANNED → ASSIGNED, gửi thông báo." },
            ].map((item) => (
              <div key={item.step} className={`relative p-6 rounded-sm border ${item.color} backdrop-blur-sm group hover:-translate-y-1 transition-transform duration-300`}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="font-black text-3xl opacity-10">{item.step}</span>
                  <div className="p-1.5 rounded-sm">{item.icon}</div>
                </div>
                <h4 className="text-slate-900 font-bold text-sm uppercase tracking-wide mb-2">{item.title}</h4>
                <p className="text-slate-500 text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { step: "05", icon: <Truck className="w-6 h-6" />, color: "text-red-600 border-red-200 bg-red-50/50", title: "Đội Thực Thi", desc: "Team nhận nhiệm vụ và di chuyển đến hiện trường." },
              { step: "06", icon: <Activity className="w-6 h-6" />, color: "text-emerald-600 border-emerald-200 bg-emerald-50/50", title: "Cập Nhật Tiến Độ", desc: "Team cập nhật số người cứu được và đồng bộ với hệ thống." },
              { step: "07", icon: <Bell className="w-6 h-6" />, color: "text-blue-600 border-blue-200 bg-blue-50/50", title: "Đồng Bộ Real-time", desc: "Citizen, Team và Coordinator nhận cập nhật tức thì qua thông báo suốt quá trình." },
            ].map((item) => (
              <div key={item.step} className={`relative p-6 rounded-sm border ${item.color} backdrop-blur-sm group hover:-translate-y-1 transition-transform duration-300`}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="font-black text-3xl opacity-10">{item.step}</span>
                  <div className="p-1.5 rounded-sm">{item.icon}</div>
                </div>
                <h4 className="text-slate-900 font-bold text-sm uppercase tracking-wide mb-2">{item.title}</h4>
                <p className="text-slate-500 text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Capabilities — 6 feature modules from FR */}
      <section className="py-24 bg-blue-50/60 relative border-b border-primary/10 overflow-hidden">
        {/* Dot Pattern Overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "radial-gradient(#000000 1px, transparent 1px)", backgroundSize: "20px 20px" }}></div>

        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-4 text-slate-900 uppercase">
              Tính Năng Cốt Lõi
            </h2>
            <div className="h-1 w-20 bg-primary mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <ClipboardList className="w-7 h-7" />,
                color: "text-red-600",
                accent: "border-red-100 hover:border-red-300",
                title: "Quản Lý Yêu Cầu",
                desc: "Citizen tạo request  -> Coordinator xác minh và phân loại.",
              },
              {
                icon: <Zap className="w-7 h-7" />,
                color: "text-amber-600",
                accent: "border-amber-100 hover:border-amber-300",
                title: "Lập Kế Hoạch Mission",
                desc: "Tạo nhiệm vụ, thêm yêu cầu, gán đội cứu hộ phù hợp.",
              },
              {
                icon: <Truck className="w-7 h-7" />,
                color: "text-orange-600",
                accent: "border-orange-100 hover:border-orange-300",
                title: "Thực Thi Cứu Hộ",
                desc: "Đội cứu hộ thực thi và cập nhật trạng thái tiến trình.",
              },
              {
                icon: <Activity className="w-7 h-7" />,
                color: "text-blue-600",
                accent: "border-blue-100 hover:border-blue-300",
                title: "Theo Dõi Tiến Độ",
                desc: "Cập nhật số người cứu được và nhu yếu phẩm đã cấp.",
              },
              {
                icon: <Bell className="w-7 h-7" />,
                color: "text-emerald-600",
                accent: "border-emerald-100 hover:border-emerald-300",
                title: "Thông Báo Real-time",
                desc: "Nhận thông báo cập nhật tức thì trên mọi thiết bị.",
              },
              {
                icon: <Package className="w-7 h-7" />,
                color: "text-purple-600",
                accent: "border-purple-100 hover:border-purple-300",
                title: "Tài Nguyên & Kho Bãi",
                desc: "Quản lý tồn kho nhu yếu phẩm và phương tiện cứu hộ.",
              },
            ].map((f) => (
              <div key={f.title} className={`p-6 bg-white/80 backdrop-blur-md rounded-sm border ${f.accent} transition-all duration-300 group hover:-translate-y-1 shadow-sm`}>
                <div className={`${f.color} mb-4`}>{f.icon}</div>
                <h4 className="text-slate-900 font-bold text-base uppercase tracking-wide mb-2">{f.title}</h4>
                <p className="text-slate-500 text-sm leading-relaxed font-light">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-32 relative overflow-hidden flex items-center justify-center bg-background">
        <div className="absolute top-0 right-0 -mr-32 -mt-32 w-[40rem] h-[40rem] bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-[40rem] h-[40rem] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="max-w-4xl mx-auto px-6 text-center relative z-20">
          <Shield className="w-20 h-20 text-primary/20 mx-auto mb-10 drop-shadow-sm" />
          <h2 className="text-4xl md:text-6xl font-black mb-8 text-slate-900 tracking-tighter uppercase">
            Sẵn Sàng Hỗ Trợ
          </h2>
          <p className="text-slate-600 text-xl mb-12 max-w-2xl mx-auto font-light leading-relaxed">
            Đăng ký làm Citizen để gửi yêu cầu cứu trợ, hoặc tham gia Đội Cứu Hộ để bắt đầu nhiệm vụ ngay.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button size="lg" className="rounded-sm px-14 py-8 text-lg bg-primary text-white hover:bg-primary/90 transition-all hover:scale-105 font-bold uppercase tracking-widest shadow-xl shadow-primary/20" href="/register">
              Đăng kí ngay
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="rounded-sm px-14 py-8 text-lg border-2 border-slate-200 bg-white/60 text-slate-900 hover:bg-slate-50 hover:border-primary transition-all uppercase tracking-widest font-bold"
              href="/login"
            >
              Cổng Đăng Nhập
            </Button>
          </div>
        </div>
      </section>



      <Footer variant="transparent" />
    </main>
  );
}
