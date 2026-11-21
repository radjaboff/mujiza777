import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uz" className="overflow-x-hidden max-w-full w-full">
      <body className="min-h-screen flex flex-col bg-[#FBF9F4] text-[#1C261E] antialiased overflow-x-hidden max-w-full w-full">
        {children}
      </body>
    </html>
  );
}
