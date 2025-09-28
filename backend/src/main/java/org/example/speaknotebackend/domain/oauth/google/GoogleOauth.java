package org.example.speaknotebackend.domain.oauth.google;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.speaknotebackend.domain.oauth.SocialOauth;
import org.example.speaknotebackend.domain.oauth.SocialTermsAgreementResponse;
import org.example.speaknotebackend.domain.oauth.SocialUser;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.Optional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

@Slf4j
@Component
@RequiredArgsConstructor
public class GoogleOauth implements SocialOauth {

    private final GoogleAccessKey accessKey;

    private final RestTemplate restTemplate;

    @Value("${spring.oauth2.google.redirect-uri}")
    private String redirectUri;

    @Override
    public String getAccessToken(String code) {

        accessKey.setCode(code);
        // redirect_uri 설정 추가
        accessKey.setRedirectUri(redirectUri);

        URI uri =
                UriComponentsBuilder.fromUriString("https://oauth2.googleapis.com/token")
                        .build()
                        .toUri();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<?> httpEntity = new HttpEntity<>(accessKey, headers);

        ResponseEntity<GoogleOAuthToken> response =
                restTemplate.exchange(uri, HttpMethod.POST, httpEntity, GoogleOAuthToken.class);

        Optional<GoogleOAuthToken> authTokenOptional = Optional.of(response.getBody());
        GoogleOAuthToken authToken = authTokenOptional.orElseThrow();
        return authToken.getAccessToken();
    }

    @Override
    public SocialUser getUserInfo(String accessToken) {
        URI uri =
                UriComponentsBuilder.fromUriString("https://www.googleapis.com/oauth2/v1/userinfo")
                        .build()
                        .toUri();

        // header에 accessToken을 담는다.
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);

        // HttpEntity를 하나 생성해 헤더를 담아서 restTemplate으로 구글과 통신하게 된다.
        HttpEntity<?> request = new HttpEntity<>(headers);
        ResponseEntity<GoogleUser> response =
                restTemplate.exchange(uri, HttpMethod.GET, request, GoogleUser.class);

        Optional<GoogleUser> googleUserOptional = Optional.of(response.getBody());
        return googleUserOptional.orElseThrow();
    }

    @Override
    public SocialTermsAgreementResponse getTermsAgreements(String accessToken)
            throws HttpClientErrorException {
        return new SocialTermsAgreementResponse(null, null, null, null, null);
    }
}