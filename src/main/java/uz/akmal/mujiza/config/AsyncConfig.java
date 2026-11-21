package uz.akmal.mujiza.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.ThreadPoolExecutor;

/**
 * Alohida oqimda ishlaydigan metodlarni (@Async) yoqadi.
 * Telegram'ga xabar yuborish shu oqimda bajariladi, shunda Telegram sekin javob bersa ham
 * mijozning buyurtmasi kechikmaydi.
 */
@Configuration
@EnableAsync
public class AsyncConfig {

    /** Keep async notification work bounded during traffic bursts. */
    @Bean(name = "taskExecutor")
    public ThreadPoolTaskExecutor taskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(2);
        executor.setMaxPoolSize(4);
        // Keep burst checkout requests away from slow notification providers.
        executor.setQueueCapacity(2_000);
        executor.setKeepAliveSeconds(60);
        executor.setThreadNamePrefix("mujiza-async-");
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(20);
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        return executor;
    }
}
