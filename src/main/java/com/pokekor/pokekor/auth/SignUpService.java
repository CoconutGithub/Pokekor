package com.pokekor.pokekor.auth;

import com.pokekor.pokekor.domain.User;
import com.pokekor.pokekor.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SignUpService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager; // [추가됨]
    private final JwtUtil jwtUtil; // [추가됨]

    /**
     * 회원가입 비즈니스 로직
     */
    @Transactional // 쓰기 트랜잭션 적용
    public User registerUser(AuthDTO request) {
        // 1. 아이디 중복 검사
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            // (나중에 커스텀 예외로 변경하는 것이 좋습니다)
            throw new IllegalStateException("이미 존재하는 아이디입니다.");
        }

        // 2. User 엔티티 생성
        User newUser = new User();
        newUser.setUsername(request.getUsername());

        // 3. (중요) 비밀번호를 암호화하여 저장
        newUser.setPassword(passwordEncoder.encode(request.getPassword()));

        // 4. 이메일 설정 (null일 수도 있음)
        if (request.getEmail() != null && !request.getEmail().isEmpty()) {
            newUser.setEmail(request.getEmail());
        }

        // 5. DB에 저장 (T_USER 테이블에 INSERT)
        return userRepository.save(newUser);
    }

    /**
     * 로그인 비즈니스 로직
     */
    @Transactional(readOnly = true) // 읽기 트랜잭션 적용
    // [수정됨] DTO 클래스 참조 및 반환 타입 변경 (AuthDTO.LoginRequest -> AuthDTO, 반환타입 AuthDTO)
    public AuthDTO login(AuthDTO request) {
        // 1. Spring Security의 AuthenticationManager를 사용하여 인증 시도
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        // 2. 인증 성공 시, (UserDetails) 객체를 가져옴
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();

        // 3. JwtUtil을 사용하여 액세스 토큰 생성
        String accessToken = jwtUtil.generateToken(userDetails);

        // 4. LoginResponse DTO에 토큰과 사용자 아이디를 담아 반환
        // [수정됨] AuthDTO의 응답용 생성자 사용 (password, email은 null로 유지됨)
        return new AuthDTO(userDetails.getUsername(), accessToken);
    }
}
