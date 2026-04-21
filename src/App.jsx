/**
 * WHO: 应用入口组件
 * FROM: 组合 Scene, UI 组件
 * TO: 渲染完整页面
 * HERE: src/App.jsx
 */

import Scene from './components/Scene'
import UI from './components/UI'

export default function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <Scene />
      <UI />
    </div>
  )
}