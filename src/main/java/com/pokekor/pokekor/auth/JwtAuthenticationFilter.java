package com.pokekor.pokekor.auth;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * 모든 HTTP 요청 이전에 단 한 번 실행되어
 * 요청 헤더의 JWT 토큰을 검증하고 사용자를 인증하는 필터
 */
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final CustomUserDetailService userDetailsService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization"); // "Authorization" 헤더
        final String jwt;
        final String username;

        // 1. "Authorization" 헤더가 없거나 "Bearer "로 시작하지 않으면,
        //    이 요청은 JWT 인증이 필요 없는 요청(예: 로그인, 회원가입)이므로 다음 필터로 넘김
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // 2. "Bearer " 문자열(7글자) 이후의 토큰(jwt) 부분만 추출
        jwt = authHeader.substring(7);

        try {
            // 3. 토큰에서 사용자 아이디(username) 추출
            username = jwtUtil.extractUsername(jwt);

            // 4. 사용자 아이디가 존재하고, 아직 현재 SecurityContext에 인증 정보가 없다면
            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {

                // 5. DB에서 사용자 정보 조회
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);

                // 6. 토큰 검증 (사용자 정보 일치, 만료 여부)
                if (jwtUtil.validateToken(jwt, userDetails)) {
                    // 7. 토큰이 유효하면, Spring Security가 사용할 인증 토큰(UsernamePasswordAuthenticationToken) 생성
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null, // 비밀번호는 이미 검증되었으므로 null
                            userDetails.getAuthorities()
                    );
                    authToken.setDetails(
                            new WebAuthenticationDetailsSource().buildDetails(request)
                    );

                    // 8. (중요) SecurityContextHolder에 인증 정보(authToken)를 저장
                    //    -> 이 작업이 완료되면 Spring Security는 이 사용자를 '인증된' 사용자로 간주
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        } catch (Exception e) {
            // 토큰 검증 실패 시 (예: 만료, 서명 불일치 등)
            // (로깅 추가 가능)
            SecurityContextHolder.clearContext(); // 컨텍스트 클리어
        }

        // 9. 다음 필터 체인 실행
        filterChain.doFilter(request, response);
    }
}
