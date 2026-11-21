package uz.akmal.mujiza.file.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import uz.akmal.mujiza.file.dto.FileUploadResponse;
import uz.akmal.mujiza.file.enums.UploadFolder;
import uz.akmal.mujiza.file.service.FileStorageService;

/**
 * Admin panel uchun rasm yuklash endpoint'i.
 * Hozircha ochiq, 3-bosqichda Spring Security bilan faqat adminlarga yopamiz.
 */
@RestController
@RequestMapping("/api/admin/files")
@Tag(name = "Fayllar (admin)")
@RequiredArgsConstructor
public class AdminFileController {

    /**
     * Fayllarni saqlash xizmati (controller faqat interfeysni biladi, qayerga saqlashi uni qiziqtirmaydi).
     */
    private final FileStorageService fileStorageService;

    /**
     * Rasm yuklaydi va uning manzilini qaytaradi.
     * Admin avval rasmni shu yerga yuklaydi, olingan manzilni esa mahsulot (yoki kategoriya) yaratayotganda
     * imageUrl maydoniga yozadi.
     * Manzil: POST /api/admin/files/upload?folder=PRODUCTS (form-data, "file" maydonida rasm)
     *
     * @param file   yuklanayotgan rasm (JPG, PNG yoki WEBP, ko'pi bilan 5 MB)
     * @param folder qaysi bo'limga saqlanadi: PRODUCTS, CATEGORIES, BANNERS yoki CAKES
     * @return yuklangan rasmning manzili
     */
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Rasm yuklash")
    public FileUploadResponse upload(@RequestParam("file") MultipartFile file,
                                     @RequestParam UploadFolder folder) {
        // Rasmni saqlaymiz va manzilini javob sifatida qaytaramiz
        String url = fileStorageService.store(file, folder);
        return new FileUploadResponse(url);
    }
}