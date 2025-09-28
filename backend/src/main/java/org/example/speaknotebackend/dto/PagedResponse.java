package org.example.speaknotebackend.dto;


import java.util.List;

public record PagedResponse<T>(
        int page, int size, long totalElements, int totalPages, List<T> items
) {}
