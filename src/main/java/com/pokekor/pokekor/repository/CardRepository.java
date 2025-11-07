package com.pokekor.pokekor.repository;

import com.pokekor.pokekor.domain.Card;
import com.pokekor.pokekor.domain.Rarity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CardRepository extends JpaRepository<Card, Long> {
    // 나중에 검색 기능을 위해 여기에 메서드를 추가할 수 있습니다.
    // 예: 팩 ID로 카드 목록 찾기
    List<Card> findByPackPackId(Long packId);
    // 예: 카드 이름으로 검색하기 (포함)
    List<Card> findByCardNameContaining(String cardName);

    @Query("SELECT c FROM Card c LEFT JOIN FETCH c.pack p LEFT JOIN FETCH c.rarity r")
    List<Card> findAllWithDetails();
}
