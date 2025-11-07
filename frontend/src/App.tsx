import React, { useState, createContext, useContext, useMemo, useEffect } from 'react'; // [수정] useEffect 추가
import { BrowserRouter, Routes, Route, Link, useNavigate, Navigate, useLocation } from 'react-router-dom';
import axios, { AxiosError } from 'axios';
import { jwtDecode } from "jwt-decode";
// [수정] 파일 확장자(.tsx) 제거
import { CardListPage } from './pages/CardListPage';
import { MyCollectionPage } from './pages/MyCollectionPage';
// [수정] 파일 확장자(.ts) 제거
// import type { CardDTO, CollectionCategoryDTO } from './types.ts';

// --- 1. 타입 정의 ---
// (이전과 동일)
interface AuthResponseDTO {
    username: string;
    accessToken: string;
}
interface AuthRequestDTO {
    username: string;
    password?: string;
    email?: string;
}
interface User {
    username: string;
}
interface JwtPayload {
    sub: string;
    iat: number;
    exp: number;
}
interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (username: string, password: string) => Promise<boolean>;
    signup: (username: string, password: string, email?: string) => Promise<string>;
    logout: () => void;
    api: typeof api;
}

// [수정] CardDTO 타입을 types.ts에서 가져오므로 App.tsx에서 export 할 필요가 없습니다.
// (대신 types.ts 파일의 CardDTO에 export가 있는지 확인하세요. -> 있습니다.)


// --- 2. Axios 인스턴스 설정 ---
// (이전과 동일)
const api = axios.create({
    baseURL: '/api'
});
api.interceptors.request.use(config => {
    const token = localStorage.getItem('pokekor_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, Promise.reject);

// --- 3. 인증 컨텍스트 및 Provider ---
// (이전과 동일)
const AuthContext = createContext<AuthContextType | null>(null);

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('pokekor_token'));
    const [loading, setLoading] = useState<boolean>(true);

    // [수정] useEffect 추가 (사용자 코드에서 누락됨)
    useEffect(() => {
        if (token) {
            localStorage.setItem('pokekor_token', token);
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            try {
                const payload = jwtDecode<JwtPayload>(token);
                if (payload.exp * 1000 > Date.now()) {
                    setUser({ username: payload.sub });
                } else {
                    setToken(null); // 토큰 만료 시 로그아웃 처리
                }
            } catch (e) {
                console.error("Invalid token:", e);
                setToken(null); // 토큰 파싱 실패 시 로그아웃
            }
            setLoading(false);
        } else {
            localStorage.removeItem('pokekor_token');
            delete api.defaults.headers.common['Authorization'];
            setUser(null);
            setLoading(false);
        }
    }, [token]);


    // [수정] login 함수 추가 (사용자 코드에서 누락됨)
    const login = async (username: string, password: string): Promise<boolean> => {
        try {
            const requestDto: AuthRequestDTO = { username, password };
            const response = await api.post<AuthResponseDTO>('/auth/login', requestDto);
            setToken(response.data.accessToken);
            setUser({ username: response.data.username });
            return true;
        } catch (err) {
            console.error("Login error:", err);
            if (axios.isAxiosError(err)) {
                const errorData = err.response?.data;
                const message = (typeof errorData === 'string' && errorData) ? errorData : "로그인에 실패했습니다.";
                throw new Error(message);
            }
            throw new Error("로그인에 실패했습니다.");
        }
    };

    // [수정] signup 함수 추가 (사용자 코드에서 누락됨)
    const signup = async (username: string, password: string, email?: string): Promise<string> => {
        try {
            const requestDto: AuthRequestDTO = { username, password, email };
            const response = await api.post<string>('/auth/register', requestDto);
            return response.data; // "회원가입 성공:..."
        } catch (err) {
            console.error("Signup error:", err);
            if (axios.isAxiosError(err)) {
                const errorData = err.response?.data;
                const message = (typeof errorData === 'string' && errorData) ? errorData : "회원가입에 실패했습니다.";
                throw new Error(message);
            }
            throw new Error("회원가입에 실패했습니다.");
        }
    };

    // (이전과 동일)
    const logout = () => {
        setToken(null);
    };

    // (이전과 동일)
    const value = useMemo<AuthContextType>(() => ({
        user,
        loading,
        login,
        signup,
        logout,
        api
    }), [user, loading]);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// (이전과 동일)
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

// --- 3. 라우팅 설정 ---
// (이전과 동일)
function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Layout>
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/cards" element={<CardListPage />} />

                        {/* --- 보호된 경로 --- */}
                        <Route
                            path="/dashboard"
                            element={
                                <ProtectedRoute>
                                    <DashboardPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/my-collection"
                            element={
                                <ProtectedRoute>
                                    <MyCollectionPage />
                                </ProtectedRoute>
                            }
                        />

                        <Route path="*" element={<div>페이지를 찾을 수 없습니다.</div>} />
                    </Routes>
                </Layout>
            </BrowserRouter>
        </AuthProvider>
    );
}

// --- 4. 공통 레이아웃 (헤더/네비게이션) ---
// (이전과 동일)
const Layout = ({ children }: { children: React.ReactNode }) => {
    const { user, logout } = useAuth();

    return (
        <div>
            <nav>
                <div>
                    <div>
                        <div>
                            <Link to="/">Pokekor</Link>
                            <div>
                                <Link to="/">홈</Link>
                                <Link to="/cards" style={{ marginLeft: '10px' }}>카드 목록</Link>
                                {user && (
                                    <>
                                        <Link to="/my-collection" style={{ marginLeft: '10px' }}>내 컬렉션</Link>
                                        <Link to="/dashboard" style={{ marginLeft: '10px' }}>대시보드</Link>
                                    </>
                                )}
                            </div>
                        </div>
                        <div>
                            {user ? (
                                <div>
                                    <span>환영합니다, {user.username}님!</span>
                                    <button onClick={logout} style={{ marginLeft: '10px' }}>
                                        로그아웃
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    <Link to="/login">로그인</Link>
                                    <Link to="/register" style={{ marginLeft: '10px' }}>회원가입</Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>
            <main>
                {children}
            </main>
        </div>
    );
};

// --- 5. 페이지 컴포넌트 ---
// (이전과 동일)
// [수정] LoginPage (사용자 코드 복붙)
const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || "/dashboard";

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            await login(username, password);
            navigate(from, { replace: true });
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("알 수 없는 오류가 발생했습니다.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <div><h2>로그인</h2></div>
            <form onSubmit={handleSubmit}>
                {error && <div style={{ color: 'red' }}>{error}</div>}
                <div>
                    <div>
                        <label htmlFor="login-username">아이디: </label>
                        <input id="login-username" name="username" type="text" required value={username}
                               onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
                               placeholder="아이디" />
                    </div>
                    <div>
                        <label htmlFor="login-password">비밀번호: </label>
                        <input id="login-password" name="password" type="password" required value={password}
                               onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                               placeholder="비밀번호" />
                    </div>
                </div>
                <div>
                    <button type="submit" disabled={isLoading}>
                        {isLoading ? '로그인 중...' : '로그인'}
                    </button>
                </div>
            </form>
        </div>
    );
};
// [수정] RegisterPage (사용자 코드 복붙)
const RegisterPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { signup } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setIsLoading(true);
        try {
            const message = await signup(username, password, email || undefined);
            setSuccess(message + " 2초 후 로그인 페이지로 이동합니다.");
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("알 수 없는 오류가 발생했습니다.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <div><h2>회원가입</h2></div>
            <form onSubmit={handleSubmit}>
                {error && <div style={{ color: 'red' }}>{error}</div>}
                {success && <div style={{ color: 'green' }}>{success}</div>}
                <div>
                    <div>
                        <label htmlFor="reg-username">아이디: </label>
                        <input id="reg-username" name="username" type="text" required value={username}
                               onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
                               placeholder="아이디" />
                    </div>
                    <div>
                        <label htmlFor="reg-password">비밀번호: </label>
                        <input id="reg-password" name="password" type="password" required value={password}
                               onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                               placeholder="비밀번호" />
                    </div>
                    <div>
                        <label htmlFor="reg-email">이메일 (선택): </label>
                        <input id="reg-email" name="email" type="email" value={email}
                               onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                               placeholder="이메일 (선택)" />
                    </div>
                </div>
                <div>
                    <button type="submit" disabled={isLoading || !!success}>
                        {isLoading ? '처리 중...' : '회원가입'}
                    </button>
                </div>
            </form>
        </div>
    );
};

// [수정] HomePage (사용자 코드 복붙)
const HomePage = () => (
    <div>
        <h1>Pokekor에 오신 것을 환영합니다!</h1>
        <p>당신의 포켓몬 카드 컬렉션을 관리하세요.</p>
    </div>
);

// [수정] DashboardPage (사용자 코드 복붙)
const DashboardPage = () => {
    const { api } = useAuth();
    const [message, setMessage] = useState('불러오는 중...');

    useEffect(() => {
        // (SecurityConfig에 /api/auth/test 경로가 없으므로 401/403 테스트)
        api.get<string>('/api/auth/test')
            .then(response => {
                setMessage(response.data);
            })
            .catch((err: AxiosError) => {
                if(err.response?.status === 401 || err.response?.status === 403) {
                    setMessage(`보호된 API 접근 테스트 성공 (상태: ${err.response.status})`);
                } else {
                    setMessage(`API 호출 오류 (상태: ${err.response?.status || 'Error'})`);
                }
            });
    }, [api]);

    return (
        <div>
            <h1>대시보드</h1>
            <p>이 페이지는 로그인한 사용자만 볼 수 있습니다.</p>
            <p>보호된 API 응답: {message}</p>
        </div>
    );
};


// --- 6. 보호된 경로 컴포넌트 ---
// (이전과 동일)
const ProtectedRoute = ({ children }: { children: React.ReactElement }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};


export default App;