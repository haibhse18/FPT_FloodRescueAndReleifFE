"use client";

import Link from "next/link";
import { Shield, Lock, Eye, Database, FileCheck } from "lucide-react";
import { Button } from "@/shared/ui/components/Button";

export default function PrivacyPage() {
  return (
    <div className="dark min-h-screen bg-[#0a1f2e] text-zinc-300 font-sans selection:bg-[#FF7700]/30 py-20 px-4 relative overflow-hidden">
      {/* Cinematic Background */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1547683905-f686c993aae5?q=80&w=2000" 
          alt="Rescue background" 
          className="w-full h-full object-cover opacity-20 mix-blend-luminosity grayscale" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#071520] via-[#0a1f2e]/90 to-[#071520]/80"></div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16 animate-in fade-in slide-in-from-top-8 duration-700 text-white">
          <Link href="/" className="inline-flex items-center gap-3 font-bold text-3xl tracking-tight transition-transform hover:scale-105 mb-6">
            <div className="bg-red-600 p-2.5 rounded-sm shadow-[0_0_20px_rgba(220,38,38,0.5)]">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <span>FloodRescue</span>
          </Link>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-widest uppercase mb-4">
            Chính Sách Bảo Mật
          </h1>
          <div className="h-1 w-24 bg-[#FF7700] mx-auto"></div>
          <p className="mt-6 text-zinc-400 font-light tracking-wide italic">
            "Sự riêng tư của bạn, an toàn của chúng ta"
          </p>
        </div>

        {/* Content Card */}
        <div className="bg-[#0d2536]/60 backdrop-blur-2xl border border-white/10 rounded-sm p-8 md:p-12 shadow-2xl space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-red-500 mb-2">
              <Database className="w-6 h-6" />
              <h2 className="text-xl font-bold uppercase tracking-wider text-white">1. Dữ Liệu Thu Thập</h2>
            </div>
            <p className="leading-relaxed">
              Chúng tôi thu thập thông tin cơ bản để phục vụ cứu hộ khẩn cấp: Tên người dùng, Số điện thoại liên lạc, và quan trọng nhất là Vị trí GPS khi gửi yêu cầu cứu trợ. Thông tin kỹ thuật về thiết bị cũng được ghi nhận để đảm bảo kết nối ổn định trong vùng lũ.
            </p>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3 text-[#FF7700] mb-2">
              <Eye className="w-6 h-6" />
              <h2 className="text-xl font-bold uppercase tracking-wider text-white">2. Mục Đích Sử Dụng</h2>
            </div>
            <p className="leading-relaxed">
              Thông tin của bạn được sử dụng ĐỘC QUYỀN cho mục đích điều phối cứu trợ và cứu hộ. Chúng tôi giúp đội cứu hộ xác định vị trí của bạn nhanh nhất và cung cấp nhu yếu phẩm chính xác theo nhu cầu bạn đã báo cáo qua hệ thống.
            </p>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3 text-blue-400 mb-2">
              <Lock className="w-6 h-6" />
              <h2 className="text-xl font-bold uppercase tracking-wider text-white">3. Bảo Mật & Chia Sẻ</h2>
            </div>
            <p className="leading-relaxed">
              Dữ liệu vị trí và tình trạng khẩn cấp chỉ được chia sẻ cho các Coordinator đã xác thực và các Đội cứu trợ đang làm nhiệm vụ trực tiếp tại khu vực của bạn. Chúng tôi KHÔNG chia sẻ thông tin cho bất kỳ bên thứ ba nào ngoài mục đích cứu hộ thiên tai.
            </p>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3 text-emerald-400 mb-2">
              <FileCheck className="w-6 h-6" />
              <h2 className="text-xl font-bold uppercase tracking-wider text-white">4. Lưu Trữ & Hủy Bỏ</h2>
            </div>
            <p className="leading-relaxed">
              Dữ liệu hoạt động cứu trợ sẽ được lưu trữ làm hồ sơ lịch sử để tối ưu hóa quy trình ứng phó thiên tai trong tương lai. Người dùng có quyền yêu cầu ẩn danh hoặc xóa dữ liệu cá nhân sau khi trạng thái khẩn cấp tại khu vực đã được công bố kết thúc.
            </p>
          </section>

          <div className="pt-10 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <p className="text-sm text-zinc-500 italic">Cập nhật lần cuối: 19 tháng 03, 2026</p>
            <div className="flex gap-4">
              <Button 
                variant="outline" 
                href="/register"
                className="border-white/20 text-white hover:bg-white hover:text-black transition-all font-bold uppercase tracking-widest text-xs py-5 px-8 rounded-sm"
              >
                Quay lại Đăng ký
              </Button>
              <Button 
                href="/terms"
                className="bg-[#FF7700] text-white border border-white/40 hover:bg-white hover:text-[#0a1f2e] hover:rounded-full transition-all font-bold uppercase tracking-widest text-xs py-5 px-8 rounded-sm shadow-[0_0_20px_rgba(255,119,0,0.3)]"
              >
                Quy định an toàn
              </Button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center mt-12 text-zinc-500 text-xs font-semibold uppercase tracking-[0.2em]">
          &copy; 2026 FloodRescue Platform - Bảo Kim Thông Tin
        </div>
      </div>
    </div>
  );
}
