package com.pokekor.pokekor.controller;

import com.pokekor.pokekor.dto.CardDTO;
import com.pokekor.pokekor.service.CardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/cards") // 이 컨트롤러의 모든 경로는 /api/cards로 시작
@RequiredArgsConstructor
public class CardController {

    private final CardService cardService;

    /**
     * 전체 카드 목록 조회 API
     * GET /api/cards
     */
    @GetMapping
    public ResponseEntity<List<CardDTO>> getAllCards() {
        List<CardDTO> cards = cardService.getAllCards();
        return ResponseEntity.ok(cards);
    }

    // TODO: /api/cards/{id}, /api/cards/search 등 엔드포인트 추가
}