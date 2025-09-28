package org.example.speaknotebackend.domain.folder.model;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UpdateFolderNameRequest {

    @NotBlank(message = "수정할 폴더명을 입력해주세요.")
    @Size(max = 20, message = "폴더명은 최대 20자입니다.")
    @Schema(description = "폴더명", example = "수정된 폴더명")
    private String name;
}
