package uz.akmal.mujiza.catalog.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.akmal.mujiza.audit.service.AuditService;
import uz.akmal.mujiza.catalog.dto.ProductFilter;
import uz.akmal.mujiza.catalog.dto.ProductRequest;
import uz.akmal.mujiza.catalog.dto.ProductResponse;
import uz.akmal.mujiza.catalog.dto.PublicProductDetailResponse;
import uz.akmal.mujiza.catalog.dto.PublicProductResponse;
import uz.akmal.mujiza.catalog.entity.Category;
import uz.akmal.mujiza.catalog.entity.Product;
import uz.akmal.mujiza.catalog.enums.UnitType;
import uz.akmal.mujiza.catalog.mapper.ProductMapper;
import uz.akmal.mujiza.catalog.repository.CategoryRepository;
import uz.akmal.mujiza.catalog.repository.ProductRepository;
import uz.akmal.mujiza.catalog.service.ProductService;
import uz.akmal.mujiza.catalog.specification.ProductSpecifications;
import uz.akmal.mujiza.common.PageResponse;
import uz.akmal.mujiza.common.ShopTime;
import uz.akmal.mujiza.common.SlugUtil;
import uz.akmal.mujiza.common.exception.BusinessException;
import uz.akmal.mujiza.common.exception.ResourceNotFoundException;
import uz.akmal.mujiza.config.CacheConfig;
import uz.akmal.mujiza.order.repository.OrderItemRepository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Mahsulotlar bilan ishlash qoidalarining amaldagi ijrosi.
 *
 * @Service: Spring bu klassni "biznes mantiq qatlami" sifatida taniydi.
 * @RequiredArgsConstructor (Lombok): final maydonlar uchun konstruktor yaratadi,
 * Spring shu konstruktor orqali kerakli obyektlarni (repository, mapper) o'zi beradi.
 * @Slf4j (Lombok): log yozish uchun "log" o'zgaruvchisini yaratadi.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    /**
     * Bir sahifada so'rash mumkin bo'lgan eng ko'p mahsulot soni (server haddan ortiq yuklanmasligi uchun).
     */
    private static final int MAX_PAGE_SIZE = 50;

    /**
     * Slug uchun asosning eng uzun qismi (bazada slug 230 belgigacha, qolgani raqam qo'shimchasi uchun zaxira).
     */
    private static final int MAX_SLUG_BASE_LENGTH = 200;


    /**
     * Tavsiyalar soni eng ko'pi bilan nechta bo'lishi mumkin.
     */
    private static final int MAX_RECOMMENDATIONS = 12;

    /**
     * "Birga olinadi" hisobida oxirgi necha kunning buyurtmalari hisobga olinadi.
     */
    private static final int RECOMMENDATION_DAYS = 90;

    /**
     * Slug yasab bo'lmaganda ishlatiladigan standart nom (masalan, nom faqat kirill harflarda yozilgan bo'lsa).
     */
    private static final String DEFAULT_SLUG = "mahsulot";

    /**
     * Bazadan mahsulotlarni o'qish va yozish uchun.
     */
    private final ProductRepository productRepository;

    /**
     * Bazadan kategoriyalarni topish uchun (mahsulot kategoriyasini tekshirishda).
     */
    private final CategoryRepository categoryRepository;

    /**
     * Entity va DTO'ni bir-biriga aylantirish uchun.
     */
    private final ProductMapper productMapper;


    /**
     * "Birga olinadi" hisobi uchun buyurtma qatorlarini o'qish.
     */
    private final OrderItemRepository orderItemRepository;

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
    public PageResponse<ProductResponse> getAll(ProductFilter filter, int page, int size, String sort) {
        // Admin uchun shartlar bilan bazadan bir sahifa mahsulot olamiz
        Page<Product> result = productRepository.findAll(
                ProductSpecifications.forAdmin(filter), buildPageable(page, size, sort));
        // Har bir mahsulotni admin javobiga aylantirib qaytaramiz
        return PageResponse.of(result.map(productMapper::toResponse));
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional(readOnly = true)
    public ProductResponse getById(Long id) {
        return productMapper.toResponse(findActiveOrThrow(id));
    }

    /**
     * {@inheritDoc}
     * @Transactional: ichidagi barcha ishlar bitta tranzaksiya, xato bo'lsa hammasi bekor qilinadi.
     */
    @Override
    @Transactional
    @CacheEvict(cacheNames = {CacheConfig.PRODUCT_DETAIL, CacheConfig.PUBLIC_PRODUCTS}, allEntries = true)
    public ProductResponse create(ProductRequest request) {
        // Narx qoidalarini tekshiramiz (eski narx, chegirma vaqti)
        validatePricing(request);
        // Kategoriyani topamiz (topilmasa 404)
        Category category = findCategoryOrThrow(request.categoryId());
        // Bo'sh mahsulot yasab, ma'lumotlarni ko'chiramiz
        Product product = new Product();
        productMapper.applyRequest(product, request, category);
        // Miqdor qoidalari (eng kam miqdor va qadam) o'zaro mos ekanini tekshiramiz
        validateQuantityRules(product);
        // Slug'ni aniqlaymiz: admin bergan bo'lsa tekshiramiz, bermagan bo'lsa nomdan yasaymiz
        product.setSlug(resolveSlugForCreate(request));
        // Bazaga saqlaymiz
        Product saved = productRepository.save(product);
        log.info("Mahsulot yaratildi: id={}, slug={}", saved.getId(), saved.getSlug());
        auditService.log("PRODUCT_CREATED", "PRODUCT", saved.getId(), saved.getNameUz() + ", narx " + saved.getPrice());
        return productMapper.toResponse(saved);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional
    @CacheEvict(cacheNames = {CacheConfig.PRODUCT_DETAIL, CacheConfig.PUBLIC_PRODUCTS}, allEntries = true)
    public ProductResponse update(Long id, ProductRequest request) {
        // Narx qoidalarini tekshiramiz
        validatePricing(request);
        // Tahrirlanadigan mahsulotni va kategoriyani topamiz (topilmasa 404)
        Product product = findActiveOrThrow(id);
        Category category = findCategoryOrThrow(request.categoryId());
        // Ma'lumotlarni yangilaymiz
        productMapper.applyRequest(product, request, category);
        // Miqdor qoidalari (eng kam miqdor va qadam) o'zaro mos ekanini tekshiramiz
        validateQuantityRules(product);
        // Slug faqat admin yangisini yuborgan va u eskisidan farq qilgandagina o'zgaradi.
        // Yuborilmasa eski slug qoladi, shunda sayt havolalari buzilmaydi.
        String newSlug = request.slug();
        if (newSlug != null && !newSlug.equals(product.getSlug())) {
            // Boshqa mahsulotda shu slug bormi?
            if (productRepository.existsBySlugAndIsDeletedFalseAndIdNot(newSlug, id)) {
                throw new BusinessException("Bu slug band: " + newSlug, HttpStatus.CONFLICT);
            }
            product.setSlug(newSlug);
        }

        Product saved = productRepository.save(product);
        log.info("Mahsulot yangilandi: id={}", saved.getId());
        auditService.log("PRODUCT_UPDATED", "PRODUCT", saved.getId(), saved.getNameUz() + ", narx " + saved.getPrice());
        return productMapper.toResponse(saved);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional
    @CacheEvict(cacheNames = {CacheConfig.PRODUCT_DETAIL, CacheConfig.PUBLIC_PRODUCTS}, allEntries = true)
    public void delete(Long id) {
        // O'chiriladigan mahsulotni topamiz (topilmasa 404)
        Product product = findActiveOrThrow(id);
        // Bazadan o'chirmaymiz, faqat o'chirilgan deb belgilaymiz (soft delete)
        product.setIsDeleted(true);
        productRepository.save(product);
        log.info("Mahsulot o'chirildi (soft delete): id={}", id);
        auditService.log("PRODUCT_DELETED", "PRODUCT", id, product.getNameUz());
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @CacheEvict(cacheNames = {CacheConfig.PRODUCT_DETAIL, CacheConfig.PUBLIC_PRODUCTS}, allEntries = true)
    @Transactional
    public ProductResponse updateAvailability(Long id, boolean available) {
        Product product = findActiveOrThrow(id);
        product.setIsAvailable(available);
        Product saved = productRepository.save(product);
        log.info("Mahsulot mavjudligi o'zgardi: id={}, isAvailable={}", id, available);
        auditService.log("PRODUCT_AVAILABILITY", "PRODUCT", id, "mavjud = " + available);
        return productMapper.toResponse(saved);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional(readOnly = true)
    @Cacheable(cacheNames = CacheConfig.PUBLIC_PRODUCTS,
            key = "#filter + ':' + #page + ':' + #size + ':' + #sort + ':' + ('ru'.equalsIgnoreCase(#lang) ? 'ru' : 'uz')")
    public PageResponse<PublicProductResponse> getPublicAll(ProductFilter filter, int page, int size,
                                                            String sort, String lang) {
        // Mijoz uchun shartlar bilan (faqat ko'rinadigan mahsulotlar) bir sahifa olamiz
        Page<Product> result = productRepository.findAll(
                ProductSpecifications.forPublic(filter), buildPageable(page, size, sort));
        // Har bir mahsulotni so'ralgan tildagi kartochkaga aylantiramiz
        return PageResponse.of(result.map(product -> productMapper.toPublicResponse(product, lang)));
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional(readOnly = true)
    public PublicProductDetailResponse getPublicBySlug(String slug, String lang) {
        // Mahsulotni slug bo'yicha topamiz (o'chirilgan bo'lsa topilmaydi)
        Product product = productRepository.findBySlugAndIsDeletedFalse(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Mahsulot topilmadi"));
        // Kategoriyasi o'chirilgan yoki yashirilgan bo'lsa, mahsulot ham mijozga ko'rinmaydi
        Category category = product.getCategory();
        if (Boolean.TRUE.equals(category.getIsDeleted()) || !Boolean.TRUE.equals(category.getIsActive())) {
            throw new ResourceNotFoundException("Mahsulot topilmadi");
        }
        return productMapper.toPublicDetailResponse(product, lang);
    }


    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional(readOnly = true)
    public List<PublicProductResponse> getPublicRecommendations(String slug, String lang, int limit) {
        // Asosiy mahsulotni topamiz (topilmasa 404)
        Product source = productRepository.findBySlugAndIsDeletedFalse(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Mahsulot topilmadi"));
        int safeLimit = Math.min(Math.max(limit, 1), MAX_RECOMMENDATIONS);
        List<Product> result = new ArrayList<>();
        // Allaqachon qo'shilganlar (va asosiy mahsulotning o'zi) takrorlanmasligi uchun
        Set<Long> used = new HashSet<>();
        used.add(source.getId());

        // 1) Shu mahsulot bilan birga olinganlar (eng ko'p uchraganidan boshlab)
        List<Long> togetherIds = orderItemRepository.findFrequentlyBoughtTogether(
                source.getId(), ShopTime.now().minusDays(RECOMMENDATION_DAYS), safeLimit * 3);
        if (!togetherIds.isEmpty()) {
            // Faqat mijozga ko'rinadigan mahsulotlar qoladi (o'chirilgan, yashirin kategoriyadagilar tushib qoladi)
            Map<Long, Product> visible = productRepository
                    .findAll(ProductSpecifications.forPublic(null)
                            .and((root, query, cb) -> root.get("id").in(togetherIds)))
                    .stream()
                    .collect(Collectors.toMap(Product::getId, Function.identity()));
            for (Long id : togetherIds) {
                Product candidate = visible.get(id);
                if (candidate != null && Boolean.TRUE.equals(candidate.getIsAvailable())
                        && result.size() < safeLimit) {
                    result.add(candidate);
                    used.add(id);
                }
            }
        }
        // 2) Yetmasa, shu kategoriyadagi mashhur mahsulotlar bilan to'ldiramiz
        if (result.size() < safeLimit) {
            fillWithPopular(result, used, safeLimit,
                    new ProductFilter(source.getCategory().getId(), null, null, null, null, null, null,
                            true, null, null, true));
        }
        // 3) Hali ham yetmasa, umumiy mashhur mahsulotlar bilan
        if (result.size() < safeLimit) {
            fillWithPopular(result, used, safeLimit,
                    new ProductFilter(null, null, null, null, null, null, null, true, null, null, true));
        }
        return result.stream().map(product -> productMapper.toPublicResponse(product, lang)).toList();
    }

    /**
     * Yordamchi metod: ro'yxatni berilgan filtr bo'yicha topilgan mashhur mahsulotlar bilan limitgacha to'ldiradi
     * (allaqachon qo'shilgan va sotuvda yo'q mahsulotlar o'tkazib yuboriladi).
     *
     * @param result ro'yxat (shunga qo'shiladi)
     * @param used   allaqachon qo'shilgan mahsulotlar raqamlari
     * @param limit  ro'yxatning eng katta hajmi
     * @param filter qidiruv filtri
     */
    private void fillWithPopular(List<Product> result, Set<Long> used, int limit, ProductFilter filter) {
        Page<Product> page = productRepository.findAll(
                ProductSpecifications.forPublic(filter), buildPageable(0, limit * 3, null));
        for (Product candidate : page.getContent()) {
            if (result.size() >= limit) {
                return;
            }
            if (!used.contains(candidate.getId()) && Boolean.TRUE.equals(candidate.getIsAvailable())) {
                result.add(candidate);
                used.add(candidate.getId());
            }
        }
    }

    /**
     * Yordamchi metod: id bo'yicha o'chirilmagan mahsulotni topadi yoki 404 xatosini tashlaydi.
     *
     * @param id mahsulotning raqami
     * @return topilgan mahsulot
     */
    private Product findActiveOrThrow(Long id) {
        return productRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Mahsulot", id));
    }

    /**
     * Yordamchi metod: id bo'yicha o'chirilmagan kategoriyani topadi yoki 404 xatosini tashlaydi.
     *
     * @param categoryId kategoriyaning raqami
     * @return topilgan kategoriya
     */
    private Category findCategoryOrThrow(Long categoryId) {
        return categoryRepository.findByIdAndIsDeletedFalse(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Kategoriya", categoryId));
    }

    /**
     * Yordamchi metod: narx bilan bog'liq biznes qoidalarini tekshiradi.
     * 1) Eski (chegirmadan oldingi) narx hozirgi narxdan katta bo'lishi kerak.
     * 2) Chegirma tugash vaqti berilgan bo'lsa, eski narx ham berilishi kerak.
     *
     * @param request admin yuborgan ma'lumot
     */
    private void validatePricing(ProductRequest request) {
        // Eski narx hozirgi narxdan katta bo'lmasa, chegirmaning ma'nosi yo'q
        if (request.oldPrice() != null && request.oldPrice() <= request.price()) {
            throw new BusinessException("Eski narx hozirgi narxdan katta bo'lishi kerak");
        }
        // Eski narxsiz chegirma tugash vaqtini berib bo'lmaydi
        if (request.discountEndsAt() != null && request.oldPrice() == null) {
            throw new BusinessException("Chegirma tugash vaqti uchun eski narx ham kiritilishi kerak");
        }
    }

    /**
     * Yordamchi metod: mahsulotning miqdor qoidalari mantiqan to'g'ri ekanini tekshiradi.
     * 1) Eng kam miqdor qadamga karrali bo'lishi kerak (masalan, eng kam 1 va qadam 0.5 to'g'ri, eng kam 0.3 va qadam 0.5 noto'g'ri).
     * 2) Donalik mahsulotda miqdor va qadam butun son bo'lishi kerak (yarim dona sotib bo'lmaydi).
     *
     * @param product tekshiriladigan mahsulot (mapper to'ldirib bo'lgan)
     */
    private void validateQuantityRules(Product product) {
        BigDecimal min = product.getMinQuantity();
        BigDecimal step = product.getQuantityStep();
        // Eng kam miqdor qadamga qoldiqsiz bo'linishi kerak
        if (min.remainder(step).compareTo(BigDecimal.ZERO) != 0) {
            throw new BusinessException("Eng kam miqdor qadamga karrali bo'lishi kerak (masalan, eng kam 1, qadam 0.5)");
        }
        // Donalik mahsulotda kasr bo'lmasligi kerak (scale > 0 degani kasr qismi bor)
        if (product.getUnitType() == UnitType.PIECE
                && (min.stripTrailingZeros().scale() > 0 || step.stripTrailingZeros().scale() > 0)) {
            throw new BusinessException("Donalik mahsulotda eng kam miqdor va qadam butun son bo'lishi kerak");
        }
    }

    /**
     * Yordamchi metod: ro'yxat so'rovi uchun sahifa va tartib sozlamasini yasaydi.
     * Noto'g'ri qiymatlar to'g'rilanadi: sahifa raqami manfiy bo'lmaydi, hajm 1 dan MAX_PAGE_SIZE gacha.
     *
     * @param page sahifa raqami
     * @param size sahifa hajmi
     * @param sort saralash turi
     * @return tayyor Pageable
     */
    private Pageable buildPageable(int page, int size, String sort) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), MAX_PAGE_SIZE);
        return PageRequest.of(safePage, safeSize, resolveSort(sort));
    }

    /**
     * Yordamchi metod: saralash nomini haqiqiy tartibga aylantiradi.
     * Faqat ruxsat etilgan variantlar ishlaydi, shunda mijoz bazadagi ixtiyoriy ustun bo'yicha tartiblay olmaydi.
     * Teng qiymatlarda tartib o'zgarib ketmasligi uchun oxirida id bo'yicha ham saralanadi.
     *
     * @param sort saralash turi ("price_asc", "price_desc", "newest"; boshqasi standart)
     * @return Sort obyekti
     */
    private Sort resolveSort(String sort) {
        String key = sort == null ? "" : sort;
        return switch (key) {
            case "price_asc" -> Sort.by(Sort.Direction.ASC, "price").and(Sort.by(Sort.Direction.ASC, "id"));
            case "price_desc" -> Sort.by(Sort.Direction.DESC, "price").and(Sort.by(Sort.Direction.ASC, "id"));
            case "newest" -> Sort.by(Sort.Direction.DESC, "createdAt").and(Sort.by(Sort.Direction.DESC, "id"));
            // Standart: admin belgilagan tartib, keyin id
            default -> Sort.by(Sort.Direction.ASC, "sortOrder").and(Sort.by(Sort.Direction.ASC, "id"));
        };
    }

    /**
     * Yordamchi metod: yangi mahsulot uchun slug'ni aniqlaydi.
     * Admin slug bergan bo'lsa, band emasligini tekshiradi. Bermagan bo'lsa, o'zbekcha nomdan yasaydi.
     *
     * @param request admin yuborgan ma'lumot
     * @return takrorlanmaydigan slug
     */
    private String resolveSlugForCreate(ProductRequest request) {
        // Admin o'zi slug bergan bo'lsa
        if (request.slug() != null && !request.slug().isBlank()) {
            if (productRepository.existsBySlugAndIsDeletedFalse(request.slug())) {
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
     * Misol: "napoleon" band bo'lsa "napoleon-2", u ham band bo'lsa "napoleon-3".
     *
     * @param base asosiy slug
     * @return bo'sh (takrorlanmaydigan) slug
     */
    private String makeUnique(String base) {
        // Sinab ko'riladigan slug, avval asl holida
        String candidate = base;
        // Keyingi qo'shiladigan raqam
        int counter = 2;
        while (productRepository.existsBySlugAndIsDeletedFalse(candidate)) {
            candidate = base + "-" + counter;
            counter++;
        }
        return candidate;
    }
}
