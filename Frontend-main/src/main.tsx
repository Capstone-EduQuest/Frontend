// src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux' // ✨ 이 줄 추가!
import { store } from './store'       // ✨ 이 줄 추가!
import App from './App'
import './index.css' // (또는 tailwind.css 등 본인 환경에 맞는 css)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* 👇 App을 Provider로 감싸줍니다 👇 */}
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
)