package org.example.speaknotebackend.domain.folder.model;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class CreateFolderRequest {

    @NotBlank(message = "폴더명을 입력해주세요.")
    @Size(max = 20, message = "폴더명은 최대 20자입니다.")
    @Schema(description = "폴더명", example = "새로운 폴더")
    private String folderName;
}
