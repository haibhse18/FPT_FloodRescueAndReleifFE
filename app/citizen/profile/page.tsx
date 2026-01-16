export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gray-100 flex justify-center">
      <div className="w-full max-w-md bg-white">
        {/* HEADER */}
        <div className="bg-blue-600 text-white px-4 py-4 rounded-b-3xl shadow">
          <h1 className="text-lg font-bold">👤 Hồ sơ cá nhân</h1>
          <p className="text-sm opacity-90">
            Thông tin giúp hỗ trợ nhanh khi có thiên tai
          </p>
        </div>

        {/* CONTENT */}
        <div className="p-4 space-y-6">
          {/* AVATAR */}
          <div className="flex flex-col items-center gap-3">
            <div className="w-24 h-24 rounded-full bg-gray-300" />
            <button className="text-blue-600 text-sm font-semibold">
              Thay ảnh đại diện
            </button>
          </div>

          {/* FORM */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold">Họ và tên</label>
              <input
                type="text"
                defaultValue="Nguyễn Văn A"
                className="mt-1 w-full rounded-xl border border-gray-300 p-3 text-sm
                           focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="text-sm font-semibold">Số điện thoại</label>
              <input
                type="tel"
                defaultValue="0909 123 456"
                className="mt-1 w-full rounded-xl border border-gray-300 p-3 text-sm
                           focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="text-sm font-semibold">Địa chỉ hiện tại</label>
              <input
                type="text"
                defaultValue="Phường 3, Quận 8, TP.HCM"
                className="mt-1 w-full rounded-xl border border-gray-300 p-3 text-sm
                           focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="text-sm font-semibold">
                Ghi chú y tế (người già, trẻ em, bệnh nền)
              </label>
              <textarea
                placeholder="Có người già 80 tuổi, cần hỗ trợ di chuyển..."
                className="mt-1 w-full rounded-xl border border-gray-300 p-3 text-sm
                           focus:outline-none focus:ring-2 focus:ring-blue-400"
                rows={3}
              />
            </div>
          </div>

          {/* SAVE BUTTON */}
          <button
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-base
                             active:scale-[0.97] transition shadow-lg"
          >
            LƯU THÔNG TIN
          </button>
        </div>
      </div>
    </div>
  );
}
