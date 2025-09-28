package org.example.speaknotebackend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "lecture_file")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LectureFile extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 255, nullable = false)
    private String fileName;

    @Column(length = 36, nullable = false)
    private String uuid;

    @Column(length = 512, nullable = false)
    private String fileUrl;

}
