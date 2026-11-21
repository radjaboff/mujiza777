package uz.akmal.mujiza.file.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import uz.akmal.mujiza.common.RateLimiter;
import uz.akmal.mujiza.file.dto.FileUploadResponse;
import uz.akmal.mujiza.file.enums.UploadFolder;
import uz.akmal.mujiza.file.service.FileStorageService;

import java.time.Duration;

/**
 * Mijoz sayti uchun rasm yuklash endpoint'i: faqat tort konstruktoridagi namuna rasm uchun.
 * Hamma ochiq endpoint kabi suiiste'mol qilinishi mumkin, shuning uchun bir IP dan soatiga 10 ta bilan cheklangan.
 */
@RestController
@RequestMapping("/api/public/files")
@Tag(name = "Fayllar (mijoz)")
@RequiredArgsConstructor
public class PublicFileController {

    /**
     * Fayllarni saqlash xizmati.
     */
    private final FileStorageService fileStorageService;

    /**
     * So'rovlarni cheklash vositasi.
     */
    private final RateLimiter rateLimiter;

    /**
     * Tort namuna rasmini yuklaydi va manzilini qaytaradi (keyin tort buyurtmasida ishlatiladi).
     * Faqat JPG, PNG yoki WEBP, ko'pi bilan 5 MB. Manzil: POST /api/public/files/cake-reference
     *
     * @param file yuklanayotgan rasm
     * @param http joriy so'rov (IP manzilni bilish uchun)
     * @return yuklangan rasmning manzili (201)
     */
    @PostMapping(value = "/cake-reference", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Tort namuna rasmini yuklash")
    public FileUploadResponse uploadCakeReference(@RequestParam("file") MultipartFile file,
                                                  HttpServletRequest http) {
        rateLimiter.acquireOrThrow("upload:" + http.getRemoteAddr(), 10, Duration.ofHours(1));
        return new FileUploadResponse(fileStorageService.store(file, UploadFolder.CAKES));
    }
}