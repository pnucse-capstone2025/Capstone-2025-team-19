package org.example.speaknotebackend.domain.oauth;

import lombok.*;

// 클라이언트로 보낼 jwtToken, accessToken등이 담긴 객체
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class OauthRes implements GetSocialOAuthRes {

    private Long userId;
    private String accessToken;
    private String refreshToken;
} // 인터페이스로 변경 필요
