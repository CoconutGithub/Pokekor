package com.pokekor.pokekor.controller;

import com.pokekor.pokekor.domain.CollectedCard;
import com.pokekor.pokekor.dto.CardCollectRequestDTO;
import com.pokekor.pokekor.dto.CategoryCreateRequestDTO;
import com.pokekor.pokekor.dto.CollectionCategoryDTO;
import com.pokekor.pokekor.dto.CollectionCategoryDetailDTO;
import com.pokekor.pokekor.service.CollectedCardService;
import com.pokekor.pokekor.service.CollectionCategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/my-collections") // 인증이 필요한 경로
@RequiredArgsConstructor
public class CollectionCategoryController {

    private final CollectionCategoryService collectionCategoryService;
    private final CollectedCardService collectedCardService;

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
     * [추가됨] 특정 카테고리 상세 조회 (수집된 카드 목록 포함)
     * GET /api/my-collections/{categoryId}
     */
    @GetMapping("/{categoryId}")
    public ResponseEntity<?> getCategoryDetails(
            @PathVariable Long categoryId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        try {
            String username = userDetails.getUsername();
            CollectionCategoryDetailDTO categoryDetails = collectionCategoryService.getCategoryDetails(categoryId, username);
            return ResponseEntity.ok(categoryDetails);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("서버 오류: " + e.getMessage());
        }
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

    /**
     * [추가됨] 특정 카테고리 정보 수정
     * PUT /api/my-collections/{categoryId}
     */
    @PutMapping("/{categoryId}")
    public ResponseEntity<?> updateCategory(
            @PathVariable Long categoryId,
            @RequestBody CategoryCreateRequestDTO requestDTO, // [수정] 생성 DTO 재사용
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        try {
            String username = userDetails.getUsername();
            CollectionCategoryDTO updatedCategory = collectionCategoryService.updateCategory(categoryId, requestDTO, username);
            return ResponseEntity.ok(updatedCategory); // 성공 시 200 OK와 수정된 DTO 반환

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("서버 오류: " + e.getMessage());
        }
    }

    /**
     * [추가됨] 특정 카테고리 삭제
     * DELETE /api/my-collections/{categoryId}
     */
    @DeleteMapping("/{categoryId}")
    public ResponseEntity<?> deleteCategory(
            @PathVariable Long categoryId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        try {
            String username = userDetails.getUsername();
            collectionCategoryService.deleteCategory(categoryId, username);

            // 성공 시 200 OK와 메시지 반환
            return ResponseEntity.ok(Map.of("message", "카테고리가 성공적으로 삭제되었습니다."));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("서버 오류: " + e.getMessage());
        }
    }

    /**
     * [추가됨] 특정 카테고리에 카드 추가 (수집)
     * POST /api/my-collections/{categoryId}/cards
     *
     * @param categoryId (URL 경로 변수)
     * @param requestDTO (Request Body, 예: { "cardId": 123 })
     * @param userDetails (로그인한 사용자 정보)
     * @return
     */
    @PostMapping("/{categoryId}/cards")
    public ResponseEntity<?> addCardToCategory(
            @PathVariable Long categoryId,
            @RequestBody CardCollectRequestDTO requestDTO,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        try {
            String username = userDetails.getUsername();
            CollectedCard savedCard = collectedCardService.addCardToCategory(
                    categoryId,
                    requestDTO.getCardId(),
                    username
            );

            // 성공 시 201 Created 응답 (간단한 메시지만 반환)
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of("message", "카드가 성공적으로 수집되었습니다."));

        } catch (IllegalArgumentException e) {
            // 존재하지 않는 카드 또는 카테고리 ID
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (AccessDeniedException e) {
            // 다른 사용자의 카테고리에 접근 시도
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (IllegalStateException e) {
            // 이미 수집된 카드 (중복)
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        } catch (Exception e) {
            // 기타 서버 오류
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("서버 오류가 발생했습니다: " + e.getMessage());
        }
    }

    /**
     * [추가됨] 특정 카테고리에서 카드 제거 (수집 해제)
     * DELETE /api/my-collections/{categoryId}/cards/{cardId}
     */
    @DeleteMapping("/{categoryId}/cards/{cardId}")
    public ResponseEntity<?> removeCardFromCategory(
            @PathVariable Long categoryId,
            @PathVariable Long cardId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        try {
            String username = userDetails.getUsername();
            collectedCardService.removeCardFromCategory(categoryId, cardId, username);

            // 성공 시 200 OK (또는 204 No Content) 와 메시지 반환
            return ResponseEntity.ok(Map.of("message", "카드가 컬렉션에서 제거되었습니다."));

        } catch (IllegalArgumentException e) {
            // 제거할 카드가 없는 경우
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (AccessDeniedException e) {
            // 권한이 없는 경우
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (Exception e) {
            // 기타 서버 오류
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("서버 오류: " + e.getMessage());
        }
    }
}
