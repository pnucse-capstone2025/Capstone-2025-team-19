package org.example.speaknotebackend.domain.oauth;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.speaknotebackend.common.exceptions.BaseException;
import org.example.speaknotebackend.domain.repository.FolderRepository;
import org.example.speaknotebackend.domain.user.UserService;
import org.example.speaknotebackend.entity.Folder;
import org.example.speaknotebackend.entity.SocialType;
import org.example.speaknotebackend.entity.User;
import org.example.speaknotebackend.global.JwtService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;

@Slf4j
@Service
@RequiredArgsConstructor
public class OAuthService {
    private final UserService userService;
    private final JwtService jwtService;

    @Transactional
    public GetSocialOAuthRes oAuthLogin(
            SocialLoginType socialLoginType, String code, String accessToken)
            throws IOException {

        SocialOauth socialOauth = socialLoginType.getSocialOauth();

        if (accessToken == null) {
            accessToken = socialOauth.getAccessToken(code);
        }
        SocialUser socialUser = socialOauth.getUserInfo(accessToken);

        User user;

        try {
            // 이메일로 유저 찾기
            user =
                    userService.findByEmailAndSocialId(
                            socialUser.getEmail(), socialUser.getSocialId());
        } catch (Exception e) {
            // 사용자가 없으면 새로 생성
            log.info("새로운 소셜 로그인 사용자 생성: {}", socialUser.getEmail());
            
            SocialType socialType = convertToSocialType(socialLoginType);
            user = userService.createUser(
                    socialUser.getEmail(),
                    socialUser.getName(),
                    socialUser.getSocialId(),
                    socialType
            );
        }

        try {
            // 서버에 user가 존재하면 앞으로 회원 인가 처리를 위한 jwtToken을 발급한다.
            String accessJwtToken = jwtService.createUserJwt(user.getId());
            String refreshJwtToken = jwtService.createUserRefreshJwt(user.getId());
            user.updateRefreshToken(refreshJwtToken);

            // 액세스 토큰과 jwtToken, 이외 정보들이 담긴 자바 객체를 다시 전송한다.
            return new OauthRes(user.getId(), accessJwtToken, refreshJwtToken);
        } catch (BaseException exception) {
            throw exception;
        }
    }

    private SocialType convertToSocialType(SocialLoginType socialLoginType) {
        switch (socialLoginType) {
            case GOOGLE:
                return SocialType.GOOGLE;
            case KAKAO:
                return SocialType.KAKAO;
            case APPLE:
                return SocialType.APPLE;
            default:
                throw new IllegalArgumentException("지원하지 않는 소셜 로그인 타입: " + socialLoginType);
        }
    }

    private final FolderRepository folderRepository;
}
