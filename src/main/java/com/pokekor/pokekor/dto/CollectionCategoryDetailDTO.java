package com.pokekor.pokekor.dto;

import com.pokekor.pokekor.domain.CollectionCategory;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.stream.Collectors;

@Getter
@NoArgsConstructor
public class CollectionCategoryDetailDTO {

    // 카테고리 자체의 정보
    private Long categoryId;
    private String categoryName;
    private String themeColor;
    private String categoryType;

    // [추가] 이 카테고리에 수집된 카드 목록
    private List<CardDTO> collectedCards;

    /**
     * CollectionCategory 엔티티를 DTO로 변환하는 생성자
     * (N+1 방지를 위해 JOIN FETCH된 엔티티가 넘어와야 함)
     */
    public CollectionCategoryDetailDTO(CollectionCategory entity) {
        this.categoryId = entity.getCategoryId();
        this.categoryName = entity.getCategoryName();
        this.themeColor = entity.getThemeColor();
        this.categoryType = entity.getCategoryType();

        // (중요) EAGER 로딩이 아닌, JOIN FETCH로 가져온 CollectedCard 리스트를 DTO로 변환
        // getCollectedCards() -> List<CollectedCard>
        // .getCard()         -> Card
        // new CardDTO(card) -> CardDTO
        this.collectedCards = entity.getCollectedCards().stream()
                .map(collectedCard -> new CardDTO(collectedCard.getCard()))
                .collect(Collectors.toList());
    }
}
