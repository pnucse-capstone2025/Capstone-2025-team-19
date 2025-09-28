package org.example.speaknotebackend.domain.oauth;

import org.springframework.web.client.HttpClientErrorException;

public interface SocialOauth {
    String getAccessToken(String code);

    SocialUser getUserInfo(String accessToken) throws HttpClientErrorException;

    SocialTermsAgreementResponse getTermsAgreements(String accessToken)
            throws HttpClientErrorException;
}
