package uz.akmal.mujiza.file.service;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;
import uz.akmal.mujiza.common.exception.BusinessException;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * ImageProcessor: katta rasmni kichraytirish, kichigini saqlash, buzilgan faylni rad etish.
 */
class ImageProcessorTest {

    private final ImageProcessor processor = new ImageProcessor();

    /**
     * Yordamchi metod: berilgan o'lcham va turdagi rasm baytlarini yasaydi.
     */
    private byte[] image(int width, int height, int type, String format) throws IOException {
        BufferedImage image = new BufferedImage(width, height, type);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        ImageIO.write(image, format, out);
        return out.toByteArray();
    }

    private BufferedImage read(byte[] data) throws IOException {
        return ImageIO.read(new ByteArrayInputStream(data));
    }

    private MockMultipartFile file(byte[] content) {
        return new MockMultipartFile("file", "x", "application/octet-stream", content);
    }

    @Test
    void shrinksLargeJpegToMaxSide() throws IOException {
        byte[] original = image(3200, 2400, BufferedImage.TYPE_INT_RGB, "jpg");
        ImageProcessor.ProcessedImage result = processor.process(file(original), "jpg");
        BufferedImage processed = read(result.data());
        assertThat(result.extension()).isEqualTo("jpg");
        assertThat(processed.getWidth()).isEqualTo(1600);
        assertThat(processed.getHeight()).isEqualTo(1200);
    }

    @Test
    void keepsSmallImageSize() throws IOException {
        byte[] original = image(400, 300, BufferedImage.TYPE_INT_RGB, "jpg");
        BufferedImage processed = read(processor.process(file(original), "jpg").data());
        assertThat(processed.getWidth()).isEqualTo(400);
        assertThat(processed.getHeight()).isEqualTo(300);
    }

    @Test
    void keepsPngTransparency() throws IOException {
        byte[] original = image(100, 100, BufferedImage.TYPE_INT_ARGB, "png");
        ImageProcessor.ProcessedImage result = processor.process(file(original), "png");
        assertThat(result.extension()).isEqualTo("png");
        assertThat(read(result.data()).getColorModel().hasAlpha()).isTrue();
    }

    @Test
    void reencodesWebpAsJpeg() throws IOException {
        byte[] webp = java.util.Base64.getDecoder().decode(
                "UklGRlIAAABXRUJQVlA4IEYAAAAwAgCdASoEAAQAAYcIhYwAAP77/v/+8vUB/6Vf8P/2T/n/v7A//eX/3/3/9D8B/h/+//7/9v//3/8B");
        ImageProcessor.ProcessedImage result = processor.process(file(webp), "webp");
        assertThat(result.extension()).isEqualTo("jpg");
        BufferedImage processed = read(result.data());
        assertThat(processed).isNotNull();
        assertThat(processed.getWidth()).isGreaterThan(0);
    }

    @Test
    void rejectsOversizedWebpFromHeader() {
        byte[] webp = java.util.Base64.getDecoder().decode(
                "UklGRlIAAABXRUJQVlA4IEYAAAAwAgCdASoEAAQAAYcIhYwAAP77/v/+8vUB/6Vf8P/2T/n/v7A//eX/3/3/9D8B/h/+//7/9v//3/8B");
        // VP8 kenglik/bo'y 14 bit. 10001x10001 sarlavhasi 24 megapiksel limitidan oshadi.
        webp = withVp8Dimensions(webp, 10001, 10001);
        byte[] oversized = webp;
        assertThatThrownBy(() -> processor.process(file(oversized), "webp"))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("24 megapiksel");
    }

    /**
     * VP8 kalit-kadr sarlavhasidagi en va bo'yni almashtiradi (start code 9d 01 2a dan keyin).
     */
    private static byte[] withVp8Dimensions(byte[] webp, int width, int height) {
        byte[] copy = webp.clone();
        for (int i = 0; i < copy.length - 7; i++) {
            if ((copy[i] & 0xFF) == 0x9D && (copy[i + 1] & 0xFF) == 0x01 && (copy[i + 2] & 0xFF) == 0x2A) {
                copy[i + 3] = (byte) (width & 0xFF);
                copy[i + 4] = (byte) ((width >> 8) & 0x3F);
                copy[i + 5] = (byte) (height & 0xFF);
                copy[i + 6] = (byte) ((height >> 8) & 0x3F);
                return copy;
            }
        }
        throw new IllegalStateException("VP8 start code topilmadi");
    }

    @Test
    void rejectsCorruptedImage() {
        byte[] broken = {(byte) 0xFF, (byte) 0xD8, (byte) 0xFF, 1, 2, 3, 4, 5, 6, 7, 8, 9};
        assertThatThrownBy(() -> processor.process(file(broken), "jpg"))
                .isInstanceOf(BusinessException.class);
    }
}
