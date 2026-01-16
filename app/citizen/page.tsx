export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-100 flex justify-center">
      <div className="w-full max-w-md bg-white pb-24">

        {/* ALERT BANNER */}
        <div className="bg-gradient-to-r from-red-600 to-orange-500 text-white px-4 py-5 rounded-b-3xl shadow">
          <h1 className="text-xl font-bold flex items-center gap-2">
            🌊 CẢNH BÁO LŨ
          </h1>
          <p className="text-sm mt-1 opacity-90">
            Mực nước đang dâng cao – nguy hiểm
          </p>
        </div>

        {/* CONTENT */}
        <div className="p-4 space-y-6">

          {/* LOCATION */}
          <div className="bg-gray-50 rounded-2xl p-4 border">
            <p className="text-xs text-gray-500">Khu vực hiện tại</p>
            <p className="font-semibold">
              📍 Phường 3, Quận 8, TP.HCM
            </p>
          </div>

          {/* EMERGENCY BUTTON */}
          <a
            href="/citizen/report"
            className="block text-center bg-red-600 text-white py-5 rounded-3xl
                       font-bold text-lg shadow-xl
                       active:scale-[0.96] transition
                       animate-pulse"
          >
            🚨 BÁO CÁO KHẨN CẤP
          </a>

          {/* HOTLINE */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 space-y-2">
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

          {/* INFO */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
            <p className="font-semibold text-yellow-700 mb-1">
              ⚠️ Hướng dẫn an toàn
            </p>
            <ul className="text-sm text-yellow-700 list-disc list-inside space-y-1">
              <li>Ngắt điện nếu có thể</li>
              <li>Di chuyển lên nơi cao</li>
              <li>Chuẩn bị nước & giấy tờ</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
