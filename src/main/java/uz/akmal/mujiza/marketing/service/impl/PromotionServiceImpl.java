package uz.akmal.mujiza.marketing.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.akmal.mujiza.common.SlugUtil;
import uz.akmal.mujiza.common.ShopTime;
import uz.akmal.mujiza.common.exception.BusinessException;
import uz.akmal.mujiza.common.exception.ResourceNotFoundException;
import uz.akmal.mujiza.config.CacheConfig;
import uz.akmal.mujiza.marketing.dto.PromotionRequest;
import uz.akmal.mujiza.marketing.dto.PromotionResponse;
import uz.akmal.mujiza.marketing.dto.PublicPromotionResponse;
import uz.akmal.mujiza.marketing.entity.Promotion;
import uz.akmal.mujiza.marketing.mapper.PromotionMapper;
import uz.akmal.mujiza.marketing.repository.PromotionRepository;
import uz.akmal.mujiza.marketing.service.PromotionService;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Aksiyalar va yangiliklar bilan ishlash qoidalarining amaldagi ijrosi.
 *
 * @Service: Spring bu klassni "biznes mantiq qatlami" sifatida taniydi.
 * @RequiredArgsConstructor (Lombok): final maydonlar uchun konstruktor yaratadi.
 * @Slf4j (Lombok): log yozish uchun "log" o'zgaruvchisini yaratadi.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PromotionServiceImpl implements PromotionService {

    /**
     * Slug uchun asosning eng uzun qismi (bazada slug 230 belgigacha, qolgani raqam qo'shimchasi uchun zaxira).
     */
    private static final int MAX_SLUG_BASE_LENGTH = 200;

    /**
     * Slug yasab bo'lmaganda ishlatiladigan standart nom (masalan, sarlavha faqat kirill harflarda yozilgan bo'lsa).
     */
    private static final String DEFAULT_SLUG = "aksiya";

    /**
     * Bazadan aksiyalarni o'qish va yozish uchun.
     */
    private final PromotionRepository promotionRepository;

    /**
     * Entity va DTO'ni bir-biriga aylantirish uchun.
     */
    private final PromotionMapper promotionMapper;

    /**
     * {@inheritDoc}
     * readOnly = true: faqat o'qiladi, baza tezroq ishlaydi.
     */
    @Override
    @Transactional(readOnly = true)
    public List<PromotionResponse> getAll() {
        LocalDateTime now = ShopTime.now();
        return promotionRepository.findAllByIsDeletedFalseOrderBySortOrderAscIdDesc()
                .stream()
                .map(promotion -> promotionMapper.toResponse(promotion, now))
                .toList();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional(readOnly = true)
    public PromotionResponse getById(Long id) {
        return promotionMapper.toResponse(findActiveOrThrow(id), ShopTime.now());
    }

    /**
     * {@inheritDoc}
     * @Transactional: ichidagi barcha ishlar bitta tranzaksiya, xato bo'lsa hammasi bekor qilinadi.
     */
    @Override
    @Transactional
    @CacheEvict(cacheNames = CacheConfig.PROMOTIONS, allEntries = true)
    public PromotionResponse create(PromotionRequest request) {
        // Ko'rinish vaqti oralig'i mantiqan to'g'rimi
        validatePeriod(request);
        Promotion promotion = promotionMapper.toEntity(request);
        // Slug'ni aniqlaymiz: admin bergan bo'lsa tekshiramiz, bermagan bo'lsa sarlavhadan yasaymiz
        promotion.setSlug(resolveSlugForCreate(request));
        Promotion saved = promotionRepository.save(promotion);
        log.info("Aksiya yaratildi: id={}, slug={}", saved.getId(), saved.getSlug());
        return promotionMapper.toResponse(saved, ShopTime.now());
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional
    @CacheEvict(cacheNames = CacheConfig.PROMOTIONS, allEntries = true)
    public PromotionResponse update(Long id, PromotionRequest request) {
        validatePeriod(request);
        // Tahrirlanadigan aksiyani topamiz (topilmasa 404)
        Promotion promotion = findActiveOrThrow(id);
        promotionMapper.applyRequest(promotion, request);

        // Slug faqat admin yangisini yuborgan va u eskisidan farq qilgandagina o'zgaradi.
        // Yuborilmasa eski slug qoladi, shunda sayt havolalari buzilmaydi.
        String newSlug = request.slug();
        if (newSlug != null && !newSlug.equals(promotion.getSlug())) {
            if (promotionRepository.existsBySlugAndIsDeletedFalseAndIdNot(newSlug, id)) {
                throw new BusinessException("Bu slug band: " + newSlug, HttpStatus.CONFLICT);
            }
            promotion.setSlug(newSlug);
        }

        Promotion saved = promotionRepository.save(promotion);
        log.info("Aksiya yangilandi: id={}", saved.getId());
        return promotionMapper.toResponse(saved, ShopTime.now());
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional
    @CacheEvict(cacheNames = CacheConfig.PROMOTIONS, allEntries = true)
    public void delete(Long id) {
        Promotion promotion = findActiveOrThrow(id);
        // Bazadan o'chirmaymiz, faqat o'chirilgan deb belgilaymiz (soft delete)
        promotion.setIsDeleted(true);
        promotionRepository.save(promotion);
        log.info("Aksiya o'chirildi (soft delete): id={}", id);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional(readOnly = true)
    @Cacheable(cacheNames = CacheConfig.PROMOTIONS, key = "'all:' + ('ru'.equalsIgnoreCase(#lang) ? 'ru' : 'uz')")
    public List<PublicPromotionResponse> getPublicAll(String lang) {
        return promotionRepository.findVisible(ShopTime.now())
                .stream()
                .map(promotion -> promotionMapper.toPublicResponse(promotion, lang))
                .toList();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional(readOnly = true)
    @Cacheable(cacheNames = CacheConfig.PROMOTIONS, key = "'home:' + ('ru'.equalsIgnoreCase(#lang) ? 'ru' : 'uz')")
    public List<PublicPromotionResponse> getPublicHome(String lang) {
        return promotionRepository.findVisibleOnHome(ShopTime.now())
                .stream()
                .map(promotion -> promotionMapper.toPublicResponse(promotion, lang))
                .toList();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional(readOnly = true)
    @Cacheable(cacheNames = CacheConfig.PROMOTIONS, key = "'slug:' + #slug + ':' + ('ru'.equalsIgnoreCase(#lang) ? 'ru' : 'uz')")
    public PublicPromotionResponse getPublicBySlug(String slug, String lang) {
        // Vaqti tugagan, hali boshlanmagan, o'chirilgan yoki o'chirib qo'yilgan aksiya mijozga ko'rinmaydi
        Promotion promotion = promotionRepository.findVisibleBySlug(slug, ShopTime.now())
                .orElseThrow(() -> new ResourceNotFoundException("Aksiya topilmadi"));
        return promotionMapper.toPublicResponse(promotion, lang);
    }

    /**
     * Yordamchi metod: id bo'yicha o'chirilmagan aksiyani topadi yoki 404 xatosini tashlaydi.
     *
     * @param id aksiyaning raqami
     * @return topilgan aksiya
     */
    private Promotion findActiveOrThrow(Long id) {
        return promotionRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Aksiya", id));
    }

    /**
     * Yordamchi metod: tugash vaqti boshlanish vaqtidan keyin bo'lishini tekshiradi
     * (ikkalasi ham berilgan bo'lsagina).
     *
     * @param request admin yuborgan ma'lumot
     */
    private void validatePeriod(PromotionRequest request) {
        if (request.activeFrom() != null && request.activeTo() != null
                && !request.activeTo().isAfter(request.activeFrom())) {
            throw new BusinessException("Tugash vaqti boshlanish vaqtidan keyin bo'lishi kerak");
        }
    }

    /**
     * Yordamchi metod: yangi aksiya uchun slug'ni aniqlaydi.
     * Admin slug bergan bo'lsa, band emasligini tekshiradi. Bermagan bo'lsa, o'zbekcha sarlavhadan yasaydi.
     *
     * @param request admin yuborgan ma'lumot
     * @return takrorlanmaydigan slug
     */
    private String resolveSlugForCreate(PromotionRequest request) {
        // Admin o'zi slug bergan bo'lsa
        if (request.slug() != null && !request.slug().isBlank()) {
            if (promotionRepository.existsBySlugAndIsDeletedFalse(request.slug())) {
                throw new BusinessException("Bu slug band: " + request.slug(), HttpStatus.CONFLICT);
            }
            return request.slug();
        }
        // Aks holda o'zbekcha sarlavhadan yasaymiz
        String base = SlugUtil.toSlug(request.titleUz());
        // Sarlavha faqat kirill harflarida bo'lsa, slug bo'sh chiqadi, standart nomni olamiz
        if (base.isEmpty()) {
            base = DEFAULT_SLUG;
        }
        // Juda uzun bo'lsa qisqartiramiz va oxiridagi chiziqchani olib tashlaymiz
        if (base.length() > MAX_SLUG_BASE_LENGTH) {
            base = base.substring(0, MAX_SLUG_BASE_LENGTH).replaceAll("-+$", "");
        }
        return makeUnique(base);
    }

    /**
     * Yordamchi metod: slug band bo'lsa oxiriga -2, -3, ... qo'shib, bo'sh slug topadi.
     *
     * @param base asosiy slug
     * @return bo'sh (takrorlanmaydigan) slug
     */
    private String makeUnique(String base) {
        String candidate = base;
        int counter = 2;
        while (promotionRepository.existsBySlugAndIsDeletedFalse(candidate)) {
            candidate = base + "-" + counter;
            counter++;
        }
        return candidate;
    }
}
