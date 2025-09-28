package org.example.speaknotebackend.service;

import lombok.RequiredArgsConstructor;
import org.example.speaknotebackend.domain.repository.LectureHistoryProjection;
import org.example.speaknotebackend.domain.repository.LectureRepository;
import org.example.speaknotebackend.dto.LectureHistoryFilter;
import org.example.speaknotebackend.dto.LectureHistoryItem;
import org.example.speaknotebackend.dto.PagedResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LectureHistoryService {
    private final LectureRepository lectureRepo;


    public PagedResponse<LectureHistoryItem> getHistory(Long userId, LectureHistoryFilter f, Pageable pageable) {
        Page<LectureHistoryProjection> page = lectureRepo.searchHistory(userId, f, pageable);

        List<LectureHistoryItem> items = page.getContent().stream().map(p -> {
            Long duration = null;
            if (p.getStartedAt() != null && p.getEndedAt() != null) {
                duration = Duration.between(p.getStartedAt(), p.getEndedAt()).toMinutes();
            }
            List<String> tagList = p.getTags() == null ? List.of()
                    : Arrays.stream(p.getTags().split("\\s*,\\s*")).filter(s -> !s.isBlank()).toList();

            return new LectureHistoryItem(
                    p.getLectureId(), p.getLectureName(), p.getSummary(),
                    tagList, p.getLanguage(),
                    p.getStartedAt(), p.getEndedAt(), duration,
                    p.getUpdatedAt(), p.getStatus(),
                    new LectureHistoryItem.FolderBrief(p.getFolderId(), p.getFolderName()),
                    new LectureHistoryItem.FileBrief(p.getFileId(), p.getFileName(), p.getUuid())
            );
        }).toList();

        return new PagedResponse<>(
                page.getNumber(), page.getSize(), page.getTotalElements(), page.getTotalPages(), items
        );
    }
}
