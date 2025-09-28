package org.example.speaknotebackend.client;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@Component
public class FrontendNotificationClient {
    
    @Value("${custom.cors.allowed-origin}")
    private String frontendUrl;
    
    private final RestTemplate restTemplate = new RestTemplate();
    
    /**
     * 프론트엔드에 PDF 처리 완료 알림을 전송한다.
     * @param fileId 파일 ID (게스트는 0)
     * @param userId 사용자 ID (게스트는 0)
     */
    public void notifyPdfReady(Long fileId, Long userId) {
        try {
            String url = frontendUrl + "/api/pdf/ready";
            
            Map<String, Object> payload = new HashMap<>();
            payload.put("type", "pdf_ready");
            payload.put("status", "ready");
            payload.put("fileId", fileId);
            payload.put("userId", userId);
            payload.put("message", "PDF 처리가 완료되었습니다. 녹음을 시작할 수 있습니다.");
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);
            
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);
            
            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("✅ [FRONTEND_NOTIFY] PDF ready 알림 전송 성공 - fileId={}, userId={}",
                        fileId, userId);
            } else {
                log.warn("⚠️ [FRONTEND_NOTIFY] PDF ready 알림 전송 실패 - status={}, fileId={}", 
                        response.getStatusCode(), fileId);
            }
            
        } catch (Exception e) {
            log.error("❌ [FRONTEND_NOTIFY] PDF ready 알림 전송 중 오류 발생 - fileId={}, error: ", fileId, e);
        }
    }
}
