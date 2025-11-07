package com.pokekor.pokekor.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class CardCollectRequestDTO {
    // 프론트엔드에서 "이 카드를" 수집해줘
    private Long cardId;
}
