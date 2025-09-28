package org.example.speaknotebackend.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@RequiredArgsConstructor
@Configuration
public class SwaggerConfig {
    @Bean
    public GroupedOpenApi speaknoteOpenApi() {
        String[] paths = {"/**"};
        return GroupedOpenApi.builder()
                .group("SpeakNote API v1")
                .pathsToMatch(paths)
                .build();
    }

    @Bean
    public OpenAPI openAPI() {
        Info info = new Info()
                .version("v1.0.0")
                .title("SpeakNote API")
                .description("실시간 음성 기반 주석 시스템 API 문서");

        // JWT 보안 요구사항 설정
        SecurityRequirement securityRequirement = new SecurityRequirement();
        securityRequirement.addList("JWT");

        // JWT 보안 스키마 정의
        Components components = new Components()
                .addSecuritySchemes("JWT", new SecurityScheme()
                        .name("JWT")
                        .type(SecurityScheme.Type.HTTP)
                        .scheme("bearer")
                        .bearerFormat("JWT"));

        return new OpenAPI()
                .addServersItem(new Server().url("/"))
                .info(info)
                .addSecurityItem(securityRequirement)
                .components(components);
    }
}
