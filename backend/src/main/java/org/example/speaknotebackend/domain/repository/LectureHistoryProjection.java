package org.example.speaknotebackend.domain.repository;

import org.example.speaknotebackend.entity.BaseEntity;

import java.time.LocalDateTime;

public interface LectureHistoryProjection {
    Long getLectureId();
    String getLectureName();
    String getSummary();
    String getTags(); // "웹 개발,알고리즘" 형태면 서비스에서 split
    String getLanguage();
    LocalDateTime getStartedAt();
    LocalDateTime getEndedAt();
    LocalDateTime getUpdatedAt();
    BaseEntity.Status getStatus();
    Long getFolderId();
    String getFolderName();
    Long getFileId();
    String getFileName();
    String getUuid();
}
