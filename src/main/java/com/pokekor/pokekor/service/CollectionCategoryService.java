package com.pokekor.pokekor.service;

import com.pokekor.pokekor.domain.CollectionCategory;
import com.pokekor.pokekor.domain.User;
import com.pokekor.pokekor.dto.CategoryCreateRequestDTO;
import com.pokekor.pokekor.dto.CollectionCategoryDTO;
import com.pokekor.pokekor.dto.CollectionCategoryDetailDTO;
import com.pokekor.pokekor.repository.CollectionCategoryRepository;
import com.pokekor.pokekor.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CollectionCategoryService {

    private final CollectionCategoryRepository collectionCategoryRepository;
    private final UserRepository userRepository;

    /**
     * 특정 사용자의 모든 컬렉션 카테고리 조회
     * @param username (로그인한 사용자의 아이디)
     * @return List<CollectionCategoryDTO>
     */
    public List<CollectionCategoryDTO> getCategoriesForUser(String username) {
        // 1. 사용자 ID로 카테고리 조회
        // (findByUserUserId가 User 객체를 로드하지 않고 FK만으로 조회하여 더 효율적일 수 있음)
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("사용자를 찾을 수 없습니다: " + username));

        List<CollectionCategory> categories = collectionCategoryRepository.findByUserUserId(user.getUserId());

        // 2. DTO로 변환하여 반환
        return categories.stream()
                .map(CollectionCategoryDTO::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * 특정 사용자를 위해 새 카테고리 생성
     * @param username (로그인한 사용자의 아이디)
     * @param requestDTO (새 카테고리 정보)
     * @return CollectionCategoryDTO (생성된 카테고리 정보)
     */
    @Transactional // (readOnly = false) 쓰기 트랜잭션
    public CollectionCategoryDTO createCategory(String username, CategoryCreateRequestDTO requestDTO) {
        // 1. 사용자 엔티티 조회
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("사용자를 찾을 수 없습니다: " + username));

        // 2. DTO -> Entity 변환
        CollectionCategory newCategory = new CollectionCategory();
        newCategory.setUser(user); // 연관관계 설정 (필수)
        newCategory.setCategoryName(requestDTO.getCategoryName());
        newCategory.setCategoryType(requestDTO.getCategoryType());
        newCategory.setThemeColor(requestDTO.getThemeColor() != null ? requestDTO.getThemeColor() : "#FFFFFF"); // 기본값

        // 3. 저장
        CollectionCategory savedCategory = collectionCategoryRepository.save(newCategory);

        // 4. DTO로 변환하여 반환
        return CollectionCategoryDTO.fromEntity(savedCategory);
    }

    /**
     * [추가됨] 특정 카테고리의 상세 정보 (포함된 카드 목록 포함) 조회
     * @param categoryId (조회할 카테고리 ID)
     * @param username (권한 확인용, 현재 로그인한 사용자)
     * @return CollectionCategoryDetailDTO
     */
    public CollectionCategoryDetailDTO getCategoryDetails(Long categoryId, String username) {
        // 1. N+1 방지 쿼리를 사용하여 카테고리 및 하위 카드 정보 모두 조회
        CollectionCategory category = collectionCategoryRepository.findByIdWithCollectedCards(categoryId)
                .orElseThrow(() -> new IllegalArgumentException("카테고리를 찾을 수 없습니다: " + categoryId));

        // 2. (중요) 보안 검사: 요청한 사용자가 카테고리의 소유자인지 확인
        if (!category.getUser().getUsername().equals(username)) {
            throw new AccessDeniedException("이 카테고리를 조회할 권한이 없습니다.");
        }

        // 3. DTO로 변환하여 반환
        // (JOIN FETCH가 모두 완료되었으므로 DTO 변환 시 추가 쿼리 발생 안 함)
        return new CollectionCategoryDetailDTO(category);
    }
}