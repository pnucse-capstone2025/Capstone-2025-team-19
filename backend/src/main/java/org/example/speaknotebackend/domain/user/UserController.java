package org.example.speaknotebackend.domain.user;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.speaknotebackend.common.exceptions.BaseException;
import org.example.speaknotebackend.common.response.BaseResponse;
import org.example.speaknotebackend.domain.oauth.GetSocialOAuthRes;
import org.example.speaknotebackend.domain.oauth.OAuthService;
import org.example.speaknotebackend.domain.oauth.SocialLoginType;
import org.example.speaknotebackend.domain.user.model.UserProfileResponse;
import org.example.speaknotebackend.entity.User;
import org.example.speaknotebackend.global.JwtService;
import org.springframework.web.bind.annotation.*;

import static org.example.speaknotebackend.common.response.BaseResponseStatus.*;

@Tag(name = "Users", description = "유저")
@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/app/users")
public class UserController {

    private final OAuthService oAuthService;
    private final JwtService jwtService;
    private final UserService userService;

    /**
     * Social Login
     *
     * @param socialLoginType (GOOGLE, APPLE, NAVER, KAKAO)
     * @param code API Server 로부터 넘어오는 code
     * @return SNS Login 요청 결과로 받은 Json 형태의 java 객체 (access_token, jwt_token, user_num 등)
     */
    @Operation(summary = "소셜 로그인 합니다.")
    @GetMapping(value = "/auth/{socialLoginType}/login")
    public BaseResponse<GetSocialOAuthRes> socialLogin(
            @PathVariable(name = "socialLoginType") String socialLoginType,
            @RequestParam(name = "code", required = false) String code,
            @RequestParam(name = "accessToken", required = false) String accessToken)
            throws Exception {

        SocialLoginType loginType = SocialLoginType.fromString(socialLoginType);
      
        GetSocialOAuthRes getSocialOAuthRes =
                oAuthService.oAuthLogin(loginType, code, accessToken);

        return new BaseResponse<>(getSocialOAuthRes);
    }

    /**
     * 사용자 프로필 조회
     *
     * @param authorization Authorization 헤더 (Bearer 토큰)
     * @return 사용자 프로필 정보 (id, email, name)
     */
    @Operation(summary = "사용자 프로필을 조회합니다.")
    @GetMapping("/profile")
    public BaseResponse<UserProfileResponse> getUserProfile(
            @RequestHeader("Authorization") String authorization
    ) {
        try {
            Long userId = jwtService.getUserId();
            User user = userService.findActiveById(userId);
            
            UserProfileResponse response = UserProfileResponse.builder()
                    .id(user.getId())
                    .email(user.getEmail())
                    .name(user.getName())
                    .build();
            
            return new BaseResponse<>(response);
            
        } catch (BaseException e) {
            // JWT 관련 에러
            if (e.getStatus() == EMPTY_JWT || e.getStatus() == EXPIRED_JWT || e.getStatus() == INVALID_JWT) {
                throw new BaseException(INVALID_USER_JWT);
            }
            if (e.getStatus() == USER_NOT_FOUND) {
                throw new BaseException(USER_NOT_FOUND);
            }
            throw e;
        } catch (Exception e) {
            log.error("사용자 프로필 조회 중 예상치 못한 에러 발생", e);
            throw new BaseException(SERVER_ERROR);
        }
    }
}
