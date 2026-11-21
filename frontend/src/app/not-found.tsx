import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FBF9F4] text-[#1C261E] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6 p-8 rounded-3xl bg-white border border-[#E9E5DD] shadow-lg">
        <span className="text-6xl block">🍰</span>
        <h1 className="font-serif text-3xl font-bold text-[#1C261E]">Sahifa topilmadi</h1>
        <p className="text-sm text-[#596B5E]">
          Siz qidirayotgan sahifa mavjud emas yoki boshqa manzilga ko'chirilgan.
        </p>
        <Link
          href="/uz"
          className="inline-block px-6 py-3 rounded-2xl bg-[#244B2B] text-white font-bold text-sm hover:bg-[#1A3720] transition-colors"
        >
          Bosh sahifaga qaytish
        </Link>
      </div>
    </div>
  );
}
