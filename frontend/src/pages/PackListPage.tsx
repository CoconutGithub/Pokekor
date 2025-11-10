import { useState, useEffect } from 'react';
import { useAuth } from '../App';
import type { PackDTO } from '../types';
import { Link } from 'react-router-dom';

// 팩 목록을 시리즈별로 그룹화하기 위한 타입
type GroupedPacks = Record<string, PackDTO[]>;

export const PackListPage = () => {
    const { api } = useAuth();
    const [groupedPacks, setGroupedPacks] = useState<GroupedPacks>({});
    const [seriesOrder, setSeriesOrder] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPacks = async () => {
            try {
                setLoading(true);
                setError(null);

                // 1. 백엔드에서 모든 팩 목록을 가져옵니다 (정렬은 백엔드가 처리)
                const response = await api.get<PackDTO[]>('/packs');
                const packs = response.data;

                // 2. 'series' 필드를 기준으로 팩을 그룹화합니다.
                const groups: GroupedPacks = packs.reduce((acc, pack) => {
                    const seriesName = pack.series || '기타'; // 시리즈가 없는 경우
                    if (!acc[seriesName]) {
                        acc[seriesName] = [];
                    }
                    acc[seriesName].push(pack);
                    return acc;
                }, {} as GroupedPacks);

                // 3. 시리즈의 순서를 결정합니다 (백엔드에서 받은 순서대로)
                const orderedSeriesNames = packs
                    .map(p => p.series || '기타')
                    .filter((value, index, self) => self.indexOf(value) === index);

                setGroupedPacks(groups);
                setSeriesOrder(orderedSeriesNames);

            } catch (err) {
                console.error("팩 목록 조회 실패:", err);
                setError("팩 목록을 불러오는 데 실패했습니다.");
            } finally {
                setLoading(false);
            }
        };

        fetchPacks();
    }, [api]);

    if (loading) {
        return <div>팩 목록을 불러오는 중...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div>
            <h1>카드 팩 목록</h1>

            {/* 4. 그룹화된 팩 목록을 순서대로 렌더링합니다. */}
            {seriesOrder.length === 0 ? (
                <p>등록된 팩이 없습니다.</p>
            ) : (
                seriesOrder.map(seriesName => (
                    <div key={seriesName} style={{ marginBottom: '30px' }}>
                        {/* 시리즈 제목 (예: "DP", "BW", "XY") */}
                        <h2 style={{ textAlign: 'left', borderBottom: '2px solid #ccc', paddingBottom: '5px' }}>
                            {seriesName}
                        </h2>

                        {/* 팩 이미지 목록 */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                            {groupedPacks[seriesName].map(pack => (
                                <Link
                                    key={pack.packId}
                                    // 5. 클릭 시 카드 목록 페이지로 packId를 넘겨줍니다.
                                    to={`/cards?packId=${pack.packId}`}
                                    style={{
                                        textDecoration: 'none',
                                        color: 'inherit',
                                        width: '150px', // 팩 이미지 크기
                                        border: '1px solid #eee',
                                        padding: '10px'
                                    }}
                                >
                                    <img
                                        src={pack.packImageUrl || 'https://via.placeholder.com/150?text=No+Image'}
                                        alt={pack.packNameKo}
                                        style={{ width: '100%', objectFit: 'contain' }}
                                    />
                                    <p style={{ fontSize: '14px', textAlign: 'center', margin: '5px 0 0 0' }}>
                                        {pack.packNameKo}
                                    </p>
                                </Link>
                            ))}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};