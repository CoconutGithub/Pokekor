package com.pokekor.pokekor.dto;

import com.pokekor.pokekor.domain.Card;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.*;

@Getter
@NoArgsConstructor
public class CardDTO {

    private Long cardId;
    private String cardName;
    private String cardImageUrl;
    private String cardNumberInPack;
    private String packName; // Pack 엔티티의 packNameKo
    private String rarityId; // Rarity 엔티티의 rarityName

    // [추가] 카드 유형 및 속성 필드
    private String cardType;
    private String cardAttribute;
    // [수정] boolean isCollected -> List<String> collectedInColors
    private List<CollectionInfoDTO> collections = new ArrayList<>(); // 빈 리스트로 초기화

    /**
     * [수정됨] Card 엔티티를 CardDTO로 변환하는 메인 생성자
     *
     * @param card (JPA로 조회한 Card 엔티티)
     * @param collectedCardInfoMap (Key: cardId, Value: 이 카드를 수집한 카테고리 정보(이름, 색상) 목록)
     */
    public CardDTO(Card card, Map<Long, List<CollectionInfoDTO>> collectedCardInfoMap) {
        this.cardId = card.getCardId();
        this.cardName = card.getCardName();
        this.cardImageUrl = card.getCardImageUrl();
        this.cardNumberInPack = card.getCardNumberInPack();

        // [추가] 유형 및 속성 매핑
        this.cardType = card.getCardType();
        this.cardAttribute = card.getCardAttribute();

        if (card.getPack() != null) {
            this.packName = card.getPack().getPackNameKo();
        }
        if (card.getRarity() != null) {
            this.rarityId = card.getRarity().getRarityId();
        }


        // [수정]
        // collectedCardInfoMap에서 이 카드의 ID에 해당하는 '정보 목록'을 가져와 설정
        this.collections = collectedCardInfoMap.getOrDefault(
                this.cardId,
                Collections.emptyList()
        );
    }

    /**
     * (기존 코드) 수집 목록 조회 시 사용되는 생성자 (DetailDTO 내부)
     * [수정] 위 메인 생성자를 호출하도록 변경 (collectedInColors는 빈 리스트로 유지됨)
     * (상세 페이지에서는 컬러 닷을 표시할 필요가 없으므로)
     */
    public CardDTO(Card card) {
        this(card, Collections.emptyMap());
    }
}