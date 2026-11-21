package uz.akmal.mujiza.file.service.impl;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.client.config.ClientOverrideConfiguration;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3ClientBuilder;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.ListObjectsV2Request;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Object;
import uz.akmal.mujiza.file.enums.UploadFolder;
import uz.akmal.mujiza.file.service.FileStorageService;
import uz.akmal.mujiza.file.service.ImageProcessor;
import uz.akmal.mujiza.file.service.ImageValidator;

import java.time.Duration;
import java.time.Instant;
import java.net.URI;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

/**
 * Rasmlarni bulutli xotiraga (Cloudflare R2 yoki AWS S3) saqlaydigan xizmat.
 * Cloudflare R2 AWS S3 API bilan 100% mos keladi va rasmlar uchun chiqish trafigi BEPUL ($0).
 * Yuklangan rasm avtomatik siqiladi va 30 kunlik kesh (Cache-Control) sarlavhasi bilan yuklanadi,
 * bu esa mijozlarga chaqmoqdek tez ochilishini ta'minlaydi.
 *
 * Faqat "app.storage.type=s3" bo'lganda ishga tushadi.
 */
@Slf4j
@Service
@ConditionalOnProperty(name = "app.storage.type", havingValue = "s3")
public class S3FileStorageService implements FileStorageService {

    private final ImageValidator imageValidator;
    private final ImageProcessor imageProcessor;

    @Value("${app.storage.s3.endpoint:}")
    private String endpoint;

    @Value("${app.storage.s3.region:auto}")
    private String region;

    @Value("${app.storage.s3.bucket:mujiza-media}")
    private String bucket;

    @Value("${app.storage.s3.access-key:}")
    private String accessKey;

    @Value("${app.storage.s3.secret-key:}")
    private String secretKey;

    @Value("${app.storage.s3.public-url:}")
    private String publicUrl;

    private S3Client s3Client;

    public S3FileStorageService(ImageValidator imageValidator, ImageProcessor imageProcessor) {
        this.imageValidator = imageValidator;
        this.imageProcessor = imageProcessor;
    }

    @PostConstruct
    public void init() {
        if (bucket == null || bucket.isBlank()) {
            throw new IllegalStateException("S3_BUCKET bo'sh bo'lmasligi kerak");
        }
        if ((endpoint == null || endpoint.isBlank()) && (publicUrl == null || publicUrl.isBlank())) {
            throw new IllegalStateException("S3_ENDPOINT yoki S3_PUBLIC_URL sozlanishi kerak");
        }
        if ((accessKey == null || accessKey.isBlank()) != (secretKey == null || secretKey.isBlank())) {
            throw new IllegalStateException("S3_ACCESS_KEY va S3_SECRET_KEY ikkalasi birga sozlanishi kerak");
        }
        log.info("S3FileStorageService ishga tushirilmoqda. Endpoint: {}, Bucket: {}, PublicURL: {}",
                endpoint, bucket, publicUrl);

        S3ClientBuilder builder = S3Client.builder()
                .region(Region.of(region.isBlank() ? "auto" : region))
                .overrideConfiguration(ClientOverrideConfiguration.builder()
                        .apiCallAttemptTimeout(Duration.ofSeconds(8))
                        .apiCallTimeout(Duration.ofSeconds(20))
                        .build());

        if (accessKey != null && !accessKey.isBlank() && secretKey != null && !secretKey.isBlank()) {
            builder.credentialsProvider(StaticCredentialsProvider.create(
                    AwsBasicCredentials.create(accessKey, secretKey)
            ));
        }

        if (endpoint != null && !endpoint.isBlank()) {
            builder.endpointOverride(URI.create(endpoint));
        }

        this.s3Client = builder.build();
    }

    @PreDestroy
    public void destroy() {
        if (s3Client != null) {
            s3Client.close();
        }
    }

    @Override
    public String store(MultipartFile file, UploadFolder folder) {
        String detected = imageValidator.validateAndDetectExtension(file);
        ImageProcessor.ProcessedImage image = imageProcessor.process(file, detected);

        String fileName = UUID.randomUUID() + "." + image.extension();
        String s3Key = folder.getDirectory() + "/" + fileName;
        String contentType = detectContentType(image.extension());

        try {
            PutObjectRequest putRequest = PutObjectRequest.builder()
                    .bucket(bucket)
                    .key(s3Key)
                    .contentType(contentType)
                    // Brauzer va Cloudflare CDN uchun 30 kunlik qat'iy kesh (uzum market tezligi)
                    .cacheControl("public, max-age=2592000, immutable")
                    .build();

            s3Client.putObject(putRequest, RequestBody.fromBytes(image.data()));
            log.info("Rasm S3/R2 bulutiga saqlandi: {} ({} bayt)", s3Key, image.data().length);

            return urlForKey(s3Key);
        } catch (Exception e) {
            log.error("Faylni S3/R2 bulutiga yuklashda xatolik: {}", s3Key, e);
            throw new IllegalStateException("Bulutga rasmni yuklab bo'lmadi", e);
        }
    }

    @Override
    public void delete(String url) {
        if (url == null || url.isBlank()) {
            return;
        }

        try {
            String s3Key = extractKey(url);
            if (s3Key != null && !s3Key.isBlank()) {
                s3Client.deleteObject(DeleteObjectRequest.builder()
                        .bucket(bucket)
                        .key(s3Key)
                        .build());
                log.info("Rasm S3/R2 bulutidan o'chirildi: {}", s3Key);
            }
        } catch (Exception e) {
            log.warn("Faylni S3/R2 bulutidan o'chirishda xatolik: {}", url, e);
        }
    }

    /**
     * {@inheritDoc}
     * Faqat cakes/ prefiksi. Ruxsat yetmasa xato logga yoziladi va bo'sh ro'yxat qaytadi.
     */
    @Override
    public List<String> listCakeFilesOlderThan(Duration age) {
        Instant cutoff = Instant.now().minus(age);
        String prefix = UploadFolder.CAKES.getDirectory() + "/";
        List<String> urls = new ArrayList<>();
        try {
            ListObjectsV2Request request = ListObjectsV2Request.builder()
                    .bucket(bucket)
                    .prefix(prefix)
                    .build();
            for (S3Object object : s3Client.listObjectsV2Paginator(request).contents()) {
                if (object.lastModified() != null && object.lastModified().isBefore(cutoff)) {
                    urls.add(urlForKey(object.key()));
                }
            }
            return urls;
        } catch (Exception e) {
            log.warn("Tort rasmlari ro'yxatini S3/R2 dan olib bo'lmadi, tozalash o'tkazib yuborildi", e);
            return List.of();
        }
    }

    /**
     * store() qaytaradigan ommaviy manzil.
     *
     * @param s3Key bucket ichidagi kalit
     * @return ommaviy manzil
     */
    private String urlForKey(String s3Key) {
        if (publicUrl != null && !publicUrl.isBlank()) {
            String normalizedPublicUrl = publicUrl.replaceAll("/+$", "");
            return normalizedPublicUrl + "/" + s3Key;
        }
        if (endpoint != null && !endpoint.isBlank()) {
            String normalizedEndpoint = endpoint.replaceAll("/+$", "");
            return normalizedEndpoint + "/" + bucket + "/" + s3Key;
        }
        return "/" + s3Key;
    }

    private String extractKey(String url) {
        String key = null;
        String normalizedPublicUrl = publicUrl == null ? "" : publicUrl.replaceAll("/+$", "");
        if (!normalizedPublicUrl.isBlank() && url.startsWith(normalizedPublicUrl + "/")) {
            key = url.substring(normalizedPublicUrl.length() + 1);
        } else if (url.startsWith("/")) {
            key = url.substring(1);
        }
        try {
            if (key == null && endpoint != null && !endpoint.isBlank()) {
                URI uri = URI.create(url);
                URI endpointUri = URI.create(endpoint);
                if (Objects.equals(uri.getScheme(), endpointUri.getScheme())
                        && Objects.equals(uri.getHost(), endpointUri.getHost())
                        && uri.getPort() == endpointUri.getPort()) {
                    String bucketPrefix = "/" + bucket + "/";
                    if (uri.getPath() != null && uri.getPath().startsWith(bucketPrefix)) {
                        key = uri.getPath().substring(bucketPrefix.length());
                    }
                }
            }
        } catch (Exception e) {
            log.debug("S3 rasm manzilidan object key ajratilmadi");
        }
        if (key == null || key.contains("..") || key.startsWith("/")) {
            return null;
        }
        String objectKey = key;
        boolean allowedFolder = java.util.Arrays.stream(UploadFolder.values())
                .anyMatch(folder -> objectKey.startsWith(folder.getDirectory() + "/"));
        return allowedFolder ? objectKey : null;
    }

    private String detectContentType(String extension) {
        return switch (extension.toLowerCase()) {
            case "png" -> "image/png";
            case "webp" -> "image/webp";
            default -> "image/jpeg";
        };
    }
}
