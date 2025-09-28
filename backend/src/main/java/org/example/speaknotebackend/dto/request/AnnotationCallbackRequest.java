package org.example.speaknotebackend.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.util.List;

@Data
public class AnnotationCallbackRequest {
    @Schema(description = "전체 응답 결과 개수")
    private Integer totalNum;

    private List<AnnotationResult> results;

    @Data
    public static class AnnotationResult {
        @Schema(description = "사용자 ID")
        private Long userId;

        @Schema(description = "웹소켓 세션 ID")
        private String sessionId;

        @Schema(description = "파이썬 내부 job ID")
        private String jobId;

        @Schema(description = "주석 스냅샷 번호")
        private Long seq;

        @Schema(description = "정제된 음성 텍스트")
        private String audioText;

        @Schema(description = "AI 주석")
        private String annotation;

        @Schema(description = "요청 ID - 중복 요청 방지 (멱등키)")
        private String requestId;

        @Schema(description = "주석이 속한 페이지 번호")
        private Integer page = 1; // 기본값 설정

        @Schema(description = "주석의 상태 코드 (1,2)")
        private Integer answerState = 1; // 기본값 설정
    }
}