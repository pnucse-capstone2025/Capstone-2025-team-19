'''
@app.post("/pdf")
async def pdf(
    file: UploadFile = File(…),
    userId: str = Form(""),
    fileId: str = Form("")
):
    # userId / fileId 사용 가능
    # …
    return 
      {
      "ok": True, 
      "userId": userId, 
      "fileId": fileId
      "keywords" : keywords # 데이터베이스강의일때 keywords : "데이터 베이스" 
      }



@/text
{
  "text": "string, 필수",
  "sessionId": "string | null(옵션) - 없으면 서버가 생성",
  "fileId": 123, 
}
/text 이거 파라미터 두개 추가댐
  "sessionId": "string | null(옵션) - 없으면 서버가 생성",
  "fileId": 123, 

'''