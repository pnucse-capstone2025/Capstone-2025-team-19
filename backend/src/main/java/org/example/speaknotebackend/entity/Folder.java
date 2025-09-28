package org.example.speaknotebackend.entity;


import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "folder")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Folder extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", length = 20, nullable = false)
    private String name;

    @Builder.Default
    @Column(name = "basic", length = 20, nullable = false) // 기본 폴더 -> 처음 유저 가입시 생성되는 폴더 단 한개, basic 은 처음 만들어질 때만 true임.
    private boolean basic =false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}
