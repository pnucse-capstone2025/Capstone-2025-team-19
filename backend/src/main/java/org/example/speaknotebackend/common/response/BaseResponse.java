package org.example.speaknotebackend.common.response;


import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.example.speaknotebackend.common.exceptions.ErrorField;
import org.springframework.validation.BindingResult;

import java.util.List;

import static org.example.speaknotebackend.common.response.BaseResponseStatus.SUCCESS;

@Getter
@AllArgsConstructor
@JsonPropertyOrder({"isSuccess", "code", "message", "result"})
public class BaseResponse<T> {
    @JsonProperty("isSuccess")
    private final Boolean isSuccess;

    private final String message;
    private final int code;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private T result;

    @Schema(hidden = true)
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private List<ErrorField> errors;

    // 요청에 성공한 경우
    public BaseResponse(T result) {
        this.isSuccess = SUCCESS.isSuccess();
        this.message = SUCCESS.getMessage();
        this.code = SUCCESS.getCode();
        this.result = result;
    }

    // 요청에 실패한 경우
    public BaseResponse(BaseResponseStatus status) {
        this.isSuccess = status.isSuccess();
        this.message = status.getMessage();
        this.code = status.getCode();
    }

    // 요청에 실패한 경우
    public BaseResponse(BaseResponseStatus status, String message) {
        this.isSuccess = status.isSuccess();
        this.message = message;
        this.code = status.getCode();
    }

    // 요청에 실패한 경우
    public BaseResponse(BaseResponseStatus status, T data) {
        this.isSuccess = status.isSuccess();
        this.message = status.getMessage();
        this.code = status.getCode();
        this.result = data;
    }

    // 요청 필드 에러
    public BaseResponse(BaseResponseStatus status, BindingResult bindingResult) {
        this.isSuccess = false;
        this.code = status.getCode();
        this.message = bindingResult.getFieldErrors().get(0).getDefaultMessage();
        this.errors = ErrorField.of(bindingResult);
    }

    public static <T> BaseResponse<T> from(T result) {
        return new BaseResponse<>(result);
    }
}