import "./globals.css";

export default function CitizenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="bg-gray-100">
        <div className="max-w-[430px] mx-auto min-h-screen bg-white">
          {children}
        </div>
      </body>
    </html>
  );
}
