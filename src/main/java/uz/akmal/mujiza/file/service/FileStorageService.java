package uz.akmal.mujiza.file.service;

import org.springframework.web.multipart.MultipartFile;
import uz.akmal.mujiza.file.enums.UploadFolder;

import java.time.Duration;
import java.util.List;

/**
 * Fayllarni saqlash va o'chirish qoidalari.
 * Qolgan kod faqat shu interfeysni biladi. Fayl qayerda turishi (serverning diskida yoki bulutda)
 * esa ijroga bog'liq: hozir LocalFileStorageService, keyinroq S3FileStorageService qo'shiladi.
 * Shuning uchun diskdan buluttga o'tganda boshqa kodni o'zgartirish shart emas.
 */
public interface FileStorageService {

    /**
     * Rasmni tekshiradi va saqlaydi.
     *
     * @param file   mijoz yuklagan fayl
     * @param folder qaysi bo'limga saqlanadi (mahsulotlar, kategoriyalar va h.k.)
     * @return saqlangan rasmning manzili (masalan, "/uploads/products/3f2a....webp")
     */
    String store(MultipartFile file, UploadFolder folder);

    /**
     * Avval saqlangan rasmni o'chiradi. Fayl topilmasa xato bermaydi.
     *
     * @param url o'chiriladigan rasmning manzili (store qaytargan qiymat)
     */
    void delete(String url);

    /**
     * Tort papkasidagi, berilgan yoshdan eski fayllarning ommaviy manzillarini qaytaradi.
     * Mahsulot, kategoriya, banner va filial papkalariga tegmaydi.
     * Ro'yxatni olib bo'lmasa bo'sh ro'yxat qaytadi va xizmat ishlashda davom etadi.
     *
     * @param age shu muddatdan eski fayllar
     * @return ommaviy manzillar (store qaytargan ko'rinishda)
     */
    List<String> listCakeFilesOlderThan(Duration age);
}