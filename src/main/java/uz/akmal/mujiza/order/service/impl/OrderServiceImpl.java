package uz.akmal.mujiza.order.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.akmal.mujiza.audit.service.AuditService;
import uz.akmal.mujiza.cake.dto.CakeOrderCreateRequest;
import uz.akmal.mujiza.cake.dto.CakeOrderDetailsResponse;
import uz.akmal.mujiza.cake.dto.CakeQuote;
import uz.akmal.mujiza.cake.entity.CakeOption;
import uz.akmal.mujiza.cake.entity.CakeRequest;
import uz.akmal.mujiza.cake.entity.CakeRequestOption;
import uz.akmal.mujiza.cake.repository.CakeRequestRepository;
import uz.akmal.mujiza.cake.service.CakeCatalogService;
import uz.akmal.mujiza.catalog.entity.Category;
import uz.akmal.mujiza.catalog.entity.Product;
import uz.akmal.mujiza.catalog.repository.ProductRepository;
import uz.akmal.mujiza.common.PageResponse;
import uz.akmal.mujiza.common.PhoneLockService;
import uz.akmal.mujiza.common.exception.BusinessException;
import uz.akmal.mujiza.common.exception.ResourceNotFoundException;
import uz.akmal.mujiza.marketing.dto.PromoApplication;
import uz.akmal.mujiza.marketing.service.PromoCodeService;
import uz.akmal.mujiza.order.dto.*;
import uz.akmal.mujiza.order.entity.CustomerOrder;
import uz.akmal.mujiza.order.entity.OrderItem;
import uz.akmal.mujiza.order.enums.OrderStatus;
import uz.akmal.mujiza.order.enums.OrderType;
import uz.akmal.mujiza.order.event.OrderCreatedEvent;
import uz.akmal.mujiza.order.event.OrderStatusChangedEvent;
import uz.akmal.mujiza.order.mapper.OrderMapper;
import uz.akmal.mujiza.order.repository.CustomerOrderRepository;
import uz.akmal.mujiza.order.repository.OrderItemRepository;
import uz.akmal.mujiza.order.service.DeliverySlotService;
import uz.akmal.mujiza.order.service.OrderService;
import uz.akmal.mujiza.order.specification.OrderSpecifications;
import uz.akmal.mujiza.shop.entity.Branch;
import uz.akmal.mujiza.shop.entity.ShopSettings;
import uz.akmal.mujiza.shop.repository.BranchRepository;
import uz.akmal.mujiza.shop.repository.ShopSettingsRepository;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.security.SecureRandom;
import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Buyurtmalar bilan ishlash qoidalarining amaldagi ijrosi.
 *
 * @Service: Spring bu klassni "biznes mantiq qatlami" sifatida taniydi.
 * @RequiredArgsConstructor (Lombok): final maydonlar uchun konstruktor yaratadi.
 * @Slf4j (Lombok): log yozish uchun "log" o'zgaruvchisini yaratadi.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    /**
     * Do'kon joylashgan vaqt zonasi (taxminiy tayyor bo'lish vaqtini hisoblash uchun).
     */
    private static final ZoneId SHOP_ZONE = ZoneId.of("Asia/Tashkent");

    /**
     * Tort sanasini Toshkent vaqti bilan solishtirish uchun. Testlar shu soatni almashtiradi.
     */
    Clock clock = Clock.system(SHOP_ZONE);

    /**
     * Bitta mahsulotdan bir buyurtmada eng ko'p buyurtma qilish mumkin bo'lgan miqdor
     * (100 dona yoki 100 kg).
     */
    private static final BigDecimal MAX_QUANTITY_PER_PRODUCT = new BigDecimal("100");

    /**
     * Bitta buyurtma mahsulotlarining ruxsat etilgan maksimal summasi (overflow va xatolardan himoya).
     */
    private static final long MAX_ORDER_TOTAL = 500_000_000L;

    /**
     * Bitta telefon raqamidan bir vaqtda kutilib turishi mumkin bo'lgan eng ko'p "yangi" buyurtma soni (spamdan himoya).
     */
    private static final int MAX_NEW_ORDERS_PER_PHONE = 5;

    /**
     * Buyurtma raqamining boshi, masalan "MJ-1001".
     */
    private static final String ORDER_NUMBER_PREFIX = "MJ-";

    /**
     * Holatlar tarixiga "buyurtmani mijozning o'zi yaratdi" deb yoziladigan nom.
     */
    private static final String CHANGED_BY_CUSTOMER = "customer";

    /**
     * Bir sahifada so'rash mumkin bo'lgan eng ko'p buyurtma soni (server haddan ortiq yuklanmasligi uchun).
     */
    private static final int MAX_PAGE_SIZE = 50;

    /**
     * Bitta telefon raqamidan bir vaqtda narxi tasdiqlanishini kutayotgan tort buyurtmalarining eng ko'p soni.
     */
    private static final int MAX_PENDING_CAKE_ORDERS_PER_PHONE = 3;

    /**
     * Vaqt oynasi tanlanmagan tort buyurtmasida sana bugundan eng ko'pi bilan necha kun keyin bo'lishi mumkin.
     */
    private static final int MAX_CAKE_DAYS_AHEAD = 60;


    /**
     * Mijoz sabab yozmasdan bekor qilganda yoziladigan standart sabab.
     */
    private static final String DEFAULT_CUSTOMER_CANCEL_REASON = "Mijoz o'zi bekor qildi";

    /**
     * Olib ketish kodini yaratish uchun xavfsiz tasodifiy son generatori.
     */
    private final SecureRandom random = new SecureRandom();

    /**
     * Buyurtmalarni bazaga yozish va o'qish uchun.
     */
    private final CustomerOrderRepository orderRepository;

    private final OrderItemRepository orderItemRepository;

    private final PhoneLockService phoneLockService;

    /** S3/CDN manzili. Bo'sh bo'lsa faqat lokal /uploads/cakes/ qabul qilinadi. */
    @Value("${app.storage.s3.public-url:}")
    private String s3PublicUrl = "";

    @Value("${app.storage.s3.endpoint:}")
    private String s3Endpoint = "";

    @Value("${app.storage.s3.bucket:mujiza-media}")
    private String s3Bucket = "mujiza-media";

    /**
     * Mahsulotlarni (haqiqiy narxi va mavjudligini bilish uchun) o'qish uchun.
     */
    private final ProductRepository productRepository;

    /**
     * Filiallarni o'qish uchun (olib ketish filialini tekshirish).
     */
    private final BranchRepository branchRepository;

    /**
     * Muhim o'zgarishlarni tarixga yozish uchun.
     */
    private final AuditService auditService;

    /**
     * Do'kon sozlamalarini o'qish uchun (yetkazib berish narxi, minimal summa va h.k.).
     */
    private final ShopSettingsRepository shopSettingsRepository;

    /**
     * Entity va DTO'ni bir-biriga aylantirish uchun.
     */
    private final OrderMapper orderMapper;


    /**
     * Tort tafsilotlarini o'qish va yozish uchun.
     */
    private final CakeRequestRepository cakeRequestRepository;

    /**
     * Tort tanlovini tekshirish va narxini hisoblash uchun.
     */
    private final CakeCatalogService cakeCatalogService;

    /**
     * Vaqt oynalarini tekshirish va band qilish uchun.
     */
    private final DeliverySlotService slotService;

    /**
     * Promo kodlarni tekshirish, qo'llash va qaytarish uchun.
     */
    private final PromoCodeService promoCodeService;

    /**
     * Hodisalarni e'lon qilish uchun (yangi buyurtma, holat o'zgardi). Obunachilar: kuzatuv sahifasi, Telegram.
     */
    private final ApplicationEventPublisher eventPublisher;

    /**
     * {@inheritDoc}
     * @Transactional: ichidagi barcha ishlar bitta tranzaksiya, xato bo'lsa hammasi bekor qilinadi.
     */
    @Override
    @Transactional
    public PublicOrderResponse create(OrderCreateRequest request, String lang, UUID idempotencyKey) {
        phoneLockService.lock("idempotency:" + idempotencyKey);
        PublicOrderResponse replay = findIdempotentReplay(idempotencyKey, request.customerPhone(), false, lang);
        if (replay != null) {
            return replay;
        }
        phoneLockService.lock("phone:" + request.customerPhone());
        // 1) Do'kon sozlamalarini olamiz va buyurtma qabul qilinyaptimi, shuni tekshiramiz
        ShopSettings settings = shopSettingsRepository.findById(ShopSettings.SINGLE_ID)
                .orElseThrow(() -> new IllegalStateException("Do'kon sozlamalari bazada topilmadi"));
        if (!Boolean.TRUE.equals(settings.getAcceptingOrders())) {
            throw new BusinessException("Hozir onlayn buyurtma qabul qilinmayapti. Iltimos, keyinroq urinib ko'ring");
        }

        // 2) Spamdan himoya: bitta raqamdan juda ko'p kutilayotgan buyurtma bo'lmasin
        if (orderRepository.countByCustomerPhoneAndStatus(request.customerPhone(), OrderStatus.NEW)
                >= MAX_NEW_ORDERS_PER_PHONE) {
            throw new BusinessException(
                    "Bu raqamdan juda ko'p buyurtma kutilmoqda. Iltimos, do'kon bilan bog'laning",
                    HttpStatus.TOO_MANY_REQUESTS);
        }

        // 3) Buyurtmaning asosiy ma'lumotlarini to'ldiramiz
        CustomerOrder order = new CustomerOrder();
        order.setOrderNumber(ORDER_NUMBER_PREFIX + orderRepository.nextOrderNumber());
        // Kuzatuv kaliti: taxmin qilib bo'lmaydigan tasodifiy UUID
        order.setTrackingToken(java.util.UUID.randomUUID().toString());
        order.setIdempotencyKey(idempotencyKey.toString());
        order.setCustomerName(request.customerName().trim());
        order.setCustomerPhone(request.customerPhone());
        order.setOrderType(request.orderType());
        order.setPaymentMethod(request.paymentMethod());
        order.setComment(blankToNull(request.comment()));

        // 4) Olib ketish yoki yetkazib berish tafsilotlarini tekshirib, to'ldiramiz
        applyReceivingDetails(order, request.orderType(), request.branchId(), request.deliveryAddress(),
                request.latitude(), request.longitude(), settings);

        // 3.1) Sovg'a rejimi tekshiruvi va qabul qiluvchi ma'lumoti
        applyGift(order, request);

        // 5) Mahsulotlarni tekshirib, narxni serverda hisoblaymiz; eng uzoq tayyorlanish vaqtini aniqlaymiz
        int maxPrepMinutes = addItemsAndCalculate(order, request);

        // 6) Minimal buyurtma summasi
        long minAmount = settings.getMinOrderAmount();
        if (minAmount > 0 && order.getItemsTotal() < minAmount) {
            throw new BusinessException("Minimal buyurtma summasi: " + formatMoney(minAmount) + " so'm");
        }

        // 6.1) Vaqt oynasi: yetkazishda (faol oyna bo'lsa) majburiy, olib ketishda ixtiyoriy.
        // Oyna bazada bloklanadi va sig'im qayta tekshiriladi.
        SlotReservation reservation = null;
        if (request.slotId() != null || request.scheduledDate() != null) {
            reservation = slotService.reserve(request.slotId(), request.scheduledDate(), maxPrepMinutes);
        } else if (request.orderType() == OrderType.DELIVERY && slotService.hasActiveSlots()) {
            throw new BusinessException("Yetkazib berish uchun sana va vaqt oynasi tanlanishi kerak");
        }
        if (reservation != null) {
            order.setScheduledDate(reservation.date());
            order.setSlotId(reservation.slotId());
            order.setSlotStart(reservation.startTime());
            order.setSlotEnd(reservation.endTime());
        }

        // 7) Promo kod (berilgan bo'lsa): chegirma faqat mahsulotlar summasiga qo'llanadi.
        // Kod bazada bloklanadi va foydalanish soni oshiriladi; buyurtma saqlanmasa, bu ham orqaga qaytadi.
        long discount = 0L;
        String promoCode = blankToNull(request.promoCode());
        if (promoCode != null) {
            PromoApplication promo = promoCodeService.apply(promoCode, order.getItemsTotal(), order.getCustomerPhone());
            order.setPromoCode(promo.code());
            discount = promo.discountAmount();
        }
        order.setDiscountAmount(discount);

        // 8) Yetkazib berish narxi (bepul yetkazish chegarasi chegirmadan OLDINGI summaga qaraydi) va jami summa
        order.setDeliveryFee(calculateDeliveryFee(order, settings));
        long payableItems = Math.max(0L, order.getItemsTotal() - discount);
        order.setTotalAmount(Math.addExact(payableItems, order.getDeliveryFee()));

        // 9) Taxminiy tayyor bo'lish vaqti, boshlang'ich holat va tarixga birinchi yozuv
        order.setEstimatedReadyAt(LocalDateTime.now(SHOP_ZONE).plusMinutes(maxPrepMinutes));
        // Vaqt oynasi tanlangan bo'lsa, tayyor bo'lish vaqti oyna boshlanishi hisoblanadi
        if (reservation != null) {
            order.setEstimatedReadyAt(reservation.startAt());
        }
        order.setStatus(OrderStatus.NEW);
        order.addHistory(OrderStatus.NEW, CHANGED_BY_CUSTOMER, null);

        // 10) Bazaga saqlaymiz
        CustomerOrder saved = orderRepository.save(order);
        log.info("Yangi buyurtma: {}, tur={}, jami={}", saved.getOrderNumber(), saved.getOrderType(),
                saved.getTotalAmount());
        // Yangi buyurtma haqida hodisa e'lon qilamiz (tranzaksiya saqlangandan keyin obunachilarga yetadi)
        eventPublisher.publishEvent(new OrderCreatedEvent(saved.getId(), saved.getOrderNumber(), OrderStatus.NEW));
        return toPublic(saved, lang);
    }


    /**
     * {@inheritDoc}
     * readOnly = true: faqat o'qiladi, baza tezroq ishlaydi.
     */
    @Override
    @Transactional(readOnly = true)
    public PageResponse<OrderListItemResponse> getAll(OrderFilter filter, int page, int size) {
        // Boshlanish sanasi tugash sanasidan keyin bo'lsa, filtr ma'nosiz
        if (filter != null && filter.dateFrom() != null && filter.dateTo() != null
                && filter.dateFrom().isAfter(filter.dateTo())) {
            throw new BusinessException("Boshlanish sanasi tugash sanasidan keyin bo'lishi mumkin emas");
        }
        // Sahifa raqami manfiy bo'lmaydi, hajm 1 dan MAX_PAGE_SIZE gacha; eng yangi buyurtma birinchi
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), MAX_PAGE_SIZE);
        PageRequest pageable = PageRequest.of(safePage, safeSize,
                Sort.by(Sort.Direction.DESC, "createdAt").and(Sort.by(Sort.Direction.DESC, "id")));

        Page<CustomerOrder> result = orderRepository.findAll(OrderSpecifications.from(filter), pageable);
        Map<Long, Integer> itemCounts = itemCounts(result.getContent());
        return PageResponse.of(result.map(order -> orderMapper.toListItem(order, itemCounts.getOrDefault(order.getId(), 0))));
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional(readOnly = true)
    public OrderResponse getById(Long id) {
        CustomerOrder order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Buyurtma", id));
        return toAdmin(order);
    }

    /**
     * {@inheritDoc}
     * Buyurtma bazada bloklab olinadi, shuning uchun ikki kishi bir vaqtda o'zgartirsa, ikkinchisi kutadi
     * va yangilangan holat bo'yicha tekshiriladi.
     */
    @Override
    @Transactional
    public OrderResponse updateStatus(Long id, OrderStatusUpdateRequest request, String changedBy) {
        // Buyurtmani topamiz va bloklaymiz (topilmasa 404)
        CustomerOrder order = orderRepository.findByIdForUpdate(id)
                .orElseThrow(() -> new ResourceNotFoundException("Buyurtma", id));
        OrderStatus current = order.getStatus();
        OrderStatus target = request.status();

        // Faqat ruxsat etilgan o'tishlar mumkin (qoidalar OrderStatus.canMoveTo da)
        if (!current.canMoveTo(target, order.getOrderType())) {
            throw new BusinessException(
                    "Buyurtma holatini «" + current + "» dan «" + target + "» ga o'zgartirib bo'lmaydi",
                    HttpStatus.CONFLICT);
        }

        String note = blankToNull(request.note());
        // Bekor qilishda sabab majburiy va buyurtmada ham saqlanadi
        if (target == OrderStatus.CANCELLED) {
            if (note == null) {
                throw new BusinessException("Bekor qilish sababi kiritilishi kerak");
            }
            order.setCancelReason(note);
            // Promo kod ishlatilgan bo'lsa, foydalanish qaytariladi (mijoz chegirmadan foydalanmadi)
            releasePromoIfAny(order);
        }

        // Tort buyurtmasi narx tasdiqlanishi kutilayotgan holatdan tasdiqlansa, hisoblangan narx yakuniy bo'ladi
        if (current == OrderStatus.PRICE_PENDING && target == OrderStatus.CONFIRMED) {
            cakeRequestRepository.findByOrderId(order.getId())
                    .ifPresent(cake -> applyConfirmedPrice(order, cake, cake.getCalculatedPrice(), null));
        }

        // Holatni o'zgartiramiz va tarixga kim o'zgartirganini yozamiz
        order.setStatus(target);
        order.addHistory(target, changedBy, note);
        // saveAndFlush: yangi tarix yozuvi darrov bazaga yoziladi (vaqti to'ladi), javobda to'g'ri ko'rinadi
        CustomerOrder saved = orderRepository.saveAndFlush(order);
        log.info("Buyurtma holati o'zgardi: {} {} -> {}, o'zgartirgan: {}",
                saved.getOrderNumber(), current, target, changedBy);

        auditService.logAs(changedBy, "ORDER_STATUS", "ORDER", saved.getId(), saved.getOrderNumber() + ": " + current + " -> " + target);
        // Holat o'zgargani haqida hodisa e'lon qilamiz (kuzatuv sahifalari shu orqali yangilanadi)
        eventPublisher.publishEvent(new OrderStatusChangedEvent(
                saved.getId(), saved.getOrderNumber(), saved.getTrackingToken(), current, target, changedBy));
        return toAdmin(saved);
    }



    /**
     * {@inheritDoc}
     * readOnly = true: faqat o'qiladi, baza tezroq ishlaydi.
     */
    @Override
    @Transactional(readOnly = true)
    public PublicOrderResponse track(String trackingToken, String lang) {
        // Kalit noto'g'ri bo'lsa ham xuddi shu xabar qaytadi (qaysi kalit mavjudligi sezdirilmaydi)
        CustomerOrder order = orderRepository.findByTrackingToken(trackingToken)
                .orElseThrow(() -> new ResourceNotFoundException("Buyurtma topilmadi"));
        return toPublic(order, lang);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional(readOnly = true)
    public void verifyTrackingToken(String trackingToken) {
        if (!orderRepository.existsByTrackingToken(trackingToken)) {
            throw new ResourceNotFoundException("Buyurtma topilmadi");
        }
    }

    /**
     * {@inheritDoc}
     * Buyurtma bazada bloklab olinadi, shuning uchun mijoz bekor qilayotganda admin bir vaqtda tasdiqlab
     * yubora olmaydi: kim birinchi bo'lsa, ikkinchisi yangilangan holatni ko'radi.
     */
    @Override
    @Transactional
    public PublicOrderResponse cancelByCustomer(String trackingToken, CustomerCancelRequest request, String lang) {
        // Buyurtmani topamiz va bloklaymiz (topilmasa 404)
        CustomerOrder order = orderRepository.findByTrackingTokenForUpdate(trackingToken)
                .orElseThrow(() -> new ResourceNotFoundException("Buyurtma topilmadi"));
        OrderStatus current = order.getStatus();

        // Allaqachon bekor qilingan buyurtmani qayta bekor qilib bo'lmaydi
        if (current == OrderStatus.CANCELLED) {
            throw new BusinessException("Buyurtma allaqachon bekor qilingan", HttpStatus.CONFLICT);
        }
        // Do'kon qabul qilgan buyurtmani faqat do'konning o'zi bekor qila oladi (masalan, tort tayyorlana boshlagan bo'lishi mumkin)
        if (current != OrderStatus.NEW && current != OrderStatus.PRICE_PENDING) {
            String phone = shopSettingsRepository.findById(ShopSettings.SINGLE_ID)
                    .map(ShopSettings::getPhone)
                    .orElse("");
            throw new BusinessException(
                    "Buyurtma qabul qilingan, uni faqat do'kon bekor qila oladi. Iltimos, do'kon bilan bog'laning: "
                            + phone,
                    HttpStatus.CONFLICT);
        }

        // Sabab yozilmagan bo'lsa, standart sabab olinadi
        String reason = request == null ? null : blankToNull(request.reason());
        if (reason == null) {
            reason = DEFAULT_CUSTOMER_CANCEL_REASON;
        }
        // Bekor qilamiz va tarixga "customer" bo'lib yozamiz
        order.setStatus(OrderStatus.CANCELLED);
        order.setCancelReason(reason);
        releasePromoIfAny(order);
        order.addHistory(OrderStatus.CANCELLED, CHANGED_BY_CUSTOMER, reason);
        CustomerOrder saved = orderRepository.saveAndFlush(order);
        log.info("Buyurtmani mijoz bekor qildi: {}", saved.getOrderNumber());
        // Mijoz bekor qilgani haqida ham hodisa e'lon qilamiz (boshqa ochiq sahifalar yangilanishi uchun)
        eventPublisher.publishEvent(new OrderStatusChangedEvent(
                saved.getId(), saved.getOrderNumber(), saved.getTrackingToken(),
                current, OrderStatus.CANCELLED, CHANGED_BY_CUSTOMER));
        return toPublic(saved, lang);
    }


    /**
     * {@inheritDoc}
     * Buyurtma bazada bloklab olinadi: ikki xodim bir vaqtda tasdiqlashga urinsa, ikkinchisi yangilangan holatni ko'radi.
     */
    @Override
    @Transactional
    public PublicOrderResponse createCakeOrder(CakeOrderCreateRequest request, String lang, UUID idempotencyKey) {
        phoneLockService.lock("idempotency:" + idempotencyKey);
        PublicOrderResponse replay = findIdempotentReplay(idempotencyKey, request.customerPhone(), true, lang);
        if (replay != null) {
            return replay;
        }
        phoneLockService.lock("phone:" + request.customerPhone());
        // 1) Do'kon sozlamalari va buyurtma qabul qilinyaptimi
        ShopSettings settings = shopSettingsRepository.findById(ShopSettings.SINGLE_ID)
                .orElseThrow(() -> new IllegalStateException("Do'kon sozlamalari bazada topilmadi"));
        if (!Boolean.TRUE.equals(settings.getAcceptingOrders())) {
            throw new BusinessException("Hozir onlayn buyurtma qabul qilinmayapti. Iltimos, keyinroq urinib ko'ring");
        }
        // 2) Spamdan himoya: bir raqamdan juda ko'p narxi tasdiqlanmagan tort buyurtmasi bo'lmasin
        if (orderRepository.countByCustomerPhoneAndStatus(request.customerPhone(), OrderStatus.PRICE_PENDING)
                >= MAX_PENDING_CAKE_ORDERS_PER_PHONE) {
            throw new BusinessException("Bu raqamdan narxi tasdiqlanishi kutilayotgan tort buyurtmalari ko'p. "
                    + "Iltimos, do'kon bilan bog'laning", HttpStatus.TOO_MANY_REQUESTS);
        }
        // 3) Tanlovni tekshirib, narxni serverda hisoblaymiz (vazn, variant va guruh qoidalari shu yerda)
        CakeQuote quote = cakeCatalogService.quote(request.cakeTypeId(), request.weightKg(), request.optionIds());

        // 4) Buyurtmaning asosiy ma'lumotlari
        CustomerOrder order = new CustomerOrder();
        order.setOrderNumber(ORDER_NUMBER_PREFIX + orderRepository.nextOrderNumber());
        order.setTrackingToken(java.util.UUID.randomUUID().toString());
        order.setIdempotencyKey(idempotencyKey.toString());
        order.setCustomerName(request.customerName().trim());
        order.setCustomerPhone(request.customerPhone());
        order.setOrderType(request.orderType());
        order.setPaymentMethod(request.paymentMethod());
        order.setComment(blankToNull(request.comment()));
        order.setIsCakeOrder(true);
        applyReceivingDetails(order, request.orderType(), request.branchId(), request.deliveryAddress(),
                request.latitude(), request.longitude(), settings);

        // 5) Vaqt: tort kamida cakeMinAdvanceHours soat oldin buyurtma qilinishi kerak
        int advanceMinutes = settings.getCakeMinAdvanceHours() * 60;
        SlotReservation reservation = null;
        if (request.slotId() != null) {
            // Oyna tanlangan: sana, tayyorlanish muddati (tort uchun) va sig'im tekshiriladi, oyna bloklanadi
            reservation = slotService.reserve(request.slotId(), request.scheduledDate(), advanceMinutes);
        } else {
            if (request.orderType() == OrderType.DELIVERY && slotService.hasActiveSlots()) {
                throw new BusinessException("Yetkazib berish uchun sana va vaqt oynasi tanlanishi kerak");
            }
            validateCakeDateWithoutSlot(request.scheduledDate(), advanceMinutes);
        }
        order.setScheduledDate(request.scheduledDate());
        if (reservation != null) {
            order.setSlotId(reservation.slotId());
            order.setSlotStart(reservation.startTime());
            order.setSlotEnd(reservation.endTime());
            order.setEstimatedReadyAt(reservation.startAt());
        }

        // 6) Summalar: mahsulot qatorlari yo'q, narx tort hisob-kitobidan; minimal summa va yetkazish narxi
        order.setItemsTotal(quote.total());
        if (settings.getMinOrderAmount() > 0 && quote.total() < settings.getMinOrderAmount()) {
            throw new BusinessException("Minimal buyurtma summasi: " + formatMoney(settings.getMinOrderAmount()) + " so'm");
        }
        order.setDiscountAmount(0L);
        order.setDeliveryFee(calculateDeliveryFee(order, settings));
        order.setTotalAmount(Math.addExact(order.getItemsTotal(), order.getDeliveryFee()));

        // 7) Boshlang'ich holat: narx tasdiqlanishi kutilmoqda
        order.setStatus(OrderStatus.PRICE_PENDING);
        order.addHistory(OrderStatus.PRICE_PENDING, CHANGED_BY_CUSTOMER, null);

        // 8) Saqlaymiz: buyurtma va tort tafsilotlari bitta tranzaksiyada
        CustomerOrder saved = orderRepository.save(order);
        cakeRequestRepository.save(buildCakeRequest(saved, quote, request));
        log.info("Yangi tort buyurtmasi: {}, vazn={}, hisoblangan narx={}", saved.getOrderNumber(),
                quote.weightKg(), quote.total());
        eventPublisher.publishEvent(
                new OrderCreatedEvent(saved.getId(), saved.getOrderNumber(), OrderStatus.PRICE_PENDING));
        return toPublic(saved, lang);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional
    public OrderResponse confirmCakePrice(Long id, ConfirmPriceRequest request, String changedBy) {
        // Buyurtmani topamiz va bloklaymiz (topilmasa 404)
        CustomerOrder order = orderRepository.findByIdForUpdate(id)
                .orElseThrow(() -> new ResourceNotFoundException("Buyurtma", id));
        CakeRequest cake = cakeRequestRepository.findByOrderId(id)
                .orElseThrow(() -> new BusinessException("Bu tort buyurtmasi emas, narx tasdiqlanmaydi"));
        // Narx faqat tasdiqlanishi kutilayotgan buyurtmada tasdiqlanadi
        if (order.getStatus() != OrderStatus.PRICE_PENDING) {
            throw new BusinessException("Narx faqat tasdiqlanishi kutilayotgan buyurtmada tasdiqlanadi",
                    HttpStatus.CONFLICT);
        }

        long finalPrice = request.finalPrice() != null ? request.finalPrice() : cake.getCalculatedPrice();
        String note = blankToNull(request.note());
        applyConfirmedPrice(order, cake, finalPrice, note);

        // Holatni o'zgartiramiz va tarixga yozamiz
        OrderStatus previous = order.getStatus();
        order.setStatus(OrderStatus.CONFIRMED);
        order.addHistory(OrderStatus.CONFIRMED, changedBy,
                note != null ? note : "Narx tasdiqlandi: " + formatMoney(finalPrice) + " so'm");
        CustomerOrder saved = orderRepository.saveAndFlush(order);
        log.info("Tort narxi tasdiqlandi: {}, narx={}, tasdiqlagan={}", saved.getOrderNumber(), finalPrice, changedBy);
        auditService.logAs(changedBy, "CAKE_PRICE_CONFIRMED", "ORDER", saved.getId(), saved.getOrderNumber() + ": " + formatMoney(finalPrice) + " so'm");
        eventPublisher.publishEvent(new OrderStatusChangedEvent(saved.getId(), saved.getOrderNumber(),
                saved.getTrackingToken(), previous, OrderStatus.CONFIRMED, changedBy));
        return toAdmin(saved);
    }

    /**
     * Yordamchi metod: tort buyurtmasining narxini yakuniy qiladi: tortga yakuniy narx va izohni yozadi,
     * buyurtma summasini yangilaydi va yetkazish narxini yangi summaga qarab qayta hisoblaydi
     * (bepul yetkazish chegarasi ham shu summaga qaraydi).
     *
     * @param order      tasdiqlanayotgan buyurtma
     * @param cake       buyurtmaning tort tafsilotlari
     * @param finalPrice yakuniy narx, so'mda
     * @param note       narx haqida izoh (null bo'lishi mumkin)
     */
    private void applyConfirmedPrice(CustomerOrder order, CakeRequest cake, long finalPrice, String note) {
        ShopSettings settings = shopSettingsRepository.findById(ShopSettings.SINGLE_ID)
                .orElseThrow(() -> new IllegalStateException("Do'kon sozlamalari bazada topilmadi"));
        cake.setFinalPrice(finalPrice);
        cake.setAdminNote(note);
        cakeRequestRepository.save(cake);
        order.setItemsTotal(finalPrice);
        order.setDeliveryFee(calculateDeliveryFee(order, settings));
        long payableCake = Math.max(0L, finalPrice - order.getDiscountAmount());
        order.setTotalAmount(Math.addExact(payableCake, order.getDeliveryFee()));
    }

    /**
     * Yordamchi metod: vaqt oynasi tanlanmagan tort buyurtmasida sanani tekshiradi: o'tib ketmagan,
     * MAX_CAKE_DAYS_AHEAD kun ichida va shu sananing oxirigacha tort tayyorlashga yetarli vaqt bor.
     *
     * @param date           tort kerak bo'ladigan sana
     * @param advanceMinutes tortga oldindan buyurtma berish kerak bo'lgan minimal vaqt, daqiqalarda
     */
    void validateCakeDateWithoutSlot(LocalDate date, int advanceMinutes) {
        LocalDate today = LocalDate.now(clock);
        if (date.isBefore(today) || date.isAfter(today.plusDays(MAX_CAKE_DAYS_AHEAD))) {
            throw new BusinessException("Sana bugundan boshlab " + MAX_CAKE_DAYS_AHEAD + " kun ichida bo'lishi kerak");
        }
        // Shu sananing eng oxirgi lahzasi ham tayyorlanish muddatidan oldin bo'lsa, o'sha kunga tort tayyor bo'lmaydi
        if (date.atTime(LocalTime.MAX).isBefore(LocalDateTime.now(clock).plusMinutes(advanceMinutes))) {
            throw new BusinessException("Tort uchun kamida " + (advanceMinutes / 60)
                    + " soat oldin buyurtma berish kerak, keyinroqqa sanani tanlang");
        }
    }

    /**
     * Yordamchi metod: tort tafsilotlarini (tanlov, narx, variantlarning nusxasi) yasaydi.
     *
     * @param order   saqlangan buyurtma
     * @param quote   tekshirilgan va hisoblangan tort tanlovi
     * @param request mijoz yuborgan ma'lumot (yozuv va namuna rasm uchun)
     * @return saqlanishga tayyor tort tafsilotlari
     */
    private CakeRequest buildCakeRequest(CustomerOrder order, CakeQuote quote, CakeOrderCreateRequest request) {
        CakeRequest cake = new CakeRequest();
        cake.setOrder(order);
        cake.setCakeTypeId(quote.type().getId());
        cake.setTypeNameUz(quote.type().getNameUz());
        cake.setTypeNameRu(quote.type().getNameRu());
        cake.setWeightKg(quote.weightKg());
        cake.setInscription(blankToNull(request.inscription()));
        cake.setReferenceImageUrl(cakeReferenceUrl(request.referenceImageUrl()));
        cake.setCalculatedPrice(quote.total());
        // Har bir variantning nusxasi (nom, narx va shu tortdagi summa) saqlanadi
        for (int i = 0; i < quote.options().size(); i++) {
            CakeOption option = quote.options().get(i);
            CakeRequestOption copy = new CakeRequestOption();
            copy.setKind(option.getKind());
            copy.setNameUz(option.getNameUz());
            copy.setNameRu(option.getNameRu());
            copy.setPriceType(option.getPriceType());
            copy.setPriceValue(option.getPriceValue());
            copy.setAmount(quote.optionAmounts().get(i));
            cake.addOption(copy);
        }
        return cake;
    }

    /**
     * Yordamchi metod: buyurtmadan mijoz uchun javob yasaydi (tort bo'lsa, tafsilotlari bilan).
     *
     * @param order buyurtma
     * @param lang  til kodi
     * @return mijozga qaytariladigan DTO
     */
    private PublicOrderResponse toPublic(CustomerOrder order, String lang) {
        return orderMapper.toPublicResponse(order, lang, cakeDetails(order, "ru".equalsIgnoreCase(lang)));
    }

    /** Returns the original response for an exact retry, and rejects key reuse by a different caller/flow. */
    private PublicOrderResponse findIdempotentReplay(UUID key, String phone, boolean cakeOrder, String lang) {
        CustomerOrder existing = orderRepository.findByIdempotencyKey(key.toString()).orElse(null);
        if (existing == null) {
            return null;
        }
        if (!existing.getCustomerPhone().equals(phone)
                || !Boolean.valueOf(cakeOrder).equals(existing.getIsCakeOrder())) {
            throw new BusinessException("Bu Idempotency-Key boshqa buyurtmada ishlatilgan", HttpStatus.CONFLICT);
        }
        return toPublic(existing, lang);
    }

    /**
     * Yordamchi metod: buyurtmadan admin uchun javob yasaydi (tort bo'lsa, tafsilotlari bilan, o'zbekcha).
     *
     * @param order buyurtma
     * @return admin panelga qaytariladigan DTO
     */
    private OrderResponse toAdmin(CustomerOrder order) {
        return orderMapper.toResponse(order, cakeDetails(order, false));
    }

    /**
     * Yordamchi metod: tort buyurtmasining tafsilotlarini javob ko'rinishiga aylantiradi.
     * Oddiy buyurtma uchun bazaga murojaat qilmasdan null qaytaradi.
     *
     * @param order buyurtma
     * @param ru    true bo'lsa ruscha nomlar
     * @return tort tafsilotlari yoki null
     */
    private CakeOrderDetailsResponse cakeDetails(CustomerOrder order, boolean ru) {
        if (!Boolean.TRUE.equals(order.getIsCakeOrder())) {
            return null;
        }
        return cakeRequestRepository.findByOrderId(order.getId())
                .map(cake -> new CakeOrderDetailsResponse(
                        ru ? cake.getTypeNameRu() : cake.getTypeNameUz(),
                        cake.getWeightKg(),
                        cake.getOptions().stream()
                                .map(option -> new CakeOrderDetailsResponse.Option(option.getKind(),
                                        ru ? option.getNameRu() : option.getNameUz(), option.getAmount()))
                                .toList(),
                        cake.getInscription(),
                        cake.getReferenceImageUrl(),
                        cake.getCalculatedPrice(),
                        cake.getFinalPrice(),
                        cake.getFinalPrice() != null,
                        cake.getAdminNote()))
                .orElse(null);
    }






    /**
     * Yordamchi metod: buyurtma turiga qarab olib ketish (filial, kod) yoki yetkazib berish (manzil) ma'lumotini
     * tekshiradi va buyurtmaga yozadi. Oddiy va tort buyurtmasi uchun umumiy.
     *
     * @param order           to'ldirilayotgan buyurtma
     * @param orderType       olib ketish yoki yetkazib berish
     * @param branchId        olib ketishda filialning raqami
     * @param deliveryAddress yetkazish manzili
     * @param latitude        yetkazish joyining kengligi (ixtiyoriy)
     * @param longitude       yetkazish joyining uzunligi (ixtiyoriy)
     * @param settings        do'kon sozlamalari
     */
    private void applyReceivingDetails(CustomerOrder order, OrderType orderType, Long branchId,
                                       String deliveryAddress, Double latitude, Double longitude,
                                       ShopSettings settings) {
        if (orderType == OrderType.PICKUP) {
            // Olib ketishda filial majburiy
            if (branchId == null) {
                throw new BusinessException("Olib ketish uchun filial tanlanishi kerak");
            }
            // Filial mavjud, faol va olib ketishga ruxsat berilgan bo'lishi kerak
            Branch branch = branchRepository.findByIdAndIsDeletedFalse(branchId)
                    .filter(found -> Boolean.TRUE.equals(found.getIsActive())
                            && Boolean.TRUE.equals(found.getIsPickupAvailable()))
                    .orElseThrow(() -> new BusinessException("Tanlangan filialdan olib ketib bo'lmaydi"));
            order.setBranch(branch);
            // Do'konda ko'rsatiladigan 4 xonali kod (0000 dan 9999 gacha)
            order.setPickupCode(String.format(Locale.ROOT, "%04d", random.nextInt(10_000)));
            return;
        }

        // Yetkazib berish: xizmat yoqilgan va manzil kiritilgan bo'lishi kerak
        if (!Boolean.TRUE.equals(settings.getDeliveryEnabled())) {
            throw new BusinessException("Hozir yetkazib berish xizmati mavjud emas, olib ketishni tanlang");
        }
        String address = blankToNull(deliveryAddress);
        if (address == null) {
            throw new BusinessException("Yetkazib berish manzili kiritilishi kerak");
        }
        // Kenglik va uzunlik birga berilishi yoki ikkalasi ham bo'sh bo'lishi kerak
        if ((latitude == null) != (longitude == null)) {
            throw new BusinessException("Kenglik va uzunlik birga kiritilishi kerak");
        }
        order.setDeliveryAddress(address);
        order.setLatitude(latitude);
        order.setLongitude(longitude);
    }




    /**
     * Yordamchi metod: savatdagi mahsulotlarni tekshiradi, buyurtmaga qator qilib qo'shadi va mahsulotlar summasini
     * hisoblaydi. Narx hamma vaqt bazadagi haqiqiy narxdan olinadi (mijoz yuborgan narx yo'q).
     * Bir mahsulot ikki marta yuborilgan bo'lsa, miqdorlari qo'shiladi.
     * Miqdor mahsulotning eng kam miqdori va qadamiga mos bo'lishi kerak (masalan, kg uchun 0.5 qadam).
     *
     * @param order   to'ldirilayotgan buyurtma
     * @param request mijoz yuborgan ma'lumot
     * @return buyurtmadagi mahsulotlarning eng uzoq tayyorlanish vaqti, daqiqalarda
     */
    private int addItemsAndCalculate(CustomerOrder order, OrderCreateRequest request) {
        // Bir xil mahsulotlarni birlashtiramiz: mahsulot raqami -> umumiy miqdor
        Map<Long, BigDecimal> quantities = new LinkedHashMap<>();
        for (OrderItemRequest item : request.items()) {
            quantities.merge(item.productId(), item.quantity(), BigDecimal::add);
        }

        // Hamma mahsulotni bazadan bir so'rovda olamiz: raqam -> mahsulot
        Map<Long, Product> products = productRepository.findAllById(quantities.keySet()).stream()
                .collect(Collectors.toMap(Product::getId, Function.identity()));

        long itemsTotal = 0;
        int maxPrepMinutes = 0;
        for (Map.Entry<Long, BigDecimal> entry : quantities.entrySet()) {
            Product product = products.get(entry.getKey());
            BigDecimal quantity = entry.getValue();

            // Mahsulot topilmadi yoki o'chirilgan
            if (product == null || Boolean.TRUE.equals(product.getIsDeleted())) {
                throw new BusinessException("Mahsulot topilmadi (id = " + entry.getKey() + ")");
            }
            // Mahsulot sotuvda yo'q yoki kategoriyasi mijozga ko'rinmaydi
            Category category = product.getCategory();
            boolean categoryVisible = !Boolean.TRUE.equals(category.getIsDeleted())
                    && Boolean.TRUE.equals(category.getIsActive());
            if (!Boolean.TRUE.equals(product.getIsAvailable()) || !categoryVisible) {
                throw new BusinessException("«" + product.getNameUz() + "» hozir mavjud emas");
            }
            // Miqdor chegaradan oshmasligi, eng kamidan kam bo'lmasligi va qadamga mos bo'lishi kerak
            validateQuantity(product, quantity);

            // Haqiqiy amaldagi narx (muddati tugagan chegirma hisobga olinadi): 1 dona yoki 1 kg uchun
            long unitPrice = product.getEffectivePrice();
            long lineTotal = calculateLineTotal(unitPrice, quantity);

            // Buyurtma qatorini yasaymiz: nom, narx va o'lchov turi shu paytdagi nusxa sifatida saqlanadi
            OrderItem line = new OrderItem();
            line.setProduct(product);
            line.setProductId(product.getId());
            line.setProductNameUz(product.getNameUz());
            line.setProductNameRu(product.getNameRu());
            line.setQuantity(quantity);
            line.setUnitType(product.getUnitType());
            line.setUnitPrice(unitPrice);
            line.setLineTotal(lineTotal);
            order.addItem(line);

            try {
                itemsTotal = Math.addExact(itemsTotal, lineTotal);
            } catch (ArithmeticException e) {
                throw new BusinessException("Buyurtma summasi maksimal ruxsat etilgan chegaradan oshib ketdi");
            }
            if (itemsTotal > MAX_ORDER_TOTAL) {
                throw new BusinessException("Buyurtmaning umumiy summasi ruxsat etilgan chegaradan (500,000,000 so'm) oshib ketdi");
            }
            maxPrepMinutes = Math.max(maxPrepMinutes, product.getPrepTimeMinutes());
        }
        order.setItemsTotal(itemsTotal);
        return maxPrepMinutes;
    }

    /**
     * Yordamchi metod: miqdor mahsulot qoidalariga mosligini tekshiradi.
     * 1) Eng ko'pi bilan MAX_QUANTITY_PER_PRODUCT.
     * 2) Mahsulotning eng kam miqdoridan kam emas.
     * 3) Qadamga qoldiqsiz bo'linadi (masalan, qadam 0.5 bo'lsa, 0.7 qabul qilinmaydi).
     *
     * @param product  tekshiriladigan mahsulot
     * @param quantity buyurtma qilingan (birlashtirilgan) miqdor
     */
    private void validateQuantity(Product product, BigDecimal quantity) {
        String unit = product.getUnitType().label(false);
        String name = "«" + product.getNameUz() + "»";
        if (quantity.compareTo(MAX_QUANTITY_PER_PRODUCT) > 0) {
            throw new BusinessException(name + " dan ko'pi bilan " + MAX_QUANTITY_PER_PRODUCT.toPlainString()
                    + " " + unit + " buyurtma qilish mumkin");
        }
        if (quantity.compareTo(product.getMinQuantity()) < 0) {
            throw new BusinessException(name + " dan kamida "
                    + product.getMinQuantity().stripTrailingZeros().toPlainString() + " " + unit
                    + " buyurtma qilish mumkin");
        }
        if (quantity.remainder(product.getQuantityStep()).compareTo(BigDecimal.ZERO) != 0) {
            throw new BusinessException(name + " miqdori "
                    + product.getQuantityStep().stripTrailingZeros().toPlainString() + " " + unit
                    + " qadam bilan kiritilishi kerak");
        }
    }

    /**
     * Yordamchi metod: qator summasini hisoblaydi (narx x miqdor) va butun so'mga yaxlitlaydi
     * (0.5 va undan ko'p bo'lsa yuqoriga). Pul hisobida double ishlatmaymiz, BigDecimal aniq hisoblaydi.
     *
     * @param unitPrice 1 birlik (1 dona yoki 1 kg) narxi, so'mda
     * @param quantity  miqdor
     * @return qator summasi, so'mda
     */
    private long calculateLineTotal(long unitPrice, BigDecimal quantity) {
        return BigDecimal.valueOf(unitPrice)
                .multiply(quantity)
                .setScale(0, RoundingMode.HALF_UP)
                .longValueExact();
    }



    /**
     * Yordamchi metod: yetkazib berish narxini hisoblaydi.
     * Olib ketishda 0. Yetkazishda sozlamadagi narx, lekin mahsulotlar summasi bepul yetkazish chegarasiga
     * yetgan bo'lsa 0.
     *
     * @param order    mahsulotlar summasi hisoblangan buyurtma
     * @param settings do'kon sozlamalari
     * @return yetkazib berish narxi, so'mda
     */
    long calculateDeliveryFee(CustomerOrder order, ShopSettings settings) {
        if (order.getOrderType() != OrderType.DELIVERY) {
            return 0L;
        }
        Long freeFrom = settings.getFreeDeliveryFrom();
        if (freeFrom != null && freeFrom > 0L && order.getItemsTotal() >= freeFrom) {
            return 0L;
        }
        return settings.getDeliveryFee();
    }


    /**
     * Yordamchi metod: buyurtmaga promo kod qo'llangan bo'lsa, uning foydalanish sonini qaytaradi.
     * Buyurtma bekor qilinganda chaqiriladi.
     *
     * @param order bekor qilinayotgan buyurtma
     */
    private void releasePromoIfAny(CustomerOrder order) {
        if (order.getPromoCode() != null) {
            promoCodeService.release(order.getPromoCode());
        }
    }

    /**
     * Yordamchi metod: sovg'a rejimini tekshiradi va qabul qiluvchi ma'lumotini buyurtmaga yozadi.
     * Sovg'a faqat yetkazib berishda mumkin, qabul qiluvchining ismi va telefoni majburiy.
     * Sovg'a bo'lmasa, sovg'a maydonlari (yuborilgan bo'lsa ham) e'tiborsiz qoldiriladi.
     *
     * @param order   to'ldirilayotgan buyurtma
     * @param request mijoz yuborgan ma'lumot
     */
    private void applyGift(CustomerOrder order, OrderCreateRequest request) {
        boolean gift = Boolean.TRUE.equals(request.isGift());
        order.setIsGift(gift);
        if (!gift) {
            order.setIsAnonymousGift(false);
            return;
        }
        if (request.orderType() != OrderType.DELIVERY) {
            throw new BusinessException("Sovg'a rejimi faqat yetkazib berishda mumkin");
        }
        String name = blankToNull(request.recipientName());
        String phone = blankToNull(request.recipientPhone());
        if (name == null || phone == null) {
            throw new BusinessException("Sovg'a uchun qabul qiluvchining ismi va telefoni kiritilishi kerak");
        }
        order.setRecipientName(name);
        order.setRecipientPhone(phone);
        order.setGiftMessage(blankToNull(request.giftMessage()));
        order.setIsAnonymousGift(Boolean.TRUE.equals(request.isAnonymousGift()));
    }

    /**
     * Admin ro'yxati uchun qatorlar soni. Buyurtmaning mahsulotlar to'plami ochilmaydi.
     */
    private Map<Long, Integer> itemCounts(List<CustomerOrder> orders) {
        List<Long> ids = orders.stream().map(CustomerOrder::getId).filter(id -> id != null).toList();
        if (ids.isEmpty()) {
            return Map.of();
        }
        Map<Long, Integer> counts = new HashMap<>();
        for (OrderItemRepository.OrderItemCount row : orderItemRepository.countItemsByOrderIds(ids)) {
            counts.put(row.getOrderId(), row.getItemCount().intValue());
        }
        return counts;
    }

    /**
     * Lokal /uploads/cakes/ yoki sozlangan S3/CDN dagi cakes/ faylini qabul qiladi.
     */
    private String cakeReferenceUrl(String raw) {
        String url = blankToNull(raw);
        if (url == null) {
            return null;
        }
        if (url.matches("^/uploads/cakes/[A-Za-z0-9._-]+$")) {
            return url;
        }
        if (url.matches("^https?://\\S+/cakes/[A-Za-z0-9._-]+$") && storedOnConfiguredCakeHost(url)) {
            return url;
        }
        throw new BusinessException("Namuna rasm faqat bizning serverga yuklangan rasm bo'lishi mumkin");
    }

    private boolean storedOnConfiguredCakeHost(String url) {
        String publicBase = trimTrailingSlash(s3PublicUrl);
        if (!publicBase.isEmpty() && url.startsWith(publicBase + "/cakes/")) {
            return true;
        }
        String endpoint = trimTrailingSlash(s3Endpoint);
        String bucket = s3Bucket == null ? "" : s3Bucket.trim();
        return !endpoint.isEmpty() && !bucket.isEmpty() && url.startsWith(endpoint + "/" + bucket + "/cakes/");
    }

    private static String trimTrailingSlash(String value) {
        if (value == null) {
            return "";
        }
        String trimmed = value.trim();
        while (trimmed.endsWith("/")) {
            trimmed = trimmed.substring(0, trimmed.length() - 1);
        }
        return trimmed;
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
