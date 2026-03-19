"use client";

import Link from "next/link";
import { Shield, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { Button } from "@/shared/ui/components/Button";

export default function TermsPage() {
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
        <div className="text-center mb-16 animate-in fade-in slide-in-from-top-8 duration-700">
          <Link href="/" className="inline-flex items-center gap-3 font-bold text-3xl tracking-tight transition-transform hover:scale-105 mb-6 text-white">
            <div className="bg-red-600 p-2.5 rounded-sm shadow-[0_0_20px_rgba(220,38,38,0.5)]">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <span>FloodRescue</span>
          </Link>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-widest uppercase mb-4">
            Quy Định An Toàn
          </h1>
          <div className="h-1 w-24 bg-[#FF7700] mx-auto"></div>
          <p className="mt-6 text-zinc-400 font-light tracking-wide italic">
            "Mỗi hành động kỷ luật là một cơ hội cứu sống"
          </p>
        </div>

        {/* Content Card */}
        <div className="bg-[#0d2536]/60 backdrop-blur-2xl border border-white/10 rounded-sm p-8 md:p-12 shadow-2xl space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-red-500 mb-2">
              <AlertTriangle className="w-6 h-6" />
              <h2 className="text-xl font-bold uppercase tracking-wider">1. Trách Nhiệm Thông Tin</h2>
            </div>
            <p className="leading-relaxed">
              Người sử dụng (Citizen) cam kết chỉ gửi các yêu cầu cứu hộ, cứu trợ khi thực sự có nhu cầu khẩn cấp. Mọi hành vi cố tình gửi tin giả, thông tin sai lệch gây nhiễu loạn điều phối sẽ bị khóa tài khoản vĩnh viễn và xử lý theo quy định của pháp luật về tình trạng khẩn cấp.
            </p>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3 text-[#FF7700] mb-2">
              <Shield className="w-6 h-6" />
              <h2 className="text-xl font-bold uppercase tracking-wider">2. An Toàn Hiện Trường</h2>
            </div>
            <p className="leading-relaxed">
              Đối với Tình nguyện viên và Đội cứu hộ: Tuyệt đối tuân thủ chỉ dẫn của Bộ chỉ huy (Coordinator). Không tự ý di chuyển vào vùng nước nguy hiểm vượt quá khả năng trang bị. An toàn của lực lượng cứu hộ là ưu tiên hàng đầu để duy trì hoạt động hỗ trợ lâu dài.
            </p>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3 text-blue-400 mb-2">
              <CheckCircle className="w-6 h-6" />
              <h2 className="text-xl font-bold uppercase tracking-wider">3. Phối Hợp & Điều Phối</h2>
            </div>
            <p className="leading-relaxed">
              Hệ thống vận hành dựa trên sự phân cấp ưu tiên. Các yêu cầu cứu hộ liên quan đến sinh mạng sẽ luôn được ưu tiên trước các yêu cầu về nhu yếu phẩm. Người dùng cần duy trì liên lạc và cập nhật trạng thái thực tế qua ứng dụng để tránh lãng phí nguồn lực cứu trợ.
            </p>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3 text-emerald-400 mb-2">
              <Info className="w-6 h-6" />
              <h2 className="text-xl font-bold uppercase tracking-wider">4. Sử Dụng Tài Nguyên</h2>
            </div>
            <p className="leading-relaxed">
              Nhu yếu phẩm và trang thiết bị cứu hộ (Manager quản lý) phải được sử dụng đúng mục đích, đúng đối tượng. Nghiêm cấm mọi hành vi trục lợi, tích trữ hoặc phân phối không thông qua hệ thống điều phối của FloodRescue.
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
                href="/privacy"
                className="bg-[#FF7700] text-white border border-white/40 hover:bg-white hover:text-[#0a1f2e] hover:rounded-full transition-all font-bold uppercase tracking-widest text-xs py-5 px-8 rounded-sm shadow-[0_0_20px_rgba(255,119,0,0.3)]"
              >
                Chính sách bảo mật
              </Button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center mt-12 text-zinc-500 text-xs font-semibold uppercase tracking-[0.2em]">
          &copy; 2026 FloodRescue Platform - Nỗ Lực Vì Sự Sống
        </div>
      </div>
    </div>
  );
}
