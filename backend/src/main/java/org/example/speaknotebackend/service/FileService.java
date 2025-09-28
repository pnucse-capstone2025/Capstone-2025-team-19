package org.example.speaknotebackend.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.example.speaknotebackend.controller.FileController;
import org.example.speaknotebackend.domain.repository.LectureRepository;
import org.example.speaknotebackend.entity.Lecture;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class FileService {
    private final LectureRepository lectureRepository;

    @Transactional
    public FileController.FileResponse renameFileName(Long id, String newName) {
        Lecture lecture = lectureRepository.findByLectureFile_Id(id);
        lecture.setLectureName(newName);
        lecture.setEndedAt(LocalDateTime.now());

        return new FileController.FileResponse(lecture.getId(), lecture.getLectureName());
    }
}
