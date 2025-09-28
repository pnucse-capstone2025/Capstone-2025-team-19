package org.example.speaknotebackend.util;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Component
public class SttTextBuffer {

    /** 세션별 최종 STT 문장 누적 버퍼 */
    private final List<String> sentences = new ArrayList<>();

    /** 한국어/영문 구두점 기준 문장 분리 패턴 (구두점 포함 유지) */
    private static final Pattern SENTENCE_PATTERN = Pattern.compile(
            "[^.!?。！？]+[\n\r\s]*[.!?。！？]?"
    );

    /** 최종 STT 텍스트를 문장 단위로 누적 */
    public synchronized void appendTranscript(String text) {
        if (text == null || text.isBlank()) {
            return;
        }
        for (String s : extractSentences(text)) {
            String trimmed = s.trim();
            if (!trimmed.isEmpty()) {
                sentences.add(trimmed);
            }
        }
    }

    /** 누적 문장 수 */
    public synchronized int getSentenceCount() {
        return sentences.size();
    }

    /** 현재까지 누적된 텍스트를 공백으로 결합해 반환 (clear 없음) */
    public synchronized String getAllText() {
        if (sentences.isEmpty()) return "";
        return String.join(" ", sentences);
    }

    /** 스냅샷 텍스트를 반환하고 버퍼를 비운다 */
    public synchronized String getSnapshotAndClear() {
        if (sentences.isEmpty()) return null;
        String joined = String.join(" ", sentences).trim();
        sentences.clear();
        return joined.isEmpty() ? null : joined;
    }

    /** 5개 이상 문장이 있으면 모든 문장을 가져오고 버퍼를 비운다 */
    public synchronized String getSnapshotAndClearIfEnough() {
        if (sentences.size() < 5) return null;
        
        // 모든 문장을 가져오고 버퍼 클리어
        String joined = String.join(" ", sentences).trim();
        sentences.clear();
        return joined.isEmpty() ? null : joined;
    }

    /** 전체 초기화 */
    public synchronized void clearAll() {
        sentences.clear();
    }

    /** 내부: 문장 추출 도우미 */
    private List<String> extractSentences(String text) {
        List<String> result = new ArrayList<>();
        Matcher m = SENTENCE_PATTERN.matcher(text);
        while (m.find()) {
            String sentence = m.group();
            if (sentence != null && !sentence.isBlank()) {
                result.add(sentence);
            }
        }
        if (result.isEmpty()) {
            result.add(text);
        }
        return result;
    }
}


