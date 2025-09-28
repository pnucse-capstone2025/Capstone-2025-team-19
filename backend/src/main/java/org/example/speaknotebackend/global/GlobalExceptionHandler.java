package org.example.speaknotebackend.global;

import lombok.extern.slf4j.Slf4j;
import org.example.speaknotebackend.common.exceptions.BaseException;
import org.example.speaknotebackend.common.response.BaseResponse;
import org.example.speaknotebackend.common.response.BaseResponseStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import io.swagger.v3.oas.annotations.Hidden;

@Hidden
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    // 알 수 없는 에러에 대한 에러 처리
    @ExceptionHandler(Exception.class)
    public ResponseEntity<BaseResponse<Void>> handleOthers(Exception e) {
        return ResponseEntity
                .status(BaseResponseStatus.UNEXPECTED_ERROR.getCode())
                .body(new BaseResponse<>(BaseResponseStatus.UNEXPECTED_ERROR));
    }


    // BaseException 예외 처리
    @ExceptionHandler(BaseException.class)
    public BaseResponse<BaseResponseStatus> handleBaseException(BaseException e) {
        return new BaseResponse(e.getStatus(), e.getData());
    }

    // 유효성 검사 예외 처리
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public BaseResponse<?> handleValidation(MethodArgumentNotValidException e) {
        return new BaseResponse<>(BaseResponseStatus.INVALID_FIELD_VALUE, e.getBindingResult());
    }

    // 사용자 인증 예외
    @ExceptionHandler({BadCredentialsException.class, AccessDeniedException.class})
    public BaseResponse<?> handleAuth(Exception e) {
        return new BaseResponse<>(BaseResponseStatus.INVALID_USER_JWT, e.getMessage());
    }
}


