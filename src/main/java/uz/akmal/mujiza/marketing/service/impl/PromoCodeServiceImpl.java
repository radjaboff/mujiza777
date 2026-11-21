package uz.akmal.mujiza.marketing.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.akmal.mujiza.audit.service.AuditService;
import uz.akmal.mujiza.common.exception.BusinessException;
import uz.akmal.mujiza.common.exception.ResourceNotFoundException;
import uz.akmal.mujiza.common.ShopTime;
import uz.akmal.mujiza.marketing.dto.PromoApplication;
import uz.akmal.mujiza.marketing.dto.PromoCodeRequest;
import uz.akmal.mujiza.marketing.dto.PromoCodeResponse;
import uz.akmal.mujiza.marketing.dto.PromoValidateRequest;
import uz.akmal.mujiza.marketing.dto.PromoValidateResponse;
import uz.akmal.mujiza.marketing.entity.PromoCode;
import uz.akmal.mujiza.marketing.enums.DiscountType;
import uz.akmal.mujiza.marketing.mapper.PromoCodeMapper;
import uz.akmal.mujiza.marketing.repository.PromoCodeRepository;
import uz.akmal.mujiza.marketing.service.PromoCodeService;
import uz.akmal.mujiza.order.enums.OrderStatus;
import uz.akmal.mujiza.order.repository.CustomerOrderRepository;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;

/**
 * Promo kodlar bilan ishlash qoidalarining amaldagi ijrosi.
 *
 * @Service: Spring bu klassni "biznes mantiq qatlami" sifatida taniydi.
 * @RequiredArgsConstructor (Lombok): final maydonlar uchun konstruktor yaratadi.
 * @Slf4j (Lombok): log yozish uchun "log" o'zgaruvchisini yaratadi.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PromoCodeServiceImpl implements PromoCodeService {

    /**
     * Kod topilmaganda yoki o'chirilgan/o'chirib qo'yilgan bo'lganda ko'rsatiladigan xabar.
     * Ikkala holat uchun bir xil: mijoz qaysi kod mavjudligini taxmin qilib topa olmasligi uchun.
     */
    private static final String NOT_FOUND_MESSAGE = "Bunday promo kod topilmadi";

    /**
     * Bazadan promo kodlarni o'qish va yozish uchun.
     */
    private final PromoCodeRepository promoCodeRepository;

    /**
     * "Faqat birinchi buyurtma" shartini tekshirish uchun mijozning oldingi buyurtmalarini qidirishda.
     */
    private final CustomerOrderRepository orderRepository;

    /**
     * Entity va DTO'ni bir-biriga aylantirish uchun.
     */
    private final PromoCodeMapper promoCodeMapper;

    /**
     * Muhim o'zgarishlarni tarixga yozish uchun.
     */
    private final AuditService auditService;

    /**
     * {@inheritDoc}
     * readOnly = true: faqat o'qiladi, baza tezroq ishlaydi.
     */
    @Override
    @Transactional(readOnly = true)
    public List<PromoCodeResponse> getAll() {
        LocalDateTime now = ShopTime.now();
        return promoCodeRepository.findAllByIsDeletedFalseOrderByIdDesc()
                .stream()
                .map(promo -> promoCodeMapper.toResponse(promo, now))
                .toList();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional(readOnly = true)
    public PromoCodeResponse getById(Long id) {
        return promoCodeMapper.toResponse(findActiveOrThrow(id), ShopTime.now());
    }

    /**
     * {@inheritDoc}
     * @Transactional: ichidagi barcha ishlar bitta tranzaksiya, xato bo'lsa hammasi bekor qilinadi.
     */
    @Override
    @Transactional
    public PromoCodeResponse create(PromoCodeRequest request) {
        validateRules(request);
        String code = promoCodeMapper.normalizeCode(request.code());
        // Kod o'chirilmagan kodlar orasida takrorlanmasligi kerak
        if (promoCodeRepository.existsByCodeAndIsDeletedFalse(code)) {
            throw new BusinessException("Bu promo kod allaqachon mavjud: " + code, HttpStatus.CONFLICT);
        }
        PromoCode saved = promoCodeRepository.save(promoCodeMapper.toEntity(request));
        log.info("Promo kod yaratildi: id={}, code={}", saved.getId(), saved.getCode());
        auditService.log("PROMO_CREATED", "PROMO_CODE", saved.getId(), saved.getCode());
        return promoCodeMapper.toResponse(saved, ShopTime.now());
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional
    public PromoCodeResponse update(Long id, PromoCodeRequest request) {
        validateRules(request);
        PromoCode promo = findActiveOrThrow(id);
        // Kod matni o'zgarmaydi: mijozlarga tarqatilgan kod birdan boshqa narsaga aylanib qolmasligi uchun
        if (!promoCodeMapper.normalizeCode(request.code()).equals(promo.getCode())) {
            throw new BusinessException("Kod matnini o'zgartirib bo'lmaydi, yangi kod yarating");
        }
        // Limit hozirgi foydalanish sonidan kam bo'lishi mantiqsiz (kodni to'xtatish uchun uni o'chirib qo'yish kerak)
        if (request.maxUses() != null && request.maxUses() < promo.getUsedCount()) {
            throw new BusinessException("Foydalanish limiti hozirgi foydalanish sonidan ("
                    + promo.getUsedCount() + ") kam bo'lishi mumkin emas");
        }
        promoCodeMapper.applyRequest(promo, request);
        PromoCode saved = promoCodeRepository.save(promo);
        log.info("Promo kod yangilandi: id={}", saved.getId());
        auditService.log("PROMO_UPDATED", "PROMO_CODE", saved.getId(), saved.getCode());
        return promoCodeMapper.toResponse(saved, ShopTime.now());
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional
    public void delete(Long id) {
        PromoCode promo = findActiveOrThrow(id);
        // Bazadan o'chirmaymiz, faqat o'chirilgan deb belgilaymiz (soft delete)
        promo.setIsDeleted(true);
        promoCodeRepository.save(promo);
        auditService.log("PROMO_DELETED", "PROMO_CODE", id, promo.getCode());
        log.info("Promo kod o'chirildi (soft delete): id={}", id);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional(readOnly = true)
    public PromoValidateResponse validate(PromoValidateRequest request) {
        String code = promoCodeMapper.normalizeCode(request.code());
        PromoCode promo = promoCodeRepository.findByCodeAndIsDeletedFalse(code).orElse(null);
        if (promo == null) {
            return new PromoValidateResponse(false, code, 0, NOT_FOUND_MESSAGE);
        }
        String problem = findProblem(promo, request.itemsTotal(), request.customerPhone(), ShopTime.now());
        if (problem != null) {
            return new PromoValidateResponse(false, code, 0, problem);
        }
        // Telefon berilmagan bo'lsa, "birinchi buyurtma" sharti hozir tekshirilmaydi, shuni eslatamiz
        String note = Boolean.TRUE.equals(promo.getFirstOrderOnly()) && request.customerPhone() == null
                ? "Birinchi buyurtma ekanligi buyurtma berish paytida tekshiriladi"
                : null;
        return new PromoValidateResponse(true, code, calculateDiscount(promo, request.itemsTotal()), note);
    }

    /**
     * {@inheritDoc}
     * Kod bazada bloklab olinadi: oxirgi qolgan foydalanishga ikki mijoz bir vaqtda kelsa, ikkinchisi kutadi
     * va yangilangan sonni ko'rib, rad etiladi.
     */
    @Override
    @Transactional
    public PromoApplication apply(String code, long itemsTotal, String customerPhone) {
        String normalized = promoCodeMapper.normalizeCode(code);
        PromoCode promo = promoCodeRepository.findByCodeForUpdate(normalized)
                .orElseThrow(() -> new BusinessException(NOT_FOUND_MESSAGE));
        String problem = findProblem(promo, itemsTotal, customerPhone, ShopTime.now());
        if (problem != null) {
            throw new BusinessException(problem);
        }
        long discount = calculateDiscount(promo, itemsTotal);
        // Foydalanish sonini oshiramiz (buyurtma saqlanmasa, tranzaksiya bilan birga orqaga qaytadi)
        promo.setUsedCount(promo.getUsedCount() + 1);
        promoCodeRepository.save(promo);
        log.info("Promo kod qo'llandi: code={}, chegirma={}, ishlatilgan={}", normalized, discount, promo.getUsedCount());
        return new PromoApplication(normalized, discount);
    }

    /**
     * {@inheritDoc}
     * Kod bloklab olinadi: ikki bekor qilish bir vaqtda kelsa, son noto'g'ri hisoblanmasligi uchun.
     * Foydalanish soni noldan pastga tushmaydi.
     */
    @Override
    @Transactional
    public void release(String code) {
        promoCodeRepository.findByCodeForUpdate(promoCodeMapper.normalizeCode(code)).ifPresent(promo -> {
            if (promo.getUsedCount() > 0) {
                promo.setUsedCount(promo.getUsedCount() - 1);
                promoCodeRepository.save(promo);
                log.info("Promo kod foydalanishi qaytarildi: code={}, ishlatilgan={}", promo.getCode(), promo.getUsedCount());
            }
        });
    }




    /**
     * Yordamchi metod: id bo'yicha o'chirilmagan kodni topadi yoki 404 xatosini tashlaydi.
     *
     * @param id kodning raqami
     * @return topilgan kod
     */
    private PromoCode findActiveOrThrow(Long id) {
        return promoCodeRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Promo kod", id));
    }

    /**
     * Yordamchi metod: yaratish va tahrirlashdagi umumiy biznes qoidalarini tekshiradi.
     * 1) Foizli chegirma 100 dan oshmasligi kerak.
     * 2) Eng ko'p chegirma summasi faqat foizli kodda bo'ladi.
     * 3) Tugash vaqti boshlanish vaqtidan keyin bo'lishi kerak.
     *
     * @param request admin yuborgan ma'lumot
     */
    private void validateRules(PromoCodeRequest request) {
        if (request.discountType() == DiscountType.PERCENT && request.discountValue() > 100) {
            throw new BusinessException("Foizli chegirma 100 dan oshmasligi kerak");
        }
        if (request.discountType() == DiscountType.FIXED && request.maxDiscountAmount() != null) {
            throw new BusinessException("Eng ko'p chegirma summasi faqat foizli kod uchun kiritiladi");
        }
        if (request.validFrom() != null && request.validTo() != null
                && !request.validTo().isAfter(request.validFrom())) {
            throw new BusinessException("Tugash vaqti boshlanish vaqtidan keyin bo'lishi kerak");
        }
    }

    /**
     * Yordamchi metod: kodni berilgan summada ishlatib bo'lmaydigan sababni topadi.
     * Tekshiruvlar tartibi: yoqilganmi, muddat, limit, minimal summa, "faqat birinchi buyurtma".
     *
     * @param promo      tekshiriladigan kod
     * @param itemsTotal mahsulotlar summasi, so'mda
     * @param phone      mijozning telefoni (null bo'lsa, "birinchi buyurtma" sharti tekshirilmaydi)
     * @param now        hozirgi vaqt
     * @return mijozga ko'rsatiladigan sabab; hamma shart bajarilsa null
     */
    private String findProblem(PromoCode promo, long itemsTotal, String phone, LocalDateTime now) {
        // O'chirib qo'yilgan kod mijozga mavjud emasdek ko'rinadi
        if (!Boolean.TRUE.equals(promo.getIsActive())) {
            return NOT_FOUND_MESSAGE;
        }
        if (promo.getValidFrom() != null && promo.getValidFrom().isAfter(now)) {
            return "Bu promo kod hali amal qilmaydi";
        }
        if (promo.getValidTo() != null && !promo.getValidTo().isAfter(now)) {
            return "Bu promo kodning muddati tugagan";
        }
        if (promo.getMaxUses() != null && promo.getUsedCount() >= promo.getMaxUses()) {
            return "Bu promo kodning foydalanish limiti tugagan";
        }
        if (itemsTotal < promo.getMinOrderAmount()) {
            return "Bu promo kod uchun minimal buyurtma summasi: " + formatMoney(promo.getMinOrderAmount()) + " so'm";
        }
        if (Boolean.TRUE.equals(promo.getFirstOrderOnly()) && phone != null
                && orderRepository.existsByCustomerPhoneAndStatusNot(phone, OrderStatus.CANCELLED)) {
            return "Bu promo kod faqat birinchi buyurtma uchun";
        }
        return null;
    }

    /**
     * Yordamchi metod: chegirma summasini hisoblaydi (butun so'mda).
     * Foizli kod: summaning foizi (0.5 va undan ko'p bo'lsa yuqoriga yaxlitlanadi), eng ko'p chegirma chegarasi bilan.
     * Aniq summali kod: shu summa. Chegirma hech qachon mahsulotlar summasidan oshmaydi (jami manfiy bo'lmasligi uchun).
     *
     * @param promo      qo'llanadigan kod
     * @param itemsTotal mahsulotlar summasi, so'mda
     * @return chegirma summasi, so'mda
     */
    private long calculateDiscount(PromoCode promo, long itemsTotal) {
        long discount;
        if (promo.getDiscountType() == DiscountType.PERCENT) {
            // BigDecimal: pul hisobida double ishlatmaymiz
            discount = BigDecimal.valueOf(itemsTotal)
                    .multiply(BigDecimal.valueOf(promo.getDiscountValue()))
                    .divide(BigDecimal.valueOf(100), 0, RoundingMode.HALF_UP)
                    .longValueExact();
        } else {
            discount = promo.getDiscountValue();
        }
        if (promo.getMaxDiscountAmount() != null) {
            discount = Math.min(discount, promo.getMaxDiscountAmount());
        }
        return Math.min(discount, itemsTotal);
    }

    /**
     * Yordamchi metod: summani o'qishga qulay ko'rinishga keltiradi (masalan, 50000 -> "50 000").
     *
     * @param amount summa, so'mda
     * @return bo'sh joy bilan ajratilgan summa
     */
    private String formatMoney(long amount) {
        return String.format(Locale.US, "%,d", amount).replace(',', ' ');
    }
}
