"use client";

import { useEffect, useRef, useState } from "react";
import { useAnnotation } from "./AnnotationContext";
import Image from "next/image";
import PLAY from "@/components/image/play.svg";
import STOP from "@/components/image/stop.svg";

type STTRecorderProps = {
  fileId?: string | number | null;
  isPdfReady?: boolean;
};

export default function STTRecorder({ fileId, isPdfReady = false }: STTRecorderProps) {
  const { addAnnotation } = useAnnotation();
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0); // 초 단위 시간
  const API_WSS_URL = process.env.NEXT_PUBLIC_API_WSS_URL;

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const keepAliveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileIdRef = useRef<typeof fileId>(fileId);
  const hasSentFirstAudioRef = useRef<boolean>(false);
  useEffect(() => { fileIdRef.current = fileId; }, [fileId]);
  const formatTime = (seconds: number) => {
    const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
    const secs = String(seconds % 60).padStart(2, "0");
    return `00:${mins}:${secs}`;
  };

  const convertFloat32ToInt16 = (buffer: Float32Array) => {
    const l = buffer.length;
    const result = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      const s = Math.max(-1, Math.min(1, buffer[i]));
      result[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
      result[i] = Math.floor(result[i]);
    }
    return result;
  };

  const startRecording = async () => {
    try {
      // PDF 준비 상태 체크
      if (!isPdfReady) {
        alert("PDF 분석이 끝나고 녹음이 가능합니다. 조금만 기다려 주세요.");
        return;
      }
      
      // 1. WebSocket 인증 토큰 발급 (로그인한 사용자만)
      let connectionToken: string | null = null;
      try {
        const { auth } = await import("@/lib/auth");
        const token = auth.getAccessToken();
        
        if (token) {
          // 로그인한 사용자: 인증 토큰 발급
          const authResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}/api/websocket/auth`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (authResponse.ok) {
            const authData = await authResponse.json();
            connectionToken = authData.connectionToken;
            console.log("🔑 [WebSocket] 인증 성공, connectionToken 발급됨");
          } else {
            console.warn("⚠️ [WebSocket] 인증 실패, 로그인하지 않은 사용자로 진행");
          }
        } else {
          console.log("ℹ️ [WebSocket] 로그인하지 않은 사용자, 인증 없이 진행");
        }
      } catch (e) {
        console.warn("⚠️ [WebSocket] 인증 실패, 로그인하지 않은 사용자로 진행:", e);
      }

      // 2. WebSocket 연결
      const url = new URL(process.env.NEXT_PUBLIC_API_WSS_URL || 'ws://localhost:8080/ws/audio');
      // fileId가 있으면 쿼리에 포함, 없으면 생략하여 STT만 테스트 가능
      if (fileIdRef.current !== undefined && fileIdRef.current !== null && String(fileIdRef.current) !== "") {
        url.searchParams.set("fileId", String(fileIdRef.current));
      }
      // connectionToken을 쿼리 파라미터로 추가
      if (connectionToken) {
        url.searchParams.set("token", connectionToken);
      }
      
      const ws = new WebSocket(url.toString());
      setSocket(ws);

      ws.onopen = async () => {
        console.log("🔗 [WebSocket] 연결 성공");
        // 무음 keep-alive 시작 (마이크 준비 전 타임아웃 방지)
        if (!keepAliveIntervalRef.current) {
          keepAliveIntervalRef.current = setInterval(() => {
            if (ws.readyState === WebSocket.OPEN && !hasSentFirstAudioRef.current) {
              const silentFrame = new Int16Array(1600); // 약 100ms @ 16kHz
              ws.send(silentFrame.buffer);
            }
          }, 200); // 200ms 간격
        }
        if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
          alert("현재 브라우저가 마이크 권한을 지원하지 않거나 잘못된 환경입니다.");
          return;
        }
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          streamRef.current = stream;

          const audioContext = new AudioContext({ sampleRate: 16000 }); // 최적의 파라미터 (16kHz)
          audioContextRef.current = audioContext;

          const source = audioContext.createMediaStreamSource(stream);
          sourceRef.current = source;

          const processor = audioContext.createScriptProcessor(4096, 1, 1); // 최적의 파라미터 (4096 샘플)
          processorRef.current = processor;

          source.connect(processor);
          processor.connect(audioContext.destination);

          processor.onaudioprocess = (e) => {
            const input = e.inputBuffer.getChannelData(0);
            const pcm = convertFloat32ToInt16(input);
            if (ws.readyState === WebSocket.OPEN) {
              // 첫 실제 오디오 프레임 전송 시 keep-alive 중지
              if (!hasSentFirstAudioRef.current) {
                hasSentFirstAudioRef.current = true;
                if (keepAliveIntervalRef.current) {
                  clearInterval(keepAliveIntervalRef.current);
                  keepAliveIntervalRef.current = null;
                }
              }
              ws.send(pcm.buffer);
              // fileId 없이도 동작하도록 init 메시지는 선택적으로만 전송
              if (fileIdRef.current !== undefined && fileIdRef.current !== null && String(fileIdRef.current) !== "") {
                ws.send(JSON.stringify({ type: "init", fileId: fileIdRef.current }));
              }
            }
          };
        } catch (err) {
          console.error("로그인 오류:", err);
          alert("로그인을 하셔야 이용 가능합니다.");
        }

        setIsRecording(true);
        setRecordingTime(0);
        intervalRef.current = setInterval(() => {
          setRecordingTime((prev) => prev + 1);
        }, 1000);
      };

      ws.onmessage = (event) => {
        const parsed = JSON.parse(event.data);
        addAnnotation({
          id: crypto.randomUUID(),
          text: event.data,
          markdown: null,
          answerState: parsed.answerState ?? 1,
          pageNumber: parsed.page, 
        });
        window.dispatchEvent(new Event("annotation-added"));

      };

      ws.onerror = (err) => {
        console.error("❌ [WebSocket] 연결 오류:", err);
        console.error("❌ [WebSocket] URL:", url.toString());
        alert("WebSocket 연결에 실패했습니다. 서버가 실행 중인지 확인해주세요.");
      };

      ws.onclose = (event) => {
        console.log("🔌 [WebSocket] 연결 종료:", event.code, event.reason);
        if (event.code !== 1000) { // 정상 종료가 아닌 경우
          alert(`연결이 종료되었습니다. (코드: ${event.code})`);
        }
        stopRecordingInternal();
        setSocket(null);
      };
    } catch (err) {
      console.error("❌ [STT] 시작 실패:", err);
      alert("마이크 권한이 필요하거나 연결에 실패했습니다.");
    }
  };

  const stopRecordingInternal = () => {
    processorRef.current?.disconnect();
    sourceRef.current?.disconnect();
    audioContextRef.current?.close();
    streamRef.current?.getTracks().forEach((track) => track.stop());

    processorRef.current = null;
    sourceRef.current = null;
    audioContextRef.current = null;
    streamRef.current = null;
    hasSentFirstAudioRef.current = false;

    clearInterval(intervalRef.current!);
    intervalRef.current = null;
    if (keepAliveIntervalRef.current) {
      clearInterval(keepAliveIntervalRef.current);
      keepAliveIntervalRef.current = null;
    }
    setIsRecording(false);
  };

  const stopRecording = () => {
    if (socket?.readyState === WebSocket.OPEN) {
      socket.close();
    } else {
      stopRecordingInternal();
      setSocket(null);
    }
  };

  return (
    <div className="flex items-center gap-4">
      {isRecording ? (
        <>
          {/* 녹음 중 - 시간 표시 */}
          <div className="flex items-center gap-2 px-4 py-1 rounded-full bg-[#e8f0fe] text-[#1a2b49] text-sm font-medium">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
            <span>녹음 중 - {formatTime(recordingTime)}</span>
          </div>
          {/* 녹음 중지 버튼 */}
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-400 text-gray-800 text-sm bg-white"
            onClick={stopRecording}
          >
            <Image src={STOP} alt="Stop" width={14} height={14} />
            <span>녹음 중지</span>
          </button>
        </>
      ) : (
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-400 text-gray-800 text-sm bg-white hover:bg-gray-50"
            onClick={startRecording}
          >
          <Image src={PLAY} alt="Play" width={14} height={14} />
          <span className="text-gray-700 text-sm">녹음 시작</span>
        </button>
      )}
    </div>
  );
}
