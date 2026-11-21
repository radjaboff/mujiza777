package uz.akmal.mujiza.report.repository;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

import javax.sql.DataSource;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Statistika uchun murakkab so'rovlar (SQL orqali). Hamma davr [fromAt, toAt) oralig'ida: boshlanish kiradi, tugash kirmaydi.
 */
@Repository
public class AnalyticsRepository {

    /**
     * Davr bo'yicha umumiy hisob: bitta so'rovda hamma ko'rsatkich (FILTER shartlari bilan).
     */
    private static final String PERIOD_SQL = """
            SELECT
              COUNT(*) AS total_orders,
              COUNT(*) FILTER (WHERE status = 'COMPLETED') AS completed,
              COUNT(*) FILTER (WHERE status = 'CANCELLED') AS cancelled,
              COUNT(*) FILTER (WHERE status NOT IN ('COMPLETED', 'CANCELLED')) AS active,
              COALESCE(SUM(total_amount) FILTER (WHERE status = 'COMPLETED'), 0) AS revenue,
              COALESCE(SUM(total_amount) FILTER (WHERE status NOT IN ('COMPLETED', 'CANCELLED')), 0) AS in_progress,
              COUNT(*) FILTER (WHERE status <> 'CANCELLED' AND order_type = 'PICKUP') AS pickup,
              COUNT(*) FILTER (WHERE status <> 'CANCELLED' AND order_type = 'DELIVERY') AS delivery,
              COUNT(*) FILTER (WHERE status <> 'CANCELLED' AND is_cake_order) AS cake,
              COUNT(*) FILTER (WHERE status <> 'CANCELLED' AND is_gift) AS gift,
              COALESCE(SUM(discount_amount) FILTER (WHERE status <> 'CANCELLED'), 0) AS discount_total
            FROM orders
            WHERE created_at >= :fromAt AND created_at < :toAt
            """;

    /**
     * Kunlar bo'yicha buyurtmalar soni va tushum.
     */
    private static final String DAILY_SQL = """
            SELECT CAST(created_at AS DATE) AS order_day,
                   COUNT(*) AS orders,
                   COALESCE(SUM(total_amount) FILTER (WHERE status = 'COMPLETED'), 0) AS revenue
            FROM orders
            WHERE created_at >= :fromAt AND created_at < :toAt AND status <> 'CANCELLED'
            GROUP BY order_day
            ORDER BY order_day
            """;

    /**
     * Sutka soatlari bo'yicha buyurtmalar soni.
     */
    private static final String HOURLY_SQL = """
            SELECT CAST(EXTRACT(HOUR FROM created_at) AS INT) AS order_hour, COUNT(*) AS orders
            FROM orders
            WHERE created_at >= :fromAt AND created_at < :toAt AND status <> 'CANCELLED'
            GROUP BY order_hour
            ORDER BY order_hour
            """;

    /**
     * Eng ko'p sotilgan mahsulotlar (tushum bo'yicha tartiblangan).
     */
    private static final String TOP_PRODUCTS_SQL = """
            SELECT oi.product_id,
                   MAX(oi.product_name_uz) AS name_uz,
                   MAX(oi.unit_type) AS unit_type,
                   SUM(oi.quantity) AS quantity,
                   SUM(oi.line_total) AS revenue
            FROM order_items oi
            JOIN orders o ON o.id = oi.order_id
            WHERE o.created_at >= :fromAt AND o.created_at < :toAt AND o.status <> 'CANCELLED'
            GROUP BY oi.product_id
            ORDER BY revenue DESC, quantity DESC
            LIMIT :limit
            """;

    /**
     * SQL so'rovlarini bajaruvchi vosita.
     */
    private final JdbcClient jdbc;

    /**
     * Konstruktor: ma'lumotlar bazasi ulanishidan SQL bajaruvchi yaratadi.
     *
     * @param dataSource bazaga ulanish
     */
    public AnalyticsRepository(DataSource dataSource) {
        this.jdbc = JdbcClient.create(dataSource);
    }

    /**
     * Davr bo'yicha umumiy ko'rsatkichlar.
     *
     * @param total       barcha buyurtmalar soni
     * @param completed   yakunlanganlar soni
     * @param cancelled   bekor qilinganlar soni
     * @param active      hali yakunlanmaganlar soni
     * @param revenue     yakunlanganlar summasi
     * @param inProgress  hali yakunlanmaganlar summasi
     * @param pickup      olib ketish buyurtmalari
     * @param delivery    yetkazib berish buyurtmalari
     * @param cake        tort buyurtmalari
     * @param gift        sovg'a buyurtmalari
     * @param discountTotal chegirmalar yig'indisi
     */
    public record PeriodStats(long total, long completed, long cancelled, long active, long revenue,
                              long inProgress, long pickup, long delivery, long cake, long gift,
                              long discountTotal) {
    }

    /**
     * Bitta kunning natijasi.
     *
     * @param date    sana
     * @param orders  buyurtmalar soni
     * @param revenue tushum
     */
    public record DailyRow(LocalDate date, long orders, long revenue) {
    }

    /**
     * Bitta soatning natijasi.
     *
     * @param hour   soat (0-23)
     * @param orders buyurtmalar soni
     */
    public record HourRow(int hour, long orders) {
    }

    /**
     * Bitta mahsulotning natijasi.
     *
     * @param productId mahsulotning raqami
     * @param name      nomi (o'zbekcha)
     * @param unitType  o'lchov birligi
     * @param quantity  sotilgan miqdor
     * @param revenue   tushgan summa
     */
    public record TopProductRow(Long productId, String name, String unitType, BigDecimal quantity, long revenue) {
    }

    /**
     * Berilgan oraliq uchun umumiy ko'rsatkichlarni hisoblaydi.
     *
     * @param fromAt boshlanish vaqti (kiradi)
     * @param toAt   tugash vaqti (kirmaydi)
     * @return ko'rsatkichlar
     */
    public PeriodStats periodStats(LocalDateTime fromAt, LocalDateTime toAt) {
        return jdbc.sql(PERIOD_SQL)
                .param("fromAt", fromAt)
                .param("toAt", toAt)
                .query((rs, rowNum) -> new PeriodStats(
                        rs.getLong("total_orders"), rs.getLong("completed"), rs.getLong("cancelled"),
                        rs.getLong("active"), rs.getLong("revenue"), rs.getLong("in_progress"),
                        rs.getLong("pickup"), rs.getLong("delivery"), rs.getLong("cake"),
                        rs.getLong("gift"), rs.getLong("discount_total")))
                .single();
    }

    /**
     * Berilgan oraliq uchun kunlik natijalar (buyurtma bo'lmagan kunlar kirmaydi).
     *
     * @param fromAt boshlanish vaqti (kiradi)
     * @param toAt   tugash vaqti (kirmaydi)
     * @return kunlar ro'yxati
     */
    public List<DailyRow> daily(LocalDateTime fromAt, LocalDateTime toAt) {
        return jdbc.sql(DAILY_SQL)
                .param("fromAt", fromAt)
                .param("toAt", toAt)
                .query((rs, rowNum) -> new DailyRow(
                        rs.getObject("order_day", LocalDate.class), rs.getLong("orders"), rs.getLong("revenue")))
                .list();
    }

    /**
     * Berilgan oraliq uchun soatlik natijalar (buyurtma bo'lmagan soatlar kirmaydi).
     *
     * @param fromAt boshlanish vaqti (kiradi)
     * @param toAt   tugash vaqti (kirmaydi)
     * @return soatlar ro'yxati
     */
    public List<HourRow> hourly(LocalDateTime fromAt, LocalDateTime toAt) {
        return jdbc.sql(HOURLY_SQL)
                .param("fromAt", fromAt)
                .param("toAt", toAt)
                .query((rs, rowNum) -> new HourRow(rs.getInt("order_hour"), rs.getLong("orders")))
                .list();
    }

    /**
     * Berilgan oraliq uchun eng ko'p sotilgan mahsulotlar.
     *
     * @param fromAt boshlanish vaqti (kiradi)
     * @param toAt   tugash vaqti (kirmaydi)
     * @param limit  eng ko'p nechta mahsulot
     * @return mahsulotlar ro'yxati (tushum kamayish tartibida)
     */
    public List<TopProductRow> topProducts(LocalDateTime fromAt, LocalDateTime toAt, int limit) {
        return jdbc.sql(TOP_PRODUCTS_SQL)
                .param("fromAt", fromAt)
                .param("toAt", toAt)
                .param("limit", limit)
                .query((rs, rowNum) -> new TopProductRow(
                        rs.getLong("product_id"), rs.getString("name_uz"), rs.getString("unit_type"),
                        rs.getBigDecimal("quantity"), rs.getLong("revenue")))
                .list();
    }
}