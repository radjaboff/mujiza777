package uz.akmal.mujiza.report.dto;

import java.math.BigDecimal;

/**
 * Eng ko'p sotilgan mahsulot.
 *
 * @param productId mahsulotning raqami
 * @param name      mahsulot nomi (o'zbekcha)
 * @param unitType  o'lchov birligi (PIECE yoki KG)
 * @param quantity  sotilgan miqdor (dona yoki kg)
 * @param revenue   shu mahsulotdan tushgan summa, so'mda (bekor qilinmagan buyurtmalar)
 */
public record TopProductResponse(Long productId, String name, String unitType, BigDecimal quantity, long revenue) {
}