package uz.akmal.mujiza.common;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * SlugUtil: nomdan URL uchun qisqa nom yasash qoidalari.
 */
class SlugUtilTest {

    @Test
    void removesApostrophesAndJoinsWordsWithDash() {
        assertThat(SlugUtil.toSlug("Tug'ilgan kun tortlari")).isEqualTo("tugilgan-kun-tortlari");
    }

    @Test
    void trimsAndCollapsesSymbols() {
        assertThat(SlugUtil.toSlug("  Napoleon   torti!!  ")).isEqualTo("napoleon-torti");
    }

    @Test
    void keepsDigits() {
        assertThat(SlugUtil.toSlug("Tort 2 kg")).isEqualTo("tort-2-kg");
    }

    @Test
    void cyrillicOnlyTextGivesEmptySlug() {
        assertThat(SlugUtil.toSlug("Торт Наполеон")).isEmpty();
    }

    @Test
    void nullGivesEmptySlug() {
        assertThat(SlugUtil.toSlug(null)).isEmpty();
    }
}