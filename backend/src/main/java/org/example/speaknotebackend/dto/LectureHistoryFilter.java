package org.example.speaknotebackend.dto;


import org.example.speaknotebackend.entity.BaseEntity;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;

public record LectureHistoryFilter(
        String q, Long folderId, BaseEntity.Status status,
        LocalDateTime from, LocalDateTime to, List<String> tags,
        boolean withAnno
) {}

