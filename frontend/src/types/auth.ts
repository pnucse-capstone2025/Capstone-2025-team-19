export interface SocialInfoRes {
  socialType: 'GOOGLE' | 'KAKAO' | 'NAVER' | 'APPLE';
  socialId: string;
  email: string;
  name: string;
  phoneNumber?: string;
  promotionReceiveAgreement?: boolean;
  smsAndAlimTalkReceiveAgreement?: boolean;
  emailReceiveAgreement?: boolean;
  pushReceiveAgreement?: boolean;
  personalInfoForMarketingAgreement?: boolean;
}

export interface OauthRes {
  userId: number;
  accessToken: string;
  refreshToken: string;
}

export interface BaseResponse<T> {
  isSuccess: boolean;
  code: number;
  message: string;
  result: T;
}

export interface LoginResponse extends BaseResponse<OauthRes> {}
export interface SocialInfoResponse extends BaseResponse<SocialInfoRes> {}
