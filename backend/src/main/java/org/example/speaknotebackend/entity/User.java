package org.example.speaknotebackend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "`users`")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 255, nullable = false)
    private String email;

    @Column(length = 100, nullable = false)
    private String name;

    @Column(length = 255, nullable = false)
    private String password;

    @Column(length = 512)
    private String refreshToken;

    @Column(length = 255)
    private String socialId;

    @Enumerated(EnumType.STRING)
    @Column(length = 50, nullable = false)
    private SocialType socialType;

    public void updateRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }
}

