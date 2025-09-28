package org.example.speaknotebackend.client;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.Map;

@Slf4j
@Component
public class PythonAnnotationClient {

    private final WebClient webClient;
    private final Duration timeout;

    public PythonAnnotationClient(
            @Value("${python.api.base-url:http://localhost:8000}") String baseUrl,
            @Value("${python.api.timeout.ms:3000}") long timeoutMs
    ) {
        this.webClient = WebClient.builder()
                .baseUrl(baseUrl)
                .build();
        this.timeout = Duration.ofMillis(timeoutMs);
    }

    public void postTextFireAndForget(Long userId,
                                      String sessionId,
                                      long seq,
                                      String text,
                                      String lang,
                                      String requestId) {
        log.info("🌐 [Python Client] /text 호출 시작 - userId={}, sessionId={}, seq={}, requestId={}, textLength={}", 
                userId, sessionId, seq, requestId, text.length());
        
        Map<String, Object> body;
        try {
            body = Map.of(
                    "userId", userId != null ? userId.toString() : "0",
                    "sessionId", sessionId,
                    "seq", seq,
                    "text", text,
                    "lang", lang,
                    "requestId", requestId
            );

            log.info("🌐 [Python Client] 요청 본문: {}", body);
        } catch (Exception e) {
            log.error("❌ [Python Client] Map.of() 생성 실패: ", e);
            return;
        }

        try {
            log.info("🌐 [Python Client] WebClient 호출 시작");
            webClient.post()
                    .uri("/text")
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(body)
                    .retrieve()
                    .toEntity(QueueResponse.class) // 202(Accepted) 응답 처리
                    .timeout(timeout)
                    .doOnNext((ResponseEntity<QueueResponse> response) -> {
                        if (response != null && response.getStatusCode().value() == 202 && response.getBody() != null) {
                            QueueResponse b = response.getBody();
                            log.info("✅ [Python Client] 파이썬 작업 큐에 들어감: jobId={} sessionId={} seq={}", b.jobId, b.sessionId, b.seq);
                        } else if (response != null) {
                            log.warn("⚠️ [Python Client] 응답 못 받음: statusCode={}", response.getStatusCode());
                        } else {
                            log.warn("⚠️ [Python Client] 응답이 null");
                        }
                    })
                    .doOnError(err -> {
                        log.error("❌ [Python Client] API 호출 실패: {}", err.toString());
                        log.error("❌ [Python Client] 에러 상세: ", err);
                    })
                    .onErrorResume(err -> Mono.empty())
                    .subscribe();
            log.info("🌐 [Python Client] WebClient 호출 완료");
        } catch (Exception e) {
            log.error("❌ [Python Client] WebClient 호출 중 예외 발생: ", e);
        }
    }

    public static class QueueResponse {
        public Boolean success;
        public String status;
        public String jobId;
        public String sessionId;
        public Long seq;
    }
}


