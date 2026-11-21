/**
 * Admin fayl va rasmlarni yuklash xizmati
 * Backend: POST /api/admin/files/upload?folder={PRODUCTS|CATEGORIES|BANNERS|CAKES}
 */

export type UploadFolderType = 'PRODUCTS' | 'CATEGORIES' | 'BANNERS' | 'BRANCHES' | 'CAKES';

export async function uploadImageFile(
  file: File,
  folder: UploadFolderType = 'PRODUCTS'
): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const res = await fetch(`/api/admin/files/upload?folder=${folder}`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.url) {
        return data.url;
      }
    }
  } catch (error) {
    console.warn('Backend file upload failed, falling back to local preview URL:', error);
  }

  // Backend ishga tushmagan bo'lsa yoki offline bo'lsa, brauzerning o'zida ko'rsatish uchun Data URL yaratamiz
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.readAsDataURL(file);
  });
}
