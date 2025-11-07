// [수정] React의 useState, useEffect 외에 Fragment를 import합니다. (필수는 아님)
import { useState, useEffect, Fragment } from 'react';
// [수정] useAuth 훅을 ../App에서 가져옵니다.
import { useAuth } from '../App';
// [수정] CardDTO 외에, 사용자의 카테고리 목록을 담을 CollectionCategoryDTO 타입을 import합니다.
import type { CardDTO, CollectionCategoryDTO } from '../types';

// [수정] 컴포넌트 이름 변경 (기존: CardListPage)
export const CardListPage = () => {
    // [수정] useAuth()를 호출하여 api 객체와 user 정보를 가져옵니다.
    const { api, user } = useAuth(); // user가 null이면 비로그인, null이 아니면 로그인 상태
    const [cards, setCards] = useState<CardDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // [추가됨] 사용자의 컬렉션 카테고리 목록을 저장할 state
    const [categories, setCategories] = useState<CollectionCategoryDTO[]>([]);

    // [추가됨] 현재 수집을 위해 "선택된" 카드의 ID를 저장할 state
    // (예: 5번 카드의 '수집' 버튼을 누르면 이 state는 5가 됩니다)
    const [selectedCardId, setSelectedCardId] = useState<number | null>(null);

    // [추가됨] 카테고리 드롭다운에서 선택된 categoryId를 저장할 state
    const [targetCategoryId, setTargetCategoryId] = useState<string>(''); // string으로 관리하여 <select> 제어

    // [추가됨] 카드 수집 API 호출 시 발생하는 에러/상태 메시지
    const [collectStatus, setCollectStatus] = useState<string | null>(null);

    // (기존과 동일)
    useEffect(() => {
        const fetchAllData = async () => {
            try {
                setLoading(true);
                setError(null);

                // 1. (기존) 카드 목록 조회
                const cardsResponse = await api.get<CardDTO[]>('/cards');
                setCards(cardsResponse.data);

                // 2. [추가됨] 로그인한 사용자(user)가 있다면, 카테고리 목록도 조회
                if (user) {
                    const categoryResponse = await api.get<CollectionCategoryDTO[]>('/my-collections');
                    setCategories(categoryResponse.data);
                    // 카테고리가 1개 이상 있다면, 첫 번째 카테고리를 기본 선택으로 설정
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
        // [수정] 의존성 배열에 'user'를 추가합니다. (로그인/로그아웃 시 재실행)
    }, [api, user]);

    // [추가됨] '수집' 버튼 클릭 시 호출되는 핸들러
    const handleCollectClick = (cardId: number) => {
        setSelectedCardId(cardId); // 현재 선택한 카드 ID를 state에 저장
        setCollectStatus(null); // 이전 에러 메시지 초기화

        // 사용자의 카테고리가 존재하고, 기본 선택이 설정되지 않았다면 첫 번째 항목을 강제로 설정
        if (categories.length > 0 && targetCategoryId === '') {
            setTargetCategoryId(String(categories[0].categoryId));
        }
    };

    // [추가됨] '취소' 버튼 클릭 시 호출되는 핸들러
    const handleCancelClick = () => {
        setSelectedCardId(null); // 선택 취소
        setCollectStatus(null); // 에러 메시지 초기화
    };

    // [추가됨] '확인' (수집) 버튼 클릭 시 호출되는 핸들러
    const handleConfirmCollect = async () => {
        if (!selectedCardId) return; // 선택된 카드가 없으면 중단
        if (targetCategoryId === '') {
            setCollectStatus("추가할 카테고리를 선택하세요.");
            return;
        }

        setCollectStatus("수집 중..."); // 로딩 상태 표시

        try {
            // 백엔드 API 호출
            await api.post(`/my-collections/${targetCategoryId}/cards`, {
                cardId: selectedCardId // DTO { "cardId": 123 }
            });

            setCollectStatus("수집 성공!");
            // 1초 뒤에 UI를 원래대로 되돌림
            setTimeout(() => {
                setSelectedCardId(null);
                setCollectStatus(null);
            }, 1000);

        } catch (err: any) {
            console.error("수집 실패:", err);
            // 백엔드에서 보낸 에러 메시지 (예: "이미 수집된 카드")
            if (err.response && err.response.data) {
                setCollectStatus(`오류: ${err.response.data.message || err.response.data}`);
            } else {
                setCollectStatus("수집에 실패했습니다.");
            }
        }
    };


    // (기존과 동일)
    if (loading) {
        return <div>카드 목록을 불러오는 중...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div>
            <h1>전체 카드 목록</h1>
            <p>총 {cards.length}장의 카드가 있습니다.</p>

            {/* [추가됨] 로그인했지만 카테고리가 없는 경우 안내 메시지 */}
            {user && categories.length === 0 && (
                <div style={{ padding: '10px', backgroundColor: '#fff3cd', color: '#856404', border: '1px solid #ffeeba', marginBottom: '15px' }}>
                    '내 컬렉션' 페이지에서 카테고리(앨범)를 1개 이상 생성해야 카드를 수집할 수 있습니다.
                </div>
            )}

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                {cards.map(card => (
                    <div key={card.cardId} style={{
                        border: '1px solid #ccc',
                        padding: '10px',
                        width: '200px',
                        backgroundColor: '#f9f9f9'
                    }}>
                        {/* [수정됨] 카드 정보 렌더링 부분 (기존과 거의 동일)
                          - (이미지, 이름, 팩, 레어도는 그대로)
                        */}
                        <img
                            src={card.cardImageUrl}
                            alt={card.cardName}
                            style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
                            onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/150?text=No+Image')}
                        />
                        <h4 style={{ marginTop: '8px', marginBottom: '4px', fontSize: '16px', color: '#555'  }}>
                            {card.cardName}
                        </h4>
                        <p style={{ margin: 0, fontSize: '14px', color: '#555' }}>
                            {card.packName}
                        </p>
                        <p style={{ margin: 0, fontSize: '12px', color: '#777' }}>
                            {card.rarityId} ({card.cardNumberInPack})
                        </p>

                        {/* [수정됨] 수집 버튼 및 수집 UI 로직
                          - 1. 로그인한 사용자(user)에게만 이 영역이 보입니다.
                          - 2. 이 카드가 "선택된" 카드(selectedCardId)인지 확인합니다.
                        */}
                        {user && (
                            <div style={{ marginTop: '10px' }}>
                                {selectedCardId === card.cardId ? (
                                    // [추가됨] '수집' 버튼을 누른 후 (선택된 상태)
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

                                        {/* [추가됨] 수집 API 상태 메시지 표시 */}
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
                                    // [추가됨] 기본 '수집' 버튼 (선택되지 않은 상태)
                                    <button
                                        onClick={() => handleCollectClick(card.cardId)}
                                        // 카테고리가 0개이면 버튼 비활성화
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