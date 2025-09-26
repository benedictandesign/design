import * as THREE from 'three';

export const FisheyeShader = {

  uniforms: {
    // input render
    tDiffuse:        { value: null },

    // optical center in UV space
    uCenter:         { value: new THREE.Vector2(0.5, 0.5) },

    // radial distortion coefficients
    k1:              { value: 0.3 },
    k2:              { value: 0.1 },
    k3:              { value: 0.01 },

    // tangential distortion coefficients
    p1:              { value: 0.0 },
    p2:              { value: 0.0 },

    // chromatic aberration per-channel distortion tweak
    k1_r:            { value: 0.7 },
    k1_g:            { value: 0.5 },
    k1_b:            { value: 0.5 },

    // vignette settings
    vignetteRadius:   { value: 1.8 },
    vignetteSoftness: { value: 0.1 },
    vignetteGain:     { value: 0.5 },

    // film grain intensity
    grainIntensity:   { value: 0.02 }
  },

  vertexShader: `
    varying vec2 vUv;

    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform vec2 uCenter;

    uniform float k1;
    uniform float k2;
    uniform float k3;

    uniform float p1;
    uniform float p2;

    uniform float k1_r;
    uniform float k1_g;
    uniform float k1_b;

    uniform float vignetteRadius;
    uniform float vignetteSoftness;
    uniform float vignetteGain;

    uniform float grainIntensity;

    varying vec2 vUv;

    // simple hash-based noise
    float rand(vec2 co){
      return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
    }

    void main(){
      // remap to [-1,+1] around center
      vec2 uv = (vUv - uCenter) * 2.0;
      float x = uv.x;
      float y = uv.y;
      float r2 = x*x + y*y;
      float r1 = sqrt(r2);

      // Brown–Conrady: radial
      float radial = 1.0
        + k1 * r2
        + k2 * r2 * r2
        + k3 * r2 * r2 * r2;

      // Brown–Conrady: tangential
      float tanX = 2.0 * p1 * x * y + p2 * (r2 + 2.0 * x * x);
      float tanY = p1 * (r2 + 2.0 * y * y) + 2.0 * p2 * x * y;

      // distorted vector
      vec2 d = uv * radial + vec2(tanX, tanY);
      vec2 n = normalize(d);

      // per-channel UV
      vec2 uvR = uCenter + n * (r1 * (1.0 + k1_r * r2));
      vec2 uvG = uCenter + n * (r1 * (1.0 + k1_g * r2));
      vec2 uvB = uCenter + n * (r1 * (1.0 + k1_b * r2));

      // fetch each channel
      float red   = texture2D(tDiffuse, uvR).r;
      float green = texture2D(tDiffuse, uvG).g;
      float blue  = texture2D(tDiffuse, uvB).b;
      vec3 col = vec3(red, green, blue);

      // vignette falloff
      float dist = length(vUv - uCenter);
      float vig = smoothstep(vignetteRadius,
                             vignetteRadius - vignetteSoftness,
                             dist);
      col *= mix(1.0, 1.0 - vignetteGain, vig);

      // film grain
      float noise = rand(gl_FragCoord.xy);
      col += (noise - 0.5) * grainIntensity;

      gl_FragColor = vec4(col, 1.0);
    }
  `
};
