"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowRight, PhoneCall, MapPin, Droplet, Package,
  Building, Phone, Heart, ChevronRight, CheckCircle2,
  AlertCircle, Shield, LucideIcon,
  Instagram,
  Facebook
} from "lucide-react";
import dynamic from "next/dynamic";

const OpenMap = dynamic(
  () => import("@/modules/map/presentation/components/OpenMap"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-white/5 border border-white/10 rounded-xl flex items-center justify-center">
        <p className="text-gray-400">Đang tải bản đồ...</p>
      </div>
    ),
  },
);


export default function Home() {
  const [active, setActive] = useState("");
  useEffect(() => {
    const handleHashChange = () => {
      setActive(window.location.hash);
    };

    handleHashChange(); // chạy lần đầu
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 font-sans text-slate-800 selection:bg-blue-200">
      
      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 h-[72px] flex items-center">
        <div className="max-w-[1400px] w-full mx-auto px-6 lg:px-10 flex items-center justify-between">
          <div className="flex items-center gap-2 text-blue-800 font-bold text-lg">
            <Heart className="w-6 h-6 fill-blue-600 text-blue-600" />
            <span>FPT Flood Rescue & Relief</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="/" className={`py-6 ${active === "" ? "text-blue-600 border-b-2 border-blue-600" : "hover:text-blue-600"}`}>
              Trang chủ
            </a>
            <a href="#hoat_dong" className={`py-6 ${active === "#hoat_dong" ? "text-blue-600 border-b-2 border-blue-600" : "hover:text-blue-600"}`}>
              Hoạt động
            </a>
            <a href="#lien_he" className={`py-6 ${active === "#lien_he" ? "text-blue-600 border-b-2 border-blue-600" : "hover:text-blue-600"}`}>
              Liên hệ
            </a>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hidden sm:block text-sm font-medium text-slate-600 hover:text-blue-600">
              Đăng nhập
            </Link>
            <Link href="/register" className="bg-blue-700 hover:bg-blue-800 text-white px-5 py-2.5 rounded-md text-sm font-semibold transition-all">
              Đăng ký
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-[72px] min-h-[600px] lg:h-[800px] flex items-center overflow-hidden bg-white">
        <div className="absolute inset-0 z-0 flex justify-end">
          <div className="w-full lg:w-2/3 h-full relative">
            <img 
              src="https://images.unsplash.com/photo-1547683905-f686c993aae5?q=80&w=2000" 
              alt="Rescue workers" 
              className="w-full h-full object-cover object-right opacity-30 mix-blend-multiply"
            />
            {/* Gradient mask to blend image into the white left side */}
            <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent"></div>
          </div>
        </div>
        
        <div className="relative z-10 max-w-[1400px] w-full mx-auto px-6 lg:px-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-red-50 border border-red-100 px-3 py-1.5 rounded-full text-red-600 text-xs font-bold uppercase tracking-wider mb-6">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
              Tình trạng khẩn cấp: Miền Trung
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-6">
              Sát cánh cùng <br/>
              <span className="text-blue-700">Đồng bào trong lũ dữ</span>
            </h1>
            
            <p className="text-lg text-slate-600 mb-10 leading-relaxed max-w-xl">
              Hệ thống điều phối cứu trợ thông minh của FPT, kết nối nhanh nhất nguồn lực cứu trợ tới những khu vực đang bị cô lập.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Link href="/register" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 text-white px-6 py-3.5 rounded-md font-semibold transition-all shadow-lg shadow-blue-700/20">
                Đăng ký tình nguyện
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/sos" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 px-6 py-3.5 rounded-md font-semibold transition-all">
                <PhoneCall className="w-5 h-5" />
                Gọi cứu trợ khẩn cấp
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* MAP & REALTIME SECTION */}
      <section id ="hoat_dong" className="py-20 bg-slate-50 border-t border-slate-200 scroll-mt-[80px]">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <p className="text-blue-600 text-sm font-bold uppercase tracking-wider mb-2">Bản đồ thực tế</p>
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900">
                Cập nhật tình hình <span className="text-blue-700">Thời gian thực</span>
              </h2>
            </div>
            <div className="flex items-center gap-6 text-sm font-medium text-slate-600">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Ngập nặng
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-700"></span> Cần nhu yếu phẩm
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Map Placeholder */}
            <div className="lg:col-span-2 relative h-[500px] bg-slate-200 rounded-2xl overflow-hidden border border-slate-300 shadow-inner">
              <img 
              src="/img/Map_Lu_Lut.png" 
              alt="Map Lu Lut" 
              className="w-full h-full object-cover object-right "
            />
              {/* Map floating card */}
              <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-white/50 w-64">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">Điểm nóng cứu trợ</p>
                <h4 className="font-bold text-slate-900 text-lg">Phú Lộc, Thành Phố Huế</h4>
              </div>
            </div>

            {/* Sidebar Stats */}
            <div className="flex flex-col gap-6">
              {/* Water level card */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex items-start justify-between mb-6">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                    <Droplet className="w-6 h-6" />
                  </div>
                  <span className="bg-red-50 text-red-600 text-xs font-bold px-2 py-1 rounded">BÁO ĐỘNG 3</span>
                </div>
                <h3 className="font-bold text-slate-900 text-lg mb-1">Mực nước biển </h3>
                <p className="text-slate-500 text-sm mb-4">Cập nhật: 5 phút trước</p>
                
                <div className="w-full bg-slate-100 rounded-full h-2.5 mb-2">
                  <div className="bg-blue-700 h-2.5 rounded-full w-[85%]"></div>
                </div>
                <div className="flex justify-between text-xs font-medium text-slate-500">
                  <span>0.0m</span>
                  <span>4.5m</span>
                </div>
              </div>

              {/* Needs Card */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex-1">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-amber-50 text-amber-700 rounded-lg">
                    <Package className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg">Nhu cầu cấp thiết</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-slate-50">
                    <span className="text-slate-600">Áo phao cứu hộ</span>
                    <span className="font-bold text-blue-700">1,500 cái</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-slate-50">
                    <span className="text-slate-600">Lương khô & Nước</span>
                    <span className="font-bold text-blue-700">3,000 suất</span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-slate-600">Thuốc y tế cơ bản</span>
                    <span className="font-bold text-blue-700">500 túi</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* NEWS SECTION */}
      <section id= "lien_he" className="py-20 bg-slate-50 scroll-mt-[80px]">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <div className="flex justify-between items-end mb-10">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900">
              Nhật ký <span className="text-blue-700">Cứu trợ</span>
            </h2>
            <Link href="/" className="text-blue-600 font-medium hover:underline flex items-center gap-1">
              Xem tất cả <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            {/* News 1 */}
            <div className="group cursor-pointer">
              <div className="relative h-60 rounded-2xl overflow-hidden mb-5 bg-slate-200 flex items-center justify-center">
                <img src="https://image.voh.com.vn/voh/image/2024/10/30/cuu-tro-ung-ho-dong-bao-lu-lut-bao-082619.jpg" alt="News 2" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-xs font-bold px-3 py-1.5 rounded-full text-slate-800">
                  10:17, 20/11/2025 
                </div>
              </div>
              <a href ="https://baochinhphu.vn/tren-1387-ty-dong-dang-ky-ung-ho-dong-bao-vung-lu-qua-ban-van-dong-cuu-tro-trung-uong-102251120093927104.htm" className="font-bold text-xl text-slate-900 mb-3 group-hover:text-blue-700 transition-colors">
                Hơn 1.387 tỷ đồng đăng ký ủng hộ đồng bào vùng lũ qua Ban Vận động cứu trợ Trung ương
              </a>
              <p className="text-slate-600 text-sm line-clamp-3">
               Tính đến thời điểm này, đã có 1,387,1 tỷ đồng và hiện vật đăng ký qua Ban Vận động cứu trợ Trung ương - Ủy ban Trung ương MTTQ Việt Nam nhằm chung tay ủng hộ đồng bào các tỉnh khắc phục hậu quả do mưa lũ gây ra.
              </p>
            </div>

            {/* News 2 */}
            <div className="group cursor-pointer">
              <div className="relative h-60 rounded-2xl overflow-hidden mb-5 bg-[#1b5e58] flex items-center justify-center">
                <img src="https://cdannd1.bocongan.gov.vn/api/Resources/Images/2024/9/11/image-20240911083814-208-37-58.jpeg" alt="News 1" className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-xs font-bold px-3 py-1.5 rounded-full text-slate-800">
                  11:38, 11/09/2024
                </div>
              </div>
              <a href ="https://cdannd1.bocongan.gov.vn/news/blog/5200/hoc-vien-nha-truong-ho-tro-cung-nhan-dan-chong-lu-lut-do-bao-yagi" className="font-bold text-xl text-slate-900 mb-3 group-hover:text-blue-700 transition-colors">
                Học viên Nhà trường hỗ trợ cùng nhân dân chống lũ lụt do bão Yagi
              </a>
              <p className="text-slate-600 text-sm line-clamp-3">
               Học viên Khóa K54S thực tập tại địa bàn các tỉnh phía Bắc nước ta đang cùng bà con nhân dân ra sức phòng, chống các thiệt hại hết sức nghiêm trọng do hoàn lưu bão Yagi gây ra.
               </p>
            </div>
            {/* News 3 */}
            <div className="group cursor-pointer">
              <div className="relative h-60 rounded-2xl overflow-hidden mb-5 bg-[#1a1a1a] flex items-center justify-center">
                <img src="https://kenh14cdn.com/203336854389633024/2024/9/10/tp-11-2209-1725927028250-17259270283241320880834.jpg" alt="News 1" className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-xs font-bold px-3 py-1.5 rounded-full text-slate-800">
                  07:24, 10/09/2024
                </div>
              </div>
              <a href="https://kenh14.vn/xuyen-dem-cuu-ho-nguoi-dan-o-vung-lu-lut-thai-nguyen-215240910071442265.chn" className="font-bold text-xl text-slate-900 mb-3 group-hover:text-blue-700 transition-colors">
                   Xuyên đêm cứu hộ người dân ở vùng lũ lụt Thái Nguyên
              </a>
              <p className="text-slate-600 text-sm line-clamp-3">
                Gần 0h ngày 10/9, lực lượng chức năng vẫn đi xuồng vào các vùng ngập lụt ở thành phố Thái Nguyên (tỉnh Thái Nguyên) để cứu hộ những người đang mắc kẹt.
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* FOOTER */}
      <footer className="py-8 border-t border-slate-200 bg-white">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="text-blue-700 font-bold text-lg mb-1 flex items-center gap-2">
              <Heart className="w-5 h-5 fill-blue-600" />
              FPT Flood Rescue & Relief
            </div>
            <p className="text-slate-400 text-xs">© {new Date().getFullYear()} FPT Flood Rescue & Relief. All rights reserved.</p>
          </div>

          <div className="flex gap-6 text-sm font-medium text-slate-500">
            <Link href="/" className="hover:text-slate-800 transition-colors">Chính sách bảo mật</Link>
            <Link href="/" className="hover:text-slate-800 transition-colors">Điều khoản sử dụng</Link>
            <Link href="/" className="hover:text-slate-800 transition-colors">Liên hệ hỗ trợ</Link>
          </div>

          <div className="flex items-center gap-4">
            <a href="#" className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-blue-100 hover:text-blue-600 transition-colors">
              <Facebook className="w-4 h-4" />
            </a>
            <a href="#" className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-blue-100 hover:text-blue-600 transition-colors">
              <Instagram className="w-4 h-4" />
            </a>
          </div>
        </div>
      </footer>

    </main>
  );
}
