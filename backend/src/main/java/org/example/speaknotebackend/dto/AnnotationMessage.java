package org.example.speaknotebackend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AnnotationMessage {
    private String text;
    private int pageNumber;
    private float x;
    private float y;
}
