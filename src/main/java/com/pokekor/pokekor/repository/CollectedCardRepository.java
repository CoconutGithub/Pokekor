package com.pokekor.pokekor.repository;

import com.pokekor.pokekor.domain.CollectedCard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CollectedCardRepository extends JpaRepository<CollectedCard, Long> {

    // 특정 카테고리에 특정 카드가 이미 수집되었는지 확인하는 기능
    Optional<CollectedCard> findByCategoryCategoryIdAndCardCardId(Long categoryId, Long cardId);
}
