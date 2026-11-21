package uz.akmal.mujiza.common;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;

/** One source of local date/time for store rules, independent of the host machine's timezone. */
public final class ShopTime {
    public static final ZoneId ZONE = ZoneId.of("Asia/Tashkent");

    private ShopTime() {
    }

    public static LocalDateTime now() {
        return LocalDateTime.now(ZONE);
    }

    public static LocalDate today() {
        return LocalDate.now(ZONE);
    }
}
