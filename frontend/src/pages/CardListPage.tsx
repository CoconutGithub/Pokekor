// [수정] 'React'는 사용되지 않으므로 import에서 제거 (TS6133 경고 해결)
import { useState, useEffect } from 'react';
// [수정] App.tsx의 상대 경로로 변경하고, 'type' 키워드로 CardDTO가 타입임을 명시
import { useAuth, type CardDTO } from '../App';

export const CardListPage = () => {
    // useAuth 훅을 사용해 Axios 인스턴스(api)를 가져옴
    const { api } = useAuth();

    // 카드 목록 상태
    const [cards, setCards] = useState<CardDTO[]>([]);
    // 로딩 상태
    const [loading, setLoading] = useState(true);
    // 에러 상태
    const [error, setError] = useState<string | null>(null);

    // 컴포넌트가 처음 마운트될 때 API 호출
    useEffect(() => {
        // API 호출 함수 정의
        const fetchCards = async () => {
            try {
                setLoading(true);
                setError(null);

                // 백엔드 GET /api/cards 호출
                const response = await api.get<CardDTO[]>('/cards');

                // 성공 시 상태에 저장
                setCards(response.data);

            } catch (err) {
                console.error("카드 목록 조회 실패:", err);
                setError("카드 목록을 불러오는 데 실패했습니다.");
            } finally {
                setLoading(false);
            }
        };

        fetchCards(); // 함수 실행
    }, [api]); // api 객체가 변경될 때만 (사실상 한 번만) 실행

    // --- 렌더링 ---

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

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                {cards.map(card => (
                    <div key={card.cardId} style={{
                        border: '1px solid #ccc',
                        padding: '10px',
                        width: '200px',
                        backgroundColor: '#f9f9f9' // 라이트모드 기준
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
                            {card.rarityName} ({card.cardNumberInPack})
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};