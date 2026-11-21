package uz.akmal.mujiza.order.dto;

import uz.akmal.mujiza.catalog.enums.UnitType;

import java.math.BigDecimal;

/**
 * Buyurtmadagi bitta mahsulot qatori (javobda).
 * Nom, narx va o'lchov turi buyurtma paytidagi nusxadan olinadi.
 *
 * @param productId mahsulotning raqami
 * @param name      mahsulot nomi (mijozga so'ralgan tilda, adminga o'zbekcha)
 * @param quantity  miqdori (donalik mahsulotda soni, kg mahsulotda kilogramm)
 * @param unitType  o'lchov birligi (PIECE yoki KG)
 * @param unitPrice 1 birlik (1 dona yoki 1 kg) narxi, buyurtma paytida, so'mda
 * @param lineTotal shu qatorning summasi, so'mda
 */
public record OrderItemResponse(
        Long productId,
        String name,
        BigDecimal quantity,
        UnitType unitType,
        Long unitPrice,
        Long lineTotal
) {
}