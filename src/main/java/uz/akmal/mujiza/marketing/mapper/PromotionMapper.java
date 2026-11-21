package uz.akmal.mujiza.marketing.mapper;

import org.springframework.stereotype.Component;
import uz.akmal.mujiza.marketing.dto.PromotionRequest;
import uz.akmal.mujiza.marketing.dto.PromotionResponse;
import uz.akmal.mujiza.marketing.dto.PublicPromotionResponse;
import uz.akmal.mujiza.marketing.entity.Promotion;

import java.time.LocalDateTime;

/**
 * Promotion entity bilan DTO'larni bir-biriga aylantiradi.
 */
@Component
public class PromotionMapper {

    /**
     * Admin yuborgan ma'lumotdan YANGI Promotion obyektini yasaydi (slug'ni Service qo'yadi).
     *
     * @param request admin yuborgan ma'lumot
     * @return yangi (hali bazaga saqlanmagan) Promotion
     */
    public Promotion toEntity(PromotionRequest request) {
        // Bo'sh Promotion yaratamiz (standart qiymatlar: showOnHome = false, isActive = true, sortOrder = 0)
        Promotion promotion = new Promotion();
        applyRequest(promotion, request);
        return promotion;
    }

    /**
     * Admin yuborgan ma'lumotni MAVJUD aksiyaga ko'chiradi (slug'ga tegmaydi, uni Service hal qiladi).
     * Ixtiyoriy matnlar bo'sh qator bo'lsa, bazaga null bo'lib yoziladi.
     * Mantiqiy maydonlar va tartib raqami yuborilmasa (null), eski qiymat qoladi.
     *
     * @param promotion tahrirlanayotgan aksiya
     * @param request   admin yuborgan yangi ma'lumot
     */
    public void applyRequest(Promotion promotion, PromotionRequest request) {
        promotion.setTitleUz(request.titleUz().trim());
        promotion.setTitleRu(request.titleRu().trim());
        promotion.setSummaryUz(blankToNull(request.summaryUz()));
        promotion.setSummaryRu(blankToNull(request.summaryRu()));
        promotion.setDescriptionUz(blankToNull(request.descriptionUz()));
        promotion.setDescriptionRu(blankToNull(request.descriptionRu()));
        promotion.setImageUrl(blankToNull(request.imageUrl()));
        promotion.setMobileImageUrl(blankToNull(request.mobileImageUrl()));
        promotion.setLinkUrl(blankToNull(request.linkUrl()));
        promotion.setActiveFrom(request.activeFrom());
        promotion.setActiveTo(request.activeTo());
        if (request.showOnHome() != null) {
            promotion.setShowOnHome(request.showOnHome());
        }
        if (request.sortOrder() != null) {
            promotion.setSortOrder(request.sortOrder());
        }
        if (request.isActive() != null) {
            promotion.setIsActive(request.isActive());
        }
    }

    /**
     * Aksiyadan admin panel uchun to'liq javob yasaydi.
     *
     * @param promotion bazadan olingan aksiya
     * @param now       hozirgi vaqt (hozir ko'rinyaptimi, shuni hisoblash uchun)
     * @return admin panelga qaytariladigan DTO
     */
    public PromotionResponse toResponse(Promotion promotion, LocalDateTime now) {
        return new PromotionResponse(
                promotion.getId(),
                promotion.getTitleUz(),
                promotion.getTitleRu(),
                promotion.getSlug(),
                promotion.getSummaryUz(),
                promotion.getSummaryRu(),
                promotion.getDescriptionUz(),
                promotion.getDescriptionRu(),
                promotion.getImageUrl(),
                promotion.getMobileImageUrl(),
                promotion.getLinkUrl(),
                promotion.getShowOnHome(),
                promotion.getActiveFrom(),
                promotion.getActiveTo(),
                promotion.getSortOrder(),
                promotion.getIsActive(),
                isVisibleAt(promotion, now),
                promotion.getCreatedAt(),
                promotion.getUpdatedAt()
        );
    }

    /**
     * Aksiyadan mijoz sayti uchun javob yasaydi (matnlar bitta tilda).
     *
     * @param promotion bazadan olingan aksiya
     * @param lang      til kodi: "ru" bo'lsa ruscha (to'ldirilgan bo'lsa), boshqa hamma holatda o'zbekcha
     * @return mijoz saytiga qaytariladigan DTO
     */
    public PublicPromotionResponse toPublicResponse(Promotion promotion, String lang) {
        // Telefon rasmi yo'q bo'lsa, kompyuter rasmi ishlatiladi (frontend har doim to'ldirilgan maydon oladi)
        String mobile = promotion.getMobileImageUrl() != null
                ? promotion.getMobileImageUrl()
                : promotion.getImageUrl();
        return new PublicPromotionResponse(
                promotion.getId(),
                localized(promotion.getTitleUz(), promotion.getTitleRu(), lang),
                promotion.getSlug(),
                localized(promotion.getSummaryUz(), promotion.getSummaryRu(), lang),
                localized(promotion.getDescriptionUz(), promotion.getDescriptionRu(), lang),
                promotion.getImageUrl(),
                mobile,
                promotion.getLinkUrl(),
                promotion.getActiveTo()
        );
    }

    /**
     * Yordamchi metod: aksiya berilgan vaqtda mijozlarga ko'rinadimi (yoqilgan va vaqt oralig'ida).
     * Repository'dagi VISIBLE sharti bilan bir xil qoida.
     *
     * @param promotion tekshiriladigan aksiya
     * @param now       hozirgi vaqt
     * @return ko'rinsa true
     */
    private boolean isVisibleAt(Promotion promotion, LocalDateTime now) {
        boolean started = promotion.getActiveFrom() == null || !promotion.getActiveFrom().isAfter(now);
        boolean notEnded = promotion.getActiveTo() == null || promotion.getActiveTo().isAfter(now);
        return Boolean.TRUE.equals(promotion.getIsActive()) && started && notEnded;
    }

    /**
     * Yordamchi metod: so'ralgan tilga mos matnni tanlaydi.
     * Ruscha so'ralgan va ruscha matn to'ldirilgan bo'lsa ruscha, aks holda o'zbekcha (bo'sh joy ko'rinmasligi uchun).
     *
     * @param uz   o'zbekcha matn
     * @param ru   ruscha matn
     * @param lang til kodi
     * @return tanlangan matn
     */
    private String localized(String uz, String ru, String lang) {
        if ("ru".equalsIgnoreCase(lang) && ru != null && !ru.isBlank()) {
            return ru;
        }
        return uz;
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