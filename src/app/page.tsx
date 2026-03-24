"use client";

import Link from "next/link";
import { Navigation } from "@/shared/ui/components/Navigation";
import { Footer } from "@/shared/ui/components/Footer";
import { Button } from "@/shared/ui/components/Button";
import {
  Shield,
  Activity,
  ArrowRight,
  Package,
  Heart,
  Users,
  Info,
} from "lucide-react";

import dynamic from "next/dynamic";
import "@openmapvn/openmapvn-gl/dist/maplibre-gl.css";

const OpenMap = dynamic(
  () => import("@/modules/map/presentation/components/OpenMap"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[420px] bg-slate-100 rounded-xl animate-pulse flex items-center justify-center text-slate-400 font-medium">
        Đang tải bản đồ...
      </div>
    ),
  },
);

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col bg-[#f0f7ff] text-slate-900 font-sans selection:bg-primary/20">

      {/* Navigation Layer */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navigation
          logo={
            <div className="flex items-center gap-2 font-bold text-2xl tracking-tighter transition-transform hover:scale-105 text-[#133249]">
              <div className="bg-[#133249] p-1.5 rounded-sm shadow-sm">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <span className="uppercase italic">FPT Flood</span>
              <span className="font-light text-[#133249]/70">& Relief</span>
            </div>
          }
          variant="transparent"
          actions={
            <>
              <Button variant="primary" size="sm" href="/register" className="font-black bg-[#133249] text-black hover:bg-[#1a4563] shadow-lg rounded-xl px-7 py-2.5 text-xs uppercase tracking-widest border-none">
                Đăng ký
              </Button>
              <Button variant="outline" size="sm" href="/login" className="font-black border-2 border-[#133249] text-[#133249] hover:bg-[#133249] hover:text-white rounded-xl px-7 py-2.5 text-xs uppercase tracking-widest transition-all">
                Đăng nhập
              </Button>
            </>
          }
        />
      </div>

      {/* Cinematic Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden pt-[80px]">
        {/* Solemn Background Image & Overlays */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/vietnam_hero.png"
            alt="Flood relief background Vietnam"
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50/95 via-blue-50/40 to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
          <div className="max-w-2xl">
            <div className="inline-flex items-center rounded-full px-4 py-1.5 text-xs font-bold text-white bg-red-500/90 mb-8 animate-in fade-in slide-in-from-left-4 duration-700 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-white mr-2 animate-pulse"></span>
              TÌNH TRẠNG KHẨN CẤP: MIỀN TRUNG
            </div>

            <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 leading-[1.1] text-[#133249] animate-in fade-in slide-in-from-left-6 duration-1000 delay-200">
              Sát cánh cùng <br />
              <span className="text-primary">Đồng bào trong lũ dữ</span>
            </h1>

            <p className="text-lg md:text-xl text-slate-700 mb-10 leading-relaxed font-medium animate-in fade-in slide-in-from-left-6 duration-1000 delay-300">
              Hệ thống điều phối cứu trợ thông minh của FPT, kết nối nhanh nhất nguồn lực cứu trợ tới những khu vực đang bị cô lập.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-5 animate-in fade-in slide-in-from-left-6 duration-1000 delay-500">
              <Button size="lg" className="rounded-xl px-10 py-5 text-sm bg-[#133249] hover:bg-[#1a4563] text-black shadow-2xl shadow-blue-900/20 transition-all hover:scale-105 font-black uppercase tracking-widest flex items-center gap-3 border-none" href="/register">
                Đăng ký
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="rounded-xl px-10 py-5 text-sm border-2 border-[#133249] bg-white text-[#133249] hover:bg-[#133249] hover:text-white transition-all hover:scale-105 font-black uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-slate-200"
                href="/login"
              >
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                Gửi yêu cầu khẩn cấp
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Real-time Map & Situation Update */}
      <section id="hoat-dong" className="py-24 bg-white/60 backdrop-blur-md relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div>
              <p className="text-[#133249]/60 font-bold text-sm uppercase tracking-widest mb-2">BẢN ĐỒ THỰC TẾ</p>
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-[#133249]">
                Cập nhật tình hình <span className="text-primary italic text-5xl md:text-6xl">Thời gian thực</span>
              </h2>
            </div>
            <div className="flex items-center gap-6 text-sm font-bold">
              <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
                <span className="text-slate-600">Nguy hiểm</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                <span className="text-slate-600">Cần cứu trợ</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Map Column */}
            <div className="lg:col-span-2 relative">
              <div className="rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-100 h-[550px] relative group">
                <OpenMap />
                <div className="absolute top-6 left-6 z-10 bg-white/90 backdrop-blur-md p-5 rounded-2xl shadow-xl border border-white/50 max-w-[280px]">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">ĐỊA ĐIỂM TRỌNG YẾU</p>
                  <p className="text-base font-black text-[#133249] mb-1">Huyện Lệ Thủy, Quảng Bình</p>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">Vùng trũng thấp, mực nước đang dâng cao mức báo động III.</p>
                </div>
              </div>
            </div>

            {/* Stats Column */}
            <div className="space-y-8">
              <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200/60 shadow-sm transition-all hover:translate-y-[-4px] hover:shadow-xl duration-300">
                <div className="flex items-center justify-between mb-8">
                  <div className="p-3.5 bg-blue-100 rounded-2xl text-blue-600">
                    <Activity className="w-6 h-6" />
                  </div>
                  <div className="px-3 py-1 bg-red-100 text-red-600 text-[10px] font-black rounded-full uppercase tracking-widest border border-red-200">
                    CẢNH BÁO
                  </div>
                </div>
                <h4 className="text-xl font-black text-[#133249] mb-4 uppercase tracking-tight">Mực nước sông Hương</h4>
                <p className="text-xs text-slate-500 mb-6 font-medium">Cập nhật: 5 phút trước</p>
                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden mb-3">
                  <div className="bg-blue-600 h-full w-[85%] rounded-full shadow-[0_0_10px_rgba(37,99,235,0.3)]"></div>
                </div>
                <div className="flex justify-between text-[11px] font-black text-slate-400 uppercase tracking-widest">
                  <span>Mức hiện tại: 7.5m</span>
                  <span className="text-red-500">Báo động III</span>
                </div>
              </div>

              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.05)] transition-all hover:translate-y-[-4px] hover:shadow-2xl duration-300 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-125 duration-700"></div>
                <div className="flex items-center gap-4 mb-8 relative">
                  <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                    <Package className="w-6 h-6" />
                  </div>
                  <h4 className="text-xl font-black text-[#133249] uppercase tracking-tight">Nhu cầu cấp thiết</h4>
                </div>
                <ul className="space-y-5 relative">
                  {[
                    { label: "Áo phao cứu hộ", count: "1,250 cái", color: "bg-blue-50 text-blue-700 border-blue-100" },
                    { label: "Lương thực & Nước", count: "3,800 suất", color: "bg-orange-50 text-orange-700 border-orange-100" },
                    { label: "Thuốc y tế cơ bản", count: "600 túi", color: "bg-emerald-50 text-emerald-700 border-emerald-100" },
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
                      <span className="text-slate-700 font-bold text-sm tracking-tight">{item.label}</span>
                      <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border ${item.color}`}>{item.count}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Transparency & Impact Section */}
      <section id="y-nghia" className="py-24 bg-blue-100/30 relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-white to-transparent opacity-50"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl md:text-[5rem] font-black tracking-tighter text-[#133249] mb-8 leading-none">
              Minh bạch & <span className="text-primary italic">Tác động</span>
            </h2>
            <div className="h-1.5 w-24 bg-primary mx-auto mb-8 rounded-full"></div>
            <p className="text-slate-600 text-xl font-medium leading-relaxed max-w-2xl mx-auto">
              Mọi đóng góp đều được ghi nhận và chuyển trực tiếp tới các đơn vị điều phối tại hiện trường.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { label: "TỔNG QUỸ (VND)", value: "24.5B", sub: "Đã giải ngân cho 24 tỉnh thành miền Trung chịu ảnh hưởng" },
              { label: "SUẤT ĂN CUNG CẤP", value: "45k+", sub: "Được kiểm định chất lượng bởi các chuyên gia dinh dưỡng" },
              { label: "GÓI CỨU TRỢ", value: "12k", sub: "Đội ngũ tình nguyện 24/7 vận chuyển nhanh nhất đến người dân" },
            ].map((stat, idx) => (
              <div key={idx} className="bg-white p-12 rounded-[2rem] border border-slate-100 shadow-[0_20px_60px_rgba(0,0,0,0.05)] text-center group hover:-translate-y-4 transition-all duration-500 hover:shadow-2xl">
                <div className="text-6xl md:text-7xl font-black text-[#133249] mb-8 tracking-tighter transition-all group-hover:scale-110 group-hover:text-primary duration-500">{stat.value}</div>
                <div className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">{stat.label}</div>
                <div className="h-0.5 w-16 bg-primary/20 mx-auto mb-8 transition-all group-hover:w-24 duration-500"></div>
                <p className="text-slate-500 text-sm leading-relaxed font-semibold px-4">{stat.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rescue Log Section */}
      <section className="py-24 bg-white/60 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-16">
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-[#133249]">
              Nhật ký <span className="text-primary italic">Cứu trợ</span>
            </h2>
            <Link href="/activities" className="text-sm font-black text-[#133249] uppercase tracking-widest hover:text-primary flex items-center gap-2 group">
              Xem tất cả
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                img: "/images/vietnam_rescue.png",
                tag: "TẠI QUẢNG BÌNH",
                title: "Tiếp cận xã Tân Ninh bằng xuồng máy",
                desc: "Đoàn cứu trợ FPT đã tiếp cận được những hộ dân cuối cùng bị cô lập hoàn toàn tại xã Tân Ninh, huyện Quảng Ninh.",
                time: "20 phút trước"
              },
              {
                img: "/images/vietnam_truck.png",
                tag: "TẠI ĐÀ NẴNG",
                title: "Tổng kho Đà Nẵng xuất kích 10 xe nhu yếu phẩm",
                desc: "10 chuyến xe tải chứa 5,000 suất ăn nhanh và nước sạch đang di chuyển dọc quốc lộ 1A hướng ra các vùng tâm lũ.",
                time: "1 giờ trước"
              },
              {
                img: "https://images.unsplash.com/photo-1516589174184-c685ca33d2b0?q=80&w=800",
                tag: "KHẨN CẤP",
                title: "Hỗ trợ y tế khẩn cấp cho người cao tuổi",
                desc: "Đội phản ứng nhanh cứu trợ y tế đã đưa một cụ bà 75 tuổi tại xã Duy Xuyên, Quảng Nam đến khu vực trạm xá dã chiến.",
                time: "Hôm qua"
              }
            ].map((card, idx) => (
              <div key={idx} className="group cursor-pointer">
                <div className="relative h-64 rounded-3xl overflow-hidden mb-6 shadow-lg border border-slate-100">
                  <img src={card.img} alt={card.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 text-[10px] font-black text-white uppercase tracking-widest">
                    {card.time}
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                    <span className="px-3 py-1 bg-primary text-white text-[9px] font-black rounded-lg uppercase tracking-widest">
                      {card.tag}
                    </span>
                  </div>
                </div>
                <h3 className="text-xl font-black text-[#133249] mb-4 group-hover:text-primary transition-colors leading-tight">{card.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 font-medium">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Donation Section */}
      <section className="py-24 bg-[#f8fafc] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 max-w-xl">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-[#133249] mb-8 leading-[1.1]">
              Mọi sự đóng góp <br />đều là <span className="text-primary italic">Phép màu</span>
            </h2>
            <p className="text-slate-600 text-lg font-medium leading-relaxed mb-10">
              Chung tay cùng FPT mang lại hi vọng và sự sống cho đồng bào miền Trung. Mỗi đóng góp bạn gửi đi là một bữa ăn ngon, một mái ấm an lòng.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-slate-100 shadow-sm">
                <div className="p-3 bg-slate-50 rounded-xl text-slate-400">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">TÊN TÀI KHOẢN</p>
                  <p className="text-lg font-black text-[#133249]">FPT RELIEF FUND</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-slate-100 shadow-sm">
                <div className="p-3 bg-slate-50 rounded-xl text-slate-400">
                  <Info className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">SỐ TÀI KHOẢN (MB BANK)</p>
                  <p className="text-2xl font-black text-primary tracking-tighter">0333 1234 5678</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 w-full max-w-md">
            <div className="bg-white p-10 rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.1)] border border-slate-100 relative group">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl"></div>
              <div className="text-center mb-10">
                <span className="px-4 py-1.5 bg-blue-50 text-blue-600 text-[10px] font-black rounded-full uppercase tracking-widest border border-blue-100 inline-block mb-4">
                  QUÉT ĐỂ ỦNG HỘ
                </span>
                <p className="text-slate-500 text-sm font-semibold">Ủng hộ qua App Ngân hàng</p>
              </div>
              
              <div className="aspect-square bg-slate-50 rounded-[2rem] flex items-center justify-center p-8 border-2 border-dashed border-slate-200 group-hover:border-primary/50 transition-colors duration-500 mb-10">
                {/* Simulated QR Code */}
                <div className="w-full h-full bg-white rounded-2xl shadow-inner flex items-center justify-center relative overflow-hidden p-6">
                  <div className="w-full h-full border-4 border-[#133249]/10 rounded-xl opacity-20"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-[#133249] rounded-2xl flex items-center justify-center">
                      <Shield className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  {/* QR Pattern dots imitation */}
                  <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 opacity-5 p-4">
                     {[...Array(36)].map((_, i) => (
                       <div key={i} className={`m-1 rounded-sm ${Math.random() > 0.5 ? 'bg-black' : 'bg-transparent'}`}></div>
                     ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-slate-50 rounded-2xl">
                  <div className="text-xl font-black text-[#133249]">100%</div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">MINH BẠCH</div>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-2xl">
                  <div className="text-xl font-black text-[#133249]">24/7</div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">HỖ TRỢ</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Final */}
      <section className="py-32 relative overflow-hidden bg-[#133249]">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)", backgroundSize: "40px 40px" }}></div>
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
           <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center mx-auto mb-10 border border-white/20">
             <Heart className="w-10 h-10 text-primary animate-pulse" />
           </div>
           <h2 className="text-5xl md:text-7xl font-black mb-8 text-white tracking-tighter uppercase leading-[1.1]">
             Sát Cánh <br />Vượt Bão Giông
           </h2>
           <p className="text-blue-100 text-xl mb-12 max-w-2xl mx-auto font-medium leading-relaxed opacity-80">
             Đăng ký làm Tình nguyện viên ngay hôm nay hoặc gửi yêu cầu hỗ trợ nếu bạn đang trong vùng nguy hiểm.
           </p>
           <div className="flex flex-col sm:flex-row gap-6 justify-center">
             <Button size="lg" className="rounded-xl px-14 py-6 text-sm bg-primary text-white hover:bg-primary/90 transition-all hover:scale-105 font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/40 border-none" href="/register">
               Tham gia cứu trợ
               <ArrowRight className="w-5 h-5 ml-2" />
             </Button>
             <Button
               variant="outline"
               size="lg"
               className="rounded-xl px-14 py-6 text-sm border-2 border-white text-white hover:bg-white hover:text-[#133249] transition-all hover:scale-105 font-black uppercase tracking-[0.2em]"
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
