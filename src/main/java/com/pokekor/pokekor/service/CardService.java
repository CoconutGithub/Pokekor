package com.pokekor.pokekor.service;

import com.pokekor.pokekor.dto.CardDTO;
import com.pokekor.pokekor.repository.CardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true) // 기본적으로 읽기 전용 트랜잭션
public class CardService {

    private final CardRepository cardRepository;

    /**
     * 모든 카드 목록을 DTO로 변환하여 반환
     */
    public List<CardDTO> getAllCards() {
        // N+1 방지를 위해 JOIN FETCH 쿼리 사용
        return cardRepository.findAllWithDetails()
                .stream()       // Stream<Card>
                .map(CardDTO::new) // Stream<CardDTO> (CardDTO::new는 card -> new CardDTO(card)와 동일)
                .collect(Collectors.toList());
    }

    // TODO: 카드 검색, 팩별 카드 조회 등 서비스 메서드 추가
}
