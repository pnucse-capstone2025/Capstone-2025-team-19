package org.example.speaknotebackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

// 응답
@Data
@AllArgsConstructor
public class SnapshotResponse {
    private boolean ok;
    private Integer version;
}
