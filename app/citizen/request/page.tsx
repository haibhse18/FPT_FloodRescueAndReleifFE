export default function RequestPage() {
  return (
    <main className="p-4 space-y-4">
      <h2 className="text-lg font-bold">
        Gửi yêu cầu hỗ trợ
      </h2>

      <input
        className="w-full p-3 border rounded-lg"
        placeholder="Họ và tên"
      />

      <textarea
        className="w-full p-3 border rounded-lg"
        placeholder="Mô tả tình trạng cần hỗ trợ"
        rows={4}
      />

      <button className="w-full bg-blue-600 text-white p-3 rounded-lg">
        Gửi yêu cầu
      </button>
    </main>
  );
}
