# /pdf POST


{
  "input": {
    "file": "(업로드할 PDF 파일 바이너리/파일객체)"
  },
  "output": {
    "success": {
      "status": "ready",
      "message": "PDF 업로드 및 분석 완료"
    },
    "fail_no_file": {
      "error": "PDF 파일이 없습니다."
    },
    "fail_processing": {
      "error": "파일 처리 중 오류가 발생했습니다"
    }
  }
}
