package uz.akmal.mujiza.report.controller;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import uz.akmal.mujiza.report.service.VisitTracker;

import java.util.Map;

/**
 * Sayt tashriflari va mijoz hodisalarini (sahifa ko'rish, savatga solish) qabul qiluvchi ochiq API.
 */
@RestController
@RequestMapping("/api/public/analytics")
@RequiredArgsConstructor
public class PublicAnalyticsController {

    private final VisitTracker visitTracker;

    @PostMapping("/track")
    public ResponseEntity<Void> track(@RequestBody(required = false) Map<String, String> payload,
                                      HttpServletRequest request) {
        String type = payload != null ? payload.getOrDefault("type", "PAGE_VIEW") : "PAGE_VIEW";
        if ("CART_ADD".equalsIgnoreCase(type)) {
            visitTracker.recordCartAdd();
        } else {
            String clientIp = extractClientIp(request);
            visitTracker.recordPageView(clientIp);
        }
        return ResponseEntity.ok().build();
    }

    private String extractClientIp(HttpServletRequest request) {
        String xf = request.getHeader("X-Forwarded-For");
        if (xf != null && !xf.isBlank()) {
            return xf.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
