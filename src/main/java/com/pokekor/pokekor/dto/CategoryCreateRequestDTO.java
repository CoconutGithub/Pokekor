package com.pokekor.pokekor.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class CategoryCreateRequestDTO {
    // 사용자가 입력할 3가지 필드
    private String categoryName;
    private String themeColor;
    private String categoryType; // 'OWNED' 또는 'WISHLIST'
}
