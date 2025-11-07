export interface CardDTO {
    cardId: number;
    cardName: string;
    cardImageUrl?: string;
    cardNumberInPack: string;
    packName: string;
    rarityId: string;
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