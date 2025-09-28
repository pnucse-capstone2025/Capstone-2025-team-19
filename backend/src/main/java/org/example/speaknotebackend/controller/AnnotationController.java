package org.example.speaknotebackend.controller;

import lombok.RequiredArgsConstructor;
import org.example.speaknotebackend.config.UserDetailsImpl;
import org.example.speaknotebackend.domain.repository.FileAnnotationRepository;
import org.example.speaknotebackend.dto.SnapshotRequest;
import org.example.speaknotebackend.dto.SnapshotResponse;
import org.example.speaknotebackend.mongo.annotation.FileAnnotationDoc;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/annotations")
public class AnnotationController {

    private final FileAnnotationRepository repo;

    @GetMapping
    public ResponseEntity<?> getLatest(@RequestParam Long fileId) {
        return repo.findFirstByFileIdOrderByVersionDesc(fileId)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.ok(Map.of(
                        "fileId", fileId, "version", 0, "slides", List.of()
                )));
    }

    @PostMapping("/snapshot")
    public SnapshotResponse saveSnapshot(@RequestBody SnapshotRequest req,
                                         @AuthenticationPrincipal UserDetailsImpl userDetails) {
        int nextVersion = repo.findFirstByFileIdAndUserIdOrderByVersionDesc(req.getFileId(), userDetails.getUserId())
                .map(FileAnnotationDoc::getVersion).orElse(0) + 1;

        Instant now = Instant.now();

        List<FileAnnotationDoc.Slide> slides = req.getSlides().stream().map(s -> {
            List<FileAnnotationDoc.Anno> annos = s.getAnnotations().stream().map(a ->
                    FileAnnotationDoc.Anno.builder()
                            .id(a.getId())
                            .text(a.getText())
                            .position(new FileAnnotationDoc.Position(a.getX(), a.getY()))
                            .size(new FileAnnotationDoc.Size(a.getW(), a.getH()))
                            .source(FileAnnotationDoc.Source.valueOf(a.getSource()))
                            .answerState(a.getAnswerState())
                            .order(a.getOrder())
                            .createdAt(now)
                            .updatedAt(now)
                            .build()
            ).toList();
            return FileAnnotationDoc.Slide.builder()
                    .pageNumber(s.getPageNumber())
                    .annotations(annos)
                    .build();
        }).toList();

        FileAnnotationDoc doc = FileAnnotationDoc.builder()
                .fileId(req.getFileId())
                .userId(userDetails.getUserId())
                .version(nextVersion)
                .slides(slides)
                .build();

        repo.save(doc);
        return new SnapshotResponse(true, nextVersion);
    }
}
