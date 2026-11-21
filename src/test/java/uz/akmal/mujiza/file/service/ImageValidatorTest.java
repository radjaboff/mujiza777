package uz.akmal.mujiza.file.service;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;
import uz.akmal.mujiza.common.exception.BusinessException;

import java.nio.charset.StandardCharsets;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * ImageValidator: fayl haqiqiy rasm ekanini nomiga emas, ichidagi belgilarga qarab aniqlash.
 */
class ImageValidatorTest {

    private final ImageValidator validator = new ImageValidator();

    private MockMultipartFile file(String name, byte[] content) {
        return new MockMultipartFile("file", name, "application/octet-stream", content);
    }

    @Test
    void detectsJpegByContent() {
        byte[] jpeg = {(byte) 0xFF, (byte) 0xD8, (byte) 0xFF, (byte) 0xE0, 0, 0, 0, 0, 0, 0, 0, 0};
        assertThat(validator.validateAndDetectExtension(file("x.bin", jpeg))).isEqualTo("jpg");
    }

    @Test
    void detectsPngByContent() {
        byte[] png = {(byte) 0x89, 'P', 'N', 'G', 0x0D, 0x0A, 0x1A, 0x0A, 0, 0, 0, 0};
        assertThat(validator.validateAndDetectExtension(file("x.bin", png))).isEqualTo("png");
    }

    @Test
    void detectsWebpByContent() {
        byte[] webp = {'R', 'I', 'F', 'F', 0, 0, 0, 0, 'W', 'E', 'B', 'P'};
        assertThat(validator.validateAndDetectExtension(file("x.bin", webp))).isEqualTo("webp");
    }

    @Test
    void rejectsTextFileEvenWithImageName() {
        byte[] text = "bu rasm emas, oddiy matn".getBytes(StandardCharsets.UTF_8);
        assertThatThrownBy(() -> validator.validateAndDetectExtension(file("rasm.jpg", text)))
                .isInstanceOf(BusinessException.class).hasMessageContaining("JPG, PNG yoki WEBP");
    }

    @Test
    void rejectsEmptyFile() {
        assertThatThrownBy(() -> validator.validateAndDetectExtension(file("x.jpg", new byte[0])))
                .isInstanceOf(BusinessException.class).hasMessageContaining("tanlanmagan");
    }

    @Test
    void rejectsTooLargeFile() {
        byte[] huge = new byte[5 * 1024 * 1024 + 1];
        huge[0] = (byte) 0xFF;
        huge[1] = (byte) 0xD8;
        huge[2] = (byte) 0xFF;
        assertThatThrownBy(() -> validator.validateAndDetectExtension(file("x.jpg", huge)))
                .isInstanceOf(BusinessException.class).hasMessageContaining("5 MB");
    }
}