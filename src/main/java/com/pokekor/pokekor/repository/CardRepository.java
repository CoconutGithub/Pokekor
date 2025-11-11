package com.pokekor.pokekor.repository;

import com.pokekor.pokekor.domain.Card;
import com.pokekor.pokekor.domain.Rarity;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
// [수정] JpaSpecificationExecutor 인터페이스 추가
public interface CardRepository extends JpaRepository<Card, Long>, JpaSpecificationExecutor<Card> {

    // (기존 메서드들은 그대로 둠)
    List<Card> findByPackPackId(Long packId);
    List<Card> findByCardNameContaining(String cardName);

    @Query("SELECT c FROM Card c LEFT JOIN FETCH c.pack p LEFT JOIN FETCH c.rarity r")
    List<Card> findAllWithDetails();

    @Query("SELECT c FROM Card c LEFT JOIN FETCH c.pack p LEFT JOIN FETCH c.rarity r WHERE p.packId = :packId")
    List<Card> findAllWithDetailsByPackId(@Param("packId") Long packId);

    /**
     * [추가] Specification을 사용한 N+1 방지 JOIN FETCH 쿼리
     * (Specification 쿼리는 count 쿼리와 data 쿼리를 분리 실행하므로,
     * data 쿼리에만 JOIN FETCH를 적용하기 위해 별도 메서드로 분리)
     */
//    @Query("SELECT c FROM Card c LEFT JOIN FETCH c.pack p LEFT JOIN FETCH c.rarity r")
//    List<Card> findAllWithDetails(Specification<Card> spec);
}
