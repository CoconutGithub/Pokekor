// [수정] useSearchParams, Link 추가
import { useState, useEffect, Fragment } from 'react';
import { useAuth } from '../App';
import type { CardDTO, CollectionCategoryDTO, CollectionInfoDTO } from '../types'; // [수정] CollectionInfoDTO 타입을 import
import { useSearchParams, Link } from 'react-router-dom'; // [추가]

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

    // [추가] URL 쿼리 파라미터에서 packId를 읽어옵니다.
    const [searchParams] = useSearchParams();
    const packId = searchParams.get('packId');
    const [packName, setPackName] = useState<string | null>(null); // [추가] 팩 제목 표시용

    // (기존 코드와 동일 ... )
    useEffect(() => {
        const fetchAllData = async () => {
            try {
                setLoading(true);
                setError(null);
                setPackName(null); // [추가] 초기화

                // [수정] /api/cards 호출 시 packId를 파라미터로 전달
                const cardsResponse = await api.get<CardDTO[]>('/cards', {
                    params: { packId } // packId가 null이면 자동으로 무시됨
                });

                // [추가] 카드 ID 순서대로 정렬
                const sortedCards = cardsResponse.data.sort((a, b) => a.cardId - b.cardId);

                setCards(sortedCards); // [수정] 정렬된 데이터(sortedCards)를 state에 저장

                // [추가] 팩 ID가 있고 카드 데이터가 있으면, 첫 번째 카드에서 팩 이름을 가져와 제목으로 설정
                if (packId && sortedCards.length > 0) { // [수정] sortedCards 사용
                    setPackName(sortedCards[0].packName); // [수정] sortedCards 사용
                }

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
    }, [api, user, packId]); // [수정] packId가 바뀔 때마다 다시 실행

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
                setCollectStatus(`X: ${message || '알 수 없는 오류'}`);
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
            {/* [추가] 팩 목록으로 돌아가기 링크 */}
            {packId && (
                <div style={{ marginBottom: '15px', textAlign: 'left' }}>
                    <Link to="/packs">&larr; 카드 팩 목록으로</Link>
                </div>
            )}

            {/* [수정] 제목을 동적으로 변경 */}
            <h1>{packName || '전체 카드 목록'}</h1>
            <p>총 {cards.length}장의 카드가 있습니다.</p>

            {user && categories.length === 0 && (
                <div style={{ padding: '10px', backgroundColor: '#fff3cd', color: '#856404', border: '1px solid #ffeeba', marginBottom: '15px' }}>
                    '내 컬렉션' 페이지에서 카테고리(앨범)를 1개 이상 생성해야 카드를 수집할 수 있습니다.
                </div>
            )}

            {/* [추가] 팩 조회 시 카드가 없는 경우 */}
            {packId && cards.length === 0 && !loading && (
                <p>이 팩에 등록된 카드가 아직 없습니다.</p>
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

                        {/* [수정] 컬러 닷 (Dot) 영역 - 레이아웃 고정을 위해 div는 항상 렌더링 */}
                        <div style={{
                            // top: '10px', // (삭제)
                            // left: '10px', // (삭제)
                            display: 'flex',
                            gap: '4px',
                            marginBottom: '5px',
                            zIndex: 2,
                            minHeight: '10px' // [수정] 닷의 높이(10px)만큼 최소 높이를 지정
                        }}>
                            {/* [수정] card.collections.length > 0을 내부로 이동 */}
                            {card.collections.length > 0 && card.collections.map((collection, index) => (
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
                                                color: collectStatus.startsWith('X') ? 'red' : 'green',
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