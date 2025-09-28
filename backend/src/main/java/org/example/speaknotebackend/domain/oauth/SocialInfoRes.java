package org.example.speaknotebackend.domain.oauth;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class SocialInfoRes {

    @Schema(description = "소셜 타입")
    private SocialLoginType socialType;

    @Schema(description = "소셜 id")
    private String socialId;

    @Schema(description = "이메일")
    private String email;

    @Schema(description = "이름")
    private String name;

    @Schema(description = "휴대폰 번호")
    private String phoneNumber;

    @Schema(description = "광고성 정보 수신동의")
    Boolean promotionReceiveAgreement;

    @Schema(description = "광고성 sms,알림톡 수신동의")
    Boolean smsAndAlimTalkReceiveAgreement;

    @Schema(description = "광고성 이메일 수신동의")
    Boolean emailReceiveAgreement;

    @Schema(description = "광고성 푸쉬알림 수신동의")
    Boolean pushReceiveAgreement;

    @Schema(description = "개인정보 마케팅 활용동의")
    Boolean personalInfoForMarketingAgreement;

    @Builder
    public SocialInfoRes(
            SocialLoginType socialType,
            String socialId,
            String email,
            String name,
            String phoneNumber,
            Boolean promotionReceiveAgreement,
            Boolean smsAndAlimTalkReceiveAgreement,
            Boolean emailReceiveAgreement,
            Boolean pushReceiveAgreement,
            Boolean personalInfoForMarketingAgreement) {
        this.socialType = socialType;
        this.socialId = socialId;
        this.email = email;
        this.name = name;
        this.phoneNumber = phoneNumber;
        this.promotionReceiveAgreement = promotionReceiveAgreement;
        this.smsAndAlimTalkReceiveAgreement = smsAndAlimTalkReceiveAgreement;
        this.emailReceiveAgreement = emailReceiveAgreement;
        this.pushReceiveAgreement = pushReceiveAgreement;
        this.personalInfoForMarketingAgreement = personalInfoForMarketingAgreement;
    }
}
