package com.pokekor.pokekor.controller;

import com.pokekor.pokekor.dto.CategoryCreateRequestDTO;
import com.pokekor.pokekor.dto.CollectionCategoryDTO;
import com.pokekor.pokekor.service.CollectionCategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/my-collections") // 인증이 필요한 경로
@RequiredArgsConstructor
public class CollectionCategoryController {

    private final CollectionCategoryService collectionCategoryService;

    /**
     * 내 컬렉션 카테고리 목록 조회
     * GET /api/my-collections
     * (SecurityConfig의 .anyRequest().authenticated()에 의해 보호됨)
     */
    @GetMapping
    public ResponseEntity<List<CollectionCategoryDTO>> getMyCategories(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        // @AuthenticationPrincipal을 통해 현재 로그인한 사용자의 정보를 가져옴
        String username = userDetails.getUsername();
        List<CollectionCategoryDTO> categories = collectionCategoryService.getCategoriesForUser(username);
        return ResponseEntity.ok(categories);
    }

    /**
     * 새 컬렉션 카테고리 생성
     * POST /api/my-collections
     */
    @PostMapping
    public ResponseEntity<CollectionCategoryDTO> createCategory(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody CategoryCreateRequestDTO requestDTO
    ) {
        String username = userDetails.getUsername();
        CollectionCategoryDTO createdCategory = collectionCategoryService.createCategory(username, requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdCategory);
    }
}
