// [수정] Link 외에 useRef를 import합니다 (수정 시 폼으로 스크롤)
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../App';
import type { CollectionCategoryDTO, CategoryCreateRequestDTO } from '../types';
import { Link } from 'react-router-dom';

export const MyCollectionPage = () => {
    const { api } = useAuth();
    const [categories, setCategories] = useState<CollectionCategoryDTO[]>([]);
    const [loading, setLoading] = useState(true);
    // [수정] 폼 제출 에러와 삭제 에러를 분리
    const [formError, setFormError] = useState<string | null>(null);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    // --- 폼 상태 ---
    // [수정] 현재 '수정 중'인 카테고리 객체를 저장. null이면 '생성' 모드
    const [editingCategory, setEditingCategory] = useState<CollectionCategoryDTO | null>(null);

    // (기존 폼 상태)
    const [categoryName, setCategoryName] = useState('');
    const [categoryType, setCategoryType] = useState<'OWNED' | 'WISHLIST'>('OWNED');
    const [themeColor, setThemeColor] = useState('#FFFFFF');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // [추가됨] '수정' 버튼 클릭 시 폼으로 스크롤하기 위한 ref
    const formRef = useRef<HTMLDivElement>(null);

    // 카테고리 목록 불러오기 함수 (기존과 동일)
    const fetchCategories = async () => {
        try {
            setLoading(true);
            setDeleteError(null); // [수정] 목록 새로고침 시 삭제 에러 초기화
            const response = await api.get<CollectionCategoryDTO[]>('/my-collections');
            setCategories(response.data);
        } catch (err) {
            console.error("컬렉션 조회 실패:", err);
            // [수정] 폼 에러가 아닌, 목록 조회 에러로 state 변경
            setDeleteError("컬렉션을 불러오는 데 실패했습니다.");
        } finally {
            setLoading(false);
        }
    };

    // (기존과 동일)
    useEffect(() => {
        fetchCategories();
    }, [api]);

    // [추가됨] 폼을 초기화하는 함수
    const resetForm = () => {
        setEditingCategory(null);
        setCategoryName('');
        setCategoryType('OWNED');
        setThemeColor('#FFFFFF');
        setFormError(null);
    };

    // [추가됨] '수정' 버튼 클릭 핸들러
    const handleEditClick = (category: CollectionCategoryDTO) => {
        // 폼을 '수정' 모드로 변경
        setEditingCategory(category);
        // 폼에 기존 데이터 채우기
        setCategoryName(category.categoryName);
        setCategoryType(category.categoryType);
        setThemeColor(category.themeColor || '#FFFFFF');
        // 폼으로 스크롤
        formRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // [추가됨] '삭제' 버튼 클릭 핸들러
    const handleDeleteClick = async (category: CollectionCategoryDTO) => {
        // (중요) 삭제 확인
        if (!window.confirm(`'${category.categoryName}' 카테고리를 정말 삭제하시겠습니까?\n(카테고리에 포함된 모든 수집 내역이 함께 삭제됩니다.)`)) {
            return;
        }

        setDeleteError(null);
        try {
            // 백엔드 DELETE API 호출
            await api.delete(`/my-collections/${category.categoryId}`);
            // 성공 시 목록 새로고침
            fetchCategories();
        } catch (err: any) {
            console.error("카테고리 삭제 실패:", err);
            const message = err.response?.data?.message || err.response?.data || "삭제에 실패했습니다.";
            setDeleteError(`오류: ${message}`);
        }
    };

    // [수정] 폼 제출 핸들러 ('생성' 및 '수정' 공통 처리)
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!categoryName) {
            setFormError("카테고리 이름을 입력하세요.");
            return;
        }

        setIsSubmitting(true);
        setFormError(null);

        // API 요청에 사용할 DTO (생성/수정 동일)
        const requestDTO: CategoryCreateRequestDTO = {
            categoryName,
            themeColor,
            categoryType
        };

        try {
            if (editingCategory) {
                // --- 수정 모드 ---
                // 백엔드 PUT API 호출
                await api.put(`/my-collections/${editingCategory.categoryId}`, requestDTO);
            } else {
                // --- 생성 모드 ---
                // 백엔드 POST API 호출
                await api.post('/my-collections', requestDTO);
            }

            // 성공 시 폼 초기화 및 목록 새로고침
            resetForm();
            fetchCategories(); // 목록 다시 불러오기

        } catch (err: any) {
            console.error("카테고리 저장 실패:", err);
            const message = err.response?.data?.message || err.response?.data || "저장에 실패했습니다.";
            setFormError(`오류: ${message}`);
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

            {/* --- 1. 생성/수정 폼 --- */}
            {/* [추가됨] 폼 컨테이너에 ref 할당 */}
            <div ref={formRef} style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '20px' }}>
                {/* [수정] 폼 제목 (모드에 따라 변경) */}
                <h3>{editingCategory ? '카테고리 수정' : '새 카테고리 만들기'}</h3>

                <form onSubmit={handleSubmit}>
                    {/* (폼 필드 기존과 동일) */}
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

                    {/* [수정] 폼 에러 메시지 표시 */}
                    {formError && <div style={{ color: 'red', marginTop: '10px' }}>{formError}</div>}

                    {/* [수정] 버튼 영역 (모드에 따라 변경) */}
                    <div style={{ marginTop: '15px' }}>
                        <button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? '저장 중...' : (editingCategory ? '수정 완료' : '카테고리 생성')}
                        </button>

                        {/* [추가됨] 수정 모드일 때만 '취소' 버튼 표시 */}
                        {editingCategory && (
                            <button
                                type="button"
                                onClick={resetForm}
                                disabled={isSubmitting}
                                style={{ marginLeft: '10px', backgroundColor: '#6c757d' /* 회색 */ }}
                            >
                                수정 취소
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* --- 2. 카테고리 목록 --- */}
            <h2>내 카테고리 목록</h2>

            {/* [추가됨] 삭제 에러 메시지 표시 */}
            {deleteError && <div style={{ color: 'red', marginBottom: '10px' }}>{deleteError}</div>}

            {categories.length === 0 ? (
                <p>아직 생성된 카테고리가 없습니다.</p>
            ) : (
                <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
                    {categories.map(cat => (
                        // [수정] li 요소를 flexbox로 변경하여 버튼 배치
                        <li key={cat.categoryId} style={{
                            padding: '10px',
                            border: '1px solid #eee',
                            marginBottom: '5px',
                            borderLeft: `5px solid ${cat.themeColor || '#FFFFFF'}`,
                            display: 'flex', // [수정]
                            justifyContent: 'space-between', // [수정]
                            alignItems: 'center' // [수정]
                        }}>
                            {/* [수정] 카테고리 이름 (Link) */}
                            <Link
                                to={`/my-collection/${cat.categoryId}`}
                                style={{ textDecoration: 'none', color: 'inherit', fontWeight: 'bold' }}
                            >
                                {cat.categoryName} ({cat.categoryType === 'OWNED' ? '보유' : '희망'})
                            </Link>

                            {/* [추가됨] 수정/삭제 버튼 영역 */}
                            <div>
                                <button
                                    onClick={() => handleEditClick(cat)}
                                    style={{ fontSize: '12px', padding: '4px 8px' }}
                                >
                                    수정
                                </button>
                                <button
                                    onClick={() => handleDeleteClick(cat)}
                                    style={{
                                        fontSize: '12px',
                                        padding: '4px 8px',
                                        marginLeft: '5px',
                                        backgroundColor: '#dc3545' /* 빨간색 */
                                    }}
                                >
                                    삭제
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};