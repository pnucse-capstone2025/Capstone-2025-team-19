package org.example.speaknotebackend.domain.oauth;

public interface SocialUser {
    String getEmail();

    String getSocialId();

    String getName();

    Long getFolderId();

    SocialInfoRes toSocialInfoRes(SocialTermsAgreementResponse termsAgreements);
}
