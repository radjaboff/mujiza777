package uz.akmal.mujiza.file.service;

import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;
import uz.akmal.mujiza.common.exception.BusinessException;

import java.io.IOException;
import java.io.InputStream;

/**
 * Yuklanayotgan fayl haqiqiy rasm ekanini va hajmi me'yordaligini tekshiradi.
 * Fayl saqlanadigan joydan (disk yoki bulut) qat'i nazar, ikkala ijro ham shu klassdan foydalanadi.
 *
 * @Component: Spring bu klassdan o'zi bitta obyekt yaratib, kerakli joyga beradi.
 */
@Component
public class ImageValidator {

    /**
     * Ruxsat etilgan eng katta fayl hajmi: 5 MB (baytlarda).
     */
    private static final long MAX_SIZE_BYTES = 5L * 1024 * 1024;

    /**
     * Faylning turini aniqlash uchun o'qiladigan boshlang'ich baytlar soni.
     * WEBP'ni aniqlash uchun kamida 12 bayt kerak.
     */
    private static final int HEADER_LENGTH = 12;

    /**
     * Faylni tekshiradi va uning haqiqiy kengaytmasini qaytaradi.
     * Fayl nomi e'tiborga olinmaydi, tur faqat ichidagi belgilardan aniqlanadi.
     *
     * @param file mijoz yuklagan fayl
     * @return haqiqiy kengaytma: "jpg", "png" yoki "webp" (nuqtasiz)
     * @throws BusinessException fayl bo'sh, katta yoki rasm bo'lmasa (400 xatosi)
     */
    public String validateAndDetectExtension(MultipartFile file) {
        // Fayl umuman tanlanmagan yoki bo'sh bo'lsa
        if (file == null || file.isEmpty()) {
            throw new BusinessException("Fayl tanlanmagan");
        }
        // Hajm chegarasidan oshgan bo'lsa
        if (file.getSize() > MAX_SIZE_BYTES) {
            throw new BusinessException("Fayl hajmi 5 MB dan oshmasligi kerak");
        }

        // Faylning boshidan bir necha bayt o'qiymiz (butun faylni emas, xotira tejaladi)
        byte[] header;
        try (InputStream in = file.getInputStream()) {
            header = in.readNBytes(HEADER_LENGTH);
        } catch (IOException e) {
            throw new BusinessException("Faylni o'qib bo'lmadi");
        }

        // Boshlang'ich baytlarga qarab rasm turini aniqlaymiz
        if (isJpeg(header)) {
            return "jpg";
        }
        if (isPng(header)) {
            return "png";
        }
        if (isWebp(header)) {
            return "webp";
        }
        throw new BusinessException("Faqat JPG, PNG yoki WEBP formatdagi rasm yuklash mumkin");
    }

    /**
     * JPEG fayllar uchta maxsus bayt bilan boshlanadi: FF D8 FF.
     *
     * @param h faylning boshlang'ich baytlari
     * @return JPEG bo'lsa true
     */
    private boolean isJpeg(byte[] h) {
        return h.length >= 3
                && (h[0] & 0xFF) == 0xFF
                && (h[1] & 0xFF) == 0xD8
                && (h[2] & 0xFF) == 0xFF;
    }

    /**
     * PNG fayllar sakkizta maxsus bayt bilan boshlanadi: 89 50 4E 47 0D 0A 1A 0A.
     *
     * @param h faylning boshlang'ich baytlari
     * @return PNG bo'lsa true
     */
    private boolean isPng(byte[] h) {
        return h.length >= 8
                && (h[0] & 0xFF) == 0x89
                && h[1] == 'P' && h[2] == 'N' && h[3] == 'G'
                && (h[4] & 0xFF) == 0x0D && (h[5] & 0xFF) == 0x0A
                && (h[6] & 0xFF) == 0x1A && (h[7] & 0xFF) == 0x0A;
    }

    /**
     * WEBP fayllar "RIFF" so'zi bilan boshlanadi va 8-12 baytlarida "WEBP" yozuvi bo'ladi.
     *
     * @param h faylning boshlang'ich baytlari
     * @return WEBP bo'lsa true
     */
    private boolean isWebp(byte[] h) {
        return h.length >= 12
                && h[0] == 'R' && h[1] == 'I' && h[2] == 'F' && h[3] == 'F'
                && h[8] == 'W' && h[9] == 'E' && h[10] == 'B' && h[11] == 'P';
    }
}