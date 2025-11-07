package com.pokekor.pokekor.repository;

import com.pokekor.pokekor.domain.CollectionCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CollectionCategoryRepository extends JpaRepository<CollectionCategory, Long> {
    // 특정 사용자가 소유한 모든 카테고리를 찾는 기능
    // "SELECT * FROM T_COLLECTION_CATEGORY WHERE user_id = ?"
    // (JPA 쿼리 메서드 규칙에 따라 User 객체 안의 userId 필드를 찾습니다)
    List<CollectionCategory> findByUserUserId(Long userId);
}
