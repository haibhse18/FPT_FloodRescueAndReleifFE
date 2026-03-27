"use client";
import React, { useState, useEffect } from "react";
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
  Zap,
  Cpu,
  Map as MapIcon,
  Bell,
  Layout,
} from "lucide-react";

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
          variant="light"
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
            src="https://cdn.nhandan.vn/images/867ea768657a7655eff9045b05592d1bfc368399f6efb1948af0d0ac16b2bc7ca780101c5d0bea1627de200cb12ee176a08994d06e48dce2505ee36281722caf9693b5cf5f6e86bbc1d7c48a5d9e414bce3f433e9da648e0ceb749d8fe0ca549/z7109955258270-a682e3d55eecb0c38ff38c84a99ca043-8274.jpg"
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

      {/* Real-time Features Section */}
      <section id="hoat-dong" className="py-24 bg-white/60 backdrop-blur-md relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-6">
            <div className="max-w-2xl">
              <p className="text-primary font-black text-sm uppercase tracking-[0.3em] mb-4">TÍNH NĂNG ƯU VIỆT</p>
              <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-[#133249] leading-none mb-6">
                Giải pháp <span className="text-primary italic">Toàn diện</span> cho Cứu hộ
              </h2>
              <p className="text-slate-500 text-lg font-medium leading-relaxed">
                Hệ thống tích hợp mọi công cụ cần thiết để đẩy nhanh tốc độ cứu trợ và tối ưu hóa nguồn lực trong mọi điều kiện thời tiết.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Yêu cầu Cứu hộ Nhanh chóng",
                desc: "Gửi yêu cầu cứu hộ chỉ trong vài giây với thông tin vị trí chính xác và mức độ khẩn cấp.",
                icon: <Zap className="w-8 h-8" />,
                color: "bg-amber-500",
                shadow: "shadow-amber-200/50",
                delay: "delay-100"
              },
              {
                title: "Điều phối Nhiệm vụ Thông minh",
                desc: "Phân công và theo dõi nhiệm vụ cứu hộ tập trung, đảm bảo không khu vực nào bị bỏ sót.",
                icon: <Cpu className="w-8 h-8" />,
                color: "bg-blue-600",
                shadow: "shadow-blue-200/50",
                delay: "delay-200"
              },
              {
                title: "Quản lý Đội Cứu hộ & Vật tư",
                desc: "Tổ chức đội ngũ và nguồn lực hiệu quả, kiểm soát kho vận và luồng hàng cứu trợ thời gian thực.",
                icon: <Package className="w-8 h-8" />,
                color: "bg-indigo-600",
                shadow: "shadow-indigo-200/50",
                delay: "delay-300"
              },
              {
                title: "Bản đồ Thời gian Thực",
                desc: "Theo dõi vị trí và tiến độ trực tiếp trên bản đồ số, cập nhật liên tục tình hình ngập lụt.",
                icon: <MapIcon className="w-8 h-8" />,
                color: "bg-emerald-500",
                shadow: "shadow-emerald-200/50",
                delay: "delay-400"
              },
              {
                title: "Thông báo & Cập nhật Tức thì",
                desc: "Kết nối mọi bên trong hoạt động cứu hộ qua hệ thống sms và thông báo đẩy tự động.",
                icon: <Bell className="w-8 h-8" />,
                color: "bg-rose-500",
                shadow: "shadow-rose-200/50",
                delay: "delay-500"
              },
              {
                title: "Giao diện Thân thiện",
                desc: "Dễ sử dụng ngay cả trong tình huống khẩn cấp, thiết kế tối ưu cho mọi thiết bị di động.",
                icon: <Layout className="w-8 h-8" />,
                color: "bg-cyan-500",
                shadow: "shadow-cyan-200/50",
                delay: "delay-600"
              }
            ].map((feature, idx) => (
              <div 
                key={idx} 
                className={`group p-10 rounded-[2.5rem] bg-white border border-slate-100 shadow-[0_15px_40px_rgba(0,0,0,0.04)] transition-all duration-500 hover:-translate-y-4 hover:shadow-[0_40px_80px_rgba(0,0,0,0.08)] hover:border-primary/20 relative overflow-hidden`}
              >
                {/* Decorative background blur */}
                <div className={`absolute -right-8 -top-8 w-32 h-32 ${feature.color} opacity-[0.03] rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700`}></div>
                
                <div className={`w-16 h-16 ${feature.color} rounded-2xl flex items-center justify-center text-white mb-10 shadow-lg ${feature.shadow} transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6`}>
                  {feature.icon}
                </div>
                
                <h3 className="text-2xl font-black text-[#133249] mb-4 tracking-tight leading-none group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                
                <p className="text-slate-500 font-medium leading-relaxed text-base">
                  {feature.desc}
                </p>
                
                <div className="mt-10 flex items-center gap-2 text-primary text-xs font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">
                  Khám phá ngay
                  <ArrowRight className="w-4 h-4" />
                </div>
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                img: "https://media.vov.vn/sites/default/files/styles/large_watermark/public/2024-10/cong_an_huyen_le_thuy_ho_tro_nguoi_dan_trong_lu.jpg",
                tag: "TẠI QUẢNG BÌNH",
                title: "Tiếp cận xã Tân Ninh bằng xuồng máy",
                desc: "Đoàn cứu trợ FPT đã tiếp cận được những hộ dân cuối cùng bị cô lập hoàn toàn tại xã Tân Ninh, huyện Quảng Ninh.",
                time: "20 phút trước"
              },
              {
                img: "https://danviet.ex-cdn.com/files/f1/296231569849192448/2024/9/10/z5815381724409fd59230abfc769e996903c2cff1b7c54-17259415614311852644499.jpeg",
                tag: "TẠI ĐÀ NẴNG",
                title: "Tổng kho Đà Nẵng xuất kích 10 xe nhu yếu phẩm",
                desc: "10 chuyến xe tải chứa 5,000 suất ăn nhanh và nước sạch đang di chuyển dọc quốc lộ 1A hướng ra các vùng tâm lũ.",
                time: "1 giờ trước"
              },
              {
                img: "https://media.vietnamplus.vn/images/7e482ce660fa258aaa7bebc4c2bfe04d89d01a96ed855b7206cb635c5a884d64ff658d6787173211134a8ca957f95447/ttxvn-mua-lu.jpg",
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
              Đăng ký ngay
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

      <Footer variant="light" />
    </main>
  );
}
