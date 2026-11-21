package uz.akmal.mujiza.report.dto;

/**
 * Sutkaning bitta soati uchun statistika.
 *
 * @param hour   soat (0 dan 23 gacha)
 * @param orders shu soatda berilgan buyurtmalar soni (bekor qilinmaganlar)
 */
public record HourPointResponse(int hour, long orders) {
}