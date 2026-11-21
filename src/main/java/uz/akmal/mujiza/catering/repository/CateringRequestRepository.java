package uz.akmal.mujiza.catering.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import uz.akmal.mujiza.catering.entity.CateringRequest;
import uz.akmal.mujiza.catering.enums.CateringStatus;

/**
 * CateringRequest jadvali bilan ishlaydigan qatlam.
 */
public interface CateringRequestRepository extends JpaRepository<CateringRequest, Long> {

    /**
     * Berilgan holatdagi so'rovlarni sahifalab oladi.
     *
     * @param status   holat
     * @param pageable sahifa va tartib sozlamasi
     * @return so'rovlar sahifasi
     */
    Page<CateringRequest> findAllByStatus(CateringStatus status, Pageable pageable);

    /**
     * Shu telefon raqamidan berilgan holatdagi so'rovlar sonini sanaydi (spamdan himoya uchun).
     *
     * @param phone  telefon raqami
     * @param status holat
     * @return so'rovlar soni
     */
    long countByPhoneAndStatus(String phone, CateringStatus status);
}