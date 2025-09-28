package org.example.speaknotebackend.domain.oauth.google;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// 구글에 일회성 코드를 다시 보내 받아올 액세스 토큰을 포함한 JSON 문자열을 담을 클래스
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class GoogleOAuthToken {
    @JsonProperty("access_token")
    private String accessToken;

    @JsonProperty("expires_in")
    private int expiresIn;

    @JsonProperty("scope")
    private String scope;

    @JsonProperty("token_type")
    private String tokenType;

    @JsonProperty("id_token")
    private String idToken;
}
