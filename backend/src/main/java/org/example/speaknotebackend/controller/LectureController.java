package org.example.speaknotebackend.controller;


import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.example.speaknotebackend.common.exceptions.BaseException;
import org.example.speaknotebackend.common.response.BaseResponse;
import org.example.speaknotebackend.common.response.BaseResponseStatus;
import org.example.speaknotebackend.config.UserDetailsImpl;
import org.example.speaknotebackend.service.LectureService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import static org.example.speaknotebackend.common.response.BaseResponseStatus.SUCCESS;

@RestController
@RequestMapping("/api/lectures")
@RequiredArgsConstructor
public class LectureController {
    private final LectureService lectureService;

    @PatchMapping("/{id}/name")
    public ResponseEntity<LectureController.FileResponse> renameFile(
            @PathVariable Long id,
            @Valid @RequestBody LectureController.RenameRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails
    ) {
        LectureController.FileResponse res = lectureService.renamelectureName(id, request.name());
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

//    public BaseResponse<Void> deleteFolder(
//            @PathVariable Long folderId,
//            @AuthenticationPrincipal UserDetailsImpl user
//    ) {
//        if (user == null) {
//            throw new BaseException(BaseResponseStatus.INVALID_USER_JWT);
//        }
//
//        folderService.deleteFolder(user.getUserId(), folderId);
//        return new BaseResponse<>(SUCCESS);
//    }
    @DeleteMapping("/{id}/delete")
    public BaseResponse<Void> deleteFolder(
            @Valid @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl user
    ) {
        if (user == null) {
            throw new BaseException(BaseResponseStatus.INVALID_USER_JWT);
        }

        lectureService.deleteLecture(user.getUserId(),id);

        return new BaseResponse<>(SUCCESS);
    }
}
