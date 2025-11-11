export interface CollectionInfoDTO {
    categoryName: string;
    themeColor: string;
}

export interface CardDTO {
    cardId: number;
    cardName: string;
    cardImageUrl?: string;
    cardNumberInPack: string;
    packName: string;
    rarityId: string;
    collections: CollectionInfoDTO[];
}

/**
 * 백엔드 CollectionCategory (응답용 DTO)와 일치하는 타입
 */
export interface CollectionCategoryDTO {
    categoryId: number;
    categoryName: string;
    themeColor: string;
    categoryType: 'OWNED' | 'WISHLIST'; // DB의 chk_category_type
}

/**
 * 백엔드 (요청용 DTO)와 일치하는 타입
 */
export interface CategoryCreateRequestDTO {
    categoryName: string;
    themeColor: string;
    categoryType: 'OWNED' | 'WISHLIST';
}

/**
 * [추가됨] 백엔드 CollectionCategoryDetailDTO (상세 조회 응답용)
 * (카테고리 정보 + 수집된 카드 목록)
 */
export interface CollectionCategoryDetailDTO {
    categoryId: number;
    categoryName: string;
    themeColor: string;
    categoryType: 'OWNED' | 'WISHLIST';
    collectedCards: CardDTO[]; // 수집된 카드 목록이 여기에 포함됩니다.
}

/**
 * [추가됨] 백엔드 PackDTO (팩 목록 조회 응답용)
 */
export interface PackDTO {
    packId: number;
    packNameKo: string;
    packImageUrl?: string;
    releaseDate?: string;
    series: string; // "DP", "BW", "XY" 등
}

/**
 * [추가됨] 백엔드 RarityDTO (레어도 목록 조회 응답용)
 */
export interface RarityDTO {
    rarityId: string;
    rarityName: string;
    rarityDescription?: string;
}