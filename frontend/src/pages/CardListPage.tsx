// [수정] PackDTO, RarityDTO 추가
import { useState, useEffect, Fragment } from 'react';
import { useAuth } from '../App';
import type { CardDTO, CollectionCategoryDTO, CollectionInfoDTO, PackDTO, RarityDTO } from '../types'; // [수정]
import { useSearchParams, Link } from 'react-router-dom';

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

    // [수정] URL 쿼리 파라미터를 검색의 "Source of Truth"로 사용합니다.
    const [searchParams, setSearchParams] = useSearchParams();
    const packId = searchParams.get('packId') || '';
    const cardName = searchParams.get('name') || '';
    const rarityId = searchParams.get('rarityId') || '';

    // [추가] 팩/레어도 드롭다운 목록을 담을 state
    const [packs, setPacks] = useState<PackDTO[]>([]);
    const [rarities, setRarities] = useState<RarityDTO[]>([]);

    // [추가] 검색 폼의 '입력 중'인 값을 관리할 별도 state
    const [filterName, setFilterName] = useState(cardName);
    const [filterPack, setFilterPack] = useState(packId);
    const [filterRarity, setFilterRarity] = useState(rarityId);

    const [packName, setPackName] = useState<string | null>(null); // (기존과 동일)

    // [수정] 메인 데이터(카드 목록) 조회 Effect
    useEffect(() => {
        const fetchAllData = async () => {
            try {
                setLoading(true);
                setError(null);
                setPackName(null);

                // [수정] /api/cards 호출 시 모든 검색 파라미터를 전달
                const cardsResponse = await api.get<CardDTO[]>('/cards', {
                    params: {
                        packId: packId || undefined, // 빈 문자열이면 undefined로 보내 생략
                        name: cardName || undefined,
                        rarityId: rarityId || undefined
                    }
                });

                // [수정] 카드 ID 순서대로 정렬 (기존 코드)
                const sortedCards = cardsResponse.data.sort((a, b) => a.cardId - b.cardId);

                setCards(sortedCards);

                // [수정] 팩 ID가 있고 카드 데이터가 있으면, 팩 이름을 가져와 제목으로 설정
                // (검색 조건에 팩이 포함된 경우)
                if (packId && sortedCards.length > 0) {
                    setPackName(sortedCards[0].packName);
                } else if (packId && packs.length > 0) {
                    // [추가] 검색 결과 카드는 없지만, packId가 넘어온 경우 (예: 빈 팩)
                    // 팩 목록 state에서 팩 이름을 찾아 설정
                    const foundPack = packs.find(p => String(p.packId) === packId);
                    if (foundPack) {
                        setPackName(foundPack.packNameKo);
                    }
                }

                // (기존 코드와 동일)
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
    }, [api, user, packId, cardName, rarityId, packs]); // [수정] packId, cardName, rarityId, packs(팩 이름용) 의존성 추가

    // [추가] 검색 필터(팩, 레어도) 데이터 조회 Effect (최초 1회)
    useEffect(() => {
        const fetchFilterData = async () => {
            try {
                // 팩 목록과 레어도 목록을 동시에 병렬로 요청
                const [packsRes, raritiesRes] = await Promise.all([
                    api.get<PackDTO[]>('/packs'),
                    api.get<RarityDTO[]>('/rarities')
                ]);
                setPacks(packsRes.data);
                setRarities(raritiesRes.data);
            } catch (err) {
                console.error("필터 데이터 조회 실패:", err);
                setError("검색 필터 정보를 불러오는 데 실패했습니다.");
            }
        };
        fetchFilterData();
    }, [api]);

    // [추가] URL 파라미터가 변경될 때 (예: 브라우저 뒤로가기)
    // 폼 입력 state도 동기화
    useEffect(() => {
        setFilterName(cardName);
        setFilterPack(packId);
        setFilterRarity(rarityId);
    }, [cardName, packId, rarityId]);


    // (기존 코드와 동일 ... )
    const handleCollectClick = (cardId: number) => {
        setSelectedCardId(cardId);
        setCollectStatus(null);
        if (categories.length > 0 && targetCategoryId === '') {
            setTargetCategoryId(String(categories[0].categoryId));
        }
    };
    const handleCancelClick = () => {
        setSelectedCardId(null);
        setCollectStatus(null);
    };
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
            const addedCategory = categories.find(
                c => String(c.categoryId) === targetCategoryId
            );
            if (addedCategory) {
                const newCollectionInfo: CollectionInfoDTO = {
                    categoryName: addedCategory.categoryName,
                    themeColor: addedCategory.themeColor
                };
                setCards(prevCards =>
                    prevCards.map(c =>
                        c.cardId === selectedCardId ?
                            {
                                ...c,
                                collections: c.collections.find(col => col.categoryName === newCollectionInfo.categoryName)
                                    ? c.collections
                                    : [...c.collections, newCollectionInfo]
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

    // [추가] 검색 폼 제출 핸들러
    const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // 로컬 폼 state를 URL 쿼리 파라미터로 설정
        const newParams: Record<string, string> = {};

        if (filterName) newParams.name = filterName;
        if (filterPack) newParams.packId = filterPack;
        if (filterRarity) newParams.rarityId = filterRarity;

        setSearchParams(newParams);
    };

    // [추가] 검색 초기화 핸들러
    const handleSearchReset = () => {
        setFilterName('');
        setFilterPack('');
        setFilterRarity('');
        setSearchParams({}); // URL 파라미터 모두 제거
    };


    if (loading && cards.length === 0) { // [수정] 로딩 중이라도 기존 카드가 있으면 잠시 보여줌
        return <div>카드 목록을 불러오는 중...</div>;
    }

    if (error) {
        return <div style={{ color: 'red' }}>{error}</div>;
    }

    // [추가] 검색 중인지 여부 확인 (파라미터가 하나라도 있는지)
    const isSearching = !!(packId || cardName || rarityId);

    return (
        <div>
            {/* [수정] 팩 목록으로 돌아가기 링크 (팩 ID가 넘어왔을 때만) */}
            {packId && !cardName && !rarityId && ( // 팩 단일 조회 시에만
                <div style={{ marginBottom: '15px', textAlign: 'left' }}>
                    <Link to="/packs">&larr; 카드 팩 목록으로</Link>
                </div>
            )}

            {/* [추가] 검색 필터 폼 */}
            <div style={{
                border: '1px solid #ccc',
                padding: '15px',
                marginBottom: '20px',
                backgroundColor: '#f8f8f8',
                textAlign: 'left'
            }}>
                <form onSubmit={handleSearchSubmit}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 15px' }}>
                        {/* 1. 카드 이름 입력 */}
                        <div style={{ flex: '1 1 200px' }}>
                            <label htmlFor="filter-name" style={{ display: 'block', marginBottom: '5px' }}>카드 이름:</label>
                            <input
                                id="filter-name"
                                type="text"
                                value={filterName}
                                onChange={(e) => setFilterName(e.target.value)}
                                placeholder="카드 이름 검색..."
                                style={{ width: '100%', padding: '8px' }}
                            />
                        </div>

                        {/* 2. 확장팩 선택 */}
                        <div style={{ flex: '1 1 200px' }}>
                            <label htmlFor="filter-pack" style={{ display: 'block', marginBottom: '5px' }}>확장팩:</label>
                            <select
                                id="filter-pack"
                                value={filterPack}
                                onChange={(e) => setFilterPack(e.target.value)}
                                style={{ width: '100%', padding: '8px' }}
                            >
                                <option value="">전체 팩</option>
                                {packs.map(p => (
                                    <option key={p.packId} value={p.packId}>{p.packNameKo}</option>
                                ))}
                            </select>
                        </div>

                        {/* 3. 레어도 선택 */}
                        <div style={{ flex: '1 1 150px' }}>
                            <label htmlFor="filter-rarity" style={{ display: 'block', marginBottom: '5px' }}>레어도:</label>
                            <select
                                id="filter-rarity"
                                value={filterRarity}
                                onChange={(e) => setFilterRarity(e.target.value)}
                                style={{ width: '100%', padding: '8px' }}
                            >
                                <option value="">전체 레어도</option>
                                {rarities.map(r => (
                                    <option key={r.rarityId} value={r.rarityId}>{r.rarityId} ({r.rarityName})</option>
                                ))}
                            </select>
                        </div>

                        {/* 4. 버튼 */}
                        <div style={{ flex: '1 1 100%', display: 'flex', gap: '10px', alignItems: 'flex-end', marginTop: '10px' }}>
                            <button
                                type="submit"
                                style={{ padding: '8px 16px', backgroundColor: '#007bff', color: 'white' }}
                                disabled={loading}
                            >
                                {loading ? '검색 중...' : '검색'}
                            </button>
                            <button
                                type="button"
                                onClick={handleSearchReset}
                                style={{ padding: '8px 16px', backgroundColor: '#6c757d', color: 'white' }}
                                disabled={loading}
                            >
                                초기화
                            </button>
                        </div>
                    </div>
                </form>
            </div>


            {/* [수정] 제목을 동적으로 변경 */}
            <h1>
                {isSearching
                    ? (packName ? `${packName} (검색 결과)` : '카드 검색 결과')
                    : '전체 카드 목록'
                }
            </h1>
            <p>총 {cards.length}장의 카드가 있습니다.</p>

            {/* (기존 코드와 동일) */}
            {user && categories.length === 0 && (
                <div style={{ padding: '10px', backgroundColor: '#fff3cd', color: '#856404', border: '1px solid #ffeeba', marginBottom: '15px' }}>
                    '내 컬렉션' 페이지에서 카테고리(앨범)를 1개 이상 생성해야 카드를 수집할 수 있습니다.
                </div>
            )}

            {/* [수정] 팩 조회 시/검색 시 카드가 없는 경우 */}
            {cards.length === 0 && !loading && isSearching && (
                <p>검색 조건에 해당하는 카드가 없습니다.</p>
            )}
            {cards.length === 0 && !loading && !isSearching && (
                <p>등록된 카드가 아직 없습니다.</p>
            )}

            {/* (기존 카드 목록 렌더링... 동일) */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                {cards.map(card => (
                    <div key={card.cardId} style={{
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
                            display: 'flex',
                            gap: '4px',
                            marginBottom: '5px',
                            zIndex: 2,
                            minHeight: '10px' // [수정] 닷의 높이(10px)만큼 최소 높이를 지정
                        }}>
                            {card.collections.length > 0 && card.collections.map((collection, index) => (
                                <div
                                    key={index}
                                    title={collection.categoryName}
                                    style={{
                                        width: '10px',
                                        height: '10px',
                                        backgroundColor: collection.themeColor || '#ccc',
                                        borderRadius: '50%',
                                        border: '1px solid rgba(0,0,0,0.2)',
                                        cursor: 'pointer'
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

                        {/* (수집 버튼 영역 동일) */}
                        {user && (
                            <div style={{
                                marginTop: 'auto',
                                paddingTop: '10px'
                            }}>
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