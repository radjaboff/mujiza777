package uz.akmal.mujiza.order.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import uz.akmal.mujiza.common.PageResponse;
import uz.akmal.mujiza.common.ShopTime;
import uz.akmal.mujiza.order.dto.*;
import uz.akmal.mujiza.order.service.OrderService;
import uz.akmal.mujiza.report.service.OrderExcelExporter;

import java.time.LocalDate;

/**
 * Admin panel uchun buyurtmalarni boshqarish endpoint'lari.
 * Faqat tizimga kirgan ADMIN yoki STAFF roli bilan ishlaydi (SecurityConfig'da belgilangan).
 */
@RestController
@RequestMapping("/api/admin/orders")
@Tag(name = "Buyurtmalar (admin)")
@RequiredArgsConstructor
public class AdminOrderController {

    /**
     * Buyurtmalar bo'yicha biznes mantiq.
     */
    private final OrderService orderService;

    /**
     * Buyurtmalarni Excel faylga aylantiruvchi.
     */
    private final OrderExcelExporter orderExcelExporter;

    /**
     * Buyurtmalar ro'yxati (filtr va sahifalash bilan), eng yangisi birinchi.
     * Manzil misoli: GET /api/admin/orders?status=NEW&dateFrom=2026-10-25&search=1001&page=0&size=20
     * @ParameterObject: filtr maydonlari URL parametrlaridan yig'iladi va Swagger'da alohida maydon bo'lib ko'rinadi.
     *
     * @param filter filtr shartlari (hammasi ixtiyoriy)
     * @param page   sahifa raqami, 0 dan boshlanadi (standart 0)
     * @param size   bir sahifadagi buyurtmalar soni (standart 20, ko'pi bilan 50)
     * @return sahifalangan buyurtmalar
     */
    @GetMapping
    @Operation(summary = "Buyurtmalar ro'yxati (filtr va sahifalash bilan)")
    public PageResponse<OrderListItemResponse> getAll(@ParameterObject OrderFilter filter,
                                                      @RequestParam(defaultValue = "0") int page,
                                                      @RequestParam(defaultValue = "20") int size) {
        return orderService.getAll(filter, page, size);
    }

    /**
     * Bitta buyurtmaning to'liq ma'lumoti (mahsulotlar va holatlar tarixi bilan).
     * Manzil: GET /api/admin/orders/{id}
     *
     * @param id buyurtmaning raqami (manzildan olinadi)
     * @return buyurtma (topilmasa 404)
     */
    @GetMapping("/{id}")
    @Operation(summary = "Buyurtmani id bo'yicha olish")
    public OrderResponse getById(@PathVariable Long id) {
        return orderService.getById(id);
    }

    /**
     * Buyurtma holatini o'zgartiradi (masalan, NEW dan CONFIRMED ga).
     * Manzil: PATCH /api/admin/orders/{id}/status
     * Authentication: hozir tizimga kirgan admin yoki xodim, uning kirish nomi tarixga yoziladi.
     *
     * @param id             buyurtmaning raqami
     * @param request        yangi holat va izoh
     * @param authentication joriy foydalanuvchi (filtr to'ldirib beradi)
     * @return yangilangan buyurtma
     */
    @PatchMapping("/{id}/status")
    @Operation(summary = "Buyurtma holatini o'zgartirish")
    public OrderResponse updateStatus(@PathVariable Long id,
                                      @Valid @RequestBody OrderStatusUpdateRequest request,
                                      Authentication authentication) {
        return orderService.updateStatus(id, request, authentication.getName());
    }



    /**
     * Tort buyurtmasining narxini tasdiqlaydi: yakuniy narx (yoki hisoblangani) belgilanadi, buyurtma
     * "CONFIRMED" holatiga o'tadi, mijozga kuzatuv sahifasida yangi summa ko'rinadi.
     * Manzil: PATCH /api/admin/orders/{id}/confirm-price
     *
     * @param id             buyurtmaning raqami
     * @param request        yakuniy narx (ixtiyoriy) va izoh
     * @param authentication joriy foydalanuvchi (tarixga yoziladi)
     * @return yangilangan buyurtma
     */
    @PatchMapping("/{id}/confirm-price")
    @Operation(summary = "Tort narxini tasdiqlash")
    public OrderResponse confirmPrice(@PathVariable Long id,
                                      @Valid @RequestBody ConfirmPriceRequest request,
                                      Authentication authentication) {
        return orderService.confirmCakePrice(id, request, authentication.getName());
    }


    /**
     * Buyurtmalarni Excel (.xlsx) fayl sifatida yuklab beradi. Filtrlar ro'yxatdagi bilan bir xil;
     * ko'pi bilan 5000 qator. Faqat ADMIN (mijozlar telefon raqamlari bor).
     * Manzil: GET /api/admin/orders/export?status=COMPLETED&dateFrom=2026-10-01
     *
     * @param filter filtr shartlari (hammasi ixtiyoriy)
     * @return .xlsx fayl (yuklab olinadi)
     */
    @GetMapping("/export")
    @Operation(summary = "Buyurtmalarni Excel'ga yuklash")
    public ResponseEntity<byte[]> export(@ParameterObject OrderFilter filter) {
        byte[] data = orderExcelExporter.export(filter);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"buyurtmalar-" + ShopTime.today() + ".xlsx\"")
                .contentType(MediaType.parseMediaType(
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(data);
    }
}
