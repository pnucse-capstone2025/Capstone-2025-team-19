package org.example.speaknotebackend.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Document(collection = "annotations")  // MongoDB 컬렉션명
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnnotationDocument {

    @Id
    private String id;

    private Long fileId; // MySQL에 저장된 파일 ID 참조

    private boolean isDroppedOnPdf;

    private String content;

    private Position position;  // PDF 위에 배치된 경우 위치 정보

    private int pageNumber;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class Position {
        private float x;
        private float y;
        private float width;
        private float height;
    }
}
