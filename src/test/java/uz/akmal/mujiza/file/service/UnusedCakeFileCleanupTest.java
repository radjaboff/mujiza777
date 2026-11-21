package uz.akmal.mujiza.file.service;

import org.junit.jupiter.api.Test;
import org.springframework.web.multipart.MultipartFile;
import uz.akmal.mujiza.cake.repository.CakeOptionRepository;
import uz.akmal.mujiza.cake.repository.CakeRequestRepository;
import uz.akmal.mujiza.cake.repository.CakeTypeRepository;
import uz.akmal.mujiza.file.enums.UploadFolder;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

/**
 * Ishlatilmagan tort rasmi o'chadi, buyurtma yoki katalog ko'rsatgan rasm qoladi.
 */
class UnusedCakeFileCleanupTest {

    @Test
    void deletesUnreferencedUrlsAndKeepsKnownOnes() {
        List<String> oldFiles = List.of(
                "/uploads/cakes/orphan.jpg",
                "/uploads/cakes/order.jpg",
                "/uploads/cakes/type.png",
                "/uploads/cakes/option.png");
        RecordingStorage storage = new RecordingStorage(oldFiles);
        CakeRequestRepository requests = mock(CakeRequestRepository.class);
        CakeTypeRepository types = mock(CakeTypeRepository.class);
        CakeOptionRepository options = mock(CakeOptionRepository.class);
        when(requests.findReferencedImageUrls()).thenReturn(List.of("/uploads/cakes/order.jpg"));
        when(types.findImageUrls()).thenReturn(List.of("/uploads/cakes/type.png"));
        when(options.findImageUrls()).thenReturn(List.of("/uploads/cakes/option.png"));

        new UnusedCakeFileCleanup(storage, requests, types, options).cleanup();

        assertThat(storage.deleted).containsExactly("/uploads/cakes/orphan.jpg");
    }

    private static final class RecordingStorage implements FileStorageService {
        private final List<String> oldFiles;
        private final List<String> deleted = new ArrayList<>();

        private RecordingStorage(List<String> oldFiles) {
            this.oldFiles = oldFiles;
        }

        @Override
        public String store(MultipartFile file, UploadFolder folder) {
            throw new UnsupportedOperationException();
        }

        @Override
        public void delete(String url) {
            deleted.add(url);
        }

        @Override
        public List<String> listCakeFilesOlderThan(Duration age) {
            return oldFiles;
        }
    }
}
