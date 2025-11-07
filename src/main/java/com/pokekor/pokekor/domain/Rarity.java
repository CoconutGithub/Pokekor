package com.pokekor.pokekor.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.smartcardio.Card;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "T_RARITY")
@Getter
@Setter
@NoArgsConstructor
public class Rarity {

    @Id
    @Column(name = "rarity_id", length = 20)
    private String rarityId; // 'SR', 'RR' 등 (VARCHAR 타입이므로 @GeneratedValue 없음)

    @Column(name = "rarity_name", nullable = false, length = 100)
    private String rarityName;

    @Column(name = "rarity_description", length = 500)
    private String rarityDescription;

    // 하나의 레어도는 여러 개의 카드에 해당될 수 있음 (1:N 관계)
    @OneToMany(mappedBy = "rarity")
    private List<Card> cards = new ArrayList<>();
}