import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom'; // URL 파라미터(categoryId)를 가져오기 위해
import { useAuth } from '../App';
import type { CollectionCategoryDetailDTO } from '../types'; // 방금 추가한 상세 DTO 타입

export const CollectionDetailPage = () => {
    // URL 경로에서 "/my-collection/:categoryId"의 categoryId 값을 추출
    const { categoryId } = useParams<{ categoryId: string }>();
    const { api } = useAuth();

    // 카테고리 상세 정보 (카드 목록 포함)를 저장할 state
    const [categoryDetail, setCategoryDetail] = useState<CollectionCategoryDetailDTO | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!categoryId) return; // categoryId가 없으면 API를 호출하지 않음

        const fetchCategoryDetails = async () => {
            try {
                setLoading(true);
                setError(null);

                // 백엔드에서 만든 상세 API 호출
                const response = await api.get<CollectionCategoryDetailDTO>(`/my-collections/${categoryId}`);
                setCategoryDetail(response.data);

            } catch (err: any) {
                console.error("컬렉션 상세 조회 실패:", err);
                if (err.response && (err.response.status === 403 || err.response.status === 404)) {
                    setError("존재하지 않거나 접근 권한이 없는 컬렉션입니다.");
                } else {
                    setError("컬렉션을 불러오는 데 실패했습니다.");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchCategoryDetails();
    }, [api, categoryId]); // categoryId (URL)가 변경될 때마다 API를 다시 호출

    // --- 렌더링 로직 ---

    if (loading) {
        return <div>컬렉션 상세 정보를 불러오는 중...</div>;
    }

    if (error) {
        return <div style={{ color: 'red' }}>{error}</div>;
    }

    if (!categoryDetail) {
        return <div>컬렉션 정보를 찾을 수 없습니다.</div>;
    }

    // 성공적으로 데이터를 받아온 경우
    return (
        <div>
            {/* '목록으로' 돌아가기 링크 */}
            <Link to="/my-collection">&larr; 내 컬렉션 목록으로</Link>

            {/* 카테고리 헤더 (테마 색상 적용) */}
            <h1 style={{
                borderLeft: `8px solid ${categoryDetail.themeColor || '#FFFFFF'}`,
                paddingLeft: '10px',
                marginTop: '15px'
            }}>
                {categoryDetail.categoryName}
            </h1>
            <p>
                {categoryDetail.categoryType === 'OWNED' ? '보유 앨범' : '희망 앨범'} |
                총 {categoryDetail.collectedCards.length}장의 카드가 수집되었습니다.
            </p>

            <hr style={{ margin: '20px 0' }} />

            {/* CardListPage.tsx의 카드 렌더링 로직을 재사용 */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                {categoryDetail.collectedCards.length === 0 ? (
                    <p>이 컬렉션에 수집된 카드가 아직 없습니다.</p>
                ) : (
                    // DTO에 포함된 collectedCards 배열을 순회
                    categoryDetail.collectedCards.map(card => (
                        <div key={card.cardId} style={{
                            border: '1px solid #ccc',
                            padding: '10px',
                            width: '200px',
                            backgroundColor: '#f9f9f9'
                        }}>
                            <img
                                src={card.cardImageUrl}
                                alt={card.cardName}
                                style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
                                onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/150?text=No+Image')}
                            />
                            <h4 style={{ marginTop: '8px', marginBottom: '4px', fontSize: '16px' }}>
                                {card.cardName}
                            </h4>
                            <p style={{ margin: 0, fontSize: '14px', color: '#555' }}>
                                {card.packName}
                            </p>
                            <p style={{ margin: 0, fontSize: '12px', color: '#777' }}>
                                {card.rarityId} ({card.cardNumberInPack})
                            </p>
                            {/* 나중에 이 곳에 '컬렉션에서 제거' 버튼을 추가할 수 있습니다. */}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};