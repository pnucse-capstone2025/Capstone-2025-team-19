package org.example.speaknotebackend.domain.repository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import lombok.RequiredArgsConstructor;
import org.example.speaknotebackend.dto.LectureHistoryFilter;
import org.example.speaknotebackend.entity.BaseEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.*;

/**
 * JPQL 기반 동적 쿼리 구현.
 * - lecture l
 *   left join l.folder f
 *   left join l.lectureFile lf
 * - 모든 조회는 l.userId = :userId 로 스코프 제한
 */
@Repository
@RequiredArgsConstructor
public class LectureHistoryCustomImpl implements LectureHistoryCustom {

    private final EntityManager em;

    @Override
    public Page<LectureHistoryProjection> searchHistory(Long userId, LectureHistoryFilter f, Pageable pageable) {
        Objects.requireNonNull(userId, "userId is required");

        List<String> wheres = new ArrayList<>();
        Map<String, Object> params = new HashMap<>();

        wheres.add("l.user.id = :userId");
        params.put("userId", userId);

        // ✅ 여기 추가: status 고정 필터
        wheres.add("l.status = :onlyStatus");
        params.put("onlyStatus", BaseEntity.Status.ACTIVE); // ← enum일 때
        // params.put("onlyStatus", true);                  // ← boolean일 때

        if (f != null) {
            if (f.folderId() != null) {
                wheres.add("l.folder.id = :folderId");
                params.put("folderId", f.folderId());
            }
            // f.status() 조건은 더 이상 받지 않음 (항상 ACTIVE만)
            if (f.from() != null) { wheres.add("l.startedAt >= :from"); params.put("from", f.from()); }
            if (f.to() != null)   { wheres.add("l.startedAt < :to");   params.put("to",   f.to());   }
            if (f.q() != null && !f.q().isBlank()) {
                wheres.add("(l.lectureName like :q OR l.summary like :q OR l.tags like :q)");
                params.put("q", "%" + f.q().trim() + "%");
            }
            if (f.tags() != null && !f.tags().isEmpty()) {
                List<String> tagConds = new ArrayList<>();
                int idx = 0;
                for (String tag : f.tags()) {
                    if (tag == null || tag.isBlank()) continue;
                    String key = "tag" + (idx++);
                    tagConds.add("l.tags LIKE :" + key);
                    params.put(key, "%" + tag.trim() + "%");
                }
                if (!tagConds.isEmpty()) {
                    wheres.add("(" + String.join(" OR ", tagConds) + ")");
                }
            }
        }

        String whereClause = wheres.isEmpty() ? "" : (" WHERE " + String.join(" AND ", wheres));
        String orderBy = buildOrderBy(pageable);

        String select =
                "SELECT new org.example.speaknotebackend.domain.repository.LectureHistoryCustomImpl$Row(" +
                        " l.id, l.lectureName, l.summary, l.tags, l.language, " +
                        " l.startedAt, l.endedAt, l.updatedAt, l.status, " +
                        " f.id, f.name, lf.id, lf.fileName, lf.uuid) " +
                        "FROM Lecture l " +
                        "LEFT JOIN l.folder f " +
                        "LEFT JOIN l.lectureFile lf";

        String jpql = select + whereClause + orderBy;

        TypedQuery<Row> dataQuery = em.createQuery(jpql, Row.class);
        params.forEach(dataQuery::setParameter);
        dataQuery.setFirstResult((int) pageable.getOffset());
        dataQuery.setMaxResults(pageable.getPageSize());
        List<Row> rows = dataQuery.getResultList();

        String countJpql = "SELECT COUNT(l) FROM Lecture l LEFT JOIN l.folder f " + whereClause;
        TypedQuery<Long> countQuery = em.createQuery(countJpql, Long.class);
        params.forEach(countQuery::setParameter);
        long total = countQuery.getSingleResult();

        List<LectureHistoryProjection> items = new ArrayList<>(rows);
        return new PageImpl<>(items, pageable, total);
    }

    private String buildOrderBy(Pageable pageable) {
        if (pageable == null || pageable.getSort().isUnsorted()) {
            return " ORDER BY l.updatedAt DESC";
        }
        // 허용 컬럼 화이트리스트 (보안/안정성)
        Set<String> allowed = Set.of(
                "updatedAt","startedAt","endedAt","lectureName","status"
        );

        List<String> clauses = new ArrayList<>();
        for (Sort.Order o : pageable.getSort()) {
            String prop = o.getProperty();
            if (!allowed.contains(prop)) continue; // 허용되지 않은 필드는 무시
            String dir = o.isAscending() ? "ASC" : "DESC";
            clauses.add("l." + prop + " " + dir);
        }
        if (clauses.isEmpty()) {
            clauses.add("l.updatedAt DESC");
        }
        return " ORDER BY " + String.join(", ", clauses);
    }

    /**
     * JPQL new 구문으로 바로 매핑되는 row.
     * 이 클래스가 LectureHistoryProjection 인터페이스를 구현하여
     * 컨트롤러/서비스에서는 Projection 타입으로 사용 가능.
     */
    public static class Row implements LectureHistoryProjection {
        private final Long lectureId;
        private final String lectureName;
        private final String summary;
        private final String tags;
        private final String language;
        private final LocalDateTime startedAt;
        private final LocalDateTime endedAt;
        private final LocalDateTime updatedAt;
        private final BaseEntity.Status status;
        private final Long folderId;
        private final String folderName;
        private final Long fileId;
        private final String fileName;
        private final String uuid;

        public Row(Long lectureId, String lectureName, String summary, String tags, String language,
                   LocalDateTime startedAt, LocalDateTime endedAt, LocalDateTime updatedAt, BaseEntity.Status status,
                   Long folderId, String folderName, Long fileId, String fileName, String uuid) {
            this.lectureId = lectureId;
            this.lectureName = lectureName;
            this.summary = summary;
            this.tags = tags;
            this.language = language;
            this.startedAt = startedAt;
            this.endedAt = endedAt;
            this.updatedAt = updatedAt;
            this.status = status;
            this.folderId = folderId;
            this.folderName = folderName;
            this.fileId = fileId;
            this.fileName = fileName;
            this.uuid = uuid;
        }

        @Override public Long getLectureId() { return lectureId; }
        @Override public String getLectureName() { return lectureName; }
        @Override public String getSummary() { return summary; }
        @Override public String getTags() { return tags; }
        @Override public String getLanguage() { return language; }
        @Override public LocalDateTime getStartedAt() { return startedAt; }
        @Override public LocalDateTime getEndedAt() { return endedAt; }
        @Override public LocalDateTime getUpdatedAt() { return updatedAt; }
        @Override public BaseEntity.Status getStatus() { return status; }
        @Override public Long getFolderId() { return folderId; }
        @Override public String getFolderName() { return folderName; }
        @Override public Long getFileId() { return fileId; }
        @Override public String getFileName() { return fileName; }
        @Override public String getUuid() { return uuid; }
    }
}
