package uz.akmal.mujiza.admin.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import uz.akmal.mujiza.admin.dto.AdminProfileResponse;
import uz.akmal.mujiza.admin.dto.ChangePasswordRequest;
import uz.akmal.mujiza.admin.dto.LoginRequest;
import uz.akmal.mujiza.admin.dto.LoginResult;
import uz.akmal.mujiza.admin.service.AdminAuthService;
import uz.akmal.mujiza.common.RateLimiter;
import uz.akmal.mujiza.security.JwtCookieService;

import java.time.Duration;
import java.util.Locale;

/**
 * Admin panelga kirish va chiqish endpoint'lari.
 */
@RestController
@RequestMapping("/api/admin/auth")
@Tag(name = "Kirish (admin)")
@RequiredArgsConstructor
public class AdminAuthController {

    /**
     * Kirish qoidalari.
     */
    private final AdminAuthService adminAuthService;

    /**
     * Token cookie'sini yasash va o'chirish uchun.
     */
    private final JwtCookieService jwtCookieService;

    /**
     * So'rovlarni cheklash vositasi (parolni terib topishga urinishdan himoya).
     */
    private final RateLimiter rateLimiter;

    /**
     * Tizimga kirish. Muvaffaqiyatli bo'lsa token httpOnly cookie sifatida beriladi,
     * javobda esa faqat foydalanuvchi ma'lumoti keladi (tokenning o'zi javob matnida ko'rinmaydi).
     * Parolni terib topishdan himoya: bir IP dan 15 daqiqada 20 ta, bir IP va login juftligidan 8 ta urinish.
     * Manzil: POST /api/admin/auth/login
     *
     * @param request login va parol
     * @param http    joriy so'rov (IP manzilni bilish uchun)
     * @return foydalanuvchi ma'lumoti + Set-Cookie sarlavhasi (noto'g'ri bo'lsa 401, ko'p urinishda 429)
     */
    @PostMapping("/login")
    @Operation(summary = "Tizimga kirish")
    public ResponseEntity<AdminProfileResponse> login(@Valid @RequestBody LoginRequest request,
                                                      HttpServletRequest http) {
        String ip = http.getRemoteAddr();
        rateLimiter.acquireOrThrow("login-ip:" + ip, 20, Duration.ofMinutes(15));
        rateLimiter.acquireOrThrow("login-user:" + ip + ":" + request.username().trim().toLowerCase(Locale.ROOT),
                8, Duration.ofMinutes(15));
        LoginResult result = adminAuthService.login(request);
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, jwtCookieService.create(result.token()).toString())
                .body(result.profile());
    }

    /**
     * Tizimdan chiqish: brauzerdagi token cookie'sini o'chiradi.
     * Manzil: POST /api/admin/auth/logout
     *
     * @return bo'sh javob (204) + cookie'ni o'chiruvchi sarlavha
     */
    @PostMapping("/logout")
    @Operation(summary = "Tizimdan chiqish")
    public ResponseEntity<Void> logout() {
        return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE, jwtCookieService.clear().toString())
                .build();
    }


    /**
     * Hozir tizimga kirgan foydalanuvchining ma'lumotini qaytaradi.
     * Frontend sahifa ochilganda shu orqali "kirganmanmi" deb tekshiradi (kirmagan bo'lsa 401 qaytadi).
     * Manzil: GET /api/admin/auth/me
     *
     * @param authentication joriy foydalanuvchi (filtr to'ldirib beradi)
     * @return foydalanuvchi ma'lumoti
     */
    @GetMapping("/me")
    @Operation(summary = "Joriy foydalanuvchi ma'lumoti")
    public AdminProfileResponse me(Authentication authentication) {
        return adminAuthService.getProfile(authentication.getName());
    }

    /**
     * Joriy foydalanuvchi o'z parolini almashtiradi. Manzil: POST /api/admin/auth/change-password
     * Muvaffaqiyatli bo'lsa 204 (javob tanasi yo'q) qaytadi.
     *
     * @param request         joriy va yangi parol
     * @param authentication  joriy foydalanuvchi (filtr to'ldirib beradi)
     */
    @PostMapping("/change-password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Parolni almashtirish")
    public ResponseEntity<Void> changePassword(@Valid @RequestBody ChangePasswordRequest request,
                                               Authentication authentication) {
        String token = adminAuthService.changePassword(authentication.getName(), request);
        return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE, jwtCookieService.create(token).toString())
                .build();
    }


}