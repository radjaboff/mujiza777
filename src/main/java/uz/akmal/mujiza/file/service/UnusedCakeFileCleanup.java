package uz.akmal.mujiza.file.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import uz.akmal.mujiza.cake.repository.CakeOptionRepository;
import uz.akmal.mujiza.cake.repository.CakeRequestRepository;
import uz.akmal.mujiza.cake.repository.CakeTypeRepository;

import java.time.Duration;
import java.util.HashSet;
import java.util.Set;

/**
 * Buyurtmaga aylanmagan tort namuna rasmlarini kuniga bir marta o'chiradi.
 * 24 soatdan eski va hech qaysi buyurtma, tort turi yoki varianti ko'rsatmagan fayl o'chadi.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class UnusedCakeFileCleanup {

    private static final Duration MAX_AGE = Duration.ofHours(24);

    private final FileStorageService storage;
    private final CakeRequestRepository cakeRequestRepository;
    private final CakeTypeRepository cakeTypeRepository;
    private final CakeOptionRepository cakeOptionRepository;

    /**
     * Kuniga bir marta, Toshkent vaqti bilan 04:15 da ishlaydi.
     */
    @Scheduled(cron = "0 15 4 * * *", zone = "Asia/Tashkent")
    public void cleanup() {
        try {
            Set<String> referenced = new HashSet<>();
            referenced.addAll(cakeRequestRepository.findReferencedImageUrls());
            referenced.addAll(cakeTypeRepository.findImageUrls());
            referenced.addAll(cakeOptionRepository.findImageUrls());
            int removed = 0;
            for (String url : storage.listCakeFilesOlderThan(MAX_AGE)) {
                if (url != null && !referenced.contains(url)) {
                    storage.delete(url);
                    removed++;
                }
            }
            if (removed > 0) {
                log.info("Ishlatilmagan tort rasmlari o'chirildi: {}", removed);
            }
        } catch (RuntimeException e) {
            log.warn("Ishlatilmagan tort rasmlarini tozalab bo'lmadi", e);
        }
    }
}
