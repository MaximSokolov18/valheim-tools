/**
 * Shaders for the painted fjord scene (see mount-fjord-scene.ts).
 *
 * Painted layers (far range, mid range, near cliffs, the longship) sit over a
 * sky painted in code. A sun and a moon ride one wheel (`uAng`); the water
 * mirrors the scene with ripples, and the frame dissolves into the page's
 * paper color (`uPaper`) with an ink-wash edge from `uWash` (0-1 from the left).
 * `uPar` is the pointer parallax; `uScroll` is how far the scene has scrolled
 * past the middle of the viewport (-1..1), which sinks each layer at its own depth.
 */
export const FJORD_VERTEX_SHADER =
    'attribute vec2 a; varying vec2 v; void main(){ v = a * 0.5 + 0.5; gl_Position = vec4(a, 0.0, 1.0); }';

export const FJORD_FRAGMENT_SHADER = /* glsl */ `
precision highp float;
varying vec2 v;
uniform sampler2D uFar, uMid, uNear, uShip;
uniform vec2 uRes, uFarS, uMidS, uNearS, uShipS, uPar;
uniform float uTime, uH, uAng, uWash, uScroll;
uniform vec3 uPaper, uShipPos;
uniform float uTilt;
uniform vec4 uRip[6];
float A;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
  return mix(mix(hash(i), hash(i+vec2(1,0)), f.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y); }
float fbm(vec2 p){ float s = 0.0, a = 0.5; for (int i = 0; i < 5; i++){ s += a*noise(p); p *= 2.03; a *= 0.5; } return s; }
// Sun and moon on one wheel.
vec2 bodyPos(float ang){ return vec2(0.655 - cos(ang) * 0.17, uH - 0.22 + sin(ang) * 0.68 - uScroll * 0.22); }
float day(){ return smoothstep(-0.10, 0.22, sin(uAng)); }
float dusk(){ float s = sin(uAng); return exp(-s*s*18.0); }
vec4 layer(sampler2D t, vec2 size, vec2 p, float bottom, float h, float off, float mirror, float cover){
  float w = h * size.x / size.y / A;
  if (w < cover){ h *= cover / w; w = cover; }
  float vv = (p.y - bottom) / h; if (vv < 0.0 || vv > 1.0) return vec4(0.0);
  float u = (p.x - 0.5 + off) / w + 0.5;
  if (mirror > 0.5){ float m = mod(u, 2.0); u = m < 1.0 ? m : 2.0 - m; } else if (u < 0.0 || u > 1.0) return vec4(0.0);
  return texture2D(t, vec2(u, vv)); }
vec3 sky(vec2 p){
  float D = day(), K = dusk();
  float y = clamp((p.y - uH) / (1.0 - uH), 0.0, 1.0);
  vec3 dayTop = vec3(0.86, 0.66, 0.36), dayHor = vec3(0.97, 0.88, 0.66);
  vec3 nightTop = vec3(0.04, 0.07, 0.13), nightHor = vec3(0.16, 0.24, 0.34);
  vec3 duskTop = vec3(0.45, 0.30, 0.38), duskHor = vec3(0.98, 0.62, 0.38);
  vec3 top = mix(nightTop, dayTop, D), hor = mix(nightHor, dayHor, D);
  top = mix(top, duskTop, K * 0.55); hor = mix(hor, duskHor, K * 0.7);
  vec3 c = mix(hor, top, pow(y, 0.8));
  // Painted cloud streaks.
  vec2 q = vec2(p.x * A * 1.6 + uTime * 0.004, p.y * 9.0);
  float cl = smoothstep(0.55, 0.78, fbm(q + vec2(0.0, fbm(q * 0.5) * 1.5))) * smoothstep(0.05, 0.35, y) * (1.0 - smoothstep(0.85, 1.0, y));
  vec3 clc = mix(vec3(0.20, 0.25, 0.34), mix(vec3(0.86, 0.55, 0.28), vec3(0.80, 0.45, 0.30), K), D);
  c = mix(c, clc, cl * mix(0.45, 0.75, D));
  // Stars.
  vec2 g = floor(vec2(p.x * A, p.y) * 160.0); float st = step(0.9965, hash(g)) * (0.6 + 0.4 * sin(uTime * 2.0 + hash(g + 3.0) * 30.0));
  c += st * (1.0 - D) * smoothstep(0.1, 0.5, y) * 0.9;
  // Sun.
  vec2 sp = bodyPos(uAng), mp = bodyPos(uAng + 3.14159265);
  vec2 d = vec2((p.x - sp.x) * A, p.y - sp.y); float r = length(d);
  vec3 sunC = mix(vec3(1.0, 0.86, 0.55), vec3(1.0, 0.62, 0.36), K);
  c += sunC * (exp(-r * 9.0) * 0.55 + exp(-r * 28.0) * 0.4) * smoothstep(-0.05, 0.02, sp.y - uH + 0.03);
  float disc = smoothstep(0.052, 0.046, r + (noise(d * 60.0) - 0.5) * 0.004);
  c = mix(c, sunC * 1.02, disc);
  // Moon.
  d = vec2((p.x - mp.x) * A, p.y - mp.y); r = length(d);
  c += vec3(0.75, 0.82, 0.95) * exp(-r * 12.0) * 0.28 * (1.0 - D * 0.7);
  float md = smoothstep(0.040, 0.035, r + (noise(d * 70.0) - 0.5) * 0.003);
  vec3 moonC = vec3(0.96, 0.93, 0.84) * (0.86 + 0.16 * fbm(d * 40.0 + 7.0));
  c = mix(c, moonC, md * mix(1.0, 0.75, D));
  return c; }
vec3 land(vec2 p, vec3 base){
  float D = day(), K = dusk();
  vec3 lightC = mix(vec3(0.30, 0.36, 0.52), vec3(1.0), D) + vec3(0.18, 0.07, 0.0) * K * D;
  vec3 haze = mix(vec3(0.16, 0.24, 0.34), vec3(0.97, 0.88, 0.66), D);
  vec4 f = layer(uFar, uFarS, p, uH + 0.03 - uScroll * 0.15, 0.46, uPar.x * 0.25 + 0.21, 1.0, 0.0);
  vec3 c = mix(base, mix(f.rgb * lightC, haze, 0.38), f.a);
  vec4 m = layer(uMid, uMidS, p, uH - 0.36 - uScroll * 0.085, 0.78, uPar.x * 0.6 + 0.13, 1.0, 0.0);
  c = mix(c, mix(m.rgb * lightC, haze, 0.14), m.a);
  vec4 n = layer(uNear, uNearS, p, uH - 0.03 - uScroll * 0.03, 0.82, uPar.x * 1.3 - 0.2, 0.0, max(0.8, 2.0 * (0.7 - max(uWash, 0.0)) + 0.12));
  c = mix(c, n.rgb * lightC * 0.95, n.a);
  return c; }
vec4 ship(vec2 p){
  float w = uShipPos.z, h = w * uShipS.y / uShipS.x * A;
  vec2 d = p - uShipPos.xy; d.x *= A;
  float cs = cos(uTilt), sn = sin(uTilt); d = vec2(cs*d.x + sn*d.y, -sn*d.x + cs*d.y); d.x /= A;
  vec2 q = vec2(d.x / w + 0.5, d.y / h + 0.16);
  if (q.x < 0.0 || q.x > 1.0 || q.y < 0.0 || q.y > 1.0) return vec4(0.0);
  return texture2D(uShip, q); }
void main(){
  A = uRes.x / uRes.y;
  vec2 p = v;
  vec2 pp = p + vec2(uPar.x, uPar.y) * 0.004;
  float D = day();
  vec3 col;
  vec2 rip = vec2(0.0); float glint = 0.0;
  for (int i = 0; i < 6; i++){
    vec4 r = uRip[i]; float age = uTime - r.z;
    if (r.w > 0.0 && age > 0.0 && age < 3.0){
      vec2 dd = (p - r.xy) * vec2(A, 3.2); float rr = length(dd); float front = age * 0.16;
      float k = exp(-abs(rr - front) * 30.0) * (1.0 - age/3.0) * r.w;
      float ph = sin((rr - front) * 90.0); rip += normalize(dd + 1e-5) * ph * 0.011 * k; glint += max(ph, 0.0) * k; } }
  if (p.y >= uH){
    col = land(pp, sky(pp));
  } else {
    float depth = (uH - p.y) / uH;
    float amp = 0.0015 + depth * 0.008;
    vec2 m = vec2(pp.x + sin(p.y * (700.0 - depth * 500.0) + uTime * 1.4) * amp + rip.x, 2.0 * uH - pp.y + sin(p.x * 60.0 + uTime) * amp * 0.4 + rip.y);
    m.y = max(m.y, uH + 0.001);
    vec3 refl = land(m, sky(m));
    vec3 water = mix(vec3(0.05, 0.10, 0.15), vec3(0.42, 0.40, 0.34), D);
    col = mix(refl, water, 0.32 + depth * 0.25);
    // Glitter path under the sun / moon.
    vec2 sp = bodyPos(uAng), mp = bodyPos(uAng + 3.14159265);
    float sv = smoothstep(uH - 0.04, uH + 0.06, sp.y), mv = smoothstep(uH - 0.04, uH + 0.06, mp.y);
    float streak = smoothstep(0.55, 0.9, noise(vec2(p.x * 90.0, p.y * 420.0 - uTime * 2.0)));
    col += vec3(1.0, 0.8, 0.5) * streak * exp(-abs(p.x - sp.x) * A * 9.0) * sv * 0.5;
    col += vec3(0.8, 0.86, 1.0) * streak * exp(-abs(p.x - mp.x) * A * 12.0) * mv * 0.4;
    col += mix(vec3(0.75, 0.82, 1.0), vec3(1.0, 0.93, 0.78), D) * glint * 0.3;
    // Ship reflection.
    if (p.y < uShipPos.y){
      float dy = uShipPos.y - p.y;
      vec2 rp = vec2(p.x + sin(p.y * 260.0 + uTime * 2.0) * 0.003 * (0.3 + dy * 8.0) + rip.x, uShipPos.y + dy * 1.05 + rip.y);
      vec4 rs = ship(rp);
      col = mix(col, rs.rgb * mix(vec3(0.35, 0.42, 0.55), vec3(0.62, 0.62, 0.6), D), rs.a * 0.42 * clamp(1.0 - dy * 5.0, 0.0, 1.0));
    }
  }
  // The ship.
  vec4 sh = ship(p);
  float cut = smoothstep(uShipPos.y - 0.004, uShipPos.y + 0.006, p.y + sin(p.x * 300.0 + uTime * 3.0) * 0.0015);
  col = mix(col, sh.rgb * mix(vec3(0.45, 0.52, 0.72), vec3(1.0), D), sh.a * cut);
  // Ink-wash dissolve into the paper, plus grain.
  float n = fbm(p * vec2(5.0, 3.5) + 3.1);
  float msk = smoothstep(uWash, uWash + 0.22, p.x + (n - 0.5) * 0.22);
  msk *= smoothstep(0.0, 0.11, p.y + (n - 0.5) * 0.08);
  msk *= 1.0 - smoothstep(0.88, 1.0, p.y + (n - 0.5) * 0.08);
  col = mix(uPaper, col, msk);
  col += (hash(floor(p * uRes) + floor(uTime * 12.0)) - 0.5) * 0.025;
  gl_FragColor = vec4(col, 1.0);
}
`;
