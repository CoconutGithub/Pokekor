package com.pokekor.pokekor.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;

@Entity
@Table(name = "T_USER") // 실제 DB 테이블 이름과 매핑
@Getter
@Setter
@NoArgsConstructor // JPA는 기본 생성자를 필요로 합니다.
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // PostgreSQL의 BIGSERIAL 전략
    @Column(name = "user_id")
    private Long userId;

    @Column(name = "username", nullable = false, unique = true, length = 100)
    private String username;

    @Column(name = "password", nullable = false, length = 255)
    private String password;

    @Column(name = "email", length = 255)
    private String email;

    // 한 명의 유저는 여러 개의 카테고리를 가질 수 있음 (1:N 관계)
    // mappedBy = "user": CollectionCategory 클래스의 'user' 필드와 연결됨
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CollectionCategory> categories = new ArrayList<>();

    // (생성자, 편의 메서드 등은 필요에 따라 나중에 추가)
}