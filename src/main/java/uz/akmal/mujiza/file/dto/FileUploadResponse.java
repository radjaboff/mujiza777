package uz.akmal.mujiza.file.dto;

/**
 * Rasm yuklangandan keyin adminga qaytariladigan javob.
 * Shu manzilni mahsulotning (yoki kategoriyaning) imageUrl maydoniga yozamiz.
 *
 * @param url yuklangan rasmning manzili (masalan, "/uploads/products/3f2a....webp")
 */
public record FileUploadResponse(String url) {
}