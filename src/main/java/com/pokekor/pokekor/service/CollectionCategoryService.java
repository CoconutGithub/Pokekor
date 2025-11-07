package com.pokekor.pokekor.service;

import com.pokekor.pokekor.domain.CollectionCategory;
import com.pokekor.pokekor.domain.User;
import com.pokekor.pokekor.dto.CategoryCreateRequestDTO;
import com.pokekor.pokekor.dto.CollectionCategoryDTO;
import com.pokekor.pokekor.repository.CollectionCategoryRepository;
import com.pokekor.pokekor.repository.UserRepository;
import lombok.RequiredArgsConstructor;
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
}