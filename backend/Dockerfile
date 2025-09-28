FROM openjdk:21-jdk-slim
WORKDIR /app

# JAR 파일 복사
COPY speaknote-backend-0.0.1-SNAPSHOT.jar app.jar

# Google 인증파일도 포함 (필요하면)
COPY stt-credentials.json stt-credentials.json

# Fly.io가 인식할 수 있도록 ENV 설정
ENV GOOGLE_CREDENTIAL_PATH=/app/stt-credentials.json
ENV AI_SERVER_URL=http://localhost:8000/text
ENV PDF_ALLOWED_ORIGIN=http://localhost:8000/pdf
#ENV AI_SERVER_URL=https://speaknote-ai2025.azurewebsites.net/text
#ENV PDF_ALLOWED_ORIGIN=https://speaknote-ai2025.azurewebsites.net/pdf

# 실행
ENTRYPOINT ["java", "-jar", "app.jar"]
