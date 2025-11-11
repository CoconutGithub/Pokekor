package com.pokekor.pokekor.dto;

import com.pokekor.pokekor.domain.Rarity;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class RarityDTO {

    private String rarityId;
    private String rarityName;
    private String rarityDescription;

    public RarityDTO(Rarity entity) {
        this.rarityId = entity.getRarityId();
        this.rarityName = entity.getRarityName();
        this.rarityDescription = entity.getRarityDescription(); // 오타 수정: getRarityDescription()
    }
}