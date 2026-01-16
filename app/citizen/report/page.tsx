export default function ReportPage() {
  return (
    <div className="p-4 pb-20 max-w-md mx-auto space-y-4">
      <h1 className="text-lg font-bold">🚨 Báo cáo lũ khẩn cấp</h1>

      {/* EMERGENCY */}
      <div className="bg-red-50 border border-red-300 rounded-xl p-3 flex gap-2 items-center">
        <input type="checkbox" className="scale-125" />
        <span className="text-red-700 font-semibold text-sm">
          CẦN HỖ TRỢ KHẨN CẤP (nguy hiểm đến tính mạng)
        </span>
      </div>

      {/* FORM */}
      <textarea
        placeholder="Mô tả tình trạng (nước ngập, người mắc kẹt...)"
        className="w-full border rounded-xl p-3 text-sm"
        rows={4}
      />

      {/* MAP UI */}
      <div className="h-40 bg-gray-200 rounded-xl flex items-center justify-center text-gray-500 text-sm">
        🗺️ Bản đồ vị trí (UI)
      </div>

      <button className="w-full bg-red-600 text-white py-3 rounded-xl font-semibold">
        GỬI BÁO CÁO
      </button>
    </div>
  );
}
