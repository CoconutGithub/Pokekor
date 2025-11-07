package com.pokekor.pokekor.auth;

import com.pokekor.pokekor.domain.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final SignUpService signUpService;

    /**
     * 회원가입 API 엔드포인트 (기존과 동일)
     * POST /api/auth/register
     */
    @PostMapping("/register")
    public ResponseEntity<String> registerUser(@RequestBody AuthDTO dto) {
        try {
            User registeredUser = signUpService.registerUser(dto);
            // 회원가입 성공 시 201 Created 응답과 메시지 반환
            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body("회원가입 성공: " + registeredUser.getUsername());
        } catch (IllegalStateException e) {
            // 아이디 중복 등 예외 발생 시 409 Conflict 응답
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(e.getMessage());
        } catch (Exception e) {
            // 기타 서버 오류 시 500 Internal Server Error 응답
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("서버 오류: " + e.getMessage());
        }
    }

    /**
     * [추가됨] 로그인 API 엔드포인트
     * POST /api/auth/login
     */
    @PostMapping("/login")
    // [수정됨] DTO 클래스 참조 변경 (AuthDTO.LoginRequest -> AuthDTO)
    public ResponseEntity<?> loginUser(@RequestBody AuthDTO loginRequest) {
        try {
            // [수정됨] DTO 및 서비스 참조 변경 (반환 타입이 AuthDTO)
            AuthDTO loginResponse = signUpService.login(loginRequest);

            // 로그인 성공 시 200 OK와 함께 JWT 토큰이 담긴 응답(AuthDTO) 반환
            // (AuthDTO의 @JsonInclude 덕분에 password, email은 null이라 전송되지 않음)
            return ResponseEntity.ok(loginResponse);

        } catch (AuthenticationException e) {
            // Spring Security 인증 실패 시 (예: 아이디 없음, 비밀번호 틀림)
            // 401 Unauthorized (권한 없음) 응답
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("아이디 또는 비밀번호가 일치하지 않습니다.");
        } catch (Exception e) {
            // 기타 서버 오류 시 500 Internal Server Error 응답
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("서버 오류: " + e.getMessage());
        }
    }
}
