package com.pokekor.pokekor.dto;

import com.pokekor.pokekor.domain.Card;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class CardDTO {

    private Long cardId;
    private String cardName;
    private String cardImageUrl;
    private String cardNumberInPack;
    private String packName; // Pack 엔티티의 packNameKo
    private String rarityName; // Rarity 엔티티의 rarityName

    // Card 엔티티를 CardDTO로 변환하는 생성자
    public CardDTO(Card card) {
        this.cardId = card.getCardId();
        this.cardName = card.getCardName();
        this.cardImageUrl = card.getCardImageUrl();
        this.cardNumberInPack = card.getCardNumberInPack();

        // LAZY 로딩이지만, Service에서 JOIN FETCH로 미리 조회해왔기 때문에 N+1 문제 없음
        if (card.getPack() != null) {
            this.packName = card.getPack().getPackNameKo();
        }
        if (card.getRarity() != null) {
            this.rarityName = card.getRarity().getRarityName();
        }
    }
}