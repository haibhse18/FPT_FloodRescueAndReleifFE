'use client'

import { CheckCircle, Loader2, AlertTriangle, MapPin, Phone } from 'lucide-react'

const steps = [
  {
    title: 'Đã gửi báo cáo',
    desc: 'Hệ thống đã tiếp nhận thông tin của bạn',
    icon: <AlertTriangle size={18} />,
    status: 'done',
  },
  {
    title: 'Xác minh vị trí',
    desc: 'Đang kiểm tra khu vực bị ảnh hưởng',
    icon: <MapPin size={18} />,
    status: 'active',
  },
  {
    title: 'Điều phối cứu hộ',
    desc: 'Đội cứu hộ đang được điều động',
    icon: <Loader2 size={18} className="animate-spin" />,
    status: 'pending',
  },
  {
    title: 'Hoàn tất hỗ trợ',
    desc: 'Bạn đã được hỗ trợ an toàn',
    icon: <CheckCircle size={18} />,
    status: 'pending',
  },
]

export default function StatusPage() {
  return (
    <div className="p-4 max-w-md mx-auto">
      {/* HEADER */}
      <h1 className="text-lg font-bold mb-2">📍 Trạng thái xử lý</h1>
      <p className="text-sm text-gray-600 mb-4">
        Theo dõi tiến trình hỗ trợ của bạn
      </p>

      {/* PROGRESS BAR */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Tiến độ</span>
          <span>50%</span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full w-1/2 bg-blue-600 rounded-full"></div>
        </div>
      </div>

      {/* TIMELINE */}
      <div className="space-y-6">
        {steps.map((step, index) => (
          <div key={index} className="flex items-start gap-3">
            {/* ICON */}
            <div
              className={`
                w-8 h-8 rounded-full flex items-center justify-center text-white text-sm
                ${
                  step.status === 'done'
                    ? 'bg-green-500'
                    : step.status === 'active'
                    ? 'bg-blue-600'
                    : 'bg-gray-300'
                }
              `}
            >
              {step.icon}
            </div>

            {/* CONTENT */}
            <div className="flex-1">
              <h3 className="font-semibold text-sm">{step.title}</h3>
              <p className="text-xs text-gray-600">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* HOTLINE */}
      <div className="mt-8 bg-red-50 border border-red-200 rounded-xl p-4">
        <div className="flex items-center gap-2 text-red-700 font-semibold text-sm">
          <Phone size={16} />
          Hotline khẩn cấp: 112
        </div>
        <p className="text-xs text-red-600 mt-1">
          Gọi ngay nếu tình trạng trở nên nguy hiểm
        </p>
      </div>
    </div>
  )
}
