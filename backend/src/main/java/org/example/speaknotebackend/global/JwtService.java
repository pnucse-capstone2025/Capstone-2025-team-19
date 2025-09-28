package org.example.speaknotebackend.global;


import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.example.speaknotebackend.common.exceptions.BaseException;
import org.example.speaknotebackend.entity.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import io.jsonwebtoken.*;
import org.springframework.http.HttpHeaders;


import java.util.Date;

import static org.example.speaknotebackend.common.response.BaseResponseStatus.*;
import static org.example.speaknotebackend.global.Constant.JWT_EXPIRATION;
import static org.example.speaknotebackend.global.Constant.REFRESH_JWT_EXPIRATION;

@Slf4j
@Service
public class JwtService {

    @Value("${jwt.secret-key}")
    private String JWT_SECRET_KEY;

    /*
     * JWT 생성
     *
     * @param userId
     *
     * @return String
     */
    public String createUserJwt(Long userId) {
        Date now = new Date();
        return Jwts.builder()
                .setHeaderParam("type", "jwt")
                .claim("userId", userId)
                .setIssuedAt(now)
                .setExpiration(new Date(System.currentTimeMillis() + JWT_EXPIRATION))
                .signWith(SignatureAlgorithm.HS256, JWT_SECRET_KEY)
                .compact();
    }

    public String createUserRefreshJwt(Long userId) {
        Date now = new Date();
        return Jwts.builder()
                .setHeaderParam("type", "jwt")
                .claim("userId", userId)
                .setIssuedAt(now)
                .setExpiration(new Date(System.currentTimeMillis() + REFRESH_JWT_EXPIRATION))
                .signWith(SignatureAlgorithm.HS256, JWT_SECRET_KEY)
                .compact();
    }

    /*
     * Header에서 AUTHORIZATION 으로 JWT 추출
     *
     * @return String
     */
    public String getJwt() {
        HttpServletRequest request =
                ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes())
                        .getRequest();

        String accessToken = request.getHeader(HttpHeaders.AUTHORIZATION);

        if (accessToken == null || accessToken.length() == 0) {
            throw new BaseException(EMPTY_JWT);
        }

        return accessToken.replaceAll("^Bearer( )*", "");
    }

    public String getJwtOrElse() {
        HttpServletRequest request =
                ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes())
                        .getRequest();

        String accessToken = request.getHeader(HttpHeaders.AUTHORIZATION);

        if (accessToken == null || accessToken.length() == 0) {
            return null;
        }

        return accessToken.replaceAll("^Bearer( )*", "");
    }

    /*
     * JWT에서 userId 추출
     *
     * @return Long
     *
     * @throws BaseException
     */
    public Long getUserId() {
        String accessToken = getJwt();
        return getUserIdByToken(accessToken);
    }

    public Long getUserIdByToken(String token) {
        // JWT parsing
        Claims claims = parseClaims(token);
        // userIdx 추출
        return claims.get("userId", Long.class);
    }

    public String refreshJwt(String refreshToken, User user) {

        if (user.getRefreshToken().equals(refreshToken)) {
            return createUserJwt(user.getId());
        } else {
            throw new BaseException(INVALID_JWT);
        }
    }

    public Claims parseClaims(String token) {
        try {
            return Jwts.parser().setSigningKey(JWT_SECRET_KEY).parseClaimsJws(token).getBody();
        } catch (ExpiredJwtException expired) {
            throw new BaseException(EXPIRED_JWT);
        } catch (Exception ignored) {
            throw new BaseException(INVALID_JWT);
        }
    }
}
