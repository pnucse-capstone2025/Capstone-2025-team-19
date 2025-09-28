package org.example.speaknotebackend.controller;


import lombok.RequiredArgsConstructor;
import org.example.speaknotebackend.config.UserDetailsImpl;
import org.example.speaknotebackend.dto.LectureHistoryFilter;
import org.example.speaknotebackend.dto.LectureHistoryItem;
import org.example.speaknotebackend.dto.PagedResponse;
import org.example.speaknotebackend.entity.BaseEntity;
import org.example.speaknotebackend.service.LectureHistoryService;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping(value = "/api/lectures", produces = MediaType.APPLICATION_JSON_VALUE)
@RequiredArgsConstructor
public class LectureHistoryController {

    private final LectureHistoryService service;

    @GetMapping("/history")
    public PagedResponse<LectureHistoryItem> listHistory(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) Long folderId,
            @RequestParam(required = false) BaseEntity.Status status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @RequestParam(required = false) List<String> tags,
            @RequestParam(defaultValue = "false") boolean withAnno,
            @PageableDefault(size = 20, sort = "updatedAt", direction = Sort.Direction.DESC) Pageable pageable,
            @AuthenticationPrincipal UserDetailsImpl user
    ) {
        Long userId = user.getUserId();
        LectureHistoryFilter f = new LectureHistoryFilter(q, folderId, status, from, to, tags, withAnno);
        return service.getHistory(userId, f, pageable);
    }
//
//    @GetMapping("/history/_debug_user1")
//    public PagedResponse<LectureHistoryItem> listHistoryDebug(
//            @RequestParam(required = false) String q,
//            @RequestParam(required = false) Long folderId,
//            @RequestParam(required = false) BaseEntity.Status status,
//            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
//            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
//            @RequestParam(required = false) List<String> tags,
//            @RequestParam(defaultValue = "false") boolean withAnno,
//            @PageableDefault(size = 5, sort = "updatedAt", direction = Sort.Direction.DESC) Pageable pageable
//    ) {
//        Long uid = 1L; // ★ 강제
//        return service.getHistory(uid, new LectureHistoryFilter(q, folderId, status, from, to, tags, withAnno), pageable);
//    }
}

