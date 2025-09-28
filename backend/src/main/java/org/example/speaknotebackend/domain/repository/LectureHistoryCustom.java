package org.example.speaknotebackend.domain.repository;

import org.example.speaknotebackend.dto.LectureHistoryFilter;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface LectureHistoryCustom {
    Page<LectureHistoryProjection> searchHistory(Long userId, LectureHistoryFilter f, Pageable pageable);
}
