package uz.akmal.mujiza.admin.service;

import uz.akmal.mujiza.admin.dto.StaffCreateRequest;
import uz.akmal.mujiza.admin.dto.StaffResponse;
import uz.akmal.mujiza.admin.dto.StaffUpdateRequest;

import java.util.List;

/**
 * Xodimlar (admin panel foydalanuvchilari) bilan ishlash qoidalari.
 * Xodim o'chirilmaydi, faqat faolsizlantiriladi (shunda tarixdagi yozuvlar buzilmaydi).
 */
public interface AdminStaffService {

    /**
     * Barcha xodimlar ro'yxati.
     *
     * @return xodimlar
     */
    List<StaffResponse> getAll();

    /**
     * Yangi xodim yaratadi.
     *
     * @param request xodim ma'lumoti va boshlang'ich parol
     * @return yaratilgan xodim
     */
    StaffResponse create(StaffCreateRequest request);

    /**
     * Xodimni tahrirlaydi (ism, rol, faollik, parol).
     *
     * @param id      xodimning raqami
     * @param request yangi ma'lumot (ixtiyoriy maydonlar)
     * @param actor   tahrirlayotgan adminning kirish nomi (o'zini cheklash qoidalari uchun)
     * @return yangilangan xodim
     */
    StaffResponse update(Long id, StaffUpdateRequest request, String actor);
}