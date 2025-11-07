package com.pokekor.pokekor.service;

import com.pokekor.pokekor.domain.Card;
import com.pokekor.pokekor.domain.CollectedCard;
import com.pokekor.pokekor.domain.CollectionCategory;
import com.pokekor.pokekor.repository.CardRepository;
import com.pokekor.pokekor.repository.CollectedCardRepository;
import com.pokekor.pokekor.repository.CollectionCategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional // 쓰기 작업이 포함되므로 readOnly = false
public class CollectedCardService {

    private final CollectedCardRepository collectedCardRepository;
    private final CollectionCategoryRepository collectionCategoryRepository;
    private final CardRepository cardRepository;

    /**
     * 특정 카테고리에 특정 카드를 추가 (수집)
     * @param categoryId (어느 카테고리에?)
     * @param cardId (어떤 카드를?)
     * @param username (누가 요청?)
     * @return 저장된 CollectedCard 엔티티
     */
    public CollectedCard addCardToCategory(Long categoryId, Long cardId, String username) {
        // 1. 카테고리 엔티티 조회
        CollectionCategory category = collectionCategoryRepository.findById(categoryId)
                .orElseThrow(() -> new IllegalArgumentException("카테고리를 찾을 수 없습니다: " + categoryId));

        // 2. (중요) 보안 검사: 요청한 사용자가 카테고리의 소유자인지 확인
        if (!category.getUser().getUsername().equals(username)) {
            throw new AccessDeniedException("이 카테고리에 접근할 권한이 없습니다.");
        }

        // 3. 카드 엔티티 조회
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new IllegalArgumentException("카드를 찾을 수 없습니다: " + cardId));

        // 4. (중요) 중복 검사: 해당 카테고리에 이 카드가 이미 수집되었는지 확인
        // (JPA가 자동으로 생성해준 메서드 활용)
        collectedCardRepository.findByCategoryCategoryIdAndCardCardId(categoryId, cardId)
                .ifPresent(existingCard -> {
                    throw new IllegalStateException("이 카드는 이미 해당 카테고리에 수집되었습니다.");
                });

        // 5. 모든 검사 통과 -> 새 CollectedCard 엔티티 생성
        CollectedCard newCollectedCard = new CollectedCard();
        newCollectedCard.setCategory(category); // 연관관계 설정 (FK)
        newCollectedCard.setCard(card);         // 연관관계 설정 (FK)

        // 6. T_COLLECTED_CARD 테이블에 저장
        return collectedCardRepository.save(newCollectedCard);
    }
}