package com.pokekor.pokekor.dto;

import com.pokekor.pokekor.domain.CollectionCategory;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class CollectionCategoryDTO {

    private Long categoryId;
    private String categoryName;
    private String themeColor;
    private String categoryType; // "OWNED" 또는 "WISHLIST"

    // CollectionCategory 엔티티를 DTO로 변환
    public static CollectionCategoryDTO fromEntity(CollectionCategory entity) {
        return new CollectionCategoryDTO(
                entity.getCategoryId(),
                entity.getCategoryName(),
                entity.getThemeColor(),
                entity.getCategoryType()
        );
    }
}