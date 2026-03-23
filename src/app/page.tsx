import React from "react";
import Link from "next/link";
import { 
  ArrowRight, PhoneCall, MapPin, Droplet, Package, 
  Building, Phone, Heart, ChevronRight, CheckCircle2,
  AlertCircle, Shield, LucideIcon,
  Instagram,
  Facebook
} from "lucide-react";

export default function Home() {
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
            <Link href="/" className="text-blue-600 border-b-2 border-blue-600 py-6">Trang chủ</Link>
            <Link href="/" className="hover:text-blue-600 transition-colors py-6">Hoạt động</Link>
            <Link href="/" className="hover:text-blue-600 transition-colors py-6">Ủng hộ</Link>
            <Link href="/" className="hover:text-blue-600 transition-colors py-6">Liên hệ</Link>
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
      <section className="py-20 bg-slate-50 border-t border-slate-200">
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
              <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1500" alt="Map" className="w-full h-full object-cover grayscale opacity-60 mix-blend-darken" />
              
              {/* Map Pins */}
              <div className="absolute top-[40%] left-[30%] w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-md animate-bounce"></div>
              <div className="absolute top-[30%] left-[60%] w-4 h-4 bg-amber-700 rounded-full border-2 border-white shadow-md"></div>
              
              {/* Map floating card */}
              <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-white/50 w-64">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">Điểm nóng cứu trợ</p>
                <h4 className="font-bold text-slate-900 text-lg">Huyện Lệ Thủy, Quảng Bình</h4>
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
                <h3 className="font-bold text-slate-900 text-lg mb-1">Mức nước sông Hương</h3>
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

      {/* STATS SECTION */}
      <section className="py-20 bg-white">
        <div className="max-w-[1000px] mx-auto px-6 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
            Minh bạch & <span className="text-blue-700">Tác động</span>
          </h2>
          <p className="text-slate-600 mb-12">
            Mọi đóng góp đều được ghi nhận và chuyển tới trực tiếp đến tay người dân.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { value: "24.5B", unit: "TỔNG QUỸ (VNĐ)", label: "Đã giải ngân 15.2B cho công tác cứu trợ khẩn cấp.", color: "text-blue-700" },
              { value: "45k+", unit: "SUẤT ĂN CUNG CẤP", label: "Được trao trong đợt thiên tai cho các hộ gia đình.", color: "text-red-500" },
              { value: "12k", unit: "GÓI CỨU TRỢ", label: "Bao gồm nhu yếu phẩm, chăn màn và đồ dùng vệ sinh.", color: "text-blue-700" },
            ].map((stat, idx) => (
              <div key={idx} className="bg-white border border-slate-100 rounded-2xl p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
                <div className={`text-4xl md:text-5xl font-black mb-2 ${stat.color}`}>{stat.value}</div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">{stat.unit}</div>
                <p className="text-sm text-slate-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NEWS SECTION */}
      <section className="py-20 bg-slate-50">
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
              <div className="relative h-60 rounded-2xl overflow-hidden mb-5 bg-[#1a1a1a] flex items-center justify-center">
                <img src="https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?q=80&w=800" alt="News 1" className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-xs font-bold px-3 py-1.5 rounded-full text-slate-800">
                  14:30 HÔM NAY
                </div>
              </div>
              <h3 className="font-bold text-xl text-slate-900 mb-3 group-hover:text-blue-700 transition-colors">
                Tiếp cận xã Tân Ninh bằng xuồng máy
              </h3>
              <p className="text-slate-600 text-sm line-clamp-3">
                Đoàn cứu trợ FPT đã tiếp cận thành công 50 hộ dân bị cô lập hoàn toàn tại xã Tân Ninh, trao tận tay thực phẩm thiết yếu...
              </p>
            </div>

            {/* News 2 */}
            <div className="group cursor-pointer">
              <div className="relative h-60 rounded-2xl overflow-hidden mb-5 bg-slate-200 flex items-center justify-center">
                <img src="https://image.voh.com.vn/voh/image/2024/10/30/cuu-tro-ung-ho-dong-bao-lu-lut-bao-082619.jpg" alt="News 2" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-xs font-bold px-3 py-1.5 rounded-full text-slate-800">
                  09:00 HÔM NAY
                </div>
              </div>
              <h3 className="font-bold text-xl text-slate-900 mb-3 group-hover:text-blue-700 transition-colors">
                Hơn 1.387 tỷ đồng đăng ký ủng hộ đồng bào vùng lũ qua Ban Vận động cứu trợ Trung ương
              </h3>
              <p className="text-slate-600 text-sm line-clamp-3">
               Ban Vận động cứu trợ Trung ương – Ủy ban Trung ương MTTQ Việt Nam cho biết đã có hơn 1.387 tỷ đồng và hiện vật được các tổ chức, cá nhân đăng ký ủng hộ hỗ trợ đồng bào các tỉnh bị thiệt hại do mưa lũ.
              </p>
            </div>

            {/* News 3 */}
            <div className="group cursor-pointer">
              <div className="relative h-60 rounded-2xl overflow-hidden mb-5 bg-[#1b5e58] flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <div className="w-12 h-12 bg-white flex items-center justify-center" style={{ clipPath: "polygon(35% 0, 65% 0, 65% 35%, 100% 35%, 100% 65%, 65% 65%, 65% 100%, 35% 100%, 35% 65%, 0 65%, 0 35%, 35% 35%)" }}></div>
                </div>
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-xs font-bold px-3 py-1.5 rounded-full text-slate-800">
                  HÔM QUA
                </div>
              </div>
              <h3 className="font-bold text-xl text-slate-900 mb-3 group-hover:text-blue-700 transition-colors">
                Hỗ trợ y tế khẩn cấp cho người cao tuổi
              </h3>
              <p className="text-slate-600 text-sm line-clamp-3">
                Đội ngũ y bác sĩ tình nguyện FPT đã có mặt tại điểm sơ tán, khám chữa bệnh và cấp phát thuốc cho 200 bà con...
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* DONATE SECTION */}
      <section className="py-24 bg-white relative overflow-hidden">
        {/* Background blob */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-50 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

        <div className="max-w-[1200px] mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1">
            <h2 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-6">
              Mọi sự đóng góp <br/>
              đều là <span className="text-blue-700">Phép màu</span>
            </h2>
            <p className="text-slate-600 text-lg mb-10 leading-relaxed">
              Chung tay cùng FPT mang lại hi vọng và sự sống cho cộng đồng miền Trung. Mỗi đồng tiền bạn gửi đi là một bữa ăn ngon, một manh áo ấm.
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-4 bg-slate-50 border border-slate-100 p-5 rounded-xl">
                <div className="p-3 bg-white rounded-lg shadow-sm text-blue-700">
                  <Building className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Tài khoản chung</p>
                  <p className="font-bold text-slate-900 text-lg tracking-wide">FPT RELIEF FUND</p>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-slate-50 border border-slate-100 p-5 rounded-xl">
                <div className="p-3 bg-white rounded-lg shadow-sm text-blue-700">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Số điện thoại (Momo)</p>
                  <p className="font-bold text-slate-900 text-lg tracking-wide">0900 1234 5678</p>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full md:w-[450px]">
            <div className="bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-slate-100 p-10 text-center relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-100 text-blue-700 text-xs font-bold px-4 py-2 rounded-full uppercase tracking-widest">
                Quét bằng app
              </div>
              
              <div className="bg-[#fdf4ee] p-8 rounded-2xl mb-8 flex justify-center">
                {/* Mock QR Code */}
                <div className="w-40 h-40 bg-white p-2 rounded-xl shadow-sm border border-slate-200">
                  <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=Donate" alt="QR Code" className="w-full h-full opacity-80" />
                </div>
              </div>

              <h4 className="font-bold text-2xl text-slate-900 mb-2">Ủng hộ qua App Ngân hàng</h4>
              <p className="text-slate-500 text-sm mb-10">Mở app Mobile Banking và quét mã để ủng hộ</p>

              <div className="flex justify-center gap-12 border-t border-slate-100 pt-8">
                <div>
                  <div className="font-bold text-blue-700 text-xl mb-1">100%</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Minh bạch</div>
                </div>
                <div>
                  <div className="font-bold text-blue-700 text-xl mb-1">24/7</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hỗ trợ</div>
                </div>
              </div>
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
