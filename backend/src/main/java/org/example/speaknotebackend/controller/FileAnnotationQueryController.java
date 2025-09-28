package org.example.speaknotebackend.controller;


import lombok.RequiredArgsConstructor;
import org.example.speaknotebackend.config.UserDetailsImpl;
import org.example.speaknotebackend.domain.repository.LectureFileRepository;
import org.example.speaknotebackend.domain.repository.LectureRepository;
import org.example.speaknotebackend.dto.AnnotationVersionListResponse;
import org.example.speaknotebackend.dto.FileAnnotationResponse;
import org.example.speaknotebackend.entity.Lecture;
import org.example.speaknotebackend.entity.LectureFile;
import org.example.speaknotebackend.service.FileAnnotationQueryService;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping(value = "/api/files", produces = MediaType.APPLICATION_JSON_VALUE)
@RequiredArgsConstructor
public class FileAnnotationQueryController {

    private final FileAnnotationQueryService service;
    private final LectureFileRepository lectureFileRepository;

    /** 최신 또는 특정 버전 주석 + 파일 메타 조회 */
    @GetMapping("/{fileId}/annotations")
    public FileAnnotationResponse getFileAnnotations(
            @PathVariable Long fileId,
            @RequestParam(required = false) Integer version,
            @AuthenticationPrincipal UserDetailsImpl user
    ) {
        return service.getFileWithAnnotations(fileId, user.getUserId(), version);
    }

    /** 버전 목록 조회 (최근 → 과거) */
    @GetMapping("/{fileId}/annotation-versions")
    public AnnotationVersionListResponse listAnnotationVersions(
            @PathVariable Long fileId,
            @AuthenticationPrincipal UserDetailsImpl user
    ) {
        return service.listVersions(fileId, user.getUserId());
    }


    @GetMapping("/{fileId}/content")
    public ResponseEntity<Resource> getFileContent(
            @PathVariable Long fileId,
            @AuthenticationPrincipal UserDetailsImpl user
    ) {
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.");
        }

//        LectureFile file = lectureFileRepository.findByIdAndOwner(fileId, user.getUserId())
        LectureFile file = lectureFileRepository.findById(fileId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "접근 권한이 없습니다."));

        Lecture lecture = lectureRepository.findByLectureFile_Id(fileId);

        // 예시: file.getFileUrl()이 로컬 경로나 S3 키일 수 있음
        // 1) 로컬 파일일 때 (예: /data/uploads/xxx.pdf)
        Path p = Paths.get(file.getFileUrl()+"/"+file.getUuid()+"_"+file.getFileName()); // 로컬 경로라고 가정
        if (!Files.exists(p)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "파일을 찾을 수 없습니다.");
        }

        try {
            InputStream is = Files.newInputStream(p);
            InputStreamResource body = new InputStreamResource(is);
            String filename = lecture.getLectureName() != null ? file.getFileName() : ("file-" + file.getId() + ".pdf");

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_PDF)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                    .body(body);
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "파일 읽기 실패");
        }
    }

    private final LectureRepository lectureRepository;
}
