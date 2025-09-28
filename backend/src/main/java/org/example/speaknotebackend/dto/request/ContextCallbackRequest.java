package org.example.speaknotebackend.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.util.List;

@Data
public class ContextCallbackRequest {
    @Schema(description = "전체 컨텍스트 결과 개수")
    private Integer totalNum;

    private List<ContextResult> contexts;

    @Data
    public static class ContextResult {
        @Schema(description = "처리 성공 여부")
        private Boolean success;

        @Schema(description = "세션 ID = 파일 ID")
        private Long sessionId;

        @Schema(description = "사용자 ID")
        private Long userId;

        @Schema(description = "문서 요약")
        private String summary;

        @Schema(description = "키워드 목록")
        private List<String> keywords;
    }
}
