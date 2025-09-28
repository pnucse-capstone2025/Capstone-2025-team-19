package org.example.speaknotebackend.domain.repository;


import org.example.speaknotebackend.entity.LectureFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface LectureFileRepository extends JpaRepository<LectureFile, Long> {
    @Query("""
          select lf
          from Lecture l
          join l.lectureFile lf
          where lf.id = :fileId and l.user.id = :userId
    """)
    Optional<LectureFile> findByIdAndOwner(@Param("fileId") Long fileId,
                                           @Param("userId") Long userId);

    Optional<LectureFile> findById(Long fileId);

}
