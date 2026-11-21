package uz.akmal.mujiza.file.service.impl;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import uz.akmal.mujiza.file.enums.UploadFolder;
import uz.akmal.mujiza.file.service.FileStorageService;
import uz.akmal.mujiza.file.service.ImageProcessor;
import uz.akmal.mujiza.file.service.ImageValidator;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Stream;

/**
 * Rasmlarni serverning o'z diskiga saqlaydigan ijro.
 * Faqat app.storage.type=local bo'lganda (yoki sozlama umuman yozilmaganda) ishga tushadi.
 * Keyinroq bulut (S3) ijrosi qo'shilganda sozlamani o'zgartirish yetarli, boshqa kod o'zgarmaydi.
 *
 * @Service: Spring bu klassni xizmat sifatida taniydi.
 * @ConditionalOnProperty: klass faqat sozlamada "local" tanlangan bo'lsagina yaratiladi.
 * @Slf4j (Lombok): log yozish uchun "log" o'zgaruvchisini yaratadi.
 */
@Slf4j
@Service
@ConditionalOnProperty(name = "app.storage.type", havingValue = "local", matchIfMissing = true)
public class LocalFileStorageService implements FileStorageService {

    /**
     * Saqlangan rasm manzilining boshi. Brauzerda rasm shu yo'l bilan ochiladi:
     * http://localhost:8081/uploads/products/abc.png
     */
    private static final String URL_PREFIX = "/uploads/";

    /**
     * Rasmlar saqlanadigan asosiy papkaning to'liq yo'li (sozlamadan olinadi).
     */
    private final Path rootDir;

    /**
     * Rasmning haqiqiy rasm ekanini va hajmini tekshiruvchi.
     */
    private final ImageValidator imageValidator;

    /**
     * Rasmni kichraytirish va qayta kodlash uchun.
     */
    private final ImageProcessor imageProcessor;

    /**
     * Konstruktor: sozlamadagi yo'lni olib, to'liq (absolyut) yo'lga aylantiradi.
     *
     * @param storagePath    sozlamadagi papka yo'li (app.storage.local.path), standart "./uploads"
     * @param imageValidator rasm tekshiruvchi
     * @param imageProcessor rasm kichraytirish va qayta kodlash uchun
     */
    /**
     * Konstruktor: sozlamadagi yo'lni olib, to'liq (absolyut) yo'lga aylantiradi.
     *
     * @param storagePath    sozlamadagi papka yo'li (app.storage.local.path), standart "./uploads"
     * @param imageValidator rasm tekshiruvchi
     * @param imageProcessor rasm qayta ishlovchi
     */
    public LocalFileStorageService(@Value("${app.storage.local.path:./uploads}") String storagePath,
                                   ImageValidator imageValidator,
                                   ImageProcessor imageProcessor) {
        this.rootDir = Paths.get(storagePath).toAbsolutePath().normalize();
        this.imageValidator = imageValidator;
        this.imageProcessor = imageProcessor;
    }

    /**
     * {@inheritDoc}
     * Fayl nomini mijoz bermaydi: tasodifiy UUID yasaladi, shuning uchun nomlar takrorlanmaydi
     * va zararli nom (masalan, "../../xavfli") orqali boshqa joyga yozib bo'lmaydi.
     */
    /**
     * {@inheritDoc}
     * Fayl nomini mijoz bermaydi: tasodifiy UUID yasaladi, shuning uchun nomlar takrorlanmaydi
     * va zararli nom (masalan, "../../xavfli") orqali boshqa joyga yozib bo'lmaydi.
     * Rasm saqlanishidan oldin kichraytiriladi va qayta kodlanadi (EXIF kabi yashirin ma'lumotlar o'chadi).
     */
    @Override
    public String store(MultipartFile file, UploadFolder folder) {
        // Fayl haqiqiy rasm ekanini tekshiramiz va haqiqiy kengaytmasini olamiz
        String detected = imageValidator.validateAndDetectExtension(file);
        // Kichraytirib, qayta kodlaymiz
        ImageProcessor.ProcessedImage image = imageProcessor.process(file, detected);
        // Tasodifiy nom: masalan "3f2a9c1e-....jpg"
        String fileName = UUID.randomUUID() + "." + image.extension();

        Path targetDir = rootDir.resolve(folder.getDirectory());
        Path target = targetDir.resolve(fileName);
        try {
            Files.createDirectories(targetDir);
            // CREATE_NEW: shu nomli fayl bo'lsa, ustidan yozmaydi (xato beradi)
            Files.write(target, image.data(), StandardOpenOption.CREATE_NEW);
        } catch (IOException e) {
            // Disk bilan bog'liq kutilmagan xato: GlobalExceptionHandler uni 500 qilib qaytaradi
            log.error("Faylni saqlab bo'lmadi: {}", target, e);
            throw new IllegalStateException("Faylni saqlab bo'lmadi", e);
        }

        log.info("Rasm saqlandi: {} ({} bayt)", target, image.data().length);
        // Brauzer va bazaga yoziladigan manzil
        return URL_PREFIX + folder.getDirectory() + "/" + fileName;
    }

    /**
     * {@inheritDoc}
     * Faqat o'zimiz saqlagan papka ichidagi fayllarni o'chiradi (boshqa joyga tegib bo'lmaydi).
     */
    @Override
    public void delete(String url) {
        // Manzil bo'sh yoki bizning rasm manzilimiz bo'lmasa, o'chiradigan narsa yo'q
        if (url == null || !url.startsWith(URL_PREFIX)) {
            return;
        }
        // "/uploads/products/abc.png" -> "products/abc.png"
        String relative = url.substring(URL_PREFIX.length());
        Path target = rootDir.resolve(relative).normalize();
        // Xavfsizlik: yo'l asosiy papkadan tashqariga chiqib ketsa (masalan, "../"), o'chirmaymiz
        if (!target.startsWith(rootDir)) {
            log.warn("Ruxsat etilmagan yo'lni o'chirishga urinish: {}", url);
            return;
        }
        try {
            Files.deleteIfExists(target);
        } catch (IOException e) {
            // O'chirib bo'lmasa asosiy ish to'xtamaydi, faqat logga yozamiz
            log.warn("Faylni o'chirib bo'lmadi: {}", target, e);
        }
    }

    /**
     * {@inheritDoc}
     * Faqat cakes papkasidagi fayllarni ko'radi. Boshqa bo'limlarga kirmaydi.
     */
    @Override
    public List<String> listCakeFilesOlderThan(Duration age) {
        Path dir = rootDir.resolve(UploadFolder.CAKES.getDirectory());
        if (!Files.isDirectory(dir)) {
            return List.of();
        }
        Instant cutoff = Instant.now().minus(age);
        List<String> urls = new ArrayList<>();
        try (Stream<Path> files = Files.list(dir)) {
            for (Path path : files.filter(Files::isRegularFile).toList()) {
                try {
                    if (Files.getLastModifiedTime(path).toInstant().isBefore(cutoff)) {
                        urls.add(URL_PREFIX + UploadFolder.CAKES.getDirectory() + "/" + path.getFileName());
                    }
                } catch (IOException e) {
                    log.warn("Tort rasmining vaqtini o'qib bo'lmadi: {}", path, e);
                }
            }
        } catch (IOException e) {
            log.warn("Tort rasmlari ro'yxatini olib bo'lmadi, tozalash o'tkazib yuborildi", e);
            return List.of();
        }
        return urls;
    }
}