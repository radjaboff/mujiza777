package uz.akmal.mujiza.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.WebUtils;

import java.io.IOException;

/**
 * Har bir so'rovda cookie yoki Authorization sarlavhasidagi tokenni tekshiradigan filtr.
 * Token to'g'ri bo'lsa va foydalanuvchi hali faol bo'lsa, so'rovni "kirgan foydalanuvchi" deb belgilaydi.
 * Token yo'q yoki yaroqsiz bo'lsa, hech narsa qilmaydi: so'rov "kirmagan" bo'lib qoladi
 * va himoyalangan manzil bo'lsa SecurityConfig uni 401 bilan qaytaradi.
 *
 * OncePerRequestFilter: bitta so'rovda faqat bir marta ishlashini kafolatlaydi.
 */
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final AdminUserDetailsService userDetailsService;
    private final JwtCookieService cookieService;

    public JwtAuthenticationFilter(JwtService jwtService,
                                   AdminUserDetailsService userDetailsService,
                                   JwtCookieService cookieService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
        this.cookieService = cookieService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        String token = null;

        // 1. Avval Authorization: Bearer <token> sarlavhasini tekshiramiz (mobil ilovalar va API mijozlari uchun)
        String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7).trim();
        }

        // 2. Agar sarlavhada bo'lmasa, HttpOnly Cookie'dan olamiz (veb brauzerlar uchun)
        if (token == null || token.isBlank()) {
            Cookie cookie = WebUtils.getCookie(request, cookieService.getCookieName());
            if (cookie != null) {
                token = cookie.getValue();
            }
        }

        if (token != null && !token.isBlank() && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                // Imzo va muddatni tekshiramiz, ichidan kirish nomini olamiz
                Jwt jwt = jwtService.parse(token);
                // Foydalanuvchini bazadan olamiz: faolligi va hozirgi roli har doim yangi bo'ladi
                UserDetails user = userDetailsService.loadUserByUsername(jwt.getSubject());
                boolean stale = user instanceof AdminUserDetailsService.AdminPrincipal principal
                        && principal.rejectsIssuedAt(jwt.getIssuedAt());
                if (user.isEnabled() && !stale) {
                    UsernamePasswordAuthenticationToken authentication =
                            UsernamePasswordAuthenticationToken.authenticated(user, null, user.getAuthorities());
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    // Foydalanuvchini shu so'rov uchun "kirgan" deb belgilaymiz
                    SecurityContext context = SecurityContextHolder.createEmptyContext();
                    context.setAuthentication(authentication);
                    SecurityContextHolder.setContext(context);
                }
            } catch (JwtException | UsernameNotFoundException e) {
                // Token yaroqsiz, muddati tugagan yoki foydalanuvchi o'chirilgan: so'rov "kirmagan" bo'lib qoladi
                log.debug("Token qabul qilinmadi: {}", e.getMessage());
            }
        }
        // So'rovni keyingi filtrlarga o'tkazamiz
        chain.doFilter(request, response);
    }
}
