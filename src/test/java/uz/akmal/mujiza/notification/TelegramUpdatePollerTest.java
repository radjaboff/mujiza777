package uz.akmal.mujiza.notification;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class TelegramUpdatePollerTest {

    private final TelegramClient telegramClient = mock(TelegramClient.class);
    private final TelegramCallbackHandler callbackHandler = mock(TelegramCallbackHandler.class);
    private final TelegramDailyReportService dailyReportService = mock(TelegramDailyReportService.class);

    private final TelegramUpdatePoller poller = new TelegramUpdatePoller(
            telegramClient, callbackHandler, dailyReportService, "https://mujiza.uz"
    );

    @Test
    @DisplayName("/start command sends welcome message with Telegram WebApp button")
    void startCommandSendsWebAppButton() {
        when(telegramClient.isEnabled()).thenReturn(true);

        TelegramModels.User user = new TelegramModels.User(12345L, "alisher", "Alisher");
        TelegramModels.Chat chat = new TelegramModels.Chat(12345L);
        TelegramModels.Message msg = new TelegramModels.Message(1L, chat, "/start", user);
        TelegramModels.Update update = new TelegramModels.Update(100L, null, msg);

        when(telegramClient.getUpdates(0L)).thenReturn(List.of(update));

        poller.poll();

        verify(telegramClient).sendMessage(eq(12345L), contains("Alisher"), anyMap());
    }

    @Test
    @DisplayName("/bugun command in admin chat triggers daily report")
    void bugunCommandInAdminChatTriggersReport() {
        when(telegramClient.isEnabled()).thenReturn(true);
        when(telegramClient.isAdminChat(-100999L)).thenReturn(true);

        TelegramModels.User admin = new TelegramModels.User(999L, "admin", "Admin");
        TelegramModels.Chat chat = new TelegramModels.Chat(-100999L);
        TelegramModels.Message msg = new TelegramModels.Message(2L, chat, "/bugun", admin);
        TelegramModels.Update update = new TelegramModels.Update(101L, null, msg);

        when(telegramClient.getUpdates(0L)).thenReturn(List.of(update));

        poller.poll();

        verify(dailyReportService).sendScheduledDailyReport();
    }
}
