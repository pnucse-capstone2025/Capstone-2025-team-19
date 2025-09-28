package org.example.speaknotebackend.domain.repository;

import org.example.speaknotebackend.dto.LectureHistoryFilter;
import org.example.speaknotebackend.entity.Lecture;
import org.example.speaknotebackend.entity.LectureFile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.Optional;

public interface LectureRepository extends JpaRepository<Lecture,Long>, LectureHistoryCustom {

    Lecture findByLectureFile_Id(Long fileId);

    // 추가: Lecture ID로 LectureFile 가져오기
    @Query("select l.lectureFile from Lecture l where l.id = :lectureId")
    Optional<LectureFile> findLectureFileByLectureId(@Param("lectureId") Long lectureId);}
