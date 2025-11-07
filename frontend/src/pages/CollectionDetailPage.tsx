import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../App';
import type { CollectionCategoryDetailDTO, CardDTO } from '../types';

export const CollectionDetailPage = () => {
    // (기존 코드와 동일 ... )
    const { categoryId } = useParams<{ categoryId: string }>();
    const { api } = useAuth();
    const [categoryDetail, setCategoryDetail] = useState<CollectionCategoryDetailDTO | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isRemovingId, setIsRemovingId] = useState<number | null>(null);
    const [removeError, setRemoveError] = useState<string | null>(null);

    // (기존 코드와 동일 ... )
    useEffect(() => {
        if (!categoryId) return;

        const fetchCategoryDetails = async () => {
            try {
                setLoading(true);
                setError(null);
                setRemoveError(null);

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
    }, [api, categoryId]);

    // (기존 코드와 동일 ... )
    const handleRemoveCard = async (cardToRemove: CardDTO) => {
        if (!window.confirm(`[${cardToRemove.cardName}] 카드를 이 컬렉션에서 정말 제거하시겠습니까?`)) {
            return;
        }

        if (!categoryId) return;

        setIsRemovingId(cardToRemove.cardId);
        setRemoveError(null);

        try {
            await api.delete(`/my-collections/${categoryId}/cards/${cardToRemove.cardId}`);

            setCategoryDetail(prevDetail => {
                if (!prevDetail) return null;

                const updatedCards = prevDetail.collectedCards.filter(
                    card => card.cardId !== cardToRemove.cardId
                );

                return {
                    ...prevDetail,
                    collectedCards: updatedCards
                };
            });

        } catch (err: any) {
            console.error("카드 제거 실패:", err);
            if (err.response && err.response.data) {
                setRemoveError(`제거 실패: ${err.response.data.message || err.response.data}`);
            } else {
                setRemoveError("카드 제거에 실패했습니다.");
            }
        } finally {
            setIsRemovingId(null);
        }
    };

    // --- 렌더링 로직 ---

    if (loading) {
        // (기존 코드와 동일 ... )
        return <div>컬렉션 상세 정보를 불러오는 중...</div>;
    }

    if (error) {
        // (기존 코드와 동일 ... )
        return <div style={{ color: 'red' }}>{error}</div>;
    }

    if (!categoryDetail) {
        // (기존 코드와 동일 ... )
        return <div>컬렉션 정보를 찾을 수 없습니다.</div>;
    }

    return (
        <div>
            {/* (기존 코드와 동일 ... ) */}
            <Link to="/my-collection">&larr; 내 컬렉션 목록으로</Link>

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

            {removeError && (
                <div style={{ padding: '10px', backgroundColor: '#f8d7da', color: '#721c24', border: '1px solid #f5c6cb', margin: '15px 0' }}>
                    {removeError}
                </div>
            )}

            <hr style={{ margin: '20px 0' }} />

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                {categoryDetail.collectedCards.length === 0 ? (
                    <p>이 컬렉션에 수집된 카드가 아직 없습니다.</p>
                ) : (
                    categoryDetail.collectedCards.map(card => (
                        // [수정] 카드 아이템 div에 flex-column 스타일 적용
                        <div key={card.cardId} style={{
                            border: '1px solid #ccc',
                            padding: '10px',
                            width: '200px',
                            backgroundColor: '#f9f9f9',
                            opacity: isRemovingId === card.cardId ? 0.5 : 1,
                            // [수정] 1. 카드 박스 자체를 flex-column으로 만듭니다.
                            display: 'flex',
                            flexDirection: 'column'
                        }}>

                            {/* [수정] 2. 이미지를 고정 높이(260px) 컨테이너로 감쌉니다. */}
                            <div style={{
                                width: '100%',
                                height: '260px', // [수정] 이미지 영역 높이 고정
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '8px' // [수정] 텍스트와 여백
                            }}>
                                <img
                                    src={card.cardImageUrl}
                                    alt={card.cardName}
                                    // [수정] 이미지가 컨테이너를 넘지 않도록 max-width/height 설정
                                    style={{
                                        maxWidth: '100%',
                                        maxHeight: '100%',
                                        objectFit: 'contain'
                                    }}
                                    onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/150?text=No+Image')}
                                />
                            </div>

                            {/* [수정] 3. 텍스트 영역을 div로 묶습니다. */}
                            <div>
                                <h4 style={{
                                    margin: '0 0 4px 0', // [수정] 마진 조정
                                    fontSize: '16px',
                                    color: '#213547',
                                    // [수정] 카드 이름이 2줄일 경우를 대비해 최소 높이 고정 (16px * 1.5 line-height * 2줄 = 48px)
                                    minHeight: '3em'
                                }}>
                                    {card.cardName}
                                </h4>
                                <p style={{ margin: 0, fontSize: '14px', color: '#555' }}>
                                    {card.packName}
                                </p>
                                <p style={{ margin: 0, fontSize: '12px', color: '#777' }}>
                                    {card.rarityId} ({card.cardNumberInPack})
                                </p>
                            </div>

                            {/* [수정] 4. 버튼 영역에 'marginTop: auto'를 적용해 맨 아래로 밀어냅니다. */}
                            <div style={{
                                marginTop: 'auto', // [수정] 이 영역을 flex 컨테이너의 맨 아래로 밀어냄
                                paddingTop: '10px'  // [수정] 위 텍스트 영역과의 최소 여백
                            }}>
                                <button
                                    onClick={() => handleRemoveCard(card)}
                                    disabled={isRemovingId === card.cardId}
                                    style={{
                                        width: '100%',
                                        backgroundColor: '#dc3545',
                                        color: 'white',
                                        border: 'none',
                                        cursor: 'pointer',
                                        // [수정] 버튼 자체의 상단 마진 제거, padding으로 높이감 부여
                                        paddingTop: '10px',
                                        paddingBottom: '10px'
                                    }}
                                >
                                    {isRemovingId === card.cardId ? '제거 중...' : '제거'}
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};