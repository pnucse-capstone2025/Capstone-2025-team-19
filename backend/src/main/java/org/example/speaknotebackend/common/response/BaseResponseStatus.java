package org.example.speaknotebackend.common.response;


import lombok.Getter;
import org.springframework.http.HttpStatus;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.NOT_FOUND;

/**
 * 에러 코드 관리
 */
@Getter
public enum BaseResponseStatus {
    /**
     * 200 : 요청 성공
     */
    SUCCESS(true, HttpStatus.OK.value(), "요청에 성공하였습니다."),

    /**
     * 400 : Request, Response 오류
     */
    OTHER_SERVER_ERROR(false, HttpStatus.BAD_REQUEST.value(), "외부 서버 오류입니다."),
    INVALID_FIELD_VALUE(false, HttpStatus.BAD_REQUEST.value(), "필드 값이 올바르지 않습니다."),
    INVALID_PARAM(false, HttpStatus.BAD_REQUEST.value(), "필수 파라미터가 누락되었습니다."),

    TEST_EMPTY_COMMENT(false, HttpStatus.BAD_REQUEST.value(), "코멘트를 입력해주세요."),
    POST_TEST_EXISTS_MEMO(false, HttpStatus.BAD_REQUEST.value(), "중복된 메모입니다."),

    RESPONSE_ERROR(false, HttpStatus.NOT_FOUND.value(), "값을 불러오는데 실패하였습니다."),

    /**
     * Folder
     */
    FOLDER_NOT_FOUND(false, HttpStatus.NOT_FOUND.value(), "폴더를 찾을 수 없습니다."),
    LECTURE_NOT_FOUND(false, HttpStatus.NOT_FOUND.value(), "강의를 찾을 수 없습니다."),

    /**
     * Auth
     */
    DUPLICATED_EMAIL(false, HttpStatus.BAD_REQUEST.value(), "중복된 이메일입니다."),
    INVALID_PASSWORD(false, HttpStatus.BAD_REQUEST.value(), "설정할 수 없는 비밀번호 입니다."),
    INVALID_MEMO(false, HttpStatus.NOT_FOUND.value(), "존재하지 않는 메모입니다."),
    FAILED_TO_LOGIN(false, HttpStatus.NOT_FOUND.value(), "없는 아이디거나 비밀번호가 틀렸습니다."),
    INVALID_USER_JWT(false, HttpStatus.FORBIDDEN.value(), "권한이 없는 유저의 접근입니다."),
    INVALID_OAUTH_TYPE(false, HttpStatus.BAD_REQUEST.value(), "알 수 없는 소셜 로그인 형식입니다."),
    SLEPT_USER(false, HttpStatus.BAD_REQUEST.value(), "휴면계정입니다."),
    RECENT_WITHDRAW_USER(false, HttpStatus.BAD_REQUEST.value(), "탈퇴한지 90일이 지나지 않은 계정입니다."),
    PASSWORD_UPDATE_NEEDED(false, HttpStatus.OK.value(), "비밀번호를 변경한 지 90일이 경과되었습니다."),
    EMPTY_SOCIAL_INFO(false, HttpStatus.BAD_REQUEST.value(), "소셜 정보를 입력해주세요."),
    TERMS_AGREEMENT_NEEDED(false, HttpStatus.BAD_REQUEST.value(), "필수약관 동의가 필요합니다."),
    DUPLICATED_PHONE_NUMBER(false, HttpStatus.BAD_REQUEST.value(), "중복된 전화번호입니다."),
    GENERAL_LOGIN_PASSWORD_ERROR(false, BAD_REQUEST.value(), "비밀번호를 입력해주세요."),
    SOCIAL_LOGIN_ERROR(false, BAD_REQUEST.value(), "소셜 로그인 오류입니다."),

    /**
     * Notification
     */
    NOTIFICATION_NOT_FOUND_ERROR(false, HttpStatus.NOT_FOUND.value(), "알림 정보를 찾을 수 없습니다."),
    NOTIFICATION_USER_NOT_MATCHED_ERROR(false, HttpStatus.BAD_REQUEST.value(), "해당 유저의 알림이 아닙니다."),

    /**
     * Payment
     */
    PAYMENT_ERROR(false, HttpStatus.BAD_REQUEST.value(), "결제에 실패하였습니다."),
    CANCELED_BY_USER(false, BAD_REQUEST.value(), "유저에 의해 취소된 주문입니다."),
    INVALID_PG_ENCRYPTION(false, HttpStatus.INTERNAL_SERVER_ERROR.value(), "PG 암호화 정보가 일치하지 않습니다."),
    NOT_REGULAR_TYPE(false, BAD_REQUEST.value(), "정기 결제 상품이 아닙니다."),
    ADDITIONAL_PAYMENT_REQUIRED(false, BAD_REQUEST.value(), "추가 결제가 필요합니다."),
    PAYMENT_NOT_FOUND(false, NOT_FOUND.value(), "결제 정보를 찾을 수 없습니다."),
    NOT_UNPAID_SUBSCRIPTION_PAYMENT(false, NOT_FOUND.value(), "미납 구독을 갱신할 수 없는 결제 건 입니다."),
    PAYMENT_IS_NOT_PENDING(false, BAD_REQUEST.value(), "결제 대기 상태가 아닙니다."),

    /**
     * User
     */
    USER_NOT_FOUND(false, HttpStatus.NOT_FOUND.value(), "일치하는 유저가 없습니다."),
    USER_EMAIL_OR_PASSWORD_NOT_FOUND(
            false, HttpStatus.NOT_FOUND.value(), "이메일 또는 비밀번호가 / 올바르지 않아요"),
    USER_CARD_NOT_FOUND(false, HttpStatus.NOT_FOUND.value(), "카드 정보를 찾을 수 없습니다."),
    TOO_MANY_CARDS(false, HttpStatus.NOT_FOUND.value(), "등록 가능한 카드 개수를 초과했어요."),
    DUPLICATED_CARD_NICKNAME(false, HttpStatus.BAD_REQUEST.value(), "이미 등록된 별명이에요."),
    DUPLICATED_CARD(false, HttpStatus.BAD_REQUEST.value(), "카드가 이미 등록되었어요."),
    WITHDRAWAL_REASON_NOT_FOUND(false, HttpStatus.NOT_FOUND.value(), "일치하는 탈퇴사유가 없습니다."),
    AWAKE_USER(false, HttpStatus.BAD_REQUEST.value(), "휴면처리 되지 않은 유저입니다."),
    VERIFICATION_CODE_NOT_FOUND(false, NOT_FOUND.value(), "인증번호가 존재하지 않습니다."),
    WRONG_VERIFICATION_CODE(false, HttpStatus.BAD_REQUEST.value(), "인증번호가 일치하지 않습니다."),
    VERIFICATION_CODE_EXPIRED(false, HttpStatus.BAD_REQUEST.value(), "만료된 인증번호 입니다."),
    DIFFERENT_EMAIL_PHONE_NUMBER(false, HttpStatus.BAD_REQUEST.value(), "해당 계정의 핸드폰번호가 아닙니다."),
    USER_NOT_CERTIFICATED(false, HttpStatus.BAD_REQUEST.value(), "본인인증이 필요합니다."),

    /**
     * WebSocket / Callback
     * */
    WS_CONTEXT_NOT_FOUND(false, NOT_FOUND.value(), "세션 컨텍스트를 찾을 수 없습니다."),
    WS_SESSION_NOT_FOUND(false, NOT_FOUND.value(), "WebSocket 세션을 찾을 수 없습니다."),

    /**
     * Term
     */
    TERM_NOT_FOUND(false, HttpStatus.NOT_FOUND.value(), "약관 정보를 찾을 수 없습니다."),

    /**
     * Maintenance
     */
    MAINTENANCE_NOT_FOUND(false, HttpStatus.NOT_FOUND.value(), "서버 점검 여부를 찾을 수 없습니다."),
    MAINTENANCE_ALREADY_EXISTS(false, HttpStatus.BAD_REQUEST.value(), "서버 점검이 이미 설정되어있습니다."),
    MAINTENANCE_IN_PROGRESS(false, HttpStatus.NON_AUTHORITATIVE_INFORMATION.value(), "서버 점검중입니다."),

    /**
     * 500 : Database, Server 오류
     */
    DATABASE_ERROR(false, HttpStatus.INTERNAL_SERVER_ERROR.value(), "데이터베이스 연결에 실패하였습니다."),
    SERVER_ERROR(false, HttpStatus.INTERNAL_SERVER_ERROR.value(), "서버와의 연결에 실패하였습니다."),
    PASSWORD_ENCRYPTION_ERROR(
            false, HttpStatus.INTERNAL_SERVER_ERROR.value(), "비밀번호 암호화에 실패하였습니다."),
    PASSWORD_DECRYPTION_ERROR(
            false, HttpStatus.INTERNAL_SERVER_ERROR.value(), "비밀번호 복호화에 실패하였습니다."),

    MODIFY_FAIL_USERNAME(false, HttpStatus.INTERNAL_SERVER_ERROR.value(), "유저네임 수정 실패"),
    DELETE_FAIL_USERNAME(false, HttpStatus.INTERNAL_SERVER_ERROR.value(), "유저 삭제 실패"),
    MODIFY_FAIL_MEMO(false, HttpStatus.INTERNAL_SERVER_ERROR.value(), "메모 수정 실패"),

    UNEXPECTED_ERROR(false, HttpStatus.INTERNAL_SERVER_ERROR.value(), "예상치 못한 에러가 발생했습니다."),

    /**
     * Global
     */
    EMPTY_JWT(false, HttpStatus.UNAUTHORIZED.value(), "JWT를 입력해주세요."),
    INVALID_JWT(false, HttpStatus.UNAUTHORIZED.value(), "유효하지 않은 JWT입니다."),
    EXPIRED_JWT(false, HttpStatus.UNAUTHORIZED.value(), "자동로그인이 만료되었어요."),
    DATE_FORMAT_ERROR(false, BAD_REQUEST.value(), "날짜 입력 형식을 맞춰주세요. (yyyy-MM-dd)"),
    DATE_MONTH_FORMAT_ERROR(false, BAD_REQUEST.value(), "날짜 입력 형식을 맞춰주세요. (yyyy-MM)"),
    S3_ERROR(false, BAD_REQUEST.value(), "이미지 저장 url 생성 과정에서 에러가 발생했습니다."),
    REQUEST_IS_ALREADY_BEING_PROCESSED_ERROR(false, BAD_REQUEST.value(), "해당 요청이 이미 처리중입니다."),
    GET_LOCKING_ERROR(false, BAD_REQUEST.value(), "락 획득 중 에러가 발생했습니다."),
    LOCK_NOT_FOUND_ERROR(false, BAD_REQUEST.value(), "락이 존재하지 않습니다."),
    RELEASE_LOCKING_ERROR(false, BAD_REQUEST.value(), "현재 쓰레드에서 획득한 잠금이 아니므로 락 해제가 불가능합니다."),
    FILE_FAIL_UPLOAD(false,BAD_REQUEST.value() ,"파일 저장에 실패하였습니다" );

    private final boolean isSuccess;
    private final int code;
    private final String message;

    private BaseResponseStatus(boolean isSuccess, int code, String message) {
        this.isSuccess = isSuccess;
        this.code = code;
        this.message = message;
    }
}
