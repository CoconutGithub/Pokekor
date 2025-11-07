package com.pokekor.pokekor.repository;

import com.pokekor.pokekor.domain.CollectionCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CollectionCategoryRepository extends JpaRepository<CollectionCategory, Long> {
    // 특정 사용자가 소유한 모든 카테고리를 찾는 기능
    // "SELECT * FROM T_COLLECTION_CATEGORY WHERE user_id = ?"
    // (JPA 쿼리 메서드 규칙에 따라 User 객체 안의 userId 필드를 찾습니다)
    List<CollectionCategory> findByUserUserId(Long userId);

    /**
     * [추가됨] N+1 문제를 해결하기 위한 JOIN FETCH 쿼리
     * 특정 카테고리 ID로 조회 시,
     * 1. 수집된 카드 목록(cc)을 JOIN FETCH
     * 2. 수집된 카드가 가리키는 마스터 카드(c_card)를 JOIN FETCH
     * 3. 마스터 카드의 팩(p)과 레어도(r)를 JOIN FETCH
     */
    @Query("SELECT c FROM CollectionCategory c " +
            "LEFT JOIN FETCH c.collectedCards cc " +
            "LEFT JOIN FETCH cc.card c_card " +
            "LEFT JOIN FETCH c_card.pack p " +
            "LEFT JOIN FETCH c_card.rarity r " +
            "WHERE c.categoryId = :categoryId")
    Optional<CollectionCategory> findByIdWithCollectedCards(@Param("categoryId") Long categoryId);
}
