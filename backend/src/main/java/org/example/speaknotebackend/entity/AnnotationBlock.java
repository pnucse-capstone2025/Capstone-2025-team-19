//package org.example.speaknotebackend.domain.entity;
//
//import lombok.*;
//import org.springframework.data.annotation.Id;
//import org.springframework.data.mongodb.core.mapping.Document;
//
//import java.time.LocalDateTime;
//
//@Document(collection = "annotations")
//@Getter
//@Setter
//@Builder
//@NoArgsConstructor
//@AllArgsConstructor
//public class AnnotationBlock {
//
//    @Id
//    private String id;
//
//    private String sessionId; // WebSocket 세션 ID (또는 유저 ID)
//    private String originalText;
//    private String refinedText;
//    private Integer pageNumber; // 슬라이드 페이지 번호
//    private Float x; // 슬라이드 상 위치 (좌표값)
//    private Float y;
//    private LocalDateTime createdAt;
//}
