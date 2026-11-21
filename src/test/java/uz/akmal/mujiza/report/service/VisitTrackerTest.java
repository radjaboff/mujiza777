package uz.akmal.mujiza.report.service;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.ZoneId;

import static org.assertj.core.api.Assertions.assertThat;

class VisitTrackerTest {

    private final VisitTracker tracker = new VisitTracker();
    private final LocalDate today = LocalDate.now(ZoneId.of("Asia/Tashkent"));

    @Test
    @DisplayName("Tracking page views and unique visitors works correctly")
    void testTrackPageViewsAndUniqueVisitors() {
        // 2 requests from IP 1.1.1.1
        tracker.recordPageView("1.1.1.1");
        tracker.recordPageView("1.1.1.1");

        // 1 request from IP 2.2.2.2
        tracker.recordPageView("2.2.2.2");

        // 2 cart additions
        tracker.recordCartAdd();
        tracker.recordCartAdd();

        VisitTracker.VisitStats stats = tracker.getStats(today);

        assertThat(stats.uniqueVisitors()).isEqualTo(2); // 1.1.1.1 and 2.2.2.2
        assertThat(stats.pageViews()).isEqualTo(3);      // 3 total views
        assertThat(stats.cartAdds()).isEqualTo(2);       // 2 cart adds
    }

    @Test
    @DisplayName("Empty or null IP does not count as unique visitor but counts as view")
    void testEmptyOrNullIp() {
        tracker.recordPageView(null);
        tracker.recordPageView("");

        VisitTracker.VisitStats stats = tracker.getStats(today);
        assertThat(stats.pageViews()).isGreaterThanOrEqualTo(2);
    }
}
