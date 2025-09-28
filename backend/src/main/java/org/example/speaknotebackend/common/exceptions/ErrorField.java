package org.example.speaknotebackend.common.exceptions;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;

import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

/** method argument exception 의 필드 오류를 설명하는 클래스 */
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class ErrorField {
    private String field;

    private String value;

    private String reason;

    public static List<ErrorField> of(BindingResult bindingResult) {
        try {
            return bindingResult.getAllErrors().stream()
                    .map(
                            error -> {
                                FieldError fieldError = (FieldError) error;

                                return new ErrorField(
                                        fieldError.getField(),
                                        Objects.toString(fieldError.getRejectedValue()),
                                        fieldError.getDefaultMessage());
                            })
                    .collect(Collectors.toList());
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }
}
