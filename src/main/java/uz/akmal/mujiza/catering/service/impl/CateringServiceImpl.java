package uz.akmal.mujiza.catering.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.akmal.mujiza.catering.dto.CateringCreateRequest;
import uz.akmal.mujiza.catering.dto.CateringReceivedResponse;
import uz.akmal.mujiza.catering.dto.CateringResponse;
import uz.akmal.mujiza.catering.dto.CateringUpdateRequest;
import uz.akmal.mujiza.catering.entity.CateringRequest;
import uz.akmal.mujiza.catering.enums.CateringStatus;
import uz.akmal.mujiza.catering.event.CateringCreatedEvent;
import uz.akmal.mujiza.catering.repository.CateringRequestRepository;
import uz.akmal.mujiza.catering.service.CateringService;
import uz.akmal.mujiza.common.PageResponse;
import uz.akmal.mujiza.common.PhoneLockService;
import uz.akmal.mujiza.common.ShopTime;
import uz.akmal.mujiza.common.exception.BusinessException;
import uz.akmal.mujiza.common.exception.ResourceNotFoundException;

import java.time.LocalDate;

/**
 * Keytering so'rovlari bilan ishlash qoidalarining amaldagi ijrosi.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CateringServiceImpl implements CateringService {

    /**
     * Tadbir sanasi bugundan eng ko'pi bilan necha kun keyin bo'lishi mumkin (2 yil).
     */
    private static final int MAX_DAYS_AHEAD = 730;

    /**
     * Bitta telefon raqamidan bir vaqtda kutilib turishi mumkin bo'lgan eng ko'p "yangi" so'rov soni.
     */
    private static final int MAX_NEW_PER_PHONE = 3;

    /**
     * Bir sahifada so'rash mumkin bo'lgan eng ko'p so'rov soni.
     */
    private static final int MAX_PAGE_SIZE = 50;

    /**
     * Bazadan so'rovlarni o'qish va yozish uchun.
     */
    private final CateringRequestRepository repository;

    private final PhoneLockService phoneLockService;

    /**
     * Hodisalarni e'lon qilish uchun (Telegram bildirishnomasi).
     */
    private final ApplicationEventPublisher eventPublisher;

    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional
    public CateringReceivedResponse create(CateringCreateRequest request) {
        // Tadbir sanasi o'tib ketgan yoki juda uzoq bo'lmasligi kerak
        LocalDate today = ShopTime.today();
        if (request.eventDate().isBefore(today) || request.eventDate().isAfter(today.plusDays(MAX_DAYS_AHEAD))) {
            throw new BusinessException("Tadbir sanasi bugundan boshlab 2 yil ichida bo'lishi kerak");
        }
        // Spamdan himoya: bir raqamdan juda ko'p ko'rilmagan so'rov bo'lmasin
        phoneLockService.lock("phone:" + request.phone());
        if (repository.countByPhoneAndStatus(request.phone(), CateringStatus.NEW) >= MAX_NEW_PER_PHONE) {
            throw new BusinessException(
                    "Bu raqamdan ko'p so'rov kutilmoqda. Iltimos, do'kon bilan bog'laning",
                    HttpStatus.TOO_MANY_REQUESTS);
        }

        CateringRequest entity = new CateringRequest();
        entity.setName(request.name().trim());
        entity.setPhone(request.phone());
        entity.setEventType(request.eventType().trim());
        entity.setEventDate(request.eventDate());
        entity.setGuestCount(request.guestCount());
        entity.setBudget(request.budget());
        entity.setComment(blankToNull(request.comment()));
        entity.setStatus(CateringStatus.NEW);
        CateringRequest saved = repository.save(entity);

        log.info("Yangi keytering so'rovi: id={}, sana={}, mehmon={}", saved.getId(), saved.getEventDate(),
                saved.getGuestCount());
        // Telegram'ga xabar (so'rov saqlangandan keyin ishlaydi)
        eventPublisher.publishEvent(new CateringCreatedEvent(saved.getId(), saved.getName(), saved.getPhone(),
                saved.getEventType(), saved.getEventDate(), saved.getGuestCount(), saved.getBudget(),
                saved.getComment()));
        return new CateringReceivedResponse(saved.getId());
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional(readOnly = true)
    public PageResponse<CateringResponse> getAll(CateringStatus status, int page, int size) {
        int safeSize = Math.min(Math.max(size, 1), MAX_PAGE_SIZE);
        PageRequest pageable = PageRequest.of(Math.max(page, 0), safeSize,
                Sort.by(Sort.Direction.DESC, "createdAt").and(Sort.by(Sort.Direction.DESC, "id")));
        Page<CateringRequest> result = status == null
                ? repository.findAll(pageable)
                : repository.findAllByStatus(status, pageable);
        return PageResponse.of(result.map(this::toResponse));
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional(readOnly = true)
    public CateringResponse getById(Long id) {
        return toResponse(findOrThrow(id));
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional
    public CateringResponse update(Long id, CateringUpdateRequest request) {
        CateringRequest entity = findOrThrow(id);
        if (request.status() != null) {
            entity.setStatus(request.status());
        }
        if (request.adminNote() != null) {
            entity.setAdminNote(blankToNull(request.adminNote()));
        }
        CateringRequest saved = repository.save(entity);
        log.info("Keytering so'rovi yangilandi: id={}, holat={}", id, saved.getStatus());
        return toResponse(saved);
    }

    /**
     * Yordamchi metod: id bo'yicha so'rovni topadi yoki 404 xatosini tashlaydi.
     *
     * @param id so'rovning raqami
     * @return topilgan so'rov
     */
    private CateringRequest findOrThrow(Long id) {
        return repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Keytering so'rovi", id));
    }

    /**
     * Yordamchi metod: so'rovdan admin uchun javob yasaydi.
     *
     * @param entity bazadan olingan so'rov
     * @return javob DTO'si
     */
    private CateringResponse toResponse(CateringRequest entity) {
        return new CateringResponse(entity.getId(), entity.getName(), entity.getPhone(), entity.getEventType(),
                entity.getEventDate(), entity.getGuestCount(), entity.getBudget(), entity.getComment(),
                entity.getStatus(), entity.getAdminNote(), entity.getCreatedAt(), entity.getUpdatedAt());
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
