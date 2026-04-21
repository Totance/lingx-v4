/**
 * WHO: 粒子系统组件 - 核心视觉效果
 * FROM: 依赖 @react-three/fiber, three, shaders
 * TO: 渲染到 Canvas，被 useStore 状态控制
 * HERE: src/components/Particles.jsx
 * 
 * 功能：
 * - 15000+ 粒子的 GPU 动画
 * - LOGO 形状目标位置生成
 * - 三个阶段的平滑过渡
 */

import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import useStore from '../store/useStore'
import vertexShader from '../shaders/particles.vert?raw'
import fragmentShader from '../shaders/particles.frag?raw'

// LOGO 形状点生成 - 基于 SVG 轮廓
function generateLogoPoints(count) {
  const points = []
  const scale = 0.15
  const offsetX = 0
  const offsetY = 0
  
  // 从 SVG 解析的形状数据 (LINGX LOGO)
  const shapes = [
    // 左侧圆形
    { type: 'circle', cx: 0, cy: 0, r: 8 },
    // 右侧 LINGX 文字区域 - 简化为矩形条
    { type: 'rect', x: 15, y: -6, w: 2, h: 12 },
    { type: 'rect', x: 20, y: -6, w: 2, h: 12 },
    { type: 'rect', x: 25, y: -6, w: 2, h: 12 },
    { type: 'rect', x: 30, y: -6, w: 2, h: 12 },
    // 更多装饰条
    { type: 'rect', x: -15, y: -8, w: 1.5, h: 16 },
    { type: 'rect', x: -12, y: -8, w: 1.5, h: 16 },
  ]
  
  for (let i = 0; i < count; i++) {
    const shape = shapes[i % shapes.length]
    let x, y
    
    if (shape.type === 'circle') {
      const angle = Math.random() * Math.PI * 2
      const r = Math.sqrt(Math.random()) * shape.r
      x = shape.cx + Math.cos(angle) * r
      y = shape.cy + Math.sin(angle) * r
    } else if (shape.type === 'rect') {
      x = shape.x + (Math.random() - 0.5) * shape.w
      y = shape.y + (Math.random() - 0.5) * shape.h
    }
    
    points.push(new THREE.Vector3(x * scale + offsetX, y * scale + offsetY, 0))
  }
  
  return points
}

// 世界结构点生成 - 3D 空间展开
function generateWorldPoints(count) {
  const points = []
  
  // 创建多层环形结构
  for (let i = 0; i < count; i++) {
    const layer = Math.floor(Math.random() * 4) // 4层结构
    const angle = Math.random() * Math.PI * 2
    const radius = 10 + layer * 15 + Math.random() * 5
    const height = (Math.random() - 0.5) * 30
    
    const x = Math.cos(angle) * radius
    const y = height
    const z = Math.sin(angle) * radius
    
    points.push(new THREE.Vector3(x, y, z))
  }
  
  return points
}

// 混沌初始点
function generateChaosPoints(count) {
  const points = []
  
  for (let i = 0; i < count; i++) {
    const x = (Math.random() - 0.5) * 100
    const y = (Math.random() - 0.5) * 100
    const z = (Math.random() - 0.5) * 100
    
    points.push(new THREE.Vector3(x, y, z))
  }
  
  return points
}

export default function Particles({ particleCount = 15000 }) {
  const meshRef = useRef()
  const { phase, progress, setProgress } = useStore()
  
  // 生成三种状态的粒子位置
  const { chaosPositions, logoPositions, worldPositions } = useMemo(() => {
    const chaos = generateChaosPoints(particleCount)
    const logo = generateLogoPoints(particleCount)
    const world = generateWorldPoints(particleCount)
    
    return {
      chaosPositions: chaos,
      logoPositions: logo,
      worldPositions: world
    }
  }, [particleCount])
  
  // 创建 BufferGeometry
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    
    const positions = new Float32Array(particleCount * 3)
    const targetLogo = new Float32Array(particleCount * 3)
    const targetWorld = new Float32Array(particleCount * 3)
    
    // 设置初始位置（混沌）
    for (let i = 0; i < particleCount; i++) {
      const chaos = chaosPositions[i]
      const logo = logoPositions[i % logoPositions.length]
      const world = worldPositions[i % worldPositions.length]
      
      positions[i * 3] = chaos.x
      positions[i * 3 + 1] = chaos.y
      positions[i * 3 + 2] = chaos.z
      
      targetLogo[i * 3] = logo.x
      targetLogo[i * 3 + 1] = logo.y
      targetLogo[i * 3 + 2] = logo.z
      
      targetWorld[i * 3] = world.x
      targetWorld[i * 3 + 1] = world.y
      targetWorld[i * 3 + 2] = world.z
    }
    
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('targetLogo', new THREE.BufferAttribute(targetLogo, 3))
    geo.setAttribute('targetWorld', new THREE.BufferAttribute(targetWorld, 3))
    
    return geo
  }, [chaosPositions, logoPositions, worldPositions, particleCount])
  
  // ShaderMaterial
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uProgress: { value: 0 },
        uPhase: { value: 0 }
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    })
  }, [])
  
  // 动画循环
  useFrame((state, delta) => {
    if (!meshRef.current) return
    
    const mat = meshRef.current.material
    
    // 更新时间
    mat.uniforms.uTime.value = state.clock.elapsedTime
    
    // 自动播放动画
    let newProgress = progress
    
    if (phase === 'chaos') {
      // 混沌 -> Logo (自动播放)
      newProgress += delta * 0.15
      if (newProgress >= 0.3) {
        newProgress = 0.3
        useStore.getState().setPhase('logo')
      }
    } else if (phase === 'logo') {
      // Logo 保持一小段时间
      newProgress += delta * 0.1
      if (newProgress >= 0.6) {
        newProgress = 0.6
        useStore.getState().setPhase('explode')
      }
    } else if (phase === 'explode') {
      // 爆发 -> 世界
      newProgress += delta * 0.12
      if (newProgress >= 1.0) {
        newProgress = 1.0
        useStore.getState().setPhase('world')
      }
    }
    
    // 平滑更新进度
    mat.uniforms.uProgress.value = newProgress
    setProgress(newProgress)
    
    // 更新阶段
    const phaseMap = { chaos: 0, logo: 1, explode: 2, world: 3 }
    mat.uniforms.uPhase.value = phaseMap[phase]
    
    // 缓慢旋转整个粒子系统
    meshRef.current.rotation.y += delta * 0.02
  })
  
  return (
    <points ref={meshRef} geometry={geometry} material={material} />
  )
}