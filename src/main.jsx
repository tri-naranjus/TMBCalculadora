
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

if (window.parent !== window) {
  const post = () => {
    const h = document.documentElement.scrollHeight
    window.parent.postMessage({ type: 'tmb-calc:height', height: h }, '*')
  }
  const ro = new ResizeObserver(post)
  ro.observe(document.documentElement)
  window.addEventListener('load', post)
}
