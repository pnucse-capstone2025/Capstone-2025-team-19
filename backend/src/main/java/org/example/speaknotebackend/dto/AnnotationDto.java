package org.example.speaknotebackend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AnnotationDto {
    private String text;
    private float x;
    private float y;
    private int pageNumber;
}
