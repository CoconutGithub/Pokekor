package com.pokekor.pokekor.auth;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.function.Function;

/**
 * JWT 토큰 생성, 검증, 정보 추출을 담당하는 유틸리티 클래스
 */
@Component
public class JwtUtil {

    // application.properties에 설정된 시크릿 키
    @Value("${spring.jwt.secret}")
    private String secretKey;

    // 토큰 만료 시간 (예: 24시간)
    private static final long EXPIRATION_TIME_MS = 1000 * 60 * 60 * 24;

    /**
     * 시크릿 키를 HMAC-SHA 알고리즘에 맞는 SecretKey 객체로 변환
     */
    private SecretKey getSigningKey() {
        byte[] keyBytes = secretKey.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    /**
     * 토큰에서 모든 클레임(정보)을 추출
     */
    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey()) // 시크릿 키로 검증
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    /**
     * 토큰에서 특정 클레임을 추출 (타입 안전)
     */
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    /**
     * 토큰에서 사용자 아이디(username)를 추출
     */
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    /**
     * 토큰에서 만료 시간을 추출
     */
    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    /**
     * 토큰이 만료되었는지 확인
     */
    private Boolean isTokenExpired(String token) {
        // 만료 시간이 현재 시간보다 이전인지 확인
        return extractExpiration(token).before(new Date());
    }

    /**
     * UserDetails를 기반으로 JWT 토큰을 생성
     */
    public String generateToken(UserDetails userDetails) {
        return createToken(userDetails.getUsername());
    }

    /**
     * 사용자 아이디(subject)를 기반으로 실제 JWT 토큰을 생성
     */
    private String createToken(String subject) {
        return Jwts.builder()
                .subject(subject) // 토큰 제목 (사용자 아이디)
                .issuedAt(new Date(System.currentTimeMillis())) // 발급 시간
                .expiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME_MS)) // 만료 시간
                .signWith(getSigningKey()) // 서명 (HMAC-SHA 사용)
                .compact();
    }

    /**
     * 토큰이 유효한지 검증 (사용자 아이디 일치 및 만료 여부)
     */
    public Boolean validateToken(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }
}
