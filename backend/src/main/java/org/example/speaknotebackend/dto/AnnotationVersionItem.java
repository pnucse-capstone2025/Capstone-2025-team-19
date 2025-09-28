package org.example.speaknotebackend.dto;
import java.time.Instant;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AnnotationVersionItem {
    private Integer version;
    private Instant createdAt;
    private Instant updatedAt;
}
