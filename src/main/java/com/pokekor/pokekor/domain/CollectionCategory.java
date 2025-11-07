package com.pokekor.pokekor.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "T_COLLECTION_CATEGORY")
@Getter
@Setter
@NoArgsConstructor
public class CollectionCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "category_id")
    private Long categoryId;

    @Column(name = "category_name", nullable = false, length = 255)
    private String categoryName;

    @Column(name = "theme_color", length = 10)
    private String themeColor;

    @Column(name = "category_type", nullable = false, length = 20)
    private String categoryType; // 'OWNED' 또는 'WISHLIST'

    // N:1 관계 (카테고리는 하나의 유저에게 속함)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // 1:N 관계 (하나의 카테고리는 여러 개의 '수집된 카드' 항목을 가짐)
    @OneToMany(mappedBy = "category", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CollectedCard> collectedCards = new ArrayList<>();
}