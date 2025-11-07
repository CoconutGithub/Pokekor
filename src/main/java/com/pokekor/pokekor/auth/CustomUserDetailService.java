package com.pokekor.pokekor.auth;

import com.pokekor.pokekor.repository.UserRepository;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;

@Service
@Transactional(readOnly = true)
public class CustomUserDetailService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // DB에서 username으로 사용자 정보를 조회
        com.pokekor.pokekor.domain.User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("사용자를 찾을 수 없습니다: " + username));

        // Spring Security가 사용하는 UserDetails 객체로 변환하여 반환
        // (권한(Authority)은 지금 당장 없으므로 빈 리스트(ArrayList) 전달)
        return new User(user.getUsername(), user.getPassword(), new ArrayList<>());
    }
}
