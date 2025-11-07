package com.pokekor.pokekor.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "T_COLLECTED_CARD", uniqueConstraints = {
        // uk_category_card 제약조건을 Java 레벨에서도 명시
        @UniqueConstraint(columnNames = {"category_id", "card_id"})
})
@Getter
@Setter
@NoArgsConstructor
public class CollectedCard {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "collected_card_id")
    private Long collectedCardId;

    // N:1 관계 (수집된 카드 항목은 하나의 카테고리에 속함)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private CollectionCategory category;

    // N:1 관계 (수집된 카드 항목은 하나의 마스터 카드를 가리킴)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "card_id", nullable = false)
    private Card card;
}