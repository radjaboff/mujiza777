package uz.akmal.mujiza.report.dto;

import java.time.LocalDate;

/**
 * Bitta kun uchun statistika (grafik uchun).
 *
 * @param date    sana
 * @param orders  shu kundagi buyurtmalar soni (bekor qilinmaganlar)
 * @param revenue shu kundagi tushum: yakunlangan buyurtmalar summasi, so'mda
 */
public record DailyPointResponse(LocalDate date, long orders, long revenue) {
}