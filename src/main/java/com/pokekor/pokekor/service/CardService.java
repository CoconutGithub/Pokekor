package com.pokekor.pokekor.service;

import com.pokekor.pokekor.domain.CollectedCard;
import com.pokekor.pokekor.dto.CardDTO;
import com.pokekor.pokekor.dto.CollectionInfoDTO;
import com.pokekor.pokekor.repository.CardRepository;
import com.pokekor.pokekor.repository.CollectedCardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true) // 기본적으로 읽기 전용 트랜잭션
public class CardService {

    private final CardRepository cardRepository;
    private final CollectedCardRepository collectedCardRepository;

    /**
     * [수정됨] 모든 카드 목록을 DTO로 변환하여 반환
     *
     * @param username (로그인한 사용자의 아이디, 비로그인 시 null)
     * @return List<CardDTO>
     */
    public List<CardDTO> getAllCards(String username) {

        // 1. [수정됨] 사용자가 로그인한 경우, 수집한 모든 카드/카테고리 정보를 조회
        Map<Long, List<CollectionInfoDTO>> collectedCardInfoMap = Collections.emptyMap(); // 기본값 (비로그인)

        if (username != null) {
            // 1-1. (기존과 동일)
            List<CollectedCard> allCollectedCards =
                    collectedCardRepository.findWithCategoryByUsername(username); //

            // 1-2. [수정됨] List<CollectedCard>를 Map<Long (cardId), List<CollectionInfoDTO>>으로 변환
            collectedCardInfoMap = allCollectedCards.stream()
                    .collect(Collectors.groupingBy(
                            // Key: CollectedCard -> Card -> cardId
                            cc -> cc.getCard().getCardId(),
                            // Value: CollectedCard -> Category -> new CollectionInfoDTO(이름, 색상)
                            Collectors.mapping(
                                    cc -> new CollectionInfoDTO(
                                            cc.getCategory().getCategoryName(),
                                            cc.getCategory().getThemeColor()
                                    ),
                                    Collectors.toList()
                            )
                    ));
        }

        // 2. (기존 코드) N+1 방지를 위해 JOIN FETCH 쿼리 사용
        final Map<Long, List<CollectionInfoDTO>> finalCollectedCardInfoMap = collectedCardInfoMap;

        return cardRepository.findAllWithDetails() //
                .stream()
                // [수정] DTO 생성자에 '수집 정보 맵'을 전달
                .map(card -> new CardDTO(card, finalCollectedCardInfoMap))
                .collect(Collectors.toList());
    }

    // TODO: 카드 검색, 팩별 카드 조회 등 서비스 메서드 추가
}
