'use client'

import { useState } from 'react'

export default function ProfilePage() {
  const [open, setOpen] = useState(false)
  const [avatar, setAvatar] = useState<string | null>(null)

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const url = URL.createObjectURL(file)
    setAvatar(url)
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-24">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-b-3xl shadow-lg">
        <div className="flex items-center gap-4">
          {/* AVATAR */}
          <label className="relative cursor-pointer active:scale-95 transition">
            <div className="w-20 h-20 rounded-full bg-white overflow-hidden flex items-center justify-center shadow-md">
              {avatar ? (
                <img
                  src={avatar}
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl">👤</span>
              )}
            </div>

            {/* camera icon */}
            <div className="absolute bottom-0 right-0 bg-blue-600 text-white text-xs px-2 py-1 rounded-full shadow">
              📷
            </div>

            <input
              type="file"
              accept="image/*"
              hidden
              onChange={handleAvatarChange}
            />
          </label>

          <div className="text-white">
            <p className="text-lg font-semibold">Nguyễn Văn A</p>
            <p className="text-sm opacity-90">Cư dân – Phường An Khánh</p>
          </div>
        </div>
      </div>

      {/* BODY */}
      <div className="px-4 mt-6 space-y-4 max-w-md mx-auto">
        <Card title="📋 Thông tin cá nhân">
          <Info label="📞 Số điện thoại" value="0909 000 000" />
          <Info label="🏠 Địa chỉ" value="Quận Ninh Kiều, Cần Thơ" />
          <Info label="👥 Số người trong nhà" value="4 người" />
        </Card>

        <Card title="⚠️ Tình trạng hiện tại">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-sm font-medium text-green-700">
              An toàn – chưa cần hỗ trợ
            </span>
          </div>
        </Card>

        <button
          onClick={() => setOpen(true)}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold active:scale-95 transition"
        >
          ✏️ Chỉnh sửa hồ sơ
        </button>

        <button className="w-full bg-white text-red-600 border border-red-300 py-3 rounded-xl font-semibold active:scale-95 transition">
          🚨 Báo cáo khẩn cấp
        </button>
      </div>

      {open && <EditProfileModal onClose={() => setOpen(false)} />}
    </div>
  )
}

/* ================= MODAL ================= */

function EditProfileModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50">
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />

      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 animate-slideUp">
        <h2 className="text-lg font-semibold mb-4">
          ✏️ Chỉnh sửa hồ sơ
        </h2>

        <div className="space-y-3">
          <Input label="Họ và tên" placeholder="Nguyễn Văn A" />
          <Input label="Số điện thoại" placeholder="0909 000 000" />
          <Input label="Địa chỉ" placeholder="Quận Ninh Kiều, Cần Thơ" />
          <Input label="Số người trong nhà" placeholder="4" />
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 bg-blue-600 text-white py-3 rounded-xl font-semibold active:scale-95 transition"
        >
          💾 Lưu thay đổi
        </button>
      </div>
    </div>
  )
}

/* ================= UI PARTS ================= */

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
      <p className="font-semibold text-sm">{title}</p>
      {children}
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-800">{value}</span>
    </div>
  )
}

function Input({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <div>
      <label className="text-xs text-gray-500">{label}</label>
      <input
        placeholder={placeholder}
        className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  )
}
