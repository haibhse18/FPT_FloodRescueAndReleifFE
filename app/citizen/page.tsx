import FloodMap from "../components/FloodMap";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#f3f6fb] flex justify-center">
      <div className="w-full max-w-md bg-white pb-28">
        {/* ALERT HEADER */}
        <div
          className="bg-gradient-to-br from-red-600 via-red-500 to-orange-400
                        text-white px-5 py-6 rounded-b-[32px] shadow-lg"
        >
          <h1 className="text-2xl font-extrabold flex items-center gap-2">
            🌊 CẢNH BÁO LŨ
          </h1>
          <p className="text-sm mt-1 opacity-90">
            Mực nước đang dâng nhanh – nguy hiểm
          </p>
        </div>

        {/* CONTENT */}
        <div className="p-4 space-y-6">
          {/* LOCATION */}
          <div className="bg-white rounded-2xl p-4 border shadow-sm">
            <p className="text-xs text-gray-500 mb-1">Khu vực hiện tại</p>
            <p className="font-semibold text-gray-800">
              📍 Phường 3, Quận 8, TP.HCM
            </p>
          </div>

          {/* MAP UI (placeholder) */}
          <div className="bg-gray-100 rounded-2xl p-3">
            <p className="text-sm font-semibold mb-2">🗺️ Bản đồ khu vực</p>
            <FloodMap />
          </div>

          {/* EMERGENCY BUTTON */}
          <a
            href="/citizen/report"
            className="block text-center bg-red-600 text-white py-5 rounded-3xl
                       font-extrabold text-lg shadow-2xl
                       active:scale-[0.95] transition-all
                       animate-pulse"
          >
            🚨 BÁO CÁO KHẨN CẤP
          </a>

          {/* TIMELINE */}
          <div className="bg-white rounded-2xl p-4 border shadow-sm">
            <p className="font-semibold text-gray-800 mb-3">
              🕒 Tình trạng xử lý
            </p>

            <ul className="space-y-3 text-sm">
              <li className="flex gap-3">
                <span className="text-green-600">●</span>
                <span>Đã tiếp nhận thông tin</span>
              </li>
              <li className="flex gap-3">
                <span className="text-yellow-500">●</span>
                <span>Đang điều phối lực lượng</span>
              </li>
              <li className="flex gap-3 text-gray-400">
                <span>●</span>
                <span>Đang hỗ trợ tại hiện trường</span>
              </li>
            </ul>
          </div>

          {/* HOTLINE */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 space-y-3">
            <p className="font-semibold text-blue-700 flex items-center gap-2">
              📞 Hotline cứu trợ
            </p>

            <a
              href="tel:112"
              className="block bg-blue-600 text-white py-3 rounded-xl text-center
                         font-bold text-base active:scale-[0.97]"
            >
              GỌI 112 – CỨU NẠN KHẨN CẤP
            </a>

            <a
              href="tel:1022"
              className="block bg-white border border-blue-600 text-blue-600 py-3 rounded-xl text-center
                         font-semibold active:scale-[0.97]"
            >
              GỌI 1022 – HỖ TRỢ ĐỊA PHƯƠNG
            </a>
          </div>

          {/* SAFETY INFO */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
            <p className="font-semibold text-yellow-700 mb-2">
              ⚠️ Hướng dẫn an toàn
            </p>
            <ul className="text-sm text-yellow-700 list-disc list-inside space-y-1">
              <li>Ngắt điện nếu có thể</li>
              <li>Di chuyển lên nơi cao</li>
              <li>Chuẩn bị giấy tờ, nước uống</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
