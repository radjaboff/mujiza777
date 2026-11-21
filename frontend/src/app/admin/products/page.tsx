'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Cake, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Loader2,
  RefreshCw,
  Upload,
  X,
  Sparkles,
  Star,
  ImageIcon
} from 'lucide-react';
import { ProductCard, UnitType, PageResponse } from '../../../lib/api/types';
import { formatCurrency } from '../../../lib/format';
import { apiClient } from '../../../lib/api/client';
import { uploadImageFile } from '../../../lib/api/upload';

type AdminCategory = { id: number; nameUz: string; slug: string };
type AdminProduct = {
  id: number; categoryId: number; nameUz: string; nameRu: string; slug: string;
  descriptionUz?: string | null; descriptionRu?: string | null; price: number;
  oldPrice: number | null; discountEndsAt: string | null; weightLabel: string | null;
  imageUrl: string | null; imageUrls?: string[]; ingredientsUz?: string | null;
  ingredientsRu?: string | null; calories?: number | null; shelfLifeHours?: number | null;
  prepTimeMinutes: number; isAvailable: boolean; isPopular: boolean; isNew: boolean;
  sortOrder?: number; allergens: ProductCard['allergens']; dietTags: ProductCard['dietTags'];
  unitType: UnitType; minQuantity: number; quantityStep: number;
};

function toProductRequest(product: AdminProduct, overrides: Partial<AdminProduct> = {}) {
  const value = { ...product, ...overrides };
  return {
    categoryId: value.categoryId,
    nameUz: value.nameUz,
    nameRu: value.nameRu,
    slug: value.slug,
    descriptionUz: value.descriptionUz,
    descriptionRu: value.descriptionRu,
    price: value.price,
    oldPrice: value.oldPrice,
    discountEndsAt: value.discountEndsAt,
    weightLabel: value.weightLabel,
    imageUrl: value.imageUrl,
    imageUrls: value.imageUrls || [],
    ingredientsUz: value.ingredientsUz,
    ingredientsRu: value.ingredientsRu,
    calories: value.calories,
    shelfLifeHours: value.shelfLifeHours,
    prepTimeMinutes: value.prepTimeMinutes,
    isAvailable: value.isAvailable,
    isPopular: value.isPopular,
    isNew: value.isNew,
    sortOrder: value.sortOrder || 0,
    allergens: value.allergens || [],
    dietTags: value.dietTags || [],
    unitType: value.unitType,
    minQuantity: value.minQuantity,
    quantityStep: value.quantityStep,
  };
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductCard[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductCard | null>(null);

  // Forma holatlari
  const [name, setName] = useState('');
  const [nameRu, setNameRu] = useState('');
  const [categorySlug, setCategorySlug] = useState('tortlar');
  const [price, setPrice] = useState<number>(120000);
  const [oldPrice, setOldPrice] = useState<string>('');
  const [weightLabel, setWeightLabel] = useState('1 kg');
  const [unitType, setUnitType] = useState<UnitType>('PIECE');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isPopular, setIsPopular] = useState(false);
  const [isNew, setIsNew] = useState(true);
  const [isDailyDeal, setIsDailyDeal] = useState(false);
  const [discountEndsAt, setDiscountEndsAt] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchProducts = async () => {
    try {
      const [categoryData, productData] = await Promise.all([
        apiClient<AdminCategory[]>('/api/admin/categories'),
        apiClient<PageResponse<AdminProduct> | AdminProduct[]>('/api/admin/products?size=100'),
      ]);
      setCategories(categoryData);
      const records = Array.isArray(productData) ? productData : productData.content;
      setProducts(records.map((item) => ({
        id: item.id,
        name: item.nameUz,
        slug: item.slug,
        categorySlug: categoryData.find((category) => category.id === item.categoryId)?.slug || '',
        price: item.price,
        oldPrice: item.oldPrice,
        discountEndsAt: item.discountEndsAt,
        weightLabel: item.weightLabel,
        imageUrl: item.imageUrl,
        prepTimeMinutes: item.prepTimeMinutes,
        isAvailable: item.isAvailable,
        isPopular: item.isPopular,
        isNew: item.isNew,
        allergens: item.allergens || [],
        dietTags: item.dietTags || [],
        unitType: item.unitType,
        minQuantity: item.minQuantity,
        quantityStep: item.quantityStep,
      })));
    } catch (error) {
      setProducts([]);
      window.alert((error as { message?: string })?.message || 'Mahsulotlarni serverdan yuklab bo‘lmadi.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Modalni ochish (Yangi yoki Tahrirlash)
  const openCreateModal = () => {
    setEditingProduct(null);
    setName('');
    setNameRu('');
    setCategorySlug('tortlar');
    setPrice(120000);
    setOldPrice('');
    setWeightLabel('1 kg');
    setUnitType(categorySlug === 'pishiriqlar' ? 'KG' : 'PIECE');
    setImageUrl('');
    setIsPopular(false);
    setIsNew(true);
    setIsDailyDeal(false);
    setDiscountEndsAt('');
    setIsModalOpen(true);
  };

  const openEditModal = (prod: ProductCard) => {
    setEditingProduct(prod);
    setName(prod.name);
    setNameRu(prod.name);
    setCategorySlug(prod.categorySlug || 'tortlar');
    setPrice(prod.price);
    setOldPrice(prod.oldPrice ? String(prod.oldPrice) : '');
    setWeightLabel(prod.weightLabel || '');
    setUnitType(prod.unitType || 'PIECE');
    setImageUrl(prod.imageUrl || '');
    setIsPopular(Boolean(prod.isPopular));
    setIsNew(Boolean(prod.isNew));
    setIsDailyDeal(Boolean(prod.oldPrice && prod.oldPrice > prod.price));
    setDiscountEndsAt(prod.discountEndsAt ? prod.discountEndsAt.slice(0, 16) : '');
    setIsModalOpen(true);
  };

  // Rasm yuklash funksiyasi
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const uploadedUrl = await uploadImageFile(file, 'PRODUCTS');
      setImageUrl(uploadedUrl);
    } catch (err) {
      console.error('Rasm yuklashda xatolik:', err);
      alert('Rasmni yuklashda xatolik yuz berdi');
    } finally {
      setIsUploading(false);
    }
  };

  const handleToggleAvailability = async (id: number, current: boolean) => {
    try {
      await apiClient(`/api/admin/products/${id}/availability?available=${!current}`, {
        method: 'PATCH',
      });
      fetchProducts();
    } catch (error) {
      window.alert((error as { message?: string })?.message || 'Mavjudlik holatini saqlab bo‘lmadi.');
    }
  };

  const handleTogglePopular = async (prod: ProductCard) => {
    const nextPopular = !prod.isPopular;
    try {
      const current = await apiClient<AdminProduct>(`/api/admin/products/${prod.id}`);
      await apiClient(`/api/admin/products/${prod.id}`, {
        method: 'PUT',
        body: JSON.stringify(toProductRequest(current, { isPopular: nextPopular })),
      });
      fetchProducts();
    } catch (error) {
      window.alert((error as { message?: string })?.message || 'Mahsulotni yangilab bo‘lmadi.');
    }
  };

  const handleToggleNew = async (prod: ProductCard) => {
    const nextNew = !prod.isNew;
    try {
      const current = await apiClient<AdminProduct>(`/api/admin/products/${prod.id}`);
      await apiClient(`/api/admin/products/${prod.id}`, {
        method: 'PUT',
        body: JSON.stringify(toProductRequest(current, { isNew: nextNew })),
      });
      fetchProducts();
    } catch (error) {
      window.alert((error as { message?: string })?.message || 'Mahsulotni yangilab bo‘lmadi.');
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm("Haqiqatan ham bu mahsulotni o'chirmoqchimisiz?")) return;
    try {
      await apiClient(`/api/admin/products/${id}`, { method: 'DELETE' });
      fetchProducts();
    } catch (error) {
      window.alert((error as { message?: string })?.message || 'Mahsulotni o‘chirib bo‘lmadi.');
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    const calculatedOldPrice = isDailyDeal 
      ? (oldPrice ? Number(oldPrice) : Math.round((Number(price) * 1.15) / 1000) * 1000)
      : (oldPrice ? Number(oldPrice) : null);
    
    let calculatedDiscountEnds: string | null = null;
    if (isDailyDeal) {
      if (discountEndsAt) {
        calculatedDiscountEnds = new Date(discountEndsAt).toISOString();
      } else {
        calculatedDiscountEnds = new Date(Date.now() + 86400000).toISOString();
      }
    }

    const category = categories.find((item) => item.slug === categorySlug);
    if (!category) {
      window.alert('Mahsulot kategoriyasini tanlang.');
      return;
    }

    const productFields = {
      categoryId: category.id,
      nameUz: name.trim(),
      nameRu: nameRu.trim(),
      slug: editingProduct?.slug || undefined,
      price: Number(price),
      oldPrice: calculatedOldPrice,
      discountEndsAt: calculatedDiscountEnds,
      weightLabel: weightLabel || null,
      imageUrl: imageUrl || null,
      imageUrls: [],
      ingredientsUz: undefined,
      ingredientsRu: undefined,
      calories: null,
      shelfLifeHours: null,
      unitType,
      minQuantity: unitType === 'KG' ? 0.5 : 1,
      quantityStep: unitType === 'KG' ? 0.5 : 1,
      prepTimeMinutes: 30,
      isAvailable: true,
      isPopular,
      isNew,
      allergens: [] as ProductCard['allergens'],
      dietTags: [] as ProductCard['dietTags'],
    };

    try {
      if (editingProduct) {
        const existing = await apiClient<AdminProduct>(`/api/admin/products/${editingProduct.id}`);
        await apiClient(`/api/admin/products/${editingProduct.id}`, {
          method: 'PUT',
          body: JSON.stringify(toProductRequest({ ...existing, ...productFields, slug: existing.slug, nameRu: existing.nameRu, ingredientsUz: existing.ingredientsUz, ingredientsRu: existing.ingredientsRu, calories: existing.calories, shelfLifeHours: existing.shelfLifeHours, imageUrls: existing.imageUrls || [] })),
        });
      } else {
        await apiClient('/api/admin/products', {
          method: 'POST',
          body: JSON.stringify(productFields),
        });
      }
      await fetchProducts();
      setIsModalOpen(false);
    } catch (error) {
      window.alert((error as { message?: string })?.message || 'Mahsulotni saqlab bo‘lmadi.');
    }
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Sarlavha va Yangi qo'shish */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E9E5DD]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1C261E] tracking-tight">
            Mahsulotlar katalogi
          </h1>
          <p className="text-xs sm:text-sm text-[#596B5E] mt-0.5">
            Do‘kondagi barcha shirinliklar, narxlar va fotosuratlar boshqaruvi
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#244B2B] text-white hover:bg-[#1A3720] font-bold text-xs sm:text-sm shadow-md transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#D4AF37]" />
          <span>Yangi mahsulot qo‘shish</span>
        </button>
      </div>

      {/* Qidiruv va Yangilash */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#8C9B90] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Mahsulot nomi bo‘yicha qidirish..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E9E5DD] text-xs sm:text-sm bg-white focus:outline-none focus:border-[#244B2B]"
          />
        </div>

        <button
          onClick={fetchProducts}
          className="p-2.5 rounded-xl bg-white border border-[#E9E5DD] text-[#244B2B] hover:bg-[#F4EFE6] cursor-pointer"
          title="Yangilash"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Mahsulotlar Ro‘yxati (Desktop Jadval + Mobil Kartochkalar) */}
      <div className="bg-white rounded-3xl border border-[#E9E5DD] overflow-hidden shadow-sm">
        
        {/* Mobil Ekranlar uchun Qulay Kartochkalar (md:hidden) */}
        <div className="md:hidden divide-y divide-[#E9E5DD]">
          {filtered.map((prod) => (
            <div key={prod.id} className="p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-16 h-16 rounded-2xl bg-[#F4EFE6] border border-[#E9E5DD] flex items-center justify-center flex-shrink-0 overflow-hidden relative shadow-sm">
                  {prod.imageUrl ? (
                    <Image
                      src={prod.imageUrl}
                      alt={prod.name}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  ) : (
                    <Cake className="w-7 h-7 text-[#244B2B]/40" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm text-[#1C261E] truncate">{prod.name}</div>
                  <div className="text-xs text-[#596B5E] mt-0.5">
                    <span className="font-bold text-[#244B2B]">{formatCurrency(prod.price)}</span>
                    {prod.oldPrice && (
                      <span className="text-[10px] text-[#B83A3A] line-through ml-1.5">
                        {formatCurrency(prod.oldPrice)}
                      </span>
                    )}
                    <span className="text-[#8C9B90] ml-1">({prod.unitType === 'KG' ? 'kg' : 'dona'})</span>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap mt-1">
                    <span className="px-2 py-0.5 rounded-md bg-[#F4EFE6] text-[#596B5E] text-[10px] font-semibold capitalize">
                      {prod.categorySlug}
                    </span>
                    {prod.isPopular && (
                      <span className="px-1.5 py-0.5 rounded bg-[#D4AF37]/20 text-[#AA820A] font-bold text-[10px]">
                        ★ Mashhur
                      </span>
                    )}
                    {prod.isNew && (
                      <span className="px-1.5 py-0.5 rounded bg-[#244B2B]/20 text-[#244B2B] font-bold text-[10px]">
                        ✦ Yangi
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Mobil amallar qatori */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#F4EFE6]">
                <button
                  type="button"
                  onClick={() => handleToggleAvailability(prod.id, prod.isAvailable)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold active:scale-95 transition-all ${
                    prod.isAvailable
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-rose-50 text-rose-700'
                  }`}
                >
                  {prod.isAvailable ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Mavjud</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3.5 h-3.5 text-rose-600" />
                      <span>Tugagan</span>
                    </>
                  )}
                </button>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleTogglePopular(prod)}
                    className={`p-2 rounded-xl transition-all active:scale-90 ${
                      prod.isPopular
                        ? 'bg-[#D4AF37]/20 text-[#AA820A]'
                        : 'text-[#8C9B90] hover:bg-[#F4EFE6]'
                    }`}
                    title="Mashhur"
                  >
                    <Star className={`w-4 h-4 ${prod.isPopular ? 'fill-[#D4AF37]' : ''}`} />
                  </button>

                  <button
                    type="button"
                    onClick={() => openEditModal(prod)}
                    className="p-2 rounded-xl text-[#596B5E] hover:text-[#244B2B] hover:bg-[#F4EFE6] active:scale-90"
                    title="Tahrirlash"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteProduct(prod.id)}
                    className="p-2 rounded-xl text-[#8C9B90] hover:text-red-600 hover:bg-red-50 active:scale-90"
                    title="O‘chirish"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Jadval (hidden md:block) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-[#FBF9F4] text-[#596B5E] text-[11px] uppercase tracking-wider border-b border-[#E9E5DD]">
              <tr>
                <th className="py-4 px-6">Rasm & Mahsulot</th>
                <th className="py-4 px-4">Toifa</th>
                <th className="py-4 px-4">Birlik</th>
                <th className="py-4 px-4">Narxi</th>
                <th className="py-4 px-4">Holati</th>
                <th className="py-4 px-6 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9E5DD]">
              {filtered.map((prod) => (
                <tr key={prod.id} className="hover:bg-[#FBF9F4]/50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      {/* Mahsulot Rasmi */}
                      <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-[#F4EFE6] border border-[#E9E5DD] flex items-center justify-center flex-shrink-0 overflow-hidden relative shadow-sm">
                        {prod.imageUrl ? (
                          <Image
                            src={prod.imageUrl}
                            alt={prod.name}
                            fill
                            unoptimized
                            className="object-cover"
                          />
                        ) : (
                          <Cake className="w-6 h-6 text-[#244B2B]/40" />
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-[#1C261E]">{prod.name}</div>
                        <div className="text-[11px] text-[#8C9B90] flex items-center gap-2 mt-0.5">
                          <span>{prod.weightLabel || '1 dona'}</span>
                          {prod.isPopular && (
                            <span className="px-1.5 py-0.2 rounded bg-[#D4AF37]/20 text-[#AA820A] font-bold text-[10px]">
                              Mashhur
                            </span>
                          )}
                          {prod.isNew && (
                            <span className="px-1.5 py-0.2 rounded bg-[#244B2B]/20 text-[#244B2B] font-bold text-[10px]">
                              Yangi
                            </span>
                          )}
                          {prod.oldPrice && prod.oldPrice > prod.price && (
                            <span className="px-1.5 py-0.2 rounded bg-[#B83A3A]/20 text-[#B83A3A] font-bold text-[10px]">
                              🔥 Kun taklifi
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-[#596B5E] font-medium capitalize">
                    {prod.categorySlug}
                  </td>
                  <td className="py-4 px-4 text-[#596B5E] font-medium">
                    {prod.unitType === 'KG' ? 'Kilogramm (KG)' : 'Dona (PIECE)'}
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-bold text-[#1C261E]">
                      {formatCurrency(prod.price)}
                    </span>
                    {prod.oldPrice && (
                      <span className="text-[11px] text-[#B83A3A] line-through block">
                        {formatCurrency(prod.oldPrice)}
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <button
                      onClick={() => handleToggleAvailability(prod.id, prod.isAvailable)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                        prod.isAvailable
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                      }`}
                    >
                      {prod.isAvailable ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Mavjud</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5 text-rose-600" />
                          <span>Mavjud emas</span>
                        </>
                      )}
                    </button>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="inline-flex items-center gap-2">
                      {/* 1-click Bosh sahifada "Mashhur" qilish tugmasi */}
                      <button
                        onClick={() => handleTogglePopular(prod)}
                        className={`p-2 rounded-xl transition-all cursor-pointer ${
                          prod.isPopular
                            ? 'bg-[#D4AF37]/20 text-[#AA820A] hover:bg-[#D4AF37]/30'
                            : 'text-[#8C9B90] hover:text-[#AA820A] hover:bg-[#F4EFE6]'
                        }`}
                        title={prod.isPopular ? "Mashhurlardan chiqarish" : "Bosh sahifada 'Mashhur' qilish"}
                      >
                        <Star className={`w-4 h-4 ${prod.isPopular ? 'fill-[#D4AF37]' : ''}`} />
                      </button>

                      {/* 1-click Bosh sahifada "Yangi ta'm" qilish tugmasi */}
                      <button
                        onClick={() => handleToggleNew(prod)}
                        className={`p-2 rounded-xl transition-all cursor-pointer ${
                          prod.isNew
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'text-[#8C9B90] hover:text-emerald-700 hover:bg-emerald-50'
                        }`}
                        title={prod.isNew ? "Bosh sahifadagi 'Yangi ta'mlar'dan chiqarish" : "Bosh sahifadagi 'Yangi ta'mlar'ga qo'shish"}
                      >
                        <Sparkles className={`w-4 h-4 ${prod.isNew ? 'fill-emerald-800 text-emerald-800' : ''}`} />
                      </button>

                      <button
                        onClick={() => openEditModal(prod)}
                        className="p-2 rounded-xl text-[#596B5E] hover:text-[#244B2B] hover:bg-[#F4EFE6] transition-colors cursor-pointer"
                        title="Tahrirlash va rasmini almashtirish"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(prod.id)}
                        className="p-2 rounded-xl text-[#596B5E] hover:text-[#B83A3A] hover:bg-rose-50 transition-colors cursor-pointer"
                        title="O‘chirish"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Yangi Mahsulot Qo‘shish / Tahrirlash Modali */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-[#E9E5DD] my-8 max-h-[92vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-[#E9E5DD] mb-5">
              <h3 className="text-xl font-bold text-[#1C261E]">
                {editingProduct ? 'Mahsulotni tahrirlash' : 'Yangi mahsulot qo‘shish'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full text-[#596B5E] hover:text-[#1C261E] hover:bg-[#F4EFE6]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSaveProduct} className="space-y-4">
              
              {/* RASM YUKLASH BLOKI (Kompyuterdan / Telefonda tanlash) */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#1C261E]">
                  Mahsulot fotosurati
                </label>
                
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden"
                />

                {imageUrl ? (
                  /* Rasm yuklangan holatdagi Preview */
                  <div className="relative w-full h-44 rounded-2xl border-2 border-[#244B2B]/20 bg-[#FBF9F4] overflow-hidden flex items-center justify-center group shadow-inner">
                    <Image
                      src={imageUrl}
                      alt="Yuklangan rasm"
                      fill
                      unoptimized
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3.5 py-2 rounded-xl bg-white text-[#1C261E] text-xs font-bold hover:bg-[#F4EFE6] shadow-md flex items-center gap-1.5 active:scale-95"
                      >
                        <Upload className="w-3.5 h-3.5 text-[#244B2B]" />
                        <span>Almashtirish</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageUrl('')}
                        className="px-3.5 py-2 rounded-xl bg-[#B83A3A] text-white text-xs font-bold hover:bg-[#992222] shadow-md flex items-center gap-1.5 active:scale-95"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>O‘chirish</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Rasm yo'q holatdagi yuklash zonasi */
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-36 rounded-2xl border-2 border-dashed border-[#D4AF37]/50 hover:border-[#244B2B] bg-[#FDFBF7] hover:bg-[#F9F6EE] transition-all flex flex-col items-center justify-center cursor-pointer p-4 text-center group"
                  >
                    {isUploading ? (
                      <div className="flex flex-col items-center gap-2 text-[#244B2B]">
                        <Loader2 className="w-8 h-8 animate-spin" />
                        <span className="text-xs font-bold">Rasm yuklanmoqda...</span>
                      </div>
                    ) : (
                      <>
                        <div className="w-12 h-12 rounded-2xl bg-[#244B2B]/10 group-hover:bg-[#244B2B]/20 flex items-center justify-center text-[#244B2B] mb-2 transition-colors">
                          <Upload className="w-6 h-6 text-[#244B2B]" />
                        </div>
                        <span className="text-xs font-bold text-[#1C261E] group-hover:text-[#244B2B]">
                          Kompyuterdan rasm yuklash uchun bosing
                        </span>
                        <span className="text-[11px] text-[#8C9B90] mt-0.5">
                          JPG, PNG yoki WEBP formatda (maks. 5 MB)
                        </span>
                      </>
                    )}
                  </div>
                )}

                {/* Qo'shimcha: Rasm URL havolasi orqali ham kiritish mumkin */}
                <div className="pt-1">
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="Yoki to'g'ridan-to'g'ri rasm havolasini (URL) kiriting..."
                    className="w-full px-3 py-2 rounded-xl border border-[#E9E5DD] text-[11px] text-[#596B5E] focus:outline-none focus:border-[#244B2B] bg-white"
                  />
                </div>
              </div>

              {/* Mahsulot Nomi */}
              <div>
                <label className="block text-xs font-bold text-[#1C261E] mb-1">
                  Mahsulot nomi (O‘zbekcha) *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Masalan: Qizil Baxmal (Red Velvet)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E9E5DD] text-xs sm:text-sm focus:outline-none focus:border-[#244B2B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1C261E] mb-1">Mahsulot nomi (Ruscha) *</label>
                <input type="text" required value={nameRu} onChange={(e) => setNameRu(e.target.value)} placeholder="Название товара" className="w-full rounded-xl border border-[#E9E5DD] px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-[#244B2B]" />
              </div>

              {/* Kategoriya Tanlash */}
              <div>
                <label className="block text-xs font-bold text-[#1C261E] mb-1">
                  Toifasi (Katalog bo‘limi) *
                </label>
                <select
                  value={categorySlug}
                  onChange={(e) => {
                    const nextCategory = e.target.value;
                    setCategorySlug(nextCategory);
                    if (!editingProduct) setUnitType(nextCategory === 'pishiriqlar' || nextCategory === 'shirinliklar' ? 'KG' : 'PIECE');
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E9E5DD] text-xs sm:text-sm focus:outline-none focus:border-[#244B2B] bg-white"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.slug}>
                      {cat.nameUz}
                    </option>
                  ))}
                </select>
              </div>

              {/* Narxi va Eski Narxi */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1C261E] mb-1">
                    Sotuv narxi (so‘m) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1000}
                    step={1000}
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E9E5DD] text-xs sm:text-sm focus:outline-none focus:border-[#244B2B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1C261E] mb-1">
                    Eski narx (Chegirma bo'lsa)
                  </label>
                  <input
                    type="number"
                    min={1000}
                    step={1000}
                    value={oldPrice}
                    onChange={(e) => setOldPrice(e.target.value)}
                    placeholder="Masalan: 150000"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E9E5DD] text-xs sm:text-sm focus:outline-none focus:border-[#244B2B]"
                  />
                </div>
              </div>

              {/* Birligi va Vazn yozuvi */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1C261E] mb-1">
                    O‘lchov turi
                  </label>
                  <select
                    value={unitType}
                    onChange={(e) => setUnitType(e.target.value as UnitType)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E9E5DD] text-xs sm:text-sm focus:outline-none focus:border-[#244B2B] bg-white"
                  >
                    <option value="PIECE">Dona (PIECE)</option>
                    <option value="KG">Kilogramm (KG)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1C261E] mb-1">
                    Vazn / miqdor yozuvi
                  </label>
                  <input
                    type="text"
                    value={weightLabel}
                    onChange={(e) => setWeightLabel(e.target.value)}
                    placeholder="Masalan: 1.2 kg yoki 6 dona"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E9E5DD] text-xs sm:text-sm focus:outline-none focus:border-[#244B2B]"
                  />
                </div>
              </div>

              {/* Belgilar (Mashhur / Yangi / Kun taklifi) */}
              <div className="flex flex-wrap items-center gap-5 pt-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-[#1C261E] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPopular}
                    onChange={(e) => setIsPopular(e.target.checked)}
                    className="w-4 h-4 accent-[#244B2B] rounded cursor-pointer"
                  />
                  <span>🌟 "Mashhur"</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-semibold text-[#1C261E] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isNew}
                    onChange={(e) => setIsNew(e.target.checked)}
                    className="w-4 h-4 accent-[#244B2B] rounded cursor-pointer"
                  />
                  <span>✨ "Yangi"</span>
                </label>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-semibold text-[#B83A3A] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isDailyDeal}
                      onChange={(e) => {
                        setIsDailyDeal(e.target.checked);
                        if (e.target.checked) {
                          if (!oldPrice) {
                            setOldPrice(String(Math.round((price * 1.15) / 1000) * 1000));
                          }
                          if (!discountEndsAt) {
                            const tomorrow = new Date(Date.now() + 86400000);
                            setDiscountEndsAt(tomorrow.toISOString().slice(0, 16));
                          }
                        }
                      }}
                      className="w-4 h-4 accent-[#B83A3A] rounded cursor-pointer"
                    />
                    <span className="font-bold">🔥 "Kun taklifi & Flash Sale"</span>
                  </label>

                  {/* Chegirma vaqtini admin tomonidan sozlash bloki */}
                  {isDailyDeal && (
                    <div className="p-3 rounded-xl bg-red-50/70 dark:bg-red-950/30 border border-red-200 dark:border-red-800/40 space-y-2 animate-in fade-in duration-200">
                      <span className="text-[11px] font-bold text-[#B83A3A] uppercase tracking-wider block">
                        ⏱️ Chegirma tugash sanasi va soati:
                      </span>

                      <input
                        type="datetime-local"
                        value={discountEndsAt}
                        onChange={(e) => setDiscountEndsAt(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-red-200 dark:border-red-800/50 text-xs font-mono font-bold bg-white dark:bg-[#1A281E] text-[#1C261E] dark:text-[#F5F2EA] focus:outline-none focus:border-[#B83A3A]"
                      />

                      {/* Tezkor tayyor tugmalar */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[10px] text-[#596B5E] dark:text-[#A6B7AA]">Tezkor:</span>
                        <button
                          type="button"
                          onClick={() => {
                            const todayMidnight = new Date();
                            todayMidnight.setHours(23, 59, 0, 0);
                            setDiscountEndsAt(todayMidnight.toISOString().slice(0, 16));
                          }}
                          className="px-2 py-0.5 rounded-md bg-white dark:bg-[#1A281E] hover:bg-red-100 border border-red-200 text-[10px] font-bold text-[#B83A3A] transition-colors"
                        >
                          Bugun 23:59 gacha
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const d24 = new Date(Date.now() + 86400000);
                            setDiscountEndsAt(d24.toISOString().slice(0, 16));
                          }}
                          className="px-2 py-0.5 rounded-md bg-white dark:bg-[#1A281E] hover:bg-red-100 border border-red-200 text-[10px] font-bold text-[#B83A3A] transition-colors"
                        >
                          24 soat
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const d3 = new Date(Date.now() + 86400000 * 3);
                            setDiscountEndsAt(d3.toISOString().slice(0, 16));
                          }}
                          className="px-2 py-0.5 rounded-md bg-white dark:bg-[#1A281E] hover:bg-red-100 border border-red-200 text-[10px] font-bold text-[#B83A3A] transition-colors"
                        >
                          3 kun
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const d7 = new Date(Date.now() + 86400000 * 7);
                            setDiscountEndsAt(d7.toISOString().slice(0, 16));
                          }}
                          className="px-2 py-0.5 rounded-md bg-white dark:bg-[#1A281E] hover:bg-red-100 border border-red-200 text-[10px] font-bold text-[#B83A3A] transition-colors"
                        >
                          1 hafta
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Tugmalar */}
              <div className="flex gap-3 pt-4 border-t border-[#E9E5DD]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 px-4 rounded-xl border border-[#E9E5DD] text-xs font-bold text-[#1C261E] hover:bg-[#F4EFE6] cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="flex-1 py-3 px-4 rounded-xl bg-[#244B2B] text-white hover:bg-[#1A3720] text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
                >
                  {editingProduct ? 'Saqlash' : 'Mahsulotni qo‘shish'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
