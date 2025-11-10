package com.pokekor.pokekor.controller;

import com.pokekor.pokekor.dto.CardDTO;
import com.pokekor.pokekor.service.CardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/cards") // 이 컨트롤러의 모든 경로는 /api/cards로 시작
@RequiredArgsConstructor
public class CardController {

    private final CardService cardService;

    /**
     * [수정됨] 전체 카드 목록 조회 API (packId로 필터링 가능)
     * GET /api/cards
     * GET /api/cards?packId=123
     *
     * @param userDetails (SecurityConfig에 의해 인증된 사용자 정보. 비로그인 시 null)
     * @param packId (필터링할 팩 ID, 선택 사항) // [수정] 파라미터 추가
     */
    @GetMapping
    public ResponseEntity<List<CardDTO>> getAllCards(
            @AuthenticationPrincipal UserDetails userDetails, // [수정] 로그인 사용자 정보 받기
            @RequestParam(required = false) Long packId // [수정] 쿼리 파라미터(packId) 받기
    ) {
        // [수정]
        // 1. userDetails가 null인지 확인하여 (비로그인) username을 추출
        String username = (userDetails != null) ? userDetails.getUsername() : null;

        // 2. 서비스에 username과 packId를 전달
        List<CardDTO> cards = cardService.getAllCards(username, packId);

        return ResponseEntity.ok(cards);
    }
}