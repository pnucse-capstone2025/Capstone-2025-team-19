package org.example.speaknotebackend.domain.folder.model;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class GetFolderListResponse {

    @Schema(description = "폴더 ID")
    private Long folderId;

    @Schema(description = "폴더명")
    private String name;
}
