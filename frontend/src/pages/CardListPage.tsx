// (기존 코드와 동일)
import { useState, useEffect, Fragment } from 'react';
import { useAuth } from '../App';
// [수정] CollectionInfoDTO 타입을 import
import type { CardDTO, CollectionCategoryDTO, CollectionInfoDTO } from '../types';

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

    // [수정] '확인' (수집) 버튼 핸들러 (성공 시 CollectionInfoDTO 객체 갱신)
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

            // [수정] 추가한 카테고리의 '이름'과 '색상'을 찾음
            const addedCategory = categories.find(
                c => String(c.categoryId) === targetCategoryId
            );

            if (addedCategory) {
                // [수정] 프론트엔드 state에 추가할 새 DTO 객체
                const newCollectionInfo: CollectionInfoDTO = {
                    categoryName: addedCategory.categoryName,
                    themeColor: addedCategory.themeColor
                };

                setCards(prevCards =>
                    prevCards.map(c =>
                        c.cardId === selectedCardId ?
                            {
                                ...c,
                                // [수정] 'collections' 배열에 새 객체를 추가
                                // (중복 확인: 이미 같은 이름의 카테고리가 있는지 확인)
                                collections: c.collections.find(col => col.categoryName === newCollectionInfo.categoryName)
                                    ? c.collections // 이미 있으면 갱신 안함
                                    : [...c.collections, newCollectionInfo] // 없으면 새로 추가
                            } : c
                    )
                );
            }

            setTimeout(() => {
                setSelectedCardId(null);
                setCollectStatus(null);
            }, 1000);

        } catch (err: any) {
            console.error("수집 실패:", err);
            if (err.response && err.response.data) {
                const message = typeof err.response.data === 'string' ? err.response.data : err.response.data.message;
                setCollectStatus(`오류: ${message || '알 수 없는 오류'}`);
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
                    <div key={card.cardId} style={{
                        // (레이아웃 스타일 동일)
                        border: '1px solid #ccc',
                        padding: '10px',
                        width: '200px',
                        backgroundColor: '#f9f9f9',
                        display: 'flex',
                        flexDirection: 'column',
                        position: 'relative'
                    }}>

                        {/* [수정] 컬러 닷 (Dot) 영역 */}
                        {/* [수정] card.collectedInColors -> card.collections */}
                        {card.collections.length > 0 && (
                            <div style={{
                                top: '10px',
                                left: '10px',
                                display: 'flex',
                                gap: '4px',
                                marginBottom: '5px',
                                zIndex: 2
                            }}>
                                {/* [수정] collection 객체(이름, 색상)를 순회 */}
                                {card.collections.map((collection, index) => (
                                    <div
                                        key={index}
                                        // [수정] HTML 'title' 속성을 사용하여 호버 시 툴팁 표시
                                        title={collection.categoryName}
                                        style={{
                                            width: '10px',
                                            height: '10px',
                                            backgroundColor: collection.themeColor || '#ccc',
                                            borderRadius: '50%',
                                            border: '1px solid rgba(0,0,0,0.2)',
                                            cursor: 'pointer' // [수정] 호버 가능함을 표시
                                        }}
                                    />
                                ))}
                            </div>
                        )}

                        {/* (이미지 컨테이너 동일) */}
                        <div style={{
                            width: '100%',
                            height: '260px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '8px'
                        }}>
                            <img
                                src={card.cardImageUrl}
                                alt={card.cardName}
                                style={{
                                    maxWidth: '100%',
                                    maxHeight: '100%',
                                    objectFit: 'contain'
                                }}
                                onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/150?text=No+Image')}
                            />
                        </div>

                        {/* (텍스트 영역 동일) */}
                        <div>
                            <h4 style={{
                                margin: '0 0 4px 0',
                                fontSize: '16px',
                                color: '#213547',
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

                        {user && (
                            <div style={{
                                marginTop: 'auto',
                                paddingTop: '10px'
                            }}>
                                {/* [수정] 'isCollected' 분기 로직이 완전히 제거됨 */}
                                {selectedCardId === card.cardId ? (
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
                                    <button
                                        onClick={() => handleCollectClick(card.cardId)}
                                        disabled={categories.length === 0}
                                        style={{
                                            width: '100%',
                                            paddingTop: '10px',
                                            paddingBottom: '10px'
                                        }}
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