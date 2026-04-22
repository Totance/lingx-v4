/**
 * WHO: Three.js 场景组件 - 简化测试版
 */

import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Suspense } from 'react'

function SimpleScene() {
  return (
    <mesh>
      <boxGeometry args={[2, 2, 2]} />
      <meshNormalMaterial />
    </mesh>
  )
}

function Loading() {
  return (
    <mesh>
      <sphereGeometry args={[1, 16, 16]} />
      <meshBasicMaterial color="red" wireframe />
    </mesh>
  )
}

export default function Scene() {
  return (
    <Canvas>
      <Suspense fallback={<Loading />}>
        <SimpleScene />
        <OrbitControls />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
      </Suspense>
    </Canvas>
  )
}