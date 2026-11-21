package uz.akmal.mujiza.admin.service;

import uz.akmal.mujiza.admin.dto.AdminProfileResponse;
import uz.akmal.mujiza.admin.dto.ChangePasswordRequest;
import uz.akmal.mujiza.admin.dto.LoginRequest;
import uz.akmal.mujiza.admin.dto.LoginResult;

/**
 * Admin panelga kirish qoidalari.
 */
public interface AdminAuthService {

    /**
     * Login va parolni tekshiradi, to'g'ri bo'lsa token yasaydi.
     *
     * @param request kirish ma'lumoti
     * @return foydalanuvchi ma'lumoti va yangi token (noto'g'ri bo'lsa 401 xatosi)
     */
    LoginResult login(LoginRequest request);



    /**
     * Tizimga kirgan foydalanuvchining ochiq ma'lumotini qaytaradi.
     *
     * @param username kirish nomi
     * @return foydalanuvchi ma'lumoti (topilmasa yoki o'chirilgan bo'lsa 401 xatosi)
     */
    AdminProfileResponse getProfile(String username);

    /**
     * Foydalanuvchi o'z parolini almashtiradi (joriy parolni tasdiqlab).
     *
     * @param username kirish nomi
     * @param request  joriy va yangi parol
     * @return yangi token (joriy brauzer sessiyada qolishi uchun)
     */
    String changePassword(String username, ChangePasswordRequest request);
}