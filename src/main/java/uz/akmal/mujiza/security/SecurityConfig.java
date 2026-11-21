package uz.akmal.mujiza.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpMethod;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * Spring Security sozlamalari: kim qaysi manzilga kira olishini belgilaydi.
 *
 * @Configuration: bu klassda Spring uchun sozlama (@Bean) metodlari borligini bildiradi.
 * @EnableWebSecurity: Spring Security'ni yoqadi.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    /**
     * Parolni shifrlaydigan va tekshiradigan vosita (BCrypt).
     * BCrypt bir tomonlama shifrlaydi: parolni shifrdan qaytarib bo'lmaydi.
     *
     * @return parol shifrlovchi
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * CORS qoidalari: frontend (boshqa manzildan ochilgan sayt) API'ga so'rov yubora olishi uchun.
     * Faqat sozlamada ko'rsatilgan manzillarga ruxsat beriladi (app.cors.allowed-origins).
     * allowCredentials: cookie (token) ham yuborilishiga ruxsat.
     *
     * @param allowedOrigins ruxsat etilgan manzillar ro'yxati
     * @return CORS sozlamasi
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource(
            @Value("${app.cors.allowed-origins:http://localhost:3000}") List<String> allowedOrigins) {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(allowedOrigins);
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        // Brauzer shu muddat (soniya) oldingi tekshiruv natijasini eslab turadi
        config.setMaxAge(3600L);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    /**
     * Qaysi manzilga kim kira olishini belgilaydigan asosiy qoidalar zanjiri.
     *
     * @param http             sozlanadigan xavfsizlik obyekti
     * @param jwtService       token tekshiruvchi
     * @param userDetailsService foydalanuvchini topuvchi
     * @param cookieService    cookie nomini beruvchi
     * @param exceptionHandler 401 va 403 xatolarini qaytaruvchi
     * @return tayyor qoidalar zanjiri
     * @throws Exception sozlashda xato bo'lsa
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http,
                                           JwtService jwtService,
                                           AdminUserDetailsService userDetailsService,
                                           JwtCookieService cookieService,
                                           RestSecurityExceptionHandler exceptionHandler,
                                           @Value("${springdoc.api-docs.enabled:true}") boolean apiDocsEnabled) throws Exception {
        // Filtrni o'zimiz yaratamiz (Spring bean sifatida emas, aks holda ikki marta ishlab ketadi)
        JwtAuthenticationFilter jwtFilter = new JwtAuthenticationFilter(jwtService, userDetailsService, cookieService);

        http
                // CSRF himoyasini o'chiramiz: sessiya yo'q, token cookie'si esa SameSite=Strict bilan himoyalangan
                .csrf(AbstractHttpConfigurer::disable)
                // CORS qoidalarini yuqoridagi corsConfigurationSource bean'idan olamiz
                .cors(Customizer.withDefaults())
                // Server sessiya saqlamaydi: har so'rovda token tekshiriladi
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                // Kirmagan bo'lsa 401, ruxsati yo'q bo'lsa 403 (bir xil JSON formatida)
                .exceptionHandling(handling -> handling
                        .authenticationEntryPoint(exceptionHandler)
                        .accessDeniedHandler(exceptionHandler))
                .authorizeHttpRequests(auth -> {
                    // Mijoz sayti, yuklangan rasmlar va xato sahifasi hamma uchun ochiq
                    auth.requestMatchers("/api/public/**", "/uploads/**", "/error").permitAll();
                    auth.requestMatchers(HttpMethod.GET, "/actuator/health").permitAll();
                    // Swagger faqat lokalda. Prod profil springdoc ni o'chiradi va bu qator qo'shilmaydi.
                    if (apiDocsEnabled) {
                        auth.requestMatchers("/swagger-ui/**", "/swagger-ui.html", "/v3/api-docs/**").permitAll();
                    }
                    // Kirish va chiqish: tizimga kirishdan oldin ham ishlashi kerak.
                    // Admin-only qoidalar pastdagi umumiy qoidadan OLDIN turishi shart.
                    auth.requestMatchers("/api/admin/auth/login", "/api/admin/auth/logout").permitAll()
                            .requestMatchers("/api/admin/settings/**").hasRole("ADMIN")
                            .requestMatchers("/api/admin/delivery-slots/**").hasRole("ADMIN")
                            .requestMatchers("/api/admin/cake/**").hasRole("ADMIN")
                            .requestMatchers("/api/admin/analytics/**", "/api/admin/staff/**",
                                    "/api/admin/audit-log/**", "/api/admin/orders/export").hasRole("ADMIN")
                            .requestMatchers("/api/admin/promo-codes/**", "/api/admin/branches/**").hasRole("ADMIN")
                            // Qolgan admin endpoint'lar: ADMIN yoki STAFF (mahsulot, buyurtma, keytering)
                            .requestMatchers("/api/admin/**").hasAnyRole("ADMIN", "STAFF")
                            .anyRequest().denyAll();
                })
                // Tokenni tekshiruvchi filtrni login filtridan oldin qo'yamiz
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}