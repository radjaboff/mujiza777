package uz.akmal.mujiza.security;

import com.nimbusds.jose.jwk.source.ImmutableSecret;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.stereotype.Service;
import uz.akmal.mujiza.admin.entity.AdminUser;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;

/**
 * JWT token yasaydi va tekshiradi.
 * JWT: ichida "kim" va "qachongacha amal qiladi" yozilgan, maxfiy kalit bilan imzolangan matn.
 * Kalitni bilmagan odam tokenni soxtalashtira olmaydi.
 *
 * @Service: Spring bu klassdan o'zi bitta obyekt yaratib, kerakli joyga beradi.
 */
@Service
public class JwtService {

    /**
     * Token kim tomonidan berilgani (tokenning ichida yoziladi).
     */
    private static final String ISSUER = "mujiza777";

    /**
     * Tokenning ichida foydalanuvchi rolini saqlaydigan maydon nomi.
     */
    private static final String ROLE_CLAIM = "role";

    /**
     * Token yasovchi (imzolaydi).
     */
    private final JwtEncoder encoder;

    /**
     * Token tekshiruvchi (imzo to'g'riligini va muddati tugamaganini tekshiradi).
     */
    private final JwtDecoder decoder;

    /**
     * Token amal qilish muddati.
     */
    private final Duration lifetime;

    /**
     * Konstruktor: maxfiy kalitdan imzolash kalitini yasaydi va tekshirish uchun tayyorlaydi.
     *
     * @param secret          maxfiy kalit (app.jwt.secret), kamida 32 belgi
     * @param expirationHours token necha soat amal qilishi (app.jwt.expiration-hours)
     */
    public JwtService(@Value("${app.jwt.secret}") String secret,
                      @Value("${app.jwt.expiration-hours:12}") long expirationHours) {
        byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        // Qisqa kalit xavfsiz emas, shuning uchun loyiha ishga tushmaydi va sababini aytadi
        if (keyBytes.length < 32) {
            throw new IllegalStateException("JWT_SECRET kamida 32 belgidan iborat bo'lishi kerak");
        }
        // Kalit obyekti: HMAC-SHA256 algoritmi uchun
        SecretKey key = new SecretKeySpec(keyBytes, "HmacSHA256");
        this.encoder = new NimbusJwtEncoder(new ImmutableSecret<>(key));
        this.decoder = NimbusJwtDecoder.withSecretKey(key).macAlgorithm(MacAlgorithm.HS256).build();
        this.lifetime = Duration.ofHours(expirationHours);
    }

    /**
     * Foydalanuvchi uchun yangi token yasaydi (login muvaffaqiyatli bo'lganda).
     * Ichida: kirish nomi, roli, berilgan va tugash vaqti.
     *
     * @param user tizimga kirgan foydalanuvchi
     * @return imzolangan token matni
     */
    public String generateToken(AdminUser user) {
        Instant now = Instant.now();
        // Tokenning ichiga yoziladigan ma'lumotlar
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer(ISSUER)
                .subject(user.getUsername())
                .claim(ROLE_CLAIM, user.getRole().name())
                .issuedAt(now)
                .expiresAt(now.plus(lifetime))
                .build();
        // Imzolash algoritmi (sarlavha)
        JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();
        return encoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
    }

    /**
     * Tokenni tekshiradi va ichidagi ma'lumotni qaytaradi.
     * Imzo noto'g'ri, token buzilgan yoki muddati tugagan bo'lsa JwtException xatosi tashlanadi.
     *
     * @param token tekshiriladigan token matni
     * @return tekshirilgan token (ichidan kirish nomi va rolni olish mumkin)
     */
    public Jwt parse(String token) {
        return decoder.decode(token);
    }

    /**
     * Token amal qilish muddatini qaytaradi (cookie muddatini ham shunga tenglash uchun).
     *
     * @return token muddati
     */
    public Duration getLifetime() {
        return lifetime;
    }
}