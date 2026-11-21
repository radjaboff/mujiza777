package uz.akmal.mujiza.admin.dto;

/**
 * Muvaffaqiyatli kirishning ichki natijasi: foydalanuvchi ma'lumoti va yangi token.
 * Mijozga to'g'ridan-to'g'ri qaytarilmaydi: controller tokenni cookie'ga joylaydi,
 * mijozga esa faqat profil ma'lumotini beradi.
 *
 * @param profile foydalanuvchining ochiq ma'lumoti
 * @param token   yangi JWT token
 */
public record LoginResult(
        AdminProfileResponse profile,
        String token
) {
}