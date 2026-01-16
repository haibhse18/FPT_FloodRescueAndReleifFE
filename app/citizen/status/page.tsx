type StatusItemProps = {
  title: string;
  desc: string;
  icon: string;
  active: boolean;
  isLast?: boolean;
};

function StatusItem({
  title,
  desc,
  icon,
  active,
  isLast = false,
}: StatusItemProps) {
  return (
    <div className="flex gap-4">
      {/* LEFT: ICON + LINE */}
      <div className="flex flex-col items-center">
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm
          ${active ? 'bg-blue-600' : 'bg-gray-300'}`}
        >
          {icon}
        </div>

        {!isLast && (
          <div
            className={`w-[2px] h-full min-h-10 mt-1 ${
              active ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          />
        )}
      </div>

      {/* RIGHT: CONTENT */}
      <div className="pb-6">
        <p className="font-semibold text-sm">{title}</p>
        <p className="text-xs text-gray-500 mt-1">{desc}</p>
      </div>
    </div>
  );
}


export default function StatusPage() {
  return (
    <div className="p-4 pb-20 max-w-md mx-auto">
      <h1 className="text-lg font-bold mb-4">📍 Trạng thái xử lý</h1>

      <div className="space-y-4">
        <StatusItem
          title="Đã tiếp nhận"
          desc="Hệ thống đã ghi nhận báo cáo"
          icon="📨"
          active
        />
        <StatusItem
          title="Đang xác minh"
          desc="Cán bộ địa phương đang kiểm tra"
          icon="🔍"
          active
        />
        <StatusItem
          title="Đang hỗ trợ"
          desc="Đội cứu trợ đang di chuyển"
          icon="🚑"
          active={false}
          isLast
        />
      </div>
    </div>
  );
}
