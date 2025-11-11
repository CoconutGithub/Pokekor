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
     * [수정됨] 카드 검색 API (다중 필터링 지원)
     * GET /api/cards
     * GET /api/cards?packId=123
     * GET /api/cards?name=피카츄
     * GET /api/cards?rarity=SR
     * GET /api/cards?packId=123&name=리자몽&rarity=SR
     *
     * @param userDetails (로그인 사용자 정보)
     * @param packId (필터링할 팩 ID, 선택 사항)
     * @param cardName (검색할 카드 이름, 선택 사항) // [추가]
     * @param rarityId (필터링할 레어도 ID, 선택 사항) // [추가]
     */
    @GetMapping
    public ResponseEntity<List<CardDTO>> searchCards( // [수정] 메서드 이름 변경
                                                      @AuthenticationPrincipal UserDetails userDetails,
                                                      @RequestParam(required = false) Long packId,
                                                      @RequestParam(required = false) String cardName, // [추가]
                                                      @RequestParam(required = false) String rarityId  // [추가]
    ) {
        // 1. username 추출
        String username = (userDetails != null) ? userDetails.getUsername() : null;

        // 2. [수정] 서비스에 모든 파라미터 전달
        List<CardDTO> cards = cardService.searchCards(username, packId, cardName, rarityId);

        return ResponseEntity.ok(cards);
    }
}