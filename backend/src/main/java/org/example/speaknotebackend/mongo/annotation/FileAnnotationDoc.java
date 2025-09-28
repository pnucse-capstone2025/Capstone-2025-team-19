package org.example.speaknotebackend.mongo.annotation;


import java.time.Instant;
import java.util.List;
import java.util.Map;

import lombok.*;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.*;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

@Document("file_annotations")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
@CompoundIndex(name = "fileId_version_idx", def = "{'fileId': 1, 'version': -1}", unique = true)
public class FileAnnotationDoc {
    @Id
    private ObjectId id;

    private Long fileId;      // RDB 파일 PK
    private Long userId;      // lecture Id ..?였나 fileId 였나 기억이 안남..
    private Integer version;  // 1부터 증가(스냅샷 버전)

    private List<Slide> slides;

    @CreatedDate
    private Instant createdAt;
    @LastModifiedDate
    private Instant updatedAt;


    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class Slide {
        private int pageNumber;
        private List<Anno> annotations;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class Anno {
        private String id; // uuid
        private String text;              // 원문(선택)
        private Map<String,Object> payload; // refinedText, lines 등 구조화 데이터
        private Position position;      // {x,y} 0~1
        private Size size;              // {w,h} 0~1
        private Source source;          // PPT or MANUAL
        private Integer order;          // 렌더 순서
        private Instant createdAt;
        private Instant updatedAt;
        private Integer answerState; // 0=내부, 1=외부, 2=질문 등

    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class Position { private double x; private double y; }
    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class Size { private double width; private double height; }

    public enum Source { PPT, MANUAL,PDF }
}
