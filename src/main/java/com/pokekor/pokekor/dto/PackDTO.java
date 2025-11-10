package com.pokekor.pokekor.dto;

import com.pokekor.pokekor.domain.Pack;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@NoArgsConstructor
public class PackDTO {

    private Long packId;
    private String packNameKo;
    private LocalDate releaseDate;
    private String packImageUrl;
    private String series; // "DP", "BW", "XY" 등

    // 엔티티를 DTO로 변환하는 생성자
    public PackDTO(Pack entity) {
        this.packId = entity.getPackId();
        this.packNameKo = entity.getPackNameKo();
        this.releaseDate = entity.getReleaseDate();
        this.packImageUrl = entity.getPackImageUrl();
        this.series = entity.getSeries();
    }
}