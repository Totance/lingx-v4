/**
 * WHO: Three.js 场景组件 - 渲染核心
 * FROM: 依赖 @react-three/fiber, @react-three/drei, Particles
 * TO: 输出 Canvas 渲染
 * HERE: src/components/Scene.jsx
 * 
 * 功能：
 * - Canvas 设置
 * - 相机动画控制
 * - 灯光和环境
 */

import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { Suspense, useEffect } from 'react'
import * as THREE from 'three'
import Particles from './Particles'
import useStore from '../store/useStore'

function CameraController() {
  const { cameraPosition, cameraTarget, activePortal, portalExpanded, phase } = useStore()
  
  // 入口动画时的相机移动
  useEffect(() => {
    if (activePortal && portalExpanded) {
      // 相机推进到入口
      useStore.getState().setCameraPosition([0, 0, 15])
    } else if (phase === 'world') {
      // 世界模式，相机拉远
      useStore.getState().setCameraPosition([0, 0, 40])
    }
  }, [activePortal, portalExpanded, phase])
  
  return (
    <PerspectiveCamera 
      makeDefault 
      position={cameraPosition} 
      fov={60}
      near={0.1}
      far={1000}
    />
  )
}

function Lights() {
  return (
    <>
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={0.5} color="#ffffff" />
      <pointLight position={[-10, -10, -10]} intensity={0.3} color="#4488ff" />
    </>
  )
}

function Stars() {
  const count = 500
  const positions = new Float32Array(count * 3)
  
  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    const r = 200 + Math.random() * 100
    
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
    positions[i * 3 + 2] = r * Math.cos(phi)
  }
  
  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={1}
        color="#ffffff"
        transparent
        opacity={0.4}
        sizeAttenuation
      />
    </points>
  )
}

function PortalGate({ position, rotation, onClick, label, color = '#ffffff' }) {
  const meshRef = useRef()
  
  return (
    <group position={position} rotation={rotation} onClick={onClick}>
      {/* 门框 */}
      <mesh>
        <torusGeometry args={[3, 0.1, 16, 64]} />
        <meshBasicMaterial color={color} transparent opacity={0.6} />
      </mesh>
      
      {/* 内部光晕 */}
      <mesh>
        <circleGeometry args={[2.8, 64]} />
        <meshBasicMaterial 
          color={color} 
          transparent 
          opacity={0.1} 
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* 光效 */}
      <pointLight color={color} intensity={2} distance={10} />
    </group>
  )
}

import { useRef } from 'react'

function PortalGates() {
  const { enterPortal, portalExpanded, activePortal } = useStore()
  
  // 只有在世界阶段才显示入口
  const phase = useStore(state => state.phase)
  if (phase !== 'world' && phase !== 'explode') return null
  
  return (
    <group>
      {/* 寻剑入口 - 左侧 */}
      <PortalGate
        position={[-25, 0, -10]}
        rotation={[0, Math.PI / 6, 0]}
        color="#ff6b6b"
        onClick={(e) => {
          e.stopPropagation()
          enterPortal('xunjian')
        }}
      />
      
      {/* 奇幻巴比伦入口 - 右侧 */}
      <PortalGate
        position={[25, 0, -10]}
        rotation={[0, -Math.PI / 6, 0]}
        color="#4ecdc4"
        onClick={(e) => {
          e.stopPropagation()
          enterPortal('babylon')
        }}
      />
    </group>
  )
}

export default function Scene() {
  return (
    <Canvas
      gl={{ 
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance'
      }}
      style={{ background: '#000000' }}
    >
      <Suspense fallback={null}>
        <CameraController />
        <Lights />
        <Stars />
        <Particles particleCount={15000} />
        <PortalGates />
        <OrbitControls 
          enableZoom={false}
          enablePan={false}
          autoRotate={false}
          maxPolarAngle={Math.PI / 1.5}
          minPolarAngle={Math.PI / 3}
        />
        {/* 雾效增加深度感 */}
        <fog attach="fog" args={['#000000', 30, 150]} />
      </Suspense>
    </Canvas>
  )
}