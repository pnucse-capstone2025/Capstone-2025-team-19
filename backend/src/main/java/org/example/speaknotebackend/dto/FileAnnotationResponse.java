package org.example.speaknotebackend.dto;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class FileAnnotationResponse {
    // 파일 메타
    private Long fileId;
    private String fileName;
    private String fileUrl;          // 바로 PDF 뷰어에 넣으면 됨
    private Instant snapshotCreatedAt;

    // 버전
    private Integer version;
    private boolean latest;

    // 주석
    private List<SlideDto> slides;

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class SlideDto {
        private int pageNumber;
        private List<AnnoDto> annotations;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class AnnoDto {
        private String id;
        private String text;
        private Map<String, Object> payload;
        private Pos position; // [0,1]
        private Size size;    // [0,1]
        private String source; // PPT | MANUAL | PDF
        private Integer order;
        private Instant createdAt;
        private Instant updatedAt;
        private Integer answerState;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Pos { private double x; private double y; }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Size { private double width; private double height; }
}
