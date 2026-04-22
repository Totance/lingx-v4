/**
 * WHO: 粒子顶点着色器 - GPU动画核心
 */

varying vec3 vPosition;
varying float vAlpha;
varying float vScale;

attribute vec3 targetLogo;
attribute vec3 targetWorld;

uniform float uTime;
uniform float uProgress;
uniform float uPhase;

void main() {
  vPosition = position;
  
  float size = 2.0;
  float logoProgress = smoothstep(0.0, 0.3, uProgress);
  float explodeProgress = smoothstep(0.3, 0.6, uProgress);
  float worldProgress = smoothstep(0.6, 1.0, uProgress);
  
  vec3 finalPos = position;
  
  float noise = sin(uTime * 0.5 + position.x * 0.1) * 
                cos(uTime * 0.3 + position.y * 0.1) * 2.0;
  
  if (uProgress < 0.3) {
    finalPos = mix(position, targetLogo, logoProgress);
    finalPos += noise * (1.0 - logoProgress);
    size = mix(1.5, 2.5, logoProgress);
  } else if (uProgress < 0.6) {
    vec3 explodeDir = normalize(position) * 30.0;
    finalPos = mix(targetLogo, targetLogo + explodeDir * explodeProgress, explodeProgress);
    size = mix(2.5, 1.0, explodeProgress);
  } else {
    finalPos = mix(
      targetLogo + normalize(position) * 30.0 * explodeProgress,
      targetWorld,
      worldProgress
    );
    finalPos.x += sin(uTime * 0.2 + finalPos.y * 0.05) * 0.5;
    finalPos.y += cos(uTime * 0.15 + finalPos.x * 0.05) * 0.5;
    size = mix(1.0, 1.8, worldProgress);
  }
  
  vAlpha = 0.6 + sin(uTime + position.x) * 0.2;
  vScale = size;
  
  vec4 mvPosition = modelViewMatrix * vec4(finalPos, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  gl_PointSize = size * (300.0 / -mvPosition.z);
}