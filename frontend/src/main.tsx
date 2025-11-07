import React from 'react'
import ReactDOM from 'react-dom/client'
// [수정] App.jsx -> App.tsx
import App from './App.tsx'
// [수정] ./index.css (Vite가 생성한 기본 CSS)
import './index.css'
// React 18의 createRoot를 사용합니다.

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)
