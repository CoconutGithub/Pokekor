package com.pokekor.pokekor.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "T_PACK")
@Getter
@Setter
@NoArgsConstructor
public class Pack {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "pack_id")
    private Long packId;

    @Column(name = "pack_name_ko", nullable = false, length = 255)
    private String packNameKo;

    @Column(name = "release_date")
    private LocalDate releaseDate; // Java 8+ LocalDate는 DATE 타입과 매핑됩니다.

    @Column(name = "pack_image_url", length = 1000)
    private String packImageUrl;

    @Column(name = "series", length = 50)
    private String series;

    // 하나의 팩은 여러 개의 카드를 포함함 (1:N 관계)
    @OneToMany(mappedBy = "pack", cascade = CascadeType.ALL)
    private List<Card> cards = new ArrayList<>();
}
