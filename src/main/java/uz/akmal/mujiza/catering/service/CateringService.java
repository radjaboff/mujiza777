package uz.akmal.mujiza.catering.service;

import uz.akmal.mujiza.catering.dto.CateringCreateRequest;
import uz.akmal.mujiza.catering.dto.CateringReceivedResponse;
import uz.akmal.mujiza.catering.dto.CateringResponse;
import uz.akmal.mujiza.catering.dto.CateringUpdateRequest;
import uz.akmal.mujiza.catering.enums.CateringStatus;
import uz.akmal.mujiza.common.PageResponse;

/**
 * Keytering so'rovlari bilan ishlash qoidalari.
 */
public interface CateringService {

    /**
     * Mijozning yangi so'rovini qabul qiladi va do'konga xabar beradi.
     *
     * @param request mijoz yuborgan ma'lumot
     * @return qabul qilingan so'rovning raqami
     */
    CateringReceivedResponse create(CateringCreateRequest request);

    /**
     * Admin uchun: so'rovlar ro'yxati (eng yangisi birinchi), holat bo'yicha filtrlash mumkin.
     *
     * @param status holat (null bo'lsa, hammasi)
     * @param page   sahifa raqami (0 dan)
     * @param size   sahifa hajmi
     * @return sahifalangan so'rovlar
     */
    PageResponse<CateringResponse> getAll(CateringStatus status, int page, int size);

    /**
     * Admin uchun: bitta so'rovni id bo'yicha oladi.
     *
     * @param id so'rovning raqami
     * @return so'rov (topilmasa ResourceNotFoundException)
     */
    CateringResponse getById(Long id);

    /**
     * Admin so'rov holati va izohini o'zgartiradi.
     *
     * @param id      so'rovning raqami
     * @param request yangi holat va izoh
     * @return yangilangan so'rov
     */
    CateringResponse update(Long id, CateringUpdateRequest request);
}