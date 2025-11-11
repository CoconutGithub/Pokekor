package com.pokekor.pokekor.service;

import com.pokekor.pokekor.domain.Card;
import com.pokekor.pokekor.domain.CollectedCard;
import com.pokekor.pokekor.dto.CardDTO;
import com.pokekor.pokekor.dto.CollectionInfoDTO;
import com.pokekor.pokekor.repository.CardRepository;
import com.pokekor.pokekor.repository.CardSpecification;
import com.pokekor.pokekor.repository.CollectedCardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CardService {

    private final CardRepository cardRepository;
    private final CollectedCardRepository collectedCardRepository;

    // [수정] cardType, cardAttribute 파라미터 추가
    public List<CardDTO> searchCards(String username, Long packId, String cardName, String rarityId, String cardType, String cardAttribute) {

        // 1. 수집 정보 조회 (기존 로직과 동일)
        Map<Long, List<CollectionInfoDTO>> collectedCardInfoMap = Collections.emptyMap();
        if (username != null) {
            List<CollectedCard> allCollectedCards =
                    collectedCardRepository.findWithCategoryByUsername(username);

            collectedCardInfoMap = allCollectedCards.stream()
                    // ... (groupingBy 로직 동일)
                    .collect(Collectors.groupingBy(
                            cc -> cc.getCard().getCardId(),
                            Collectors.mapping(
                                    cc -> new CollectionInfoDTO(
                                            cc.getCategory().getCategoryName(),
                                            cc.getCategory().getThemeColor()
                                    ),
                                    Collectors.toList()
                            )
                    ));
        }

        // 2. [수정] 검색 조건(Specification) 생성 (CardSpecification에 새 파라미터 전달)
        Specification<Card> spec = CardSpecification.search(cardName, packId, rarityId, cardType, cardAttribute);

        // 3. [수정] JpaSpecificationExecutor의 기본 findAll(spec) 메서드를 호출
        List<Card> cards = cardRepository.findAll(spec);


        final Map<Long, List<CollectionInfoDTO>> finalCollectedCardInfoMap = collectedCardInfoMap;

        // 4. DTO 변환 (기존 로직과 동일)
        return cards.stream()
                .map(card -> new CardDTO(card, finalCollectedCardInfoMap))
                .collect(Collectors.toList());
    }
}