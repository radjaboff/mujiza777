package uz.akmal.mujiza.audit.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.akmal.mujiza.audit.dto.AuditLogResponse;
import uz.akmal.mujiza.audit.entity.AuditLog;
import uz.akmal.mujiza.audit.repository.AuditLogRepository;
import uz.akmal.mujiza.common.PageResponse;

import java.util.Locale;

/**
 * O'zgarishlar tarixini yozadi va qidiradi. Yozuv chaqirgan metodning tranzaksiyasi ichida saqlanadi:
 * asosiy amal bekor bo'lsa, tarix yozuvi ham qolmaydi.
 */
@Service
@RequiredArgsConstructor
public class AuditService {

    /**
     * Tafsilot matnining eng uzun hajmi (bazadagi ustun 500 belgi).
     */
    private static final int MAX_DETAILS = 500;

    /**
     * Kim bajargani 50 belgidan uzun bo'lmasligi kerak (bazadagi ustun).
     */
    private static final int MAX_ACTOR = 50;

    /**
     * Bir sahifada so'rash mumkin bo'lgan eng ko'p yozuv soni.
     */
    private static final int MAX_PAGE_SIZE = 100;

    /**
     * Tarix yozuvlarini o'qish va yozish uchun.
     */
    private final AuditLogRepository repository;

    /**
     * Tarixga yozuv qo'shadi; kim bajargani hozirgi tizimga kirgan foydalanuvchidan olinadi.
     *
     * @param action     amal kodi (masalan, PRODUCT_UPDATED)
     * @param entityType nima o'zgargani (masalan, PRODUCT)
     * @param entityId   o'zgargan yozuvning raqami (bo'lmasa null)
     * @param details    qisqa tafsilot (maxfiy ma'lumotsiz)
     */
    @Transactional
    public void log(String action, String entityType, Long entityId, String details) {
        logAs(currentActor(), action, entityType, entityId, details);
    }

    /**
     * Tarixga yozuv qo'shadi; kim bajargani aniq beriladi (masalan, Telegram orqali bajarilgan amal uchun).
     *
     * @param actor      kim bajargan
     * @param action     amal kodi
     * @param entityType nima o'zgargani
     * @param entityId   o'zgargan yozuvning raqami (bo'lmasa null)
     * @param details    qisqa tafsilot (maxfiy ma'lumotsiz)
     */
    @Transactional
    public void logAs(String actor, String action, String entityType, Long entityId, String details) {
        AuditLog entry = new AuditLog();
        entry.setActor(cut(actor, MAX_ACTOR));
        entry.setAction(action);
        entry.setEntityType(entityType);
        entry.setEntityId(entityId);
        entry.setDetails(details == null ? null : cut(details, MAX_DETAILS));
        repository.save(entry);
    }

    /**
     * Tarixni qidiradi (eng yangisi birinchi), turi va bajaruvchi bo'yicha filtrlash mumkin.
     *
     * @param entityType nima o'zgargani bo'yicha filtr (ixtiyoriy)
     * @param actor      kim bajargani bo'yicha filtr (ixtiyoriy)
     * @param page       sahifa raqami (0 dan)
     * @param size       sahifa hajmi (ko'pi bilan 100)
     * @return sahifalangan yozuvlar
     */
    @Transactional(readOnly = true)
    public PageResponse<AuditLogResponse> search(String entityType, String actor, int page, int size) {
        // Boshlang'ich shart: hamma yozuv; kerak bo'lsa filtrlar qo'shiladi
        Specification<AuditLog> spec = (root, query, cb) -> cb.conjunction();
        if (entityType != null && !entityType.isBlank()) {
            String type = entityType.trim().toUpperCase(Locale.ROOT);
            spec = spec.and((root, query, cb) -> cb.equal(root.get("entityType"), type));
        }
        if (actor != null && !actor.isBlank()) {
            String who = actor.trim();
            spec = spec.and((root, query, cb) -> cb.equal(root.get("actor"), who));
        }
        PageRequest pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), MAX_PAGE_SIZE),
                Sort.by(Sort.Direction.DESC, "createdAt").and(Sort.by(Sort.Direction.DESC, "id")));
        Page<AuditLog> result = repository.findAll(spec, pageable);
        return PageResponse.of(result.map(entry -> new AuditLogResponse(entry.getId(), entry.getActor(),
                entry.getAction(), entry.getEntityType(), entry.getEntityId(), entry.getDetails(),
                entry.getCreatedAt())));
    }

    /**
     * Yordamchi metod: hozirgi foydalanuvchining kirish nomini qaytaradi (tizimga kirmagan bo'lsa "system").
     *
     * @return kirish nomi
     */
    private String currentActor() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth instanceof AnonymousAuthenticationToken || !auth.isAuthenticated()) {
            return "system";
        }
        return auth.getName();
    }

    /**
     * Yordamchi metod: matnni berilgan uzunlikkacha qisqartiradi.
     *
     * @param text      asl matn
     * @param maxLength eng uzun hajm
     * @return qisqartirilgan matn
     */
    private String cut(String text, int maxLength) {
        return text.length() <= maxLength ? text : text.substring(0, maxLength);
    }
}