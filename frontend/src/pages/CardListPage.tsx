import { useState, useEffect } from 'react';
// [수정] import 경로를 './App' -> '../App' (상위 폴더)
import { useAuth } from '../App';
// [수정] import 경로를 './App' -> '../types' (types.ts 파일)
import type { CardDTO } from '../types';

export const CardListPage = () => {
    // (이전과 동일)
    const { api } = useAuth();
    const [cards, setCards] = useState<CardDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // (이전과 동일)
    useEffect(() => {
        const fetchCards = async () => {
            try {
                setLoading(true);
                setError(null);
                // [수정] api 경로 확인 (백엔드가 /api/cards 인지 /cards 인지 확인 -> /api/cards가 맞습니다)
                const response = await api.get<CardDTO[]>('/cards');
                setCards(response.data);
            } catch (err) {
                console.error("카드 목록 조회 실패:", err);
                setError("카드 목록을 불러오는 데 실패했습니다.");
            } finally {
                setLoading(false);
            }
        };
        fetchCards();
    }, [api]);

    // (이전과 동일)
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