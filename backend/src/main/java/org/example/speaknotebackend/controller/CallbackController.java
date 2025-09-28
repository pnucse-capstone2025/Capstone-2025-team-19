package org.example.speaknotebackend.controller;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.speaknotebackend.dto.request.AnnotationCallbackRequest;
import org.example.speaknotebackend.dto.request.ContextCallbackRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;

import org.example.speaknotebackend.service.GoogleSpeechService;
import org.example.speaknotebackend.service.PdfService;
import org.example.speaknotebackend.client.FrontendNotificationClient;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/callbacks")
public class CallbackController {

    private final GoogleSpeechService googleSpeechService;
    private final PdfService pdfService;
    private final FrontendNotificationClient frontendNotificationClient;

    @Operation(
            summary = "주석 결과 콜백 수신",
            description = "Python 서버가 생성한 주석 결과를 수신하여 해당 WebSocket 세션으로 전달합니다."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "콜백 처리 완료 (본문 없음)")
    })
    @PostMapping("/annotations")
    public ResponseEntity<Void> onAnnotations(@RequestBody AnnotationCallbackRequest body) {
        try {
            log.info("📥 [CALLBACK] 파이썬에서 콜백 요청 수신 - totalNum={}, results={}", 
                    body.getTotalNum(), body.getResults() == null ? 0 : body.getResults().size());
            
            if (body.getResults() != null) {
                for (AnnotationCallbackRequest.AnnotationResult result : body.getResults()) {
                    log.info("📥 [CALLBACK] 결과 처리 시작 - userId={}, sessionId={}, seq={}, requestId={}", 
                            result.getUserId(), result.getSessionId(), result.getSeq(), result.getRequestId());
                    log.info("📥 [CALLBACK] 콘텐츠 - audioText='{}', annotation='{}', page={}, answerState={}", 
                            result.getAudioText(), result.getAnnotation(), result.getPage(), result.getAnswerState());
                    
                    try {
                        googleSpeechService.enqueueOutboundFromCallback(result);
                        log.info("✅ [CALLBACK] 결과 처리 완료 - sessionId={}, seq={}", result.getSessionId(), result.getSeq());
                    } catch (Exception e) {
                        log.error("❌ [CALLBACK] 결과 처리 실패 - sessionId={}, seq={}, error: ", 
                                result.getSessionId(), result.getSeq(), e);
                        throw e; // 예외를 다시 던져서 상위에서 처리
                    }
                }
            } else {
                log.warn("⚠️ [CALLBACK] results가 null입니다");
            }
            
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            log.error("❌ [CALLBACK] 콜백 처리 중 예외 발생: ", e);
            throw e; // 예외를 다시 던져서 GlobalExceptionHandler에서 처리
        }
    }

    @Operation(
            summary = "컨텍스트 결과 콜백 수신",
            description = "Python 서버가 생성한 문서 요약 및 키워드 결과를 수신하여 DB에 저장합니다."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "콜백 처리 완료 (본문 없음)")
    })
    @PostMapping("/contexts")
    public ResponseEntity<Void> onContexts(@RequestBody ContextCallbackRequest body) {
        try {
            log.info("📥 [CONTEXT_CALLBACK] 파이썬에서 컨텍스트 콜백 요청 수신 - totalNum={}, contexts={}", 
                    body.getTotalNum(), body.getContexts() == null ? 0 : body.getContexts().size());
            
            if (body.getContexts() != null) {
                for (ContextCallbackRequest.ContextResult result : body.getContexts()) {
                    log.info("📥 [CONTEXT_CALLBACK] 컨텍스트 결과 처리 시작 - sessionId={}, success={}", 
                            result.getSessionId(), result.getSuccess());
                    
                    if (result.getSuccess() != null && result.getSuccess()) {
                        try {
                            // sessionId = fileId (동일함)
                            Long fileId = result.getSessionId();
                            
                            // DB에 요약 및 키워드 저장
                            pdfService.updateLectureMetaFromPythonResponse(fileId, result.getSummary(), result.getKeywords());
                            
                            // 콜백에서 직접 받은 userId 사용
                            Long userId = result.getUserId();
                            log.info("🔍 [CONTEXT_CALLBACK] 콜백에서 받은 userId={}", userId);

                            // HTTP POST로 프론트엔드에 ready 상태 전송 (sessionId = fileId)
                            frontendNotificationClient.notifyPdfReady(fileId, userId);
                            
                            // 게스트 사용자(fileId=0)인 경우 추가 처리
                            if (fileId == 0L) {
                                log.info("🎯 [GUEST_CALLBACK] 게스트 사용자 PDF 처리 완료 - fileId=0");
                            }
                            
                            log.info("✅ [CONTEXT_CALLBACK] 컨텍스트 결과 처리 완료 - sessionId={}, fileId={}", result.getSessionId(), fileId);
                        } catch (Exception e) {
                            log.error("❌ [CONTEXT_CALLBACK] 컨텍스트 결과 처리 실패 - sessionId={}, error: ", 
                                    result.getSessionId(), e);
                        }
                    } else {
                        log.warn("⚠️ [CONTEXT_CALLBACK] 처리 실패된 결과 - sessionId={}, success={}", 
                                result.getSessionId(), result.getSuccess());
                    }
                }
            } else {
                log.warn("⚠️ [CONTEXT_CALLBACK] contexts가 null입니다");
            }
            
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            log.error("❌ [CONTEXT_CALLBACK] 콜백 처리 중 예외 발생: ", e);
            throw e; // 예외를 다시 던져서 GlobalExceptionHandler에서 처리
        }
    }
}