package org.example.speaknotebackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

// 요청
@Data
public class SnapshotRequest {
    private Long fileId;
    private List<Slide> slides;

    @Data public static class Slide {
        private int pageNumber;
        private List<Anno> annotations;
    }
    @Data
    public static class Anno {
        private String id;
        private String text;
        private Double x;  // 0~1
        private Double y;  // 0~1
        private Double w;  // 0~1
        private Double h;  // 0~1
        private String source;     // "PPT"|"MANUAL"|"PDF"
        private Integer answerState;
        private Integer order;
    }
}
