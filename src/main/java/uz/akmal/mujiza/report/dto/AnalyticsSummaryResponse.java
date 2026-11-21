package uz.akmal.mujiza.report.dto;

import java.time.LocalDate;

/**
 * Tanlangan davr bo'yicha umumiy statistika (admin dashboard uchun).
 *
 * @param from             davr boshi (shu kun ham kiradi)
 * @param to               davr oxiri (shu kun ham kiradi)
 * @param days             davrdagi kunlar soni
 * @param ordersTotal      barcha buyurtmalar soni (bekor qilinganlar ham)
 * @param completed        yakunlangan buyurtmalar soni
 * @param cancelled        bekor qilingan buyurtmalar soni
 * @param active           hali yakunlanmagan va bekor qilinmagan buyurtmalar soni
 * @param revenue          tushum: faqat yakunlangan buyurtmalarning jami summasi, so'mda
 * @param inProgressAmount hali yakunlanmagan, bekor qilinmagan buyurtmalarning jami summasi, so'mda
 * @param averageOrderValue o'rtacha chek: tushum / yakunlangan buyurtmalar soni (yakunlangan yo'q bo'lsa 0)
 * @param pickupOrders     olib ketish buyurtmalari soni (bekor qilinmaganlar)
 * @param deliveryOrders   yetkazib berish buyurtmalari soni (bekor qilinmaganlar)
 * @param cakeOrders       tort buyurtmalari soni (bekor qilinmaganlar)
 * @param giftOrders       sovg'a buyurtmalari soni (bekor qilinmaganlar)
 * @param discountTotal    promo kodlar bergan chegirmalar yig'indisi (bekor qilinmaganlar), so'mda
 * @param previous         oldingi xuddi shunday uzunlikdagi davr bilan taqqoslash
 */
public record AnalyticsSummaryResponse(
        LocalDate from,
        LocalDate to,
        long days,
        long ordersTotal,
        long completed,
        long cancelled,
        long active,
        long revenue,
        long inProgressAmount,
        long averageOrderValue,
        long pickupOrders,
        long deliveryOrders,
        long cakeOrders,
        long giftOrders,
        long discountTotal,
        Comparison previous
) {

    /**
     * Oldingi davr bilan taqqoslash.
     *
     * @param ordersTotal          oldingi davrdagi buyurtmalar soni
     * @param revenue              oldingi davrdagi tushum, so'mda
     * @param ordersChangePercent  buyurtmalar soni o'zgarishi, foizda (oldingi davrda 0 bo'lsa null)
     * @param revenueChangePercent tushum o'zgarishi, foizda (oldingi davrda 0 bo'lsa null)
     */
    public record Comparison(long ordersTotal, long revenue, Double ordersChangePercent,
                             Double revenueChangePercent) {
    }
}