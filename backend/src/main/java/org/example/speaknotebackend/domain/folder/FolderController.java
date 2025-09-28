package org.example.speaknotebackend.domain.folder;

import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.example.speaknotebackend.common.exceptions.BaseException;
import org.example.speaknotebackend.common.response.BaseResponse;
import org.example.speaknotebackend.common.response.BaseResponseStatus;
import org.example.speaknotebackend.domain.folder.model.CreateFolderRequest;
import org.example.speaknotebackend.config.UserDetailsImpl;
import org.example.speaknotebackend.domain.folder.model.GetFolderListResponse;
import org.example.speaknotebackend.domain.folder.model.UpdateFolderNameRequest;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import jakarta.validation.Valid;

import static org.example.speaknotebackend.common.response.BaseResponseStatus.SUCCESS;

@RestController
@RequestMapping("/api/folders")
@RequiredArgsConstructor
public class FolderController {

    private final FolderService folderService;

    @Operation(
            summary = "폴더 생성",
            description = "사용자가 새로운 폴더를 생성합니다."
    )
    @PostMapping
    public BaseResponse<Void> createFolder(
            @Valid @RequestBody CreateFolderRequest request,
            @AuthenticationPrincipal UserDetailsImpl user
    ) {
        if (user == null) {
            throw new BaseException(BaseResponseStatus.INVALID_USER_JWT);
        }

        folderService.createFolder(user.getUserId(), request);
        return new BaseResponse<>(SUCCESS);
    }

    @Operation(summary = "사용자의 폴더 목록 조회")
    @GetMapping
    public BaseResponse<List<GetFolderListResponse>> getFolderList(
            @AuthenticationPrincipal UserDetailsImpl user
    ) {
        if (user == null) {
            throw new BaseException(BaseResponseStatus.INVALID_USER_JWT);
        }

        List<GetFolderListResponse> result = folderService.getFolderList(user.getUserId());
        return new BaseResponse<>(result);
    }

    @Operation(summary = "폴더명 수정")
    @PatchMapping("/{folderId}")
    public BaseResponse<Void> updateFolder(
            @PathVariable Long folderId,
            @Valid @RequestBody UpdateFolderNameRequest request,
            @AuthenticationPrincipal UserDetailsImpl user
    ) {
        if (user == null) {
            throw new BaseException(BaseResponseStatus.INVALID_USER_JWT);
        }
        System.out.println("폴더명 변경:");
        System.out.println(request.getName());
        folderService.updateFolder(user.getUserId(), folderId, request.getName());
        return new BaseResponse<>(SUCCESS);
    }


    @Operation(summary = "폴더 이동")
    @PatchMapping("/{lectureId}/move")
    public BaseResponse<Void> moveFolder(
            @Valid @RequestBody MoveFolderRequest request,
            @PathVariable Long lectureId,
            @AuthenticationPrincipal UserDetailsImpl user
    ) {
        if (user == null) {
            throw new BaseException(BaseResponseStatus.INVALID_USER_JWT);
        }
        System.out.println("폴더 이동:");
        folderService.moveFolder(user.getUserId(),lectureId, request.id);
        return new BaseResponse<>(SUCCESS);
    }

    // Request DTO
    public record MoveFolderRequest(
            @NotNull Long id
    ) {}

    @Operation(
            summary = "폴더 삭제",
            description = "폴더 안에 있는 강의 노트까지 삭제합니다."
    )
    @DeleteMapping("{folderId}")
    public BaseResponse<Void> deleteFolder(
            @PathVariable Long folderId,
            @AuthenticationPrincipal UserDetailsImpl user
    ) {
        if (user == null) {
            throw new BaseException(BaseResponseStatus.INVALID_USER_JWT);
        }

        folderService.deleteFolder(user.getUserId(), folderId);
        return new BaseResponse<>(SUCCESS);
    }
}
