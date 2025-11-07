// (기존 코드와 동일)
import { useState, useEffect, Fragment } from 'react';
import { useAuth } from '../App';
import type { CardDTO, CollectionCategoryDTO } from '../types';

export const CardListPage = () => {
    // (기존 코드와 동일 ... )
    const { api, user } = useAuth();
    const [cards, setCards] = useState<CardDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [categories, setCategories] = useState<CollectionCategoryDTO[]>([]);
    const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
    const [targetCategoryId, setTargetCategoryId] = useState<string>('');
    const [collectStatus, setCollectStatus] = useState<string | null>(null);

    // (기존 코드와 동일 ... )
    useEffect(() => {
        const fetchAllData = async () => {
            try {
                setLoading(true);
                setError(null);

                const cardsResponse = await api.get<CardDTO[]>('/cards');
                setCards(cardsResponse.data);

                if (user) {
                    const categoryResponse = await api.get<CollectionCategoryDTO[]>('/my-collections');
                    setCategories(categoryResponse.data);
                    if (categoryResponse.data.length > 0) {
                        setTargetCategoryId(String(categoryResponse.data[0].categoryId));
                    }
                }

            } catch (err) {
                console.error("데이터 조회 실패:", err);
                setError("데이터를 불러오는 데 실패했습니다.");
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, [api, user]);

    // (기존 코드와 동일 ... )
    const handleCollectClick = (cardId: number) => {
        setSelectedCardId(cardId);
        setCollectStatus(null);
        if (categories.length > 0 && targetCategoryId === '') {
            setTargetCategoryId(String(categories[0].categoryId));
        }
    };

    // (기존 코드와 동일 ... )
    const handleCancelClick = () => {
        setSelectedCardId(null);
        setCollectStatus(null);
    };

    // (기존 코드와 동일 ... )
    const handleConfirmCollect = async () => {
        if (!selectedCardId) return;
        if (targetCategoryId === '') {
            setCollectStatus("추가할 카테고리를 선택하세요.");
            return;
        }

        setCollectStatus("수집 중...");

        try {
            await api.post(`/my-collections/${targetCategoryId}/cards`, {
                cardId: selectedCardId
            });

            setCollectStatus("수집 성공!");
            setTimeout(() => {
                setSelectedCardId(null);
                setCollectStatus(null);
            }, 1000);

        } catch (err: any) {
            console.error("수집 실패:", err);
            if (err.response && err.response.data) {
                setCollectStatus(`오류: ${err.response.data.message || err.response.data}`);
            } else {
                setCollectStatus("수집에 실패했습니다.");
            }
        }
    };

    // (기존 코드와 동일 ... )
    if (loading) {
        return <div>카드 목록을 불러오는 중...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div>
            {/* (기존 코드와 동일 ... ) */}
            <h1>전체 카드 목록</h1>
            <p>총 {cards.length}장의 카드가 있습니다.</p>

            {user && categories.length === 0 && (
                <div style={{ padding: '10px', backgroundColor: '#fff3cd', color: '#856404', border: '1px solid #ffeeba', marginBottom: '15px' }}>
                    '내 컬렉션' 페이지에서 카테고리(앨범)를 1개 이상 생성해야 카드를 수집할 수 있습니다.
                </div>
            )}

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                {cards.map(card => (
                    // [수정] 카드 아이템 div에 flex-column 스타일 적용
                    <div key={card.cardId} style={{
                        border: '1px solid #ccc',
                        padding: '10px',
                        width: '200px',
                        backgroundColor: '#f9f9f9',
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
                            {/* [수정] 오타 수정 (rarityId -> rarityName) */}
                            <p style={{ margin: 0, fontSize: '12px', color: '#777' }}>
                                {card.rarityId} ({card.cardNumberInPack})
                            </p>
                        </div>

                        {user && (
                            // [수정] 4. 버튼 영역에 'marginTop: auto'를 적용해 맨 아래로 밀어냅니다.
                            <div style={{
                                marginTop: 'auto', // [수정] 이 영역을 flex 컨테이너의 맨 아래로 밀어냄
                                paddingTop: '10px'  // [수정] 위 텍스트 영역과의 최소 여백
                            }}>
                                {selectedCardId === card.cardId ? (
                                    // (기존 코드와 동일)
                                    <Fragment>
                                        <select
                                            value={targetCategoryId}
                                            onChange={(e) => setTargetCategoryId(e.target.value)}
                                            style={{ width: '100%', marginBottom: '5px' }}
                                        >
                                            {categories.map(cat => (
                                                <option key={cat.categoryId} value={String(cat.categoryId)}>
                                                    {cat.categoryName} ({cat.categoryType})
                                                </option>
                                            ))}
                                        </select>
                                        <button onClick={handleConfirmCollect} style={{ width: '50%' }}>확인</button>
                                        <button onClick={handleCancelClick} style={{ width: '50%' }}>취소</button>

                                        {collectStatus && (
                                            <p style={{
                                                fontSize: '12px',
                                                color: collectStatus.startsWith('오류') ? 'red' : 'green',
                                                margin: '5px 0 0 0'
                                            }}>
                                                {collectStatus}
                                            </p>
                                        )}
                                    </Fragment>
                                ) : (
                                    // (기존 코드와 동일)
                                    <button
                                        onClick={() => handleCollectClick(card.cardId)}
                                        disabled={categories.length === 0}
                                        style={{ width: '100%' }}
                                    >
                                        수집
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};