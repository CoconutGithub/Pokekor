import React, { useState, createContext, useContext, useMemo, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, Navigate, useLocation } from 'react-router-dom';
import axios, { AxiosError } from 'axios';
import { jwtDecode } from "jwt-decode";
// [수정] CardListPage를 'pages' 디렉토리에서 가져옵니다.
import { CardListPage } from './pages/CardListPage';

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

// [수정] CardDTO 타입을 CardListPage와 공유하기 위해 'export' 합니다.
export interface CardDTO {
    cardId: number;
    cardName: string;
    cardImageUrl?: string;
    cardNumberInPack: string;
    packName: string;
    rarityName: string;
}


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

    useEffect(() => {
        if (token) {
            localStorage.setItem('pokekor_token', token);
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            try {
                const payload = jwtDecode<JwtPayload>(token);
                if (payload.exp * 1000 > Date.now()) {
                    setUser({ username: payload.sub });
                } else {
                    setToken(null);
                }
            } catch (e) {
                console.error("Invalid token:", e);
                setToken(null);
            }
            setLoading(false);
        } else {
            localStorage.removeItem('pokekor_token');
            delete api.defaults.headers.common['Authorization'];
            setUser(null);
            setLoading(false);
        }
    }, [token]);

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
                // [수정] 백엔드 응답 메시지가 문자열일 경우를 처리
                const errorData = err.response?.data;
                const message = (typeof errorData === 'string' && errorData) ? errorData : "로그인에 실패했습니다.";
                throw new Error(message);
            }
            throw new Error("로그인에 실패했습니다.");
        }
    };

    const signup = async (username: string, password: string, email?: string): Promise<string> => {
        try {
            const requestDto: AuthRequestDTO = { username, password, email };
            const response = await api.post<string>('/auth/register', requestDto);
            return response.data;
        } catch (err) {
            console.error("Signup error:", err);
            if (axios.isAxiosError(err)) {
                // [수정] 백엔드 응답 메시지가 문자열일 경우를 처리
                const errorData = err.response?.data;
                const message = (typeof errorData === 'string' && errorData) ? errorData : "회원가입에 실패했습니다.";
                throw new Error(message);
            }
            throw new Error("회원가입에 실패했습니다.");
        }
    };

    const logout = () => {
        setToken(null);
    };

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

// [수정] useAuth 훅을 다른 파일(CardListPage)에서 사용할 수 있도록 'export' 합니다.
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

// --- 3. 라우팅 설정 ---
function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Layout>
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route
                            path="/dashboard"
                            element={
                                <ProtectedRoute>
                                    <DashboardPage />
                                </ProtectedRoute>
                            }
                        />
                        {/* [수정] 카드 목록 페이지 라우트 추가 */}
                        <Route path="/cards" element={<CardListPage />} />

                        <Route path="*" element={<div>페이지를 찾을 수 없습니다.</div>} />
                    </Routes>
                </Layout>
            </BrowserRouter>
        </AuthProvider>
    );
}

// --- 4. 공통 레이아웃 (헤더/네비게이션) ---
// (Tailwind 없는 버전)
const Layout = ({ children }: { children: React.ReactNode }) => {
    const { user, logout } = useAuth();

    // (CSS 스타일링은 frontend/src/index.css 또는 App.css 등에서 관리)
    return (
        <div>
            <nav>
                <div>
                    <div>
                        <div>
                            <Link to="/">Pokekor</Link>
                            <div>
                                <Link to="/">홈</Link>
                                {/* [수정] 카드 목록 페이지 링크 추가 */}
                                <Link to="/cards" style={{ marginLeft: '10px' }}>카드 목록</Link>
                                {user && (
                                    <Link to="/dashboard" style={{ marginLeft: '10px' }}>대시보드</Link>
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

const HomePage = () => (
    <div>
        <h1>Pokekor에 오신 것을 환영합니다!</h1>
        <p>당신의 포켓몬 카드 컬렉션을 관리하세요.</p>
    </div>
);

const DashboardPage = () => {
    const { api } = useAuth();
    const [message, setMessage] = useState('불러오는 중...');

    useEffect(() => {
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

// --- 6. 보호된 경로 컴포넌트 ---
// (이전과 동일)
const ProtectedRoute = ({ children }: { children: React.ReactElement }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <div>Loading...</div>; // (AuthContext 로딩 대기)
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};


export default App;