package org.example.speaknotebackend.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnnotationVersionListResponse {
    private Long fileId;
    private int count;
    private java.util.List<AnnotationVersionItem> versions;
}
