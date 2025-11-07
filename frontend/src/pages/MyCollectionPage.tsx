import React, { useState, useEffect } from 'react';
import { useAuth } from '../App'; // useAuth 훅
import type { CollectionCategoryDTO, CategoryCreateRequestDTO } from '../types'; // 타입

export const MyCollectionPage = () => {
    const { api } = useAuth();
    const [categories, setCategories] = useState<CollectionCategoryDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 새 카테고리 폼 상태
    const [categoryName, setCategoryName] = useState('');
    const [categoryType, setCategoryType] = useState<'OWNED' | 'WISHLIST'>('OWNED');
    const [themeColor, setThemeColor] = useState('#FFFFFF');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 카테고리 목록 불러오기 함수
    const fetchCategories = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get<CollectionCategoryDTO[]>('/my-collections');
            setCategories(response.data);
        } catch (err) {
            console.error("컬렉션 조회 실패:", err);
            setError("컬렉션을 불러오는 데 실패했습니다.");
        } finally {
            setLoading(false);
        }
    };

    // 컴포넌트 마운트 시 카테고리 목록 불러오기
    useEffect(() => {
        fetchCategories();
    }, [api]); // api 객체가 준비되면 1회 실행

    // 새 카테고리 생성 폼 제출 핸들러
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!categoryName) {
            setError("카테고리 이름을 입력하세요.");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const requestDTO: CategoryCreateRequestDTO = {
                categoryName,
                themeColor,
                categoryType
            };

            // POST /api/my-collections 호출
            await api.post('/my-collections', requestDTO);

            // 성공 시 폼 초기화 및 목록 새로고침
            setCategoryName('');
            setThemeColor('#FFFFFF');
            fetchCategories(); // 목록 다시 불러오기

        } catch (err) {
            console.error("카테고리 생성 실패:", err);
            setError("카테고리 생성에 실패했습니다.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- 렌더링 ---

    if (loading) {
        return <div>내 컬렉션 불러오는 중...</div>;
    }

    return (
        <div>
            <h1>내 컬렉션</h1>

            {/* --- 1. 새 카테고리 생성 폼 --- */}
            <div style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '20px' }}>
                <h3>새 카테고리 만들기</h3>
                <form onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="cat-name">이름: </label>
                        <input
                            id="cat-name"
                            type="text"
                            value={categoryName}
                            onChange={(e) => setCategoryName(e.target.value)}
                            required
                        />
                    </div>
                    <div style={{ marginTop: '10px' }}>
                        <label>타입: </label>
                        <select
                            value={categoryType}
                            onChange={(e) => setCategoryType(e.target.value as 'OWNED' | 'WISHLIST')}
                        >
                            <option value="OWNED">보유</option>
                            <option value="WISHLIST">희망</option>
                        </select>
                    </div>
                    <div style={{ marginTop: '10px' }}>
                        <label htmlFor="cat-color">색상: </label>
                        <input
                            id="cat-color"
                            type="color"
                            value={themeColor}
                            onChange={(e) => setThemeColor(e.target.value)}
                        />
                    </div>

                    {error && <div style={{ color: 'red', marginTop: '10px' }}>{error}</div>}

                    <button type="submit" disabled={isSubmitting} style={{ marginTop: '15px' }}>
                        {isSubmitting ? '생성 중...' : '카테고리 생성'}
                    </button>
                </form>
            </div>

            {/* --- 2. 카테고리 목록 --- */}
            <h2>내 카테고리 목록</h2>
            {categories.length === 0 ? (
                <p>아직 생성된 카테고리가 없습니다.</p>
            ) : (
                <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
                    {categories.map(cat => (
                        <li key={cat.categoryId} style={{
                            padding: '10px',
                            border: '1px solid #eee',
                            marginBottom: '5px',
                            borderLeft: `5px solid ${cat.themeColor || '#FFFFFF'}`
                        }}>
                            <strong>{cat.categoryName}</strong> ({cat.categoryType === 'OWNED' ? '보유' : '희망'})
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};