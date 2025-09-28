package org.example.speaknotebackend.dto;


import org.example.speaknotebackend.entity.BaseEntity;
import java.time.LocalDateTime;
import java.util.List;

public record LectureHistoryItem(
        Long lectureId, String lectureName, String summary,
        List<String> tags, String language,
        LocalDateTime startedAt, LocalDateTime endedAt, Long durationMinutes,
        LocalDateTime updatedAt, BaseEntity.Status status,
        FolderBrief folder, FileBrief file
) {
    public static record FolderBrief(Long id, String name) {}
    public static record FileBrief(Long id, String fileName, String uuid) {}
}
