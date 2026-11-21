package uz.akmal.mujiza.cake.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import uz.akmal.mujiza.cake.entity.CakeRequest;

import java.util.List;
import java.util.Optional;

/**
 * CakeRequest jadvali bilan ishlaydigan qatlam.
 */
public interface CakeRequestRepository extends JpaRepository<CakeRequest, Long> {

    /**
     * Buyurtmaning tort tafsilotlarini topadi (oddiy buyurtma bo'lsa, bo'sh qaytadi).
     *
     * @param orderId buyurtmaning raqami
     * @return tort tafsilotlari yoki bo'sh Optional
     */
    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"options"})
    Optional<CakeRequest> findByOrderId(Long orderId);

    /**
     * Buyurtmaga biriktirilgan namuna rasmlarining manzillari.
     *
     * @return bo'sh bo'lmagan manzillar
     */
    @Query("select c.referenceImageUrl from CakeRequest c where c.referenceImageUrl is not null")
    List<String> findReferencedImageUrls();
}