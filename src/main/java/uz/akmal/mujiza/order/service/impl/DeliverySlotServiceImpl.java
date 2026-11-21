package uz.akmal.mujiza.order.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.akmal.mujiza.common.exception.BusinessException;
import uz.akmal.mujiza.common.exception.ResourceNotFoundException;
import uz.akmal.mujiza.order.dto.DeliverySlotRequest;
import uz.akmal.mujiza.order.dto.DeliverySlotResponse;
import uz.akmal.mujiza.order.dto.PublicDeliverySlotResponse;
import uz.akmal.mujiza.order.dto.SlotReservation;
import uz.akmal.mujiza.order.entity.DeliverySlot;
import uz.akmal.mujiza.order.enums.OrderStatus;
import uz.akmal.mujiza.order.repository.CustomerOrderRepository;
import uz.akmal.mujiza.order.repository.DeliverySlotRepository;
import uz.akmal.mujiza.order.service.DeliverySlotService;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Vaqt oynalari bilan ishlash qoidalarining amaldagi ijrosi.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DeliverySlotServiceImpl implements DeliverySlotService {

    private static final ZoneId SHOP_ZONE = ZoneId.of("Asia/Tashkent");

    /**
     * Mijoz bugundan boshlab eng ko'pi bilan necha kun oldinga buyurtma bera oladi.
     */
    private static final int MAX_DAYS_AHEAD = 14;

    /**
     * Oynalarni o'qish va yozish uchun.
     */
    private final DeliverySlotRepository slotRepository;

    /**
     * Oyna qancha band ekanini sanash uchun.
     */
    private final CustomerOrderRepository orderRepository;

    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional(readOnly = true)
    public List<DeliverySlotResponse> getAll() {
        return slotRepository.findAllByIsDeletedFalseOrderByStartTimeAsc().stream().map(this::toResponse).toList();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional
    public DeliverySlotResponse create(DeliverySlotRequest request) {
        validateTimes(request);
        DeliverySlot slot = new DeliverySlot();
        apply(slot, request);
        DeliverySlot saved = slotRepository.save(slot);
        log.info("Vaqt oynasi yaratildi: id={}, {}-{}", saved.getId(), saved.getStartTime(), saved.getEndTime());
        return toResponse(saved);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional
    public DeliverySlotResponse update(Long id, DeliverySlotRequest request) {
        validateTimes(request);
        DeliverySlot slot = findActiveOrThrow(id);
        apply(slot, request);
        DeliverySlot saved = slotRepository.save(slot);
        log.info("Vaqt oynasi yangilandi: id={}", saved.getId());
        return toResponse(saved);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional
    public void delete(Long id) {
        DeliverySlot slot = findActiveOrThrow(id);
        slot.setIsDeleted(true);
        slotRepository.save(slot);
        log.info("Vaqt oynasi o'chirildi (soft delete): id={}", id);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional(readOnly = true)
    public List<PublicDeliverySlotResponse> getPublicSlots(LocalDate date, int prepMinutes) {
        validateDate(date);
        // Shu vaqtdan oldin boshlanadigan oynalarga mahsulotlar tayyor bo'lmaydi
        LocalDateTime earliest = LocalDateTime.now(SHOP_ZONE).plusMinutes(Math.max(prepMinutes, 0));
        List<DeliverySlot> slots = slotRepository.findAllByIsDeletedFalseAndIsActiveTrueOrderByStartTimeAsc();
        if (slots.isEmpty()) {
            return List.of();
        }
        Map<Long, Long> takenBySlot = orderRepository.countSlotUsage(
                        slots.stream().map(DeliverySlot::getId).toList(), date, OrderStatus.CANCELLED)
                .stream()
                .collect(Collectors.toMap(CustomerOrderRepository.SlotUsage::getSlotId,
                        CustomerOrderRepository.SlotUsage::getTaken));
        return slots.stream()
                .map(slot -> {
                    long taken = takenBySlot.getOrDefault(slot.getId(), 0L);
                    int remaining = (int) Math.max(slot.getCapacity() - taken, 0);
                    String reason = null;
                    if (date.atTime(slot.getStartTime()).isBefore(earliest)) {
                        reason = "TOO_SOON";
                    } else if (remaining == 0) {
                        reason = "FULL";
                    }
                    return new PublicDeliverySlotResponse(slot.getId(), slot.getStartTime(), slot.getEndTime(),
                            reason == null, remaining, reason);
                })
                .toList();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional(readOnly = true)
    public boolean hasActiveSlots() {
        return slotRepository.existsByIsDeletedFalseAndIsActiveTrue();
    }

    /**
     * {@inheritDoc}
     * Oyna bazada bloklanadi, shuning uchun bir vaqtda kelgan buyurtmalar navbat bilan tekshiriladi va
     * sig'im hech qachon oshib ketmaydi.
     */
    @Override
    @Transactional
    public SlotReservation reserve(Long slotId, LocalDate date, int prepMinutes) {
        if (slotId == null || date == null) {
            throw new BusinessException("Vaqt oynasi va sana birga tanlanishi kerak");
        }
        validateDate(date);
        DeliverySlot slot = slotRepository.findByIdForUpdate(slotId)
                .filter(found -> Boolean.TRUE.equals(found.getIsActive()))
                .orElseThrow(() -> new BusinessException("Tanlangan vaqt oynasi mavjud emas"));

        // Mahsulotlar oyna boshlanguncha tayyor bo'lishi kerak
        LocalDateTime startAt = date.atTime(slot.getStartTime());
        if (startAt.isBefore(LocalDateTime.now(SHOP_ZONE).plusMinutes(Math.max(prepMinutes, 0)))) {
            throw new BusinessException(
                    "Bu vaqt oynasiga mahsulotlar tayyor bo'lmaydi, keyinroqni tanlang", HttpStatus.CONFLICT);
        }
        long taken = orderRepository.countBySlotIdAndScheduledDateAndStatusNot(slotId, date, OrderStatus.CANCELLED);
        if (taken >= slot.getCapacity()) {
            throw new BusinessException("Bu vaqt oynasi band, boshqasini tanlang", HttpStatus.CONFLICT);
        }
        return new SlotReservation(slot.getId(), date, slot.getStartTime(), slot.getEndTime(), startAt);
    }

    /**
     * Yordamchi metod: id bo'yicha o'chirilmagan oynani topadi yoki 404 xatosini tashlaydi.
     *
     * @param id oynaning raqami
     * @return topilgan oyna
     */
    private DeliverySlot findActiveOrThrow(Long id) {
        return slotRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vaqt oynasi", id));
    }

    /**
     * Yordamchi metod: tugash vaqti boshlanishdan keyin bo'lishini tekshiradi.
     *
     * @param request admin yuborgan ma'lumot
     */
    private void validateTimes(DeliverySlotRequest request) {
        if (!request.endTime().isAfter(request.startTime())) {
            throw new BusinessException("Tugash vaqti boshlanish vaqtidan keyin bo'lishi kerak");
        }
    }

    /**
     * Yordamchi metod: sana bugundan boshlab MAX_DAYS_AHEAD kun ichida bo'lishini tekshiradi.
     *
     * @param date tekshiriladigan sana
     */
    private void validateDate(LocalDate date) {
        LocalDate today = LocalDate.now(SHOP_ZONE);
        if (date.isBefore(today) || date.isAfter(today.plusDays(MAX_DAYS_AHEAD))) {
            throw new BusinessException("Sana bugundan boshlab " + MAX_DAYS_AHEAD + " kun ichida bo'lishi kerak");
        }
    }

    /**
     * Yordamchi metod: admin yuborgan ma'lumotni oynaga ko'chiradi (isActive yuborilmasa, eski qiymat qoladi).
     *
     * @param slot    to'ldiriladigan oyna
     * @param request admin yuborgan ma'lumot
     */
    private void apply(DeliverySlot slot, DeliverySlotRequest request) {
        slot.setStartTime(request.startTime());
        slot.setEndTime(request.endTime());
        slot.setCapacity(request.capacity());
        if (request.isActive() != null) {
            slot.setIsActive(request.isActive());
        }
    }

    /**
     * Yordamchi metod: oynadan admin uchun javob yasaydi.
     *
     * @param slot oyna
     * @return javob DTO'si
     */
    private DeliverySlotResponse toResponse(DeliverySlot slot) {
        return new DeliverySlotResponse(slot.getId(), slot.getStartTime(), slot.getEndTime(), slot.getCapacity(),
                slot.getIsActive(), slot.getCreatedAt(), slot.getUpdatedAt());
    }
}
