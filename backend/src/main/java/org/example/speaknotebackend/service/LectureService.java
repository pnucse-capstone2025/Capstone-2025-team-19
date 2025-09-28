package org.example.speaknotebackend.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.example.speaknotebackend.common.exceptions.BaseException;
import org.example.speaknotebackend.common.response.BaseResponseStatus;
import org.example.speaknotebackend.controller.FileController;
import org.example.speaknotebackend.controller.LectureController;
import org.example.speaknotebackend.domain.repository.LectureFileRepository;
import org.example.speaknotebackend.domain.repository.LectureRepository;
import org.example.speaknotebackend.entity.Lecture;
import org.example.speaknotebackend.entity.LectureFile;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@RequiredArgsConstructor
@Service
public class LectureService {

    private final LectureRepository lectureRepository;

    @Transactional
    public LectureController.FileResponse renamelectureName(Long id, String newName) {
        System.out.println(id);
        System.out.println(newName);

        Lecture lecture = lectureRepository.findById(id)
                .orElseThrow(()->new BaseException(BaseResponseStatus.LECTURE_NOT_FOUND));
        lecture.setLectureName(newName);
        lecture.setEndedAt(LocalDateTime.now());

        return new LectureController.FileResponse(lecture.getId(), lecture.getLectureName());
    }

    // lecture , file 모두 비활성화
    @Transactional
    public void deleteLecture(Long userId, Long lectureId) {
        Lecture lecture = lectureRepository.findById(lectureId)
                .orElseThrow(()->new BaseException(BaseResponseStatus.LECTURE_NOT_FOUND));
        lecture.delete();
        LectureFile lectureFile = lectureRepository.findLectureFileByLectureId(lectureId)
                .orElseThrow(()->new BaseException(BaseResponseStatus.FILE_FAIL_UPLOAD));
        lectureFile.delete();
    }
}
