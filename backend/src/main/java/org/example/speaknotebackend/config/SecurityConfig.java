package org.example.speaknotebackend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.client.RestTemplate;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.context.NullSecurityContextRepository;
import org.example.speaknotebackend.global.JwtService;
import org.example.speaknotebackend.domain.user.UserService;


import java.util.List;

// removed unused import

@Configuration
public class SecurityConfig {

    @Value("${custom.cors.allowed-origin}")
    private String allowedOrigin;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, JwtAuthenticationFilter jwtAuthenticationFilter) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .securityContext(ctx -> ctx.securityContextRepository(new NullSecurityContextRepository()))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/",                         // 루트
                                "/api/pdf/**",               // PDF 관련 API
                                "/swagger-ui/**",            // Swagger UI HTML/CSS/JS 경로
                                "/v3/api-docs/**",           // OpenAPI JSON 경로
                                "/swagger-resources/**",     // (일부 swagger-ui 라이브러리)
                                "/webjars/**",               // swagger-ui에 필요한 js 라이브러리
                                "/ws/audio",
                                "/ws/annotation",
                                "/app/users/auth/**"         // OAuth 로그인 엔드포인트 허용
                        ).permitAll()                          // 인증 없이 접근 허용
                        .requestMatchers("OPTIONS", "/**").permitAll() // OPTIONS 요청 허용
                        .anyRequest().authenticated()          // 나머지는 로그인 필요
                )
                .formLogin(form -> form.disable()) // 기본 로그인 폼 비활성화
                .httpBasic(basic -> basic.disable()); // HTTP Basic 인증 비활성화

        // JWT 인증 필터 추가
        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // CORS 허용 설정 추가
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of(allowedOrigin)); // 환경변수에서 불러온 값 사용
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        config.setAllowedHeaders(List.of("*"));
        config.setExposedHeaders(List.of("Authorization", "Content-Type"));
        config.setAllowCredentials(true); // 쿠키 포함 시 true
        config.setMaxAge(3600L); // preflight 요청 캐시 시간 (1시간)

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config); // 모든 경로에 적용
        return source;
    }

    // RestTemplate 빈 생성
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }

    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter(JwtService jwtService, UserService userService) {
        return new JwtAuthenticationFilter(jwtService, userService);
    }
}
