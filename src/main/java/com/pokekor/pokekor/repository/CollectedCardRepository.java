package com.pokekor.pokekor.repository;

import com.pokekor.pokekor.domain.CollectedCard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface CollectedCardRepository extends JpaRepository<CollectedCard, Long> {

    // 특정 카테고리에 특정 카드가 이미 수집되었는지 확인하는 기능
    Optional<CollectedCard> findByCategoryCategoryIdAndCardCardId(Long categoryId, Long cardId);

    /**
     * [수정됨] 특정 사용자가 수집한 모든 카드의 정보와 '카테고리' 정보를 JOIN FETCH로 조회
     * (이전의 findCollectedCardIdsByUsernameAndOwned 메서드를 대체합니다)
     *
     * @param username (로그인한 사용자 아이디)
     * @return 수집된 카드 목록 (카테고리 정보 포함)
     */
    @Query("SELECT cc FROM CollectedCard cc " +
            "JOIN FETCH cc.category cat " + // [수정] 카테고리 정보를 함께 가져옴
            "WHERE cat.user.username = :username")
    List<CollectedCard> findWithCategoryByUsername(@Param("username") String username);
}
