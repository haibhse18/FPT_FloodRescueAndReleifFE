"use client";

import Link from "next/link";
import { Navigation } from "@/shared/ui/components/Navigation";
import { Footer } from "@/shared/ui/components/Footer";
import { Button } from "@/shared/ui/components/Button";
import { InfoCard } from "@/shared/ui/components/Card";
import {
  Shield,
  Heart,
  Users,
  ArrowRight,
  Activity,
  MapPin,
  Phone,
  LifeBuoy,
  AlertTriangle,
} from "lucide-react";

export default function Home() {
  return (
    // Force dark mode for a solemn, dramatic emergency atmosphere
    <main className="dark min-h-screen flex flex-col bg-background text-foreground font-sans selection:bg-red-500/30">
      
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
              <Button variant="primary" size="sm" href="/register" className="font-semibold bg-white text-black hover:bg-gray-200 rounded-sm uppercase tracking-widest text-xs">
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
          <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/50 to-background"></div>
          {/* Subtle red emergency glow */}
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
            Hàng ngàn gia đình đang mắc kẹt không điện, không thức ăn. Lực lượng cứu hộ phân tán. 
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
              className="rounded-sm px-10 py-8 text-lg border-2 border-white/30 bg-black/40 backdrop-blur-md text-white hover:bg-white hover:text-black transition-all uppercase tracking-widest font-semibold"
              href="/register"
            >
              THAM GIA LỰC LƯỢNG CỨU HỘ
            </Button>
          </div>
        </div>
      </section>

      {/* Critical Stats Bar */}
      <section className="relative z-20 border-y border-white/5 bg-zinc-950/80 backdrop-blur-xl">
         <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 divide-y md:divide-y-0 md:divide-x divide-white/10">
              
              <div className="flex flex-col items-center text-center px-6">
                <Activity className="w-10 h-10 text-red-500 mb-4 animate-pulse" />
                <h3 className="font-bold text-2xl text-white mb-2 tracking-tight">Cảnh Báo & Cứu Nạn</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Hệ thống phát tín hiệu SOS trực tiếp đến các trung tâm chỉ huy 24/7.
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center px-6 pt-10 md:pt-0">
                <MapPin className="w-10 h-10 text-blue-500 mb-4" />
                <h3 className="font-bold text-2xl text-white mb-2 tracking-tight">Định Vị Tọa Độ</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Bản đồ vệ tinh cập nhật vùng an toàn và vị trí của từng đội cứu hộ.
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center px-6 pt-10 md:pt-0">
                <Phone className="w-10 h-10 text-emerald-500 mb-4" />
                <h3 className="font-bold text-2xl text-white mb-2 tracking-tight">Kênh Liên Lạc 24/7</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Đảm bảo liên lạc thông suốt kể cả trong điều kiện đường truyền yếu nhất.
                </p>
              </div>
              
            </div>
         </div>
      </section>

      {/* Solumn Roles Section */}
      <section className="py-24 bg-background relative border-b border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-20 grid grid-cols-1 lg:grid-cols-2 gap-10 items-end">
            <div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-6 text-white uppercase">
                Liên kết <br/> Mọi Lực Lượng
              </h2>
              <div className="h-1 w-20 bg-red-600"></div>
            </div>
            <p className="text-lg text-zinc-400 leading-relaxed font-light">
              Nền tảng của chúng tôi sinh ra để hợp nhất toàn bộ các nỗ lực đơn lẻ. Từ người dân cần gọi cứu trợ đến các đội cứu hộ tuyến đầu và chỉ huy tổng lực. 
              <strong className="text-white font-medium block mt-2">Sự phối hợp không độ trễ chính là chìa khóa giành lại sự sống.</strong>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Citizens */}
            <div className="group flex flex-col h-full bg-zinc-900 rounded-sm overflow-hidden shadow-2xl border border-white/5 hover:border-white/20 transition-all duration-500 hover:-translate-y-2">
              <div className="h-64 w-full relative overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-700">
                 <img src="https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?q=80&w=800" alt="Người dân" className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-1000" />
                 <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/60 to-transparent"></div>
                 <div className="absolute top-4 right-4 bg-zinc-950/80 backdrop-blur-sm p-2 rounded-sm border border-white/10">
                    <Users className="w-6 h-6 text-blue-400" />
                 </div>
              </div>
              <div className="p-8 flex-1 flex flex-col -mt-10 relative z-10">
                <h3 className="text-2xl font-bold text-white mb-4 uppercase tracking-wider">Người Dân</h3>
                <p className="text-zinc-400 leading-relaxed font-light">Báo cáo tình trạng khẩn cấp, gửi định vị GPS cho lực lượng cứu hộ, tìm kiếm tuyến đường sơ tán và nơi trú ẩn an toàn gần nhất.</p>
              </div>
            </div>
            
            {/* Rescue Teams */}
            <div className="group flex flex-col h-full bg-zinc-900 rounded-sm overflow-hidden shadow-2xl border border-red-500/20 hover:border-red-500/50 transition-all duration-500 hover:-translate-y-2 scale-y-105 z-10">
              <div className="h-64 w-full relative overflow-hidden transition-all duration-700">
                 <img src="https://images.unsplash.com/photo-1593113514676-c95690b22031?q=80&w=800" alt="Đội cứu hộ" className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-1000" />
                 <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-red-950/60 to-transparent"></div>
                 <div className="absolute top-4 right-4 bg-red-600 p-2 rounded-sm shadow-[0_0_15px_rgba(220,38,38,0.5)]">
                    <Shield className="w-6 h-6 text-white animate-pulse" />
                 </div>
              </div>
              <div className="p-8 flex-1 flex flex-col -mt-10 relative z-10">
                <h3 className="text-2xl font-bold text-white mb-4 uppercase tracking-wider">Lực Lượng Cứu Hộ</h3>
                <p className="text-zinc-300 leading-relaxed font-light">Tiếp nhận lệnh điều phối theo thời gian thực. Cập nhật trạng thái sống còn của thành viên trong đội và báo cáo hoàn thành chiến dịch ngay tại hiện trường.</p>
              </div>
            </div>
            
            {/* Coordinators */}
            <div className="group flex flex-col h-full bg-zinc-900 rounded-sm overflow-hidden shadow-2xl border border-white/5 hover:border-white/20 transition-all duration-500 hover:-translate-y-2">
               <div className="h-64 w-full relative overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-700">
                 <img src="https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?q=80&w=800" alt="Trung tâm điều phối" className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-1000" />
                 <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/60 to-transparent"></div>
                 <div className="absolute top-4 right-4 bg-zinc-950/80 backdrop-blur-sm p-2 rounded-sm border border-white/10">
                    <Heart className="w-6 h-6 text-amber-500" />
                 </div>
               </div>
              <div className="p-8 flex-1 flex flex-col -mt-10 relative z-10">
                <h3 className="text-2xl font-bold text-white mb-4 uppercase tracking-wider">Bộ Chỉ Huy</h3>
                <p className="text-zinc-400 leading-relaxed font-light">Sử dụng màn hình tổng giám sát (Bird's-eye analytics) để điều phối tàu, nhu yếu phẩm và lực lượng cứu hộ mạnh mẽ nhất vào các rốn lũ khẩn cấp.</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Call to Action - Stark and Direct */}
      <section className="py-32 relative overflow-hidden flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-800 via-zinc-950 to-black">
        <div className="absolute top-0 right-0 -mr-32 -mt-32 w-[40rem] h-[40rem] bg-red-900/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-[40rem] h-[40rem] bg-blue-900/10 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="max-w-4xl mx-auto px-6 text-center relative z-20">
          <Shield className="w-20 h-20 text-white/20 mx-auto mb-10 drop-shadow-2xl" />
          <h2 className="text-4xl md:text-6xl font-black mb-8 text-white tracking-tighter uppercase">
            Sẵn Sàng Hành Động
          </h2>
          <p className="text-zinc-400 text-xl mb-12 max-w-2xl mx-auto font-light leading-relaxed">
            Mạng lưới của chúng tôi chỉ hoạt động hiệu quả khi có bạn. Đăng ký để tình nguyện hoặc đăng nhập để quản lý tài nguyên ngay bây giờ.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button size="lg" className="rounded-sm px-14 py-8 text-lg bg-white text-black hover:bg-gray-200 transition-all hover:scale-105 font-bold uppercase tracking-widest shadow-[0_0_30px_rgba(255,255,255,0.1)]" href="/register">
              Ghi Danh Ngay
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="rounded-sm px-14 py-8 text-lg border-2 border-white/30 bg-transparent text-white hover:bg-white hover:text-black transition-all uppercase tracking-widest font-bold"
              href="/login"
            >
              Cổng Đăng Nhập
            </Button>
          </div>
        </div>
      </section>

      {/* Partners / Sponsoring Organizations Section */}
      <section className="py-24 bg-zinc-950 border-t border-white/10 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-900/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
          <h3 className="text-sm font-black tracking-[0.3em] text-zinc-500 uppercase mb-16">
            Được Tin Tưởng Bởi Các Tổ Chức Cứu Trợ Toàn Cầu
          </h3>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-60 grayscale hover:grayscale-0 transition-all duration-700">
             <div className="flex items-center gap-3 font-black text-2xl text-white hover:text-red-500 transition-colors cursor-default"><Shield className="w-8 h-8"/> UN RED CROSS</div>
             <div className="flex items-center gap-3 font-black text-2xl text-white hover:text-blue-500 transition-colors cursor-default"><Activity className="w-8 h-8"/> GLOBAL RELIEF</div>
             <div className="flex items-center gap-3 font-black text-2xl text-white hover:text-emerald-500 transition-colors cursor-default"><Heart className="w-8 h-8"/> CARE FOUNDATION</div>
             <div className="flex items-center gap-3 font-black text-2xl text-white hover:text-amber-500 transition-colors cursor-default"><Phone className="w-8 h-8"/> VIETCOM NETWORK</div>
          </div>
        </div>
      </section>

      <Footer variant="dark" />
    </main>
  );
}
