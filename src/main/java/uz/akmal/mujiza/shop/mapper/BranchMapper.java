package uz.akmal.mujiza.shop.mapper;

import org.springframework.stereotype.Component;
import uz.akmal.mujiza.shop.dto.BranchRequest;
import uz.akmal.mujiza.shop.dto.BranchResponse;
import uz.akmal.mujiza.shop.dto.PublicBranchResponse;
import uz.akmal.mujiza.shop.entity.Branch;

/**
 * Branch entity bilan DTO'larni bir-biriga aylantiradi.
 */
@Component
public class BranchMapper {

    /**
     * Admin yuborgan ma'lumotdan YANGI Branch obyektini yasaydi.
     *
     * @param request admin yuborgan ma'lumot
     * @return yangi (hali bazaga saqlanmagan) Branch
     */
    public Branch toEntity(BranchRequest request) {
        // Bo'sh Branch yaratamiz (standart qiymatlar: pickup = true, active = true, sortOrder = 0)
        Branch branch = new Branch();
        applyRequest(branch, request);
        return branch;
    }

    /**
     * Admin yuborgan ma'lumotni MAVJUD Branch'ga ko'chiradi (tahrirlash uchun).
     * Ixtiyoriy mantiqiy maydonlar (isPickupAvailable, isActive, sortOrder) yuborilmasa (null), eski qiymat qoladi.
     *
     * @param branch  tahrirlanayotgan filial
     * @param request admin yuborgan yangi ma'lumot
     */
    public void applyRequest(Branch branch, BranchRequest request) {
        branch.setNameUz(request.nameUz());
        branch.setNameRu(request.nameRu());
        branch.setAddressUz(request.addressUz());
        branch.setAddressRu(request.addressRu());
        branch.setPhone(request.phone());
        branch.setWorkHours(request.workHours());
        branch.setLatitude(request.latitude());
        branch.setLongitude(request.longitude());
        branch.setImageUrl(request.imageUrl());
        if (request.isPickupAvailable() != null) {
            branch.setIsPickupAvailable(request.isPickupAvailable());
        }
        if (request.isActive() != null) {
            branch.setIsActive(request.isActive());
        }
        if (request.sortOrder() != null) {
            branch.setSortOrder(request.sortOrder());
        }
    }

    /**
     * Branch'dan admin panel uchun to'liq javob yasaydi.
     *
     * @param branch bazadan olingan filial
     * @return admin panelga qaytariladigan DTO
     */
    public BranchResponse toResponse(Branch branch) {
        return new BranchResponse(
                branch.getId(),
                branch.getNameUz(),
                branch.getNameRu(),
                branch.getAddressUz(),
                branch.getAddressRu(),
                branch.getPhone(),
                branch.getWorkHours(),
                branch.getLatitude(),
                branch.getLongitude(),
                branch.getImageUrl(),
                branch.getIsPickupAvailable(),
                branch.getIsActive(),
                branch.getSortOrder(),
                branch.getCreatedAt(),
                branch.getUpdatedAt()
        );
    }

    /**
     * Branch'dan mijoz sayti uchun javob yasaydi (nom va manzil bitta tilda).
     *
     * @param branch bazadan olingan filial
     * @param lang   til kodi: "ru" bo'lsa ruscha, boshqa hamma holatda o'zbekcha
     * @return mijoz saytiga qaytariladigan DTO
     */
    public PublicBranchResponse toPublicResponse(Branch branch, String lang) {
        // Til "ru" bo'lsa ruscha matnlarni olamiz, aks holda standart til sifatida o'zbekchani
        boolean ru = "ru".equalsIgnoreCase(lang);
        return new PublicBranchResponse(
                branch.getId(),
                ru ? branch.getNameRu() : branch.getNameUz(),
                ru ? branch.getAddressRu() : branch.getAddressUz(),
                branch.getPhone(),
                branch.getWorkHours(),
                branch.getLatitude(),
                branch.getLongitude(),
                branch.getImageUrl(),
                branch.getIsPickupAvailable()
        );
    }
}