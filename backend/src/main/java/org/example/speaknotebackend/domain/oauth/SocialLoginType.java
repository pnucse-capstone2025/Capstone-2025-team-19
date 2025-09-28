package org.example.speaknotebackend.domain.oauth;


import com.fasterxml.jackson.annotation.JsonValue;
import jakarta.annotation.PostConstruct;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.example.speaknotebackend.domain.oauth.google.GoogleOauth;
import org.springframework.stereotype.Component;

public enum SocialLoginType {
    GOOGLE,
    KAKAO,
    NAVER,
    APPLE;

    @Getter
    private SocialOauth socialOauth;

    @JsonValue
    public String getSocialLoginName() {
        return name().toLowerCase();
    }

    // 문자열을 enum으로 변환하는 메서드
    public static SocialLoginType fromString(String text) {
        if (text != null) {
            for (SocialLoginType type : SocialLoginType.values()) {
                if (text.equalsIgnoreCase(type.name()) || text.equalsIgnoreCase(type.getSocialLoginName())) {
                    return type;
                }
            }
        }
        throw new IllegalArgumentException("No constant with text " + text + " found");
    }

    @Component
    @RequiredArgsConstructor
    private static class SocialOauthInjector {
        private final GoogleOauth google;
//        private final KakaoOauth kakao;
//        private final NaverOauth naver;
//        private final AppleOauth apple;

        @PostConstruct
        public void postConstruct() {
            SocialLoginType.GOOGLE.injectSocialOauth(google);
//            SocialLoginType.KAKAO.injectSocialOauth(kakao);
//            SocialLoginType.NAVER.injectSocialOauth(naver);
//            SocialLoginType.APPLE.injectSocialOauth(apple);
        }
    }

    private void injectSocialOauth(SocialOauth socialOauth) {
        this.socialOauth = socialOauth;
    }
}
