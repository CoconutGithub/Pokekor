package com.pokekor.pokekor.repository;

import com.pokekor.pokekor.domain.Card;
import com.pokekor.pokekor.domain.Pack;
import com.pokekor.pokekor.domain.Rarity;
import jakarta.persistence.criteria.Join; // [수정] Join import
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

/**
 * 카드 검색을 위한 동적 쿼리 (Specification) 생성 유틸리티
 */
public class CardSpecification {

    // [수정] cardType, cardAttribute 파라미터 추가
    public static Specification<Card> search(String cardName, Long packId, String rarityId, String cardType, String cardAttribute) {

        return (root, query, cb) -> {

            // 1. 쿼리 타입 확인 (N+1 방지)
            if (query.getResultType() != Long.class && query.getResultType() != long.class) {
                // Data query (SELECT c): N+1 방지를 위해 SELECT 절에 fetch join 추가
                root.fetch("pack", JoinType.LEFT);
                root.fetch("rarity", JoinType.LEFT);
                query.distinct(true);
            }

            // 2. Predicate (WHERE 조건) 리스트 생성
            // (이 로직은 Data 쿼리와 Count 쿼리 모두에 적용됩니다.)
            List<Predicate> predicates = new ArrayList<>();

            // 2-1. 카드 이름 (cardName) 필터
            if (StringUtils.hasText(cardName)) {
                predicates.add(cb.like(root.get("cardName"), "%" + cardName + "%"));
            }

            // 2-2. 팩 ID (packId) 필터
            if (packId != null) {
                // [수정] WHERE 조건절을 위한 join을 별도로 생성 (fetch와 무관)
                Join<Card, Pack> packJoin = root.join("pack", JoinType.LEFT);
                predicates.add(cb.equal(packJoin.get("packId"), packId));
            }

            // 2-3. 레어도 ID (rarityId) 필터
            if (StringUtils.hasText(rarityId)) {
                // [수정] WHERE 조건절을 위한 join을 별도로 생성 (fetch와 무관)
                Join<Card, Rarity> rarityJoin = root.join("rarity", JoinType.LEFT);
                predicates.add(cb.equal(rarityJoin.get("rarityId"), rarityId));
            }

            // [추가] 2-4. 카드 유형 (cardType) 필터
            if (StringUtils.hasText(cardType)) {
                predicates.add(cb.equal(root.get("cardType"), cardType));
            }

            // [추가] 2-5. 카드 속성 (cardAttribute) 필터
            if (StringUtils.hasText(cardAttribute)) {
                predicates.add(cb.equal(root.get("cardAttribute"), cardAttribute));
            }


            // 3. 모든 조건을 AND로 결합하여 반환
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}