import React from 'react'
import ReactDOM from 'react-dom/client'
import { cssVariables } from './tokens'
import './styles/global.css'
import './styles/layout.css'
import './styles/blocks.css'
import './styles/pages.css'
import './styles/elevation.css'
import './styles/theme.css'
import App from './App'

// tokens.js 값을 첫 그림 전에 CSS 변수로 넣는다
const root = document.documentElement
for (const [k, v] of Object.entries(cssVariables())) root.style.setProperty(k, v)

ReactDOM.createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>)
