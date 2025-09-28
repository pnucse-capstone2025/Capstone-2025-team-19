package org.example.speaknotebackend.domain.oauth.google;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Setter
@Getter
@ToString
@AllArgsConstructor
@RequiredArgsConstructor
@ConfigurationProperties(prefix = "spring.oauth2.google")
public class GoogleAccessKey {
    @JsonProperty("client_id")
    private String clientId;

    @JsonProperty("redirect_uri")
    private String redirectUri;

    @JsonProperty("client_secret")
    private String clientSecret;

    @JsonProperty("grant_type")
    private String grantType = "authorization_code";

    @JsonProperty("code")
    private String code;
}
