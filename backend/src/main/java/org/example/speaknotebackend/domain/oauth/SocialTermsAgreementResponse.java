package org.example.speaknotebackend.domain.oauth;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SocialTermsAgreementResponse {

    private Boolean promotionReceiveAgreement;

    private Boolean smsAndAlimTalkReceiveAgreement;

    private Boolean emailReceiveAgreement;

    private Boolean pushReceiveAgreement;

    private Boolean personalInfoForMarketingAgreement;
}
