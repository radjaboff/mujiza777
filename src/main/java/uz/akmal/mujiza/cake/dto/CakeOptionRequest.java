package uz.akmal.mujiza.cake.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import uz.akmal.mujiza.cake.enums.CakeOptionKind;
import uz.akmal.mujiza.cake.enums.CakePriceType;

/**
 * Admin tort variantini yaratganda yoki tahrirlaganda yuboradigan ma'lumot.
 *
 * @param kind       guruhi: FLAVOR, CREAM, DECOR yoki EXTRA (majburiy)
 * @param nameUz     nomi o'zbek tilida (majburiy)
 * @param nameRu     nomi rus tilida (majburiy)
 * @param imageUrl   rasm manzili (ixtiyoriy)
 * @param priceType  narx turi: PER_KG yoki FIXED (majburiy)
 * @param priceValue qo'shimcha narx, so'mda; 0 bo'lsa bepul (majburiy)
 * @param sortOrder  ko'rsatish tartibi; yuborilmasa eski qiymat (yangida 0)
 * @param isActive   mijozlarga ko'rinadimi; yuborilmasa eski qiymat (yangida true)
 */
public record CakeOptionRequest(

        @NotNull(message = "Variant guruhi tanlanishi kerak")
        CakeOptionKind kind,

        @NotBlank(message = "O'zbekcha nom bo'sh bo'lmasligi kerak")
        @Size(max = 150, message = "O'zbekcha nom 150 belgidan oshmasligi kerak")
        String nameUz,

        @NotBlank(message = "Ruscha nom bo'sh bo'lmasligi kerak")
        @Size(max = 150, message = "Ruscha nom 150 belgidan oshmasligi kerak")
        String nameRu,

        @Size(max = 500, message = "Rasm manzili 500 belgidan oshmasligi kerak")
        String imageUrl,

        @NotNull(message = "Narx turi tanlanishi kerak")
        CakePriceType priceType,

        @NotNull(message = "Narx kiritilishi kerak (bepul bo'lsa 0)")
        @PositiveOrZero(message = "Narx manfiy bo'lmasligi kerak")
        Long priceValue,

        @PositiveOrZero(message = "Tartib raqami manfiy bo'lmasligi kerak")
        Integer sortOrder,

        Boolean isActive
) {
}