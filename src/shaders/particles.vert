/**
 * WHO: 粒子顶点着色器 - GPU动画核心
 * FROM: 接收 three.js 传入的 attribute
 * TO: 输出给片元着色器处理
 * HERE: src/shaders/particles.vert
 * 
 * 关键特性：
 * - 三个位置混合：position(混沌) -> targetLogo(LOGO) -> targetWorld(世界)
 * - 使用 mix() 实现平滑过渡
 * - 独立的动画进度控制
 */

varying vec3 vPosition;
varying float vAlpha;
varying float vScale;

uniform float uTime;
uniform float uProgress; // 0-1 全局进度
uniform float uPhase; // 0=chaos, 1=logo, 2=explode, 3=world

void main() {
  vPosition = position;
  
  // 计算粒子大小
  float size = 2.0;
  
  // 基于进度的粒子缩放动画
  float phaseProgress = uProgress;
  
  // 从混沌到Logo (0 - 0.3)
  float logoProgress = smoothstep(0.0, 0.3, uProgress);
  
  // 从Logo到爆发 (0.3 - 0.6)
  float explodeProgress = smoothstep(0.3, 0.6, uProgress);
  
  // 从爆发到展开世界 (0.6 - 1.0)
  float worldProgress = smoothstep(0.6, 1.0, uProgress);
  
  // 计算最终位置
  vec3 finalPos = position;
  
  // 添加一些噪点运动
  float noise = sin(uTime * 0.5 + position.x * 0.1) * 
                cos(uTime * 0.3 + position.y * 0.1) * 2.0;
  
  // 根据阶段混合位置
  if (uProgress < 0.3) {
    // 混沌 -> Logo
    finalPos = mix(position, targetLogo, logoProgress);
    finalPos += noise * (1.0 - logoProgress);
    size = mix(1.5, 2.5, logoProgress);
  } else if (uProgress < 0.6) {
    // Logo -> 爆发
    vec3 explodeDir = normalize(position) * 30.0;
    finalPos = mix(targetLogo, targetLogo + explodeDir * explodeProgress, explodeProgress);
    size = mix(2.5, 1.0, explodeProgress);
  } else {
    // 爆发 -> 世界
    finalPos = mix(
      targetLogo + normalize(position) * 30.0 * explodeProgress,
      targetWorld,
      worldProgress
    );
    // 世界结构中的缓慢漂移
    finalPos.x += sin(uTime * 0.2 + finalPos.y * 0.05) * 0.5;
    finalPos.y += cos(uTime * 0.15 + finalPos.x * 0.05) * 0.5;
    size = mix(1.0, 1.8, worldProgress);
  }
  
  // 透明度
  vAlpha = 0.6 + sin(uTime + position.x) * 0.2;
  
  // 粒子缩放
  vScale = size;
  
  vec4 mvPosition = modelViewMatrix * vec4(finalPos, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  gl_PointSize = size * (300.0 / -mvPosition.z);
}