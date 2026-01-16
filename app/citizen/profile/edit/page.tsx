export default function EditProfilePage() {
  return (
    <div className="min-h-screen bg-gray-100 p-4 pb-24">
      <h1 className="text-2xl font-bold mb-6">Chỉnh sửa hồ sơ</h1>

      <div className="bg-white rounded-2xl shadow p-4 space-y-5">

        {/* Avatar */}
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center text-3xl font-bold">
            U
          </div>
          <button className="mt-2 text-sm text-blue-600 font-medium">
            Thay ảnh đại diện
          </button>
        </div>

        {/* Họ tên */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Họ và tên
          </label>
          <input
            className="w-full border rounded-xl p-3"
            placeholder="Nguyễn Văn A"
          />
        </div>

        {/* SĐT */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Số điện thoại
          </label>
          <input
            className="w-full border rounded-xl p-3"
            placeholder="0123 456 789"
          />
        </div>

        {/* Địa chỉ */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Địa chỉ cư trú
          </label>
          <input
            className="w-full border rounded-xl p-3"
            placeholder="Phường, Quận, Thành phố"
          />
        </div>

        {/* Ghi chú */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Ghi chú đặc biệt
          </label>
          <textarea
            className="w-full border rounded-xl p-3"
            rows={3}
            placeholder="Có người già, trẻ nhỏ, người khuyết tật..."
          />
        </div>

        {/* Button */}
        <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold text-lg">
          Lưu thay đổi
        </button>
      </div>
    </div>
  );
}
