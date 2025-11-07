package com.pokekor.pokekor.config;

import com.pokekor.pokekor.auth.CustomUserDetailService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    // [추가됨] JWT 필터와 UserDetailsService 주입
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final CustomUserDetailService customUserDetailsService;

    // [수정됨] 생성자 변경
    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter, CustomUserDetailService customUserDetailsService) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.customUserDetailsService = customUserDetailsService;
    }

    /**
     * 비밀번호 암호화를 위한 PasswordEncoder 빈 등록 (기존과 동일)
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * [추가됨] AuthService에서 로그인 시 사용할 AuthenticationManager를 Bean으로 등록
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    /**
     * Spring Security의 HTTP 보안 필터 체인 설정
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        // [추가됨] Spring Security의 AuthenticationManagerBuilder를 가져와
        // 우리가 만든 CustomUserDetailsService와 PasswordEncoder를 사용하도록 설정
        AuthenticationManagerBuilder authBuilder = http.getSharedObject(AuthenticationManagerBuilder.class);
        authBuilder.userDetailsService(customUserDetailsService).passwordEncoder(passwordEncoder());

        http
                // CSRF 보호 비활성화 (Stateless한 REST API에서는 불필요)
                .csrf(AbstractHttpConfigurer::disable)

                // API 경로별 접근 권한 설정
                .authorizeHttpRequests(authorize -> authorize
                        // 1. /api/auth/** 경로는 모두에게 허용 (회원가입, 로그인)
                        .requestMatchers("/api/auth/**").permitAll()

                        // 2. 그 외 모든 API 요청은 인증된(authenticated) 사용자만 접근 가능
                        .anyRequest().authenticated()
                )

                // [추가됨] 세션 관리 정책을 STATELESS로 설정
                // (JWT를 사용하므로 서버가 세션을 저장할 필요가 없음)
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )

                // [추가됨] Spring Security의 기본 인증 필터(UsernamePasswordAuthenticationFilter)가 실행되기 전에,
                // 우리가 만든 JwtAuthenticationFilter를 먼저 실행하도록 추가
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)

                // (기존) HTTP Basic 및 폼 로그인 비활성화
                .httpBasic(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable);


        return http.build();
    }
}
