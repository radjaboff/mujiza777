package uz.akmal.mujiza.file.service;

import net.coobird.thumbnailator.Thumbnails;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.HttpStatus;
import uz.akmal.mujiza.common.exception.BusinessException;

import javax.imageio.ImageIO;
import javax.imageio.ImageReader;
import javax.imageio.stream.ImageInputStream;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Iterator;
import java.util.concurrent.Semaphore;
import java.util.concurrent.TimeUnit;

/**
 * Yuklangan rasmni qayta ishlaydi: o'lchamini tekshiradi, katta rasmni kichraytiradi va qayta kodlaydi.
 * Qayta kodlash EXIF kabi yashirin ma'lumotlarni (kamera, sana, GPS) o'chiradi va rasm hajmini kamaytiradi.
 * Fayl saqlanadigan joydan (disk yoki bulut) qat'i nazar, ikkala ijro ham shu klassdan foydalanadi.
 */
@Component
public class ImageProcessor {

    /** Limits simultaneous large image decodes so upload bursts cannot exhaust the JVM heap. */
    private static final Semaphore PROCESSING_SLOTS = new Semaphore(1, true);

    /**
     * Rasmning eng uzun tomoni shundan oshsa, kichraytiriladi (piksel).
     */
    private static final int MAX_SIDE = 1600;

    /**
     * Qabul qilinadigan rasmning eng katta tomoni (piksel). Undan kattasi xotirani to'ldirib yuborishi mumkin.
     */
    private static final int MAX_DIMENSION = 10_000;

    /**
     * Qabul qilinadigan rasmning eng katta maydoni (piksel soni, 24 megapiksel).
     */
    private static final long MAX_PIXELS = 24_000_000L;

    /**
     * JPEG sifati (0 dan 1 gacha): ko'zga deyarli sezilmaydi, hajm esa ancha kichik.
     */
    private static final double JPEG_QUALITY = 0.85;

    /**
     * Qayta ishlangan rasm.
     *
     * @param data      rasm baytlari
     * @param extension kengaytma nuqtasiz ("jpg", "png" yoki "webp")
     */
    public record ProcessedImage(byte[] data, String extension) {
    }

    /**
     * Rasmni qayta ishlaydi.
     *
     * @param file      yuklangan fayl (ImageValidator tekshirib bo'lgan)
     * @param extension tekshiruv aniqlagan haqiqiy kengaytma ("jpg", "png" yoki "webp")
     * @return qayta ishlangan rasm (WebP JPEG yoki PNG bo'lib qayta yoziladi)
     * @throws BusinessException rasm buzilgan yoki juda katta bo'lsa
     */
    public ProcessedImage process(MultipartFile file, String extension) {
        boolean acquired = false;
        try {
            acquired = PROCESSING_SLOTS.tryAcquire(2, TimeUnit.SECONDS);
            if (!acquired) {
                throw new BusinessException("Rasmlar hozir ko'p qayta ishlanmoqda, birozdan keyin urinib ko'ring",
                        HttpStatus.SERVICE_UNAVAILABLE);
            }
            return processImage(file, extension);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new BusinessException("Rasmni qayta ishlash bekor qilindi",
                    HttpStatus.SERVICE_UNAVAILABLE);
        } finally {
            if (acquired) {
                PROCESSING_SLOTS.release();
            }
        }
    }

    private ProcessedImage processImage(MultipartFile file, String extension) {
        try {
            byte[] original = file.getBytes();
            int[] size = readDimensions(original);
            int width = size[0];
            int height = size[1];
            if (width > MAX_DIMENSION || height > MAX_DIMENSION || (long) width * height > MAX_PIXELS) {
                throw new BusinessException("Rasm o'lchami juda katta (ko'pi bilan 24 megapiksel)");
            }
            // WebP shaffof bo'lsa PNG, aks holda JPEG. PNG o'z formatida qoladi.
            boolean asPng = "png".equals(extension) || ("webp".equals(extension) && hasAlpha(original));
            String outExtension = asPng ? "png" : ("webp".equals(extension) ? "jpg" : extension);

            // Kichik rasm o'z o'lchamida qoladi (kattalashtirilmaydi), katta rasm 1600 pikselgacha kichraytiriladi
            Thumbnails.Builder<InputStream> builder = (Thumbnails.Builder<InputStream>) Thumbnails.of(new ByteArrayInputStream(original));
            if (Math.max(width, height) > MAX_SIDE) {
                builder.size(MAX_SIDE, MAX_SIDE);
            } else {
                builder.scale(1.0);
            }
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            if (asPng) {
                builder.outputFormat("png").toOutputStream(out);
            } else {
                builder.imageType(BufferedImage.TYPE_INT_RGB)
                        .outputFormat("jpg")
                        .outputQuality(JPEG_QUALITY)
                        .toOutputStream(out);
            }
            return new ProcessedImage(out.toByteArray(), outExtension);
        } catch (IOException | RuntimeException e) {
            if (e instanceof BusinessException business) {
                throw business;
            }
            throw new BusinessException("Rasmni qayta ishlab bo'lmadi: fayl buzilgan bo'lishi mumkin");
        }
    }

    /**
     * Yordamchi metod: rasmning eni va bo'yini butun rasmni xotiraga yuklamasdan (faqat sarlavhadan) o'qiydi.
     *
     * @param data rasm baytlari
     * @return [eni, bo'yi]
     * @throws IOException rasmni o'qib bo'lmasa
     */
    /**
     * WebP (yoki boshqa format) shaffof kanalga ega ekanini aniqlaydi.
     *
     * @param data rasm baytlari
     * @return shaffof bo'lsa true
     * @throws IOException rasmni o'qib bo'lmasa
     */
    private boolean hasAlpha(byte[] data) throws IOException {
        BufferedImage image = ImageIO.read(new ByteArrayInputStream(data));
        if (image == null) {
            throw new BusinessException("Rasmni o'qib bo'lmadi: fayl buzilgan bo'lishi mumkin");
        }
        return image.getColorModel().hasAlpha();
    }

    private int[] readDimensions(byte[] data) throws IOException {
        try (ImageInputStream stream = ImageIO.createImageInputStream(new ByteArrayInputStream(data))) {
            Iterator<ImageReader> readers = ImageIO.getImageReaders(stream);
            if (!readers.hasNext()) {
                throw new BusinessException("Rasmni o'qib bo'lmadi: fayl buzilgan bo'lishi mumkin");
            }
            ImageReader reader = readers.next();
            try {
                reader.setInput(stream);
                return new int[]{reader.getWidth(0), reader.getHeight(0)};
            } finally {
                reader.dispose();
            }
        }
    }
}
