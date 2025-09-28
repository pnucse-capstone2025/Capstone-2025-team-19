package org.example.speaknotebackend.service;

import lombok.RequiredArgsConstructor;
import org.example.speaknotebackend.domain.repository.FileAnnotationRepository;
import org.example.speaknotebackend.domain.repository.LectureFileRepository;
import org.example.speaknotebackend.domain.repository.LectureRepository;
import org.example.speaknotebackend.dto.AnnotationVersionItem;
import org.example.speaknotebackend.dto.AnnotationVersionListResponse;
import org.example.speaknotebackend.dto.FileAnnotationResponse;
import org.example.speaknotebackend.entity.Lecture;
import org.example.speaknotebackend.entity.LectureFile;
import org.example.speaknotebackend.mongo.annotation.FileAnnotationDoc;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import static org.springframework.http.HttpStatus.*;

@Service
@RequiredArgsConstructor
public class FileAnnotationQueryService {

    private final LectureFileRepository lectureFileRepository;
    private final FileAnnotationRepository annotationRepo;

    public FileAnnotationResponse getFileWithAnnotations(Long fileId, Long userId, Integer versionOpt) {
        // 1) 파일 권한 검증
//        LectureFile file = lectureFileRepository.findByIdAndOwner(fileId, userId)
          LectureFile file = lectureFileRepository.findById(fileId)
                .orElseThrow(() -> new ResponseStatusException(FORBIDDEN, "접근 권한이 없습니다."));

        // 2) 버전 선택
        FileAnnotationDoc doc = (versionOpt == null)
                ? annotationRepo.findTopByFileIdAndUserIdOrderByVersionDesc(fileId, userId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "주석 스냅샷이 없습니다."))
                : annotationRepo.findByFileIdAndUserIdAndVersion(fileId, userId, versionOpt)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "해당 버전의 주석이 없습니다."));

        // 3) latest 여부
        boolean latest = annotationRepo.findTopByFileIdAndUserIdOrderByVersionDesc(fileId, userId)
                .map(top -> top.getVersion().equals(doc.getVersion()))
                .orElse(false);

        // 4) 파일 URL (이미 publicUrl 있으면 그대로, 아니면 사전서명 생성 로직 연결)
        String fileUrl = file.getFileUrl()+"/"+file.getUuid()+"_"+file.getFileName(); // 필요 시 별도 SignedUrlService 통해 생성

        // 5) 매핑
        return mapToResponse(file, doc, latest);
    }

    /** 파일의 버전 목록 조회 (최신 → 과거) */
    public AnnotationVersionListResponse listVersions(Long fileId, Long userId) {
        // 파일 권한 체크
//        lectureFileRepository.findByIdAndOwner(fileId, userId)
        LectureFile file = lectureFileRepository.findById(fileId)
                .orElseThrow(() -> new ResponseStatusException(FORBIDDEN, "접근 권한이 없습니다."));

        List<FileAnnotationDoc> docs = annotationRepo.findByFileIdAndUserIdOrderByVersionDesc(fileId, userId);

        List<AnnotationVersionItem> items = docs.stream()
                .map(d -> AnnotationVersionItem.builder()
                        .version(d.getVersion())
                        .createdAt(d.getCreatedAt())
                        .updatedAt(d.getUpdatedAt())
                        .build())
                .toList();

        return AnnotationVersionListResponse.builder()
                .fileId(fileId)
                .count(items.size())
                .versions(items)
                .build();
    }
    private FileAnnotationResponse mapToResponse(LectureFile f, FileAnnotationDoc d, boolean latest) {
        Lecture lecture = lectureRepository.findByLectureFile_Id(f.getId());
        return FileAnnotationResponse.builder()
                .fileId(f.getId())
                .fileName(lecture.getLectureName())
                .fileUrl(f.getFileUrl()+"/"+f.getUuid()+"_"+f.getFileName())      // 바로 react-pdf/pdf.js에 넣으면 됨
                .snapshotCreatedAt(d.getCreatedAt())
                .version(d.getVersion())
                .latest(latest)
                .slides(
                        d.getSlides() == null ? List.of() :
                                d.getSlides().stream().map(s ->
                                        FileAnnotationResponse.SlideDto.builder()
                                                .pageNumber(s.getPageNumber())
                                                .annotations(
                                                        (s.getAnnotations() == null ? List.<FileAnnotationDoc.Anno>of() : s.getAnnotations())
                                                                .stream()
                                                                .map(a -> FileAnnotationResponse.AnnoDto.builder()
                                                                        .id(a.getId())
                                                                        .text(a.getText())
                                                                        .payload(a.getPayload())
                                                                        .position(new FileAnnotationResponse.Pos(
                                                                                a.getPosition().getX(), a.getPosition().getY()))
                                                                        .size(new FileAnnotationResponse.Size(
                                                                                a.getSize().getWidth(), a.getSize().getHeight()))
                                                                        .source(a.getSource().name())
                                                                        .order(a.getOrder())
                                                                        .createdAt(a.getCreatedAt())
                                                                        .updatedAt(a.getUpdatedAt())
                                                                        .answerState(a.getAnswerState())
                                                                        .build()
                                                                ).toList()
                                                )
                                                .build()
                                ).toList()
                )
                .build();
    }

    private final LectureRepository lectureRepository;
}

