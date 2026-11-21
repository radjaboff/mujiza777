package uz.akmal.mujiza.file.service;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;
import uz.akmal.mujiza.file.service.impl.S3FileStorageService;

import java.lang.reflect.Method;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;

class S3FileStorageServiceTest {

    private final ImageValidator imageValidator = mock(ImageValidator.class);
    private final ImageProcessor imageProcessor = mock(ImageProcessor.class);

    @Test
    @DisplayName("init() throws exception when bucket is missing")
    void initThrowsWhenBucketMissing() {
        S3FileStorageService service = new S3FileStorageService(imageValidator, imageProcessor);
        ReflectionTestUtils.setField(service, "bucket", "");
        ReflectionTestUtils.setField(service, "endpoint", "https://xxx.r2.cloudflarestorage.com");

        assertThatThrownBy(service::init)
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("S3_BUCKET bo'sh bo'lmasligi kerak");
    }

    @Test
    @DisplayName("init() throws exception when both endpoint and publicUrl are missing")
    void initThrowsWhenEndpointAndPublicUrlMissing() {
        S3FileStorageService service = new S3FileStorageService(imageValidator, imageProcessor);
        ReflectionTestUtils.setField(service, "bucket", "mujiza-media");
        ReflectionTestUtils.setField(service, "endpoint", "");
        ReflectionTestUtils.setField(service, "publicUrl", "");

        assertThatThrownBy(service::init)
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("S3_ENDPOINT yoki S3_PUBLIC_URL sozlanishi kerak");
    }

    @Test
    @DisplayName("init() throws exception when only one credential key is provided")
    void initThrowsWhenCredentialsMismatched() {
        S3FileStorageService service = new S3FileStorageService(imageValidator, imageProcessor);
        ReflectionTestUtils.setField(service, "bucket", "mujiza-media");
        ReflectionTestUtils.setField(service, "endpoint", "https://xxx.r2.cloudflarestorage.com");
        ReflectionTestUtils.setField(service, "accessKey", "my-access-key");
        ReflectionTestUtils.setField(service, "secretKey", ""); // missing

        assertThatThrownBy(service::init)
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("S3_ACCESS_KEY va S3_SECRET_KEY ikkalasi birga sozlanishi kerak");
    }

    @Test
    @DisplayName("urlForKey formats URL with publicUrl correctly")
    void urlForKeyWithPublicUrl() throws Exception {
        S3FileStorageService service = new S3FileStorageService(imageValidator, imageProcessor);
        ReflectionTestUtils.setField(service, "publicUrl", "https://media.mujiza.uz/");

        Method method = S3FileStorageService.class.getDeclaredMethod("urlForKey", String.class);
        method.setAccessible(true);
        String url = (String) method.invoke(service, "products/cake-1.webp");

        assertThat(url).isEqualTo("https://media.mujiza.uz/products/cake-1.webp");
    }

    @Test
    @DisplayName("extractKey safely extracts object key and rejects traversal attempts")
    void extractKeySafely() throws Exception {
        S3FileStorageService service = new S3FileStorageService(imageValidator, imageProcessor);
        ReflectionTestUtils.setField(service, "publicUrl", "https://media.mujiza.uz");

        Method method = S3FileStorageService.class.getDeclaredMethod("extractKey", String.class);
        method.setAccessible(true);

        // Valid key
        String key = (String) method.invoke(service, "https://media.mujiza.uz/products/cake-1.webp");
        assertThat(key).isEqualTo("products/cake-1.webp");

        // Path traversal attack rejected
        String traversalKey = (String) method.invoke(service, "https://media.mujiza.uz/products/../../etc/passwd");
        assertThat(traversalKey).isNull();

        // Disallowed folder rejected
        String disallowedKey = (String) method.invoke(service, "https://media.mujiza.uz/secret/admin.png");
        assertThat(disallowedKey).isNull();
    }
}
