package org.example.speaknotebackend.domain.oauth.google;


import lombok.*;
import org.example.speaknotebackend.domain.oauth.SocialInfoRes;
import org.example.speaknotebackend.domain.oauth.SocialLoginType;
import org.example.speaknotebackend.domain.oauth.SocialTermsAgreementResponse;
import org.example.speaknotebackend.domain.oauth.SocialUser;

// 구글(서드파티)로 액세스 토큰을 보내 받아올 구글에 등록된 사용자 정보
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class GoogleUser implements SocialUser {
    public String id;
    public String email;
    public Boolean verifiedEmail;
    public String name;
    public String givenName;
    public String familyName;
    public String picture;
    public String locale;
    public Long folderId;

    @Override
    public String getSocialId() {
        return this.id;
    }

    @Override
    public String getEmail() {
        return this.email;
    }

    @Override
    public String getName() {
        return this.name;
    }

    @Override
    public Long getFolderId() {return this.folderId;}

    @Override
    public SocialInfoRes toSocialInfoRes(SocialTermsAgreementResponse termsAgreements) {
        return SocialInfoRes.builder()
                .socialType(SocialLoginType.GOOGLE)
                .socialId(getSocialId())
                .email(this.email)
                .name(this.name)
                .build();
    }
}
