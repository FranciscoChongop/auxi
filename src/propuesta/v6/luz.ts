/**
 * Partículas del haz de luz en «Sobre mí» (boceto v6).
 *
 * - Motas: llenan el cono de luz que baja del tragaluz hacia Daniel; caen muy despacio, se mecen y titilan,
 *   como polvo iluminado.
 * - Lluvia: unas cuantas caen más rápido desde el haz, pasan junto a Daniel y llegan hasta el suelo.
 * Todo se calcula en coordenadas de la foto (0..1), así calza aunque la foto cambie de tamaño.
 * WebGL 1 sin librerías; bucle con tope de fps solo mientras se ve; quieto con «reducir movimiento».
 */
import { crearBucle } from "./bucle";

/** Forma del haz dentro de la foto (fracciones): arriba ancho (tragaluz), abajo angosto (hombros de Daniel). */
export type Haz = { arriba: number; abajo: number; ancho0: number; ancho1: number; centro: number; suelo: number };

const VERT = `
attribute vec4 aAzar;     // tipo (0 mota, 1 lluvia), x, y, azar
attribute float aTam;
uniform vec4 uFoto;       // x, y, w, h de la foto en el lienzo
uniform vec2 uRes;
uniform vec4 uHaz;        // arriba, abajo, ancho arriba, ancho abajo
uniform vec2 uHaz2;       // centro x, suelo
uniform float uT;
uniform float uLlegada;
uniform float uDpr;
varying vec3 vColor;
varying float vAlfa;
void main() {
  float r = aAzar.w;
  float tit = 0.5 + 0.5 * sin(uT * (0.9 + r * 2.0) + r * 50.0);
  vec2 uv;
  float alfa;
  if (aAzar.x < 0.5) {
    // Mota: baja despacio dentro del cono y vuelve a empezar arriba.
    float f = fract(aAzar.z + uT * 0.012 * (0.4 + r));
    float v = mix(uHaz.x, uHaz.y, f);
    float ancho = mix(uHaz.z, uHaz.w, f);
    float lado = (aAzar.y - 0.5);
    uv = vec2(uHaz2.x + lado * ancho + sin(uT * 0.5 + r * 20.0) * 0.006, v + cos(uT * 0.4 + r * 12.0) * 0.004);
    // Más brillo al centro del haz, nada en los bordes ni en los extremos.
    alfa = (1.0 - smoothstep(0.25, 0.5, abs(lado))) * smoothstep(0.0, 0.08, f) * smoothstep(1.0, 0.85, f);
    alfa *= 0.25 + 0.75 * tit;
    vColor = mix(vec3(0.62, 0.76, 1.0), vec3(1.0, 1.0, 1.0), aAzar.z);
  } else {
    // Lluvia: cae desde la parte baja del haz hasta el suelo, a los lados de Daniel.
    float f = fract(aAzar.z + uT * 0.11 * (0.6 + r * 0.8));
    float v = mix(uHaz.y - 0.12, uHaz2.y, f);
    // A los costados de Daniel (nunca encima de su silueta): un hueco al centro.
    float lado = aAzar.y - 0.5;
    uv = vec2(uHaz2.x + sign(lado) * (0.085 + abs(lado) * 0.34), v);
    alfa = smoothstep(0.0, 0.12, f) * smoothstep(1.0, 0.7, f) * (0.55 + 0.45 * tit);
    vColor = mix(vec3(0.7, 0.84, 1.0), vec3(1.0, 0.9, 0.7), step(0.85, r));
  }
  vec2 pos = uFoto.xy + uv * uFoto.zw;
  vec2 clip = pos / uRes * 2.0 - 1.0;
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
  gl_PointSize = aTam * uDpr;
  vAlfa = alfa * uLlegada;
}
`;

const FRAG = `
precision mediump float;
varying vec3 vColor;
varying float vAlfa;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.05, d) * vAlfa;
  gl_FragColor = vec4(vColor * a, a);
}
`;

export function crearLuz(canvas: HTMLCanvasElement, motas: number, lluvia: number, opciones: { dprMax: number; vivo: boolean; fps: number }) {
  const gl = canvas.getContext("webgl", { alpha: true, antialias: false, premultipliedAlpha: true, powerPreference: "low-power" });
  if (!gl) return null;
  const dpr = Math.min(window.devicePixelRatio || 1, opciones.dprMax);
  const total = motas + lluvia;
  let semilla = 23;
  const azar = () => ((semilla = (semilla * 16807) % 2147483647) - 1) / 2147483646;
  const a = new Float32Array(total * 4);
  const tam = new Float32Array(total);
  for (let i = 0; i < total; i++) {
    const esLluvia = i >= motas;
    a[i * 4] = esLluvia ? 1 : 0;
    // Motas más concentradas al centro (suma de dos azares = forma de campana).
    a[i * 4 + 1] = esLluvia ? azar() : (azar() + azar()) / 2;
    a[i * 4 + 2] = azar();
    a[i * 4 + 3] = azar();
    tam[i] = esLluvia ? 1.3 + azar() * 1.3 : 0.9 + Math.pow(azar(), 3) * 2.8;
  }
  const sh = (tipo: number, src: string) => {
    const s = gl.createShader(tipo)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? "shader");
    return s;
  };
  const prog = gl.createProgram()!;
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  gl.useProgram(prog);
  const buf = (nombre: string, arr: Float32Array, n: number) => {
    const b = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, b);
    gl.bufferData(gl.ARRAY_BUFFER, arr, gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, nombre);
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, n, gl.FLOAT, false, 0, 0);
    return b;
  };
  const buffers = [buf("aAzar", a, 4), buf("aTam", tam, 1)];
  const u = (x: string) => gl.getUniformLocation(prog, x);
  const U = { foto: u("uFoto"), res: u("uRes"), haz: u("uHaz"), haz2: u("uHaz2"), t: u("uT"), llegada: u("uLlegada"), dpr: u("uDpr") };
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE);
  gl.clearColor(0, 0, 0, 0);

  let ancho = 1;
  let alto = 1;
  let foto: [number, number, number, number] | null = null;
  let haz: Haz | null = null;
  let llegada = 0;
  let tiempo = 0;
  let cuadro = 0;
  const pintar = () => {
    cuadro = 0;
    if (!foto || !haz) return;
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform4f(U.foto, ...foto);
    gl.uniform2f(U.res, ancho, alto);
    gl.uniform4f(U.haz, haz.arriba, haz.abajo, haz.ancho0, haz.ancho1);
    gl.uniform2f(U.haz2, haz.centro, haz.suelo);
    gl.uniform1f(U.t, tiempo);
    gl.uniform1f(U.llegada, llegada);
    gl.uniform1f(U.dpr, dpr);
    gl.drawArrays(gl.POINTS, 0, total);
  };
  const t0 = performance.now() / 1000;
  const bucle = opciones.vivo
    ? crearBucle((t) => {
        tiempo = t - t0;
        pintar();
      }, opciones.fps)
    : null;
  // Sin movimiento: un instante fijo en el que el haz ya se ve lleno.
  if (!opciones.vivo) tiempo = 30;
  const pedir = () => {
    if (!cuadro && !bucle?.activo) cuadro = requestAnimationFrame(pintar);
  };
  return {
    bucle,
    medir(w: number, h: number, f: [number, number, number, number], hz: Haz) {
      ancho = w;
      alto = h;
      foto = f;
      haz = hz;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      pedir();
    },
    dibujar(l: number) {
      if (Math.abs(l - llegada) < 0.001) return;
      llegada = l;
      pedir();
    },
    destruir() {
      bucle?.apagar();
      cancelAnimationFrame(cuadro);
      buffers.forEach((b) => gl.deleteBuffer(b));
      gl.deleteProgram(prog);
    },
  };
}
