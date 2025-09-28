package org.example.speaknotebackend.controller;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.example.speaknotebackend.config.UserDetailsImpl;
import org.example.speaknotebackend.service.FileService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.time.Instant;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileController {

    private final FileService fileService;

    @PatchMapping("/{id}/name")
    public ResponseEntity<FileResponse> renameFile(
            @PathVariable Long id,
            @Valid @RequestBody RenameRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails
            ) {
        FileResponse res = fileService.renameFileName(id, request.name());
        return ResponseEntity.ok(res);
    }

    // Request DTO
    public record RenameRequest(
            @NotBlank String name
    ) {}

    // Response DTO
    public record FileResponse(
            Long id,
            String name
    ) {}
}
