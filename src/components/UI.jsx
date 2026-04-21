/**
 * WHO: 极简 UI 组件 - 页面覆盖层
 * FROM: 依赖 useStore 状态
 * TO: 直接渲染到 DOM 层
 * HERE: src/components/UI.jsx
 * 
 * UI 限制：
 * - 主文案：点亮每个人心中的梦境
 * - 英文：LIGHT UP YOUR DREAMWORLD
 * - 底部：LINGX + CL@offthink.com
 * - 禁止：导航栏、多按钮、信息列表
 */

import { useState, useEffect } from 'react'
import useStore from '../store/useStore'

// 入口图标 SVG
const SwordIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M6.92 5H5l3 3 3-3h-1.92l-1.5 1.5L6.92 5zm12.66 2H14l-3-3-3 3h1.92l1.5-1.5L18.58 7zM12 2L8 6h3v8H8l4 4 4-4h-3V6h3L12 2z"/>
  </svg>
)

const TowerIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2L2 7v2h2v9h4v-6h4v6h4v-9h2V7l-10-5zm0 2.5L18 7v1h-2V7l-4-2.5zM10 9h4v6h-4V9z"/>
  </svg>
)

export default function UI() {
  const { phase, activePortal, portalExpanded, exitPortal } = useStore()
  const [showUI, setShowUI] = useState(true)
  
  // 动画过程中隐藏 UI
  useEffect(() => {
    if (phase === 'chaos' || phase === 'logo') {
      setShowUI(false)
    } else {
      const timer = setTimeout(() => setShowUI(true), 500)
      return () => clearTimeout(timer)
    }
  }, [phase])
  
  // 显示入口时的处理
  const showPortals = phase === 'world' || phase === 'explode'
  
  return (
    <>
      {/* 主 UI 覆盖层 */}
      <div className="ui-overlay" style={{ opacity: showUI ? 1 : 0, transition: 'opacity 0.8s ease' }}>
        {/* 主文案 */}
        <div className="main-text">
          <h1>点亮每个人心中的梦境</h1>
          <div className="subtitle">LIGHT UP YOUR DREAMWORLD</div>
        </div>
        
        {/* 底部联系 */}
        <div className="footer">
          <div className="brand">LINGX</div>
          <div className="email">CL@offthink.com</div>
        </div>
      </div>
      
      {/* 空间入口 */}
      {showPortals && (
        <div className="portal-entries">
          <div 
            className="portal-entry"
            onClick={() => useStore.getState().enterPortal('xunjian')}
          >
            <div className="portal-icon">
              <SwordIcon />
            </div>
            <div className="portal-name">寻剑</div>
          </div>
          
          <div 
            className="portal-entry"
            onClick={() => useStore.getState().enterPortal('babylon')}
          >
            <div className="portal-icon">
              <TowerIcon />
            </div>
            <div className="portal-name">奇幻巴比伦</div>
          </div>
        </div>
      )}
      
      {/* 入口内容覆盖层 */}
      <div className={`portal-overlay ${portalExpanded ? 'active' : ''}`}>
        {activePortal === 'xunjian' && (
          <div className="portal-content">
            <button className="close-btn" onClick={exitPortal}>
              <span></span>
              <span></span>
            </button>
            <h2>寻剑</h2>
            <p>在无垠的星海中寻找那把能够斩断时空的长剑开启属于你的传奇之旅</p>
          </div>
        )}
        
        {activePortal === 'babylon' && (
          <div className="portal-content">
            <button className="close-btn" onClick={exitPortal}>
              <span></span>
              <span></span>
            </button>
            <h2>奇幻巴比伦</h2>
            <p>踏入悬浮在空中的古老城邦在智慧与奇迹的殿堂中探索文明的终极奥秘</p>
          </div>
        )}
      </div>
    </>
  )
}