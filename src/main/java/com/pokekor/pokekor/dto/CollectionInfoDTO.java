package com.pokekor.pokekor.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class CollectionInfoDTO {
    // 카드 템플릿에 표시할 닷(Dot) 정보
    private String categoryName;
    private String themeColor;
}