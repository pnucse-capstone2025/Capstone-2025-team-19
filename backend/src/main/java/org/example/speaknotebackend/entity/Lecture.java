package org.example.speaknotebackend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "lecture")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Lecture extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "summary", length = 255, nullable = false)
    private String summary;

    @Column(name = "tags", length = 255, nullable = false) // 식별자 : , (콤마) => 최소 5개 저장
    private String tags;

    @Column(length = 10, nullable = false)
    private String language;

    @CreationTimestamp
    @Column(nullable = false)
    private LocalDateTime startedAt;

    @Column(name="lecture_name",length =255,nullable = false)
    private String lectureName; // 생각해보니 파일에 들어가서 이름 수정하는 거 에바인 거 같아서 저장된 이름을 수정한느게 아니라 보이는 용도의 이름을 설정해야될듯.

    @UpdateTimestamp
    private LocalDateTime endedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "file_id",  unique = true)
    private LectureFile lectureFile;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "folder_id", nullable = false)
    private Folder folder;
}
