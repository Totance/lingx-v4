/**
 * WHO: 粒子片元着色器 - 渲染粒子颜色和效果
 * FROM: 接收顶点着色器的 varyings
 * TO: 最终像素颜色输出
 * HERE: src/shaders/particles.frag
 * 
 * 视觉效果：
 * - 柔和圆形粒子
 * - 渐变发光效果
 * - 颜色基于位置和进度变化
 */

varying vec3 vPosition;
varying float vAlpha;
varying float vScale;

uniform float uTime;
uniform float uProgress;

void main() {
  // 创建圆形粒子
  vec2 center = gl_PointCoord - vec2(0.5);
  float dist = length(center);
  
  // 柔和边缘
  float alpha = 1.0 - smoothstep(0.3, 0.5, dist);
  
  // 基础颜色 - 白色/淡蓝色
  vec3 baseColor = vec3(1.0, 1.0, 1.0);
  
  // 基于进度的颜色变化
  float colorShift = uProgress;
  vec3 color1 = vec3(1.0, 1.0, 1.0); // 白色
  vec3 color2 = vec3(0.8, 0.9, 1.0); // 淡蓝
  vec3 color3 = vec3(0.6, 0.8, 1.0); // 蓝色
  
  vec3 finalColor;
  if (uProgress < 0.3) {
    finalColor = mix(color1, color2, uProgress / 0.3);
  } else if (uProgress < 0.6) {
    finalColor = mix(color2, color3, (uProgress - 0.3) / 0.3);
  } else {
    finalColor = mix(color3, color1, (uProgress - 0.6) / 0.4);
  }
  
  // 添加发光效果
  float glow = exp(-dist * 3.0) * 0.5;
  finalColor += glow;
  
  // 透明度
  float finalAlpha = alpha * vAlpha;
  
  if (finalAlpha < 0.01) discard;
  
  gl_FragColor = vec4(finalColor, finalAlpha);
}