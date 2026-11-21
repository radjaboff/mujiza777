package uz.akmal.mujiza.common;

import org.springframework.data.domain.Page;

import java.util.List;

/**
 * Sahifalangan ro'yxat javobining umumiy shakli (mahsulotlar, buyurtmalar va boshqa ro'yxatlar uchun).
 * Spring'ning o'z Page obyekti ortiqcha ma'lumotga boy, shuning uchun frontendga faqat kerakli qismini beramiz.
 *
 * @param content       joriy sahifadagi elementlar
 * @param page          joriy sahifa raqami (0 dan boshlanadi)
 * @param size          bir sahifadagi elementlar soni
 * @param totalElements barcha elementlar soni
 * @param totalPages    jami sahifalar soni
 * @param number        Spring Data bilan bir xil sahifa raqami (page bilan teng)
 * @param first         birinchi sahifami
 * @param last          oxirgi sahifami
 * @param empty         sahifa bo'shmi
 * @param <T>           element turi (masalan, PublicProductResponse)
 */
public record PageResponse<T>(
        List<T> content,
        int page,
        int size,
        long totalElements,
        int totalPages,
        int number,
        boolean first,
        boolean last,
        boolean empty
) {

    /**
     * Spring'ning Page obyektidan PageResponse yasaydi.
     *
     * @param page Spring qaytargan sahifa
     * @param <T>  element turi
     * @return tayyor PageResponse
     */
    public static <T> PageResponse<T> of(Page<T> page) {
        return new PageResponse<>(
                page.getContent(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.getNumber(),
                page.isFirst(),
                page.isLast(),
                page.isEmpty()
        );
    }
}