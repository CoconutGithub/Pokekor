package com.pokekor.pokekor.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "T_CARD")
@Getter
@Setter
@NoArgsConstructor
public class Card {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "card_id")
    private Long cardId;

    @Column(name = "card_name", nullable = false, length = 255)
    private String cardName;

    @Column(name = "card_image_url", length = 1000)
    private String cardImageUrl;

    @Column(name = "card_number_in_pack", length = 50)
    private String cardNumberInPack;

    // N:1 관계 (카드는 하나의 팩에 속함)
    @ManyToOne(fetch = FetchType.LAZY) // LAZY: 성능 최적화를 위해 필요할 때만 Pack 정보를 로드
    @JoinColumn(name = "pack_id") // DB의 외래 키(FK) 컬럼 이름
    private Pack pack;

    // N:1 관계 (카드는 하나의 레어도를 가짐)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rarity_id") // DB의 외래 키(FK) 컬럼 이름
    private Rarity rarity;

    // (T_COLLECTED_CARD와의 1:N 관계는 수집 기능 구현 시 필요하면 추가)
}