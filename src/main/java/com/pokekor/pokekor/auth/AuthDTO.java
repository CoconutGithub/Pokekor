package com.pokekor.pokekor.auth;


import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL) // JSON 변환 시 null인 필드는 응답에 포함하지 않음
public class AuthDTO {

    // 회원가입, 로그인 요청/응답에 공통 사용
    private String username;

    // 회원가입, 로그인 요청 시 사용 (응답에는 절대 포함되면 안 됨)
    private String password;

    // 회원가입 요청 시 사용
    private String email;

    // 로그인 응답 시 사용
    private String accessToken;

    /**
     * 로그인 응답(LoginResponse)용 생성자
     * (password, email 필드는 null로 유지됨)
     */
    public AuthDTO(String username, String accessToken) {
        this.username = username;
        this.accessToken = accessToken;
    }
}
