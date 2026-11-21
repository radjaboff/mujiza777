package uz.akmal.mujiza.marketing.mapper;

import org.springframework.stereotype.Component;
import uz.akmal.mujiza.marketing.dto.PromoCodeRequest;
import uz.akmal.mujiza.marketing.dto.PromoCodeResponse;
import uz.akmal.mujiza.marketing.entity.PromoCode;
import uz.akmal.mujiza.marketing.enums.DiscountType;

import java.time.LocalDateTime;
import java.util.Locale;

/**
 * PromoCode entity bilan DTO'larni bir-biriga aylantiradi.
 */
@Component
public class PromoCodeMapper {

    /**
     * Admin yuborgan ma'lumotdan YANGI PromoCode obyektini yasaydi.
     *
     * @param request admin yuborgan ma'lumot
     * @return yangi (hali bazaga saqlanmagan) PromoCode
     */
    public PromoCode toEntity(PromoCodeRequest request) {
        PromoCode promo = new PromoCode();
        // Kod faqat yaratishda o'rnatiladi va keyin o'zgarmaydi (Service tekshiradi)
        promo.setCode(normalizeCode(request.code()));
        applyRequest(promo, request);
        return promo;
    }

    /**
     * Admin yuborgan ma'lumotni MAVJUD kodga ko'chiradi (kod matniga va foydalanish soniga tegmaydi).
     * Eng ko'p chegirma summasi faqat foizli kodda saqlanadi, aniq summali kodda doim bo'sh.
     * Minimal summa yuborilmasa 0 bo'ladi. firstOrderOnly va isActive yuborilmasa, eski qiymat qoladi.
     *
     * @param promo   tahrirlanayotgan kod
     * @param request admin yuborgan yangi ma'lumot
     */
    public void applyRequest(PromoCode promo, PromoCodeRequest request) {
        promo.setDescription(blankToNull(request.description()));
        promo.setDiscountType(request.discountType());
        promo.setDiscountValue(request.discountValue());
        promo.setMaxDiscountAmount(request.discountType() == DiscountType.PERCENT ? request.maxDiscountAmount() : null);
        promo.setMinOrderAmount(request.minOrderAmount() != null ? request.minOrderAmount() : 0L);
        promo.setMaxUses(request.maxUses());
        promo.setValidFrom(request.validFrom());
        promo.setValidTo(request.validTo());
        if (request.firstOrderOnly() != null) {
            promo.setFirstOrderOnly(request.firstOrderOnly());
        }
        if (request.isActive() != null) {
            promo.setIsActive(request.isActive());
        }
    }

    /**
     * Koddan admin panel uchun javob yasaydi.
     *
     * @param promo bazadan olingan kod
     * @param now   hozirgi vaqt (hozir ishlatib bo'ladimi, shuni hisoblash uchun)
     * @return admin panelga qaytariladigan DTO
     */
    public PromoCodeResponse toResponse(PromoCode promo, LocalDateTime now) {
        return new PromoCodeResponse(
                promo.getId(),
                promo.getCode(),
                promo.getDescription(),
                promo.getDiscountType(),
                promo.getDiscountValue(),
                promo.getMaxDiscountAmount(),
                promo.getMinOrderAmount(),
                promo.getMaxUses(),
                promo.getUsedCount(),
                promo.getFirstOrderOnly(),
                promo.getValidFrom(),
                promo.getValidTo(),
                promo.getIsActive(),
                isUsableAt(promo, now),
                promo.getCreatedAt(),
                promo.getUpdatedAt()
        );
    }

    /**
     * Kod matnini standart ko'rinishga keltiradi: bo'sh joylarsiz, KATTA harflarda.
     * Bazada va qidirishda doim shu ko'rinish ishlatiladi, shuning uchun mijoz "navroz10" yozsa ham topiladi.
     *
     * @param rawCode kiritilgan kod
     * @return standart ko'rinishdagi kod
     */
    public String normalizeCode(String rawCode) {
        return rawCode.trim().toUpperCase(Locale.ROOT);
    }

    /**
     * Yordamchi metod: kod berilgan vaqtda ishlatib bo'ladimi (yoqilgan, muddati ichida, limit tugamagan).
     *
     * @param promo tekshiriladigan kod
     * @param now   hozirgi vaqt
     * @return ishlatib bo'lsa true
     */
    private boolean isUsableAt(PromoCode promo, LocalDateTime now) {
        boolean started = promo.getValidFrom() == null || !promo.getValidFrom().isAfter(now);
        boolean notEnded = promo.getValidTo() == null || promo.getValidTo().isAfter(now);
        boolean hasUses = promo.getMaxUses() == null || promo.getUsedCount() < promo.getMaxUses();
        return Boolean.TRUE.equals(promo.getIsActive()) && started && notEnded && hasUses;
    }

    /**
     * Yordamchi metod: matnni tozalaydi, bo'sh bo'lsa null qaytaradi.
     *
     * @param text tekshiriladigan matn
     * @return tozalangan matn yoki null
     */
    private String blankToNull(String text) {
        if (text == null || text.isBlank()) {
            return null;
        }
        return text.trim();
    }
}