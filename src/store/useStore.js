/**
 * WHO: 提供全局状态管理 - 动画阶段、相机位置、入口状态
 * FROM: 依赖 zustand
 * TO: 被 Scene.jsx, Particles.jsx, UI.jsx 消费
 * HERE: src/store/useStore.js - 状态中枢
 */

import { create } from 'zustand'

// 动画阶段：chaos -> logo -> explode -> world
const useStore = create((set, get) => ({
  // 动画阶段
  phase: 'chaos', // chaos | logo | explode | world
  progress: 0, // 0-1 动画进度
  
  // 相机状态
  cameraPosition: [0, 0, 50],
  cameraTarget: [0, 0, 0],
  
  // 当前入口（null | 'xunjian' | 'babylon'）
  activePortal: null,
  
  // 入口展开状态
  portalExpanded: false,
  
  // 动作
  setPhase: (phase) => set({ phase }),
  
  setProgress: (progress) => set({ progress }),
  
  setCameraPosition: (pos) => set({ cameraPosition: pos }),
  
  setCameraTarget: (target) => set({ cameraTarget: target }),
  
  enterPortal: (portalId) => {
    set({ 
      activePortal: portalId,
      portalExpanded: true,
      phase: 'world'
    })
  },
  
  exitPortal: () => {
    set({ 
      activePortal: null,
      portalExpanded: false,
      phase: 'world'
    })
  },
  
  // 重置到初始状态
  reset: () => set({
    phase: 'chaos',
    progress: 0,
    cameraPosition: [0, 0, 50],
    cameraTarget: [0, 0, 0],
    activePortal: null,
    portalExpanded: false
  })
}))

export default useStore