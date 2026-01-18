'use client';

export default function ReportPage() {
  return (
    <div className="min-h-screen bg-gray-100 pb-24">
      <div className="max-w-md mx-auto bg-white">

        {/* HEADER */}
        <div className="bg-red-600 text-white px-4 py-4 rounded-b-3xl shadow">
          <h1 className="text-lg font-bold flex items-center gap-2">
            🚨 Báo cáo khẩn cấp
          </h1>
          <p className="text-sm opacity-90">
            Gửi thông tin để được hỗ trợ nhanh nhất
          </p>
        </div>

        <div className="p-4 space-y-6">

          {/* EMERGENCY TOGGLE */}
          <label className="flex gap-3 items-start bg-red-50 border-2 border-red-300 rounded-2xl p-4 cursor-pointer">
            <input type="checkbox" className="mt-1 scale-125" />
            <div>
              <p className="text-red-700 font-bold text-sm">
                🚨 CẦN HỖ TRỢ KHẨN CẤP
              </p>
              <p className="text-xs text-red-500 mt-1">
                Nguy hiểm đến tính mạng – ưu tiên xử lý ngay
              </p>
            </div>
          </label>

          {/* DESCRIPTION */}
          <div>
            <label className="text-sm font-semibold">
              Mô tả tình trạng
            </label>
            <textarea
              rows={4}
              placeholder="Nước ngập cao ~1m, có người già và trẻ nhỏ..."
              className="mt-1 w-full border rounded-xl p-3 text-sm
                         focus:outline-none focus:ring-2 focus:ring-red-400"
            />
          </div>

          {/* UPLOAD IMAGE (UI) */}
          <div className="bg-gray-50 border-2 border-dashed rounded-2xl p-4 text-center">
            <p className="text-sm font-semibold">📷 Hình ảnh hiện trường</p>
            <p className="text-xs text-gray-500 mt-1">
              (chưa cần xử lý upload – UI trước)
            </p>

            <div className="mt-3 w-full h-32 bg-gray-200 rounded-xl flex items-center justify-center text-gray-500 text-sm">
              + Thêm hình ảnh
            </div>
          </div>

          {/* MAP UI */}
          <div>
            <p className="text-sm font-semibold mb-2">📍 Vị trí hiện tại</p>
            <div className="h-40 bg-gray-200 rounded-2xl flex items-center justify-center text-gray-500 text-sm">
              🗺️ Bản đồ vị trí (UI)
              
            </div>
          </div>

          {/* SUBMIT */}
          <button
            className="w-full bg-red-600 text-white py-4 rounded-2xl
                       font-bold text-lg shadow-xl
                       active:scale-[0.97] transition"
          >
            GỬI BÁO CÁO
          </button>
        </div>
      </div>
    </div>
  );
}
