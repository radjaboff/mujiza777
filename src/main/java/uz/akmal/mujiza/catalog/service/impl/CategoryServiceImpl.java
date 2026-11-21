package uz.akmal.mujiza.catalog.service.impl;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.akmal.mujiza.catalog.dto.CategoryRequest;
import uz.akmal.mujiza.catalog.dto.CategoryResponse;
import uz.akmal.mujiza.catalog.dto.PublicCategoryResponse;
import uz.akmal.mujiza.catalog.entity.Category;
import uz.akmal.mujiza.catalog.mapper.CategoryMapper;
import uz.akmal.mujiza.catalog.repository.CategoryRepository;
import uz.akmal.mujiza.catalog.repository.ProductRepository;
import uz.akmal.mujiza.catalog.service.CategoryService;
import uz.akmal.mujiza.common.SlugUtil;
import uz.akmal.mujiza.common.exception.BusinessException;
import uz.akmal.mujiza.common.exception.ResourceNotFoundException;
import uz.akmal.mujiza.config.CacheConfig;

import java.util.List;

/**
 * Kategoriyalar bilan ishlash qoidalarining amaldagi ijrosi.
 *
 * @Service: Spring bu klassni "biznes mantiq qatlami" sifatida taniydi.
 * @RequiredArgsConstructor (Lombok): final maydonlar uchun konstruktor yaratadi,
 * Spring shu konstruktor orqali kerakli obyektlarni (repository, mapper) o'zi beradi.
 * @Slf4j (Lombok): log yozish uchun "log" o'zgaruvchisini yaratadi.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    /**
     * Slug uchun ruxsat etilgan eng uzun asos (bazada slug 180 belgigacha, qolgani raqam qo'shimchasi uchun zaxira).
     */
    private static final int MAX_SLUG_BASE_LENGTH = 150;

    /**
     * Slug yasab bo'lmaganda ishlatiladigan standart nom (masalan, nom faqat kirill harflarda yozilgan bo'lsa).
     */
    private static final String DEFAULT_SLUG = "kategoriya";

    /**
     * Bazadan kategoriyalarni o'qish va yozish uchun.
     */
    private final CategoryRepository categoryRepository;

    /**
     * Entity va DTO'ni bir-biriga aylantirish uchun.
     */
    private final CategoryMapper categoryMapper;

    /**
     * Kategoriyada mahsulot borligini tekshirish uchun (o'chirishdan oldin).
     */
    private final ProductRepository productRepository;

    /**
     * {@inheritDoc}
     * readOnly = true: faqat o'qiladi, baza tezroq ishlaydi.
     */
    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> getAll() {
        return categoryRepository.findAllByIsDeletedFalseOrderBySortOrderAsc()
                .stream()
                .map(categoryMapper::toResponse)
                .toList();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional(readOnly = true)
    public CategoryResponse getById(Long id) {
        return categoryMapper.toResponse(findActiveOrThrow(id));
    }

    /**
     * {@inheritDoc}
     * @Transactional: ichidagi barcha ishlar bitta tranzaksiya, xato bo'lsa hammasi bekor qilinadi.
     */
    @Override
    @Transactional
    @CacheEvict(cacheNames = {CacheConfig.CATEGORIES, CacheConfig.PRODUCT_DETAIL, CacheConfig.PUBLIC_PRODUCTS}, allEntries = true)
    public CategoryResponse create(CategoryRequest request) {
        // Request'dan yangi Category yasaymiz (slug hali yo'q)
        Category category = categoryMapper.toEntity(request);
        // Slug'ni aniqlaymiz: admin bergan bo'lsa tekshiramiz, bermagan bo'lsa nomdan yasaymiz
        category.setSlug(resolveSlugForCreate(request));
        // Bazaga saqlaymiz
        Category saved = categoryRepository.save(category);
        log.info("Kategoriya yaratildi: id={}, slug={}", saved.getId(), saved.getSlug());
        return categoryMapper.toResponse(saved);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional
    @CacheEvict(cacheNames = {CacheConfig.CATEGORIES, CacheConfig.PRODUCT_DETAIL, CacheConfig.PUBLIC_PRODUCTS}, allEntries = true)
    public CategoryResponse update(Long id, CategoryRequest request) {
        // Tahrirlanadigan kategoriyani topamiz (topilmasa 404)
        Category category = findActiveOrThrow(id);
        // Oddiy maydonlarni (nom, rasm, tartib, faollik) yangilaymiz
        categoryMapper.applyRequest(category, request);

        // Slug faqat admin yangisini yuborgan va u eskisidan farq qilgandagina o'zgaradi.
        // Yuborilmasa eski slug qoladi, shunda sayt havolalari buzilmaydi.
        String newSlug = request.slug();
        if (newSlug != null && !newSlug.equals(category.getSlug())) {
            // Boshqa kategoriyada shu slug bormi?
            if (categoryRepository.existsBySlugAndIsDeletedFalseAndIdNot(newSlug, id)) {
                throw new BusinessException("Bu slug band: " + newSlug, HttpStatus.CONFLICT);
            }
            category.setSlug(newSlug);
        }

        Category saved = categoryRepository.save(category);
        log.info("Kategoriya yangilandi: id={}", saved.getId());
        return categoryMapper.toResponse(saved);
    }

    /**
     * {@inheritDoc}
     * Eslatma: Product yozilgach, ichida mahsulotlari bor kategoriyani o'chirishni cheklaymiz.
     */
    @Override
    @Transactional
    @CacheEvict(cacheNames = {CacheConfig.CATEGORIES, CacheConfig.PRODUCT_DETAIL, CacheConfig.PUBLIC_PRODUCTS}, allEntries = true)
    public void delete(Long id) {
        // O'chiriladigan kategoriyani topamiz (topilmasa 404)
        Category category = findActiveOrThrow(id);
        // Ichida mahsulotlari bor kategoriyani o'chirib bo'lmaydi (avval mahsulotlarni boshqa kategoriyaga ko'chirish yoki o'chirish kerak)
        if (productRepository.existsByCategoryIdAndIsDeletedFalse(id)) {
            throw new BusinessException(
                    "Bu kategoriyada mahsulotlar bor. Avval ularni boshqa kategoriyaga ko'chiring yoki o'chiring",
                    HttpStatus.CONFLICT);
        }
        // Bazadan o'chirmaymiz, faqat o'chirilgan deb belgilaymiz (soft delete)
        category.setIsDeleted(true);
        categoryRepository.save(category);
        log.info("Kategoriya o'chirildi (soft delete): id={}", id);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional(readOnly = true)
    @Cacheable(cacheNames = CacheConfig.CATEGORIES, key = "'ru'.equalsIgnoreCase(#lang) ? 'ru' : 'uz'")
    public List<PublicCategoryResponse> getPublicAll(String lang) {
        return categoryRepository.findAllByIsDeletedFalseAndIsActiveTrueOrderBySortOrderAsc()
                .stream()
                .map(category -> categoryMapper.toPublicResponse(category, lang))
                .toList();
    }

    /**
     * Yordamchi metod: id bo'yicha o'chirilmagan kategoriyani topadi yoki 404 xatosini tashlaydi.
     *
     * @param id kategoriyaning raqami
     * @return topilgan kategoriya
     */
    private Category findActiveOrThrow(Long id) {
        return categoryRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Kategoriya", id));
    }

    /**
     * Yordamchi metod: yangi kategoriya uchun slug'ni aniqlaydi.
     * Admin slug bergan bo'lsa, band emasligini tekshiradi. Bermagan bo'lsa, o'zbekcha nomdan yasaydi.
     *
     * @param request admin yuborgan ma'lumot
     * @return takrorlanmaydigan slug
     */
    private String resolveSlugForCreate(CategoryRequest request) {
        // Admin o'zi slug bergan bo'lsa
        if (request.slug() != null && !request.slug().isBlank()) {
            if (categoryRepository.existsBySlugAndIsDeletedFalse(request.slug())) {
                throw new BusinessException("Bu slug band: " + request.slug(), HttpStatus.CONFLICT);
            }
            return request.slug();
        }
        // Aks holda o'zbekcha nomdan yasaymiz
        String base = SlugUtil.toSlug(request.nameUz());
        // Nom faqat kirill harflarida bo'lsa, slug bo'sh chiqadi, standart nomni olamiz
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
     * Misol: "tortlar" band bo'lsa "tortlar-2", u ham band bo'lsa "tortlar-3".
     *
     * @param base asosiy slug
     * @return bo'sh (takrorlanmaydigan) slug
     */
    private String makeUnique(String base) {
        // Sinab ko'riladigan slug, avval asl holida
        String candidate = base;
        // Keyingi qo'shiladigan raqam
        int counter = 2;
        while (categoryRepository.existsBySlugAndIsDeletedFalse(candidate)) {
            candidate = base + "-" + counter;
            counter++;
        }
        return candidate;
    }
}
