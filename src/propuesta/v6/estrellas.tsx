/**
 * Capa de puntos de luz que caen sin parar en toda la landing v6 (detrás del contenido).
 *
 * Es un lienzo «pegado» a la pantalla (sticky) que no ocupa espacio: así acompaña todo el recorrido con un
 * solo dibujo. Caen despacio, se mecen y titilan; al hacer scroll se desplazan un poco según su profundidad.
 * WebGL 1 sin librerías, pocos puntos, 30 fps en celular y pausa si la pestaña se oculta.
 * Con «reducir movimiento» se dibujan una vez, quietos.
 */
import { useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";
import { crearBucle } from "./bucle";

const VERT = `
attribute vec4 aAzar;   // x, y inicial, velocidad, azar
uniform vec2 uRes;
uniform float uT;
uniform float uScroll;
uniform float uDpr;
varying float vAlfa;
varying vec3 vColor;
void main() {
  float r = aAzar.w;
  float prof = 0.3 + r * 0.7;                       // profundidad: los cercanos caen más rápido y son más grandes
  float y = fract(aAzar.y + uT * aAzar.z * prof + uScroll * 0.00012 * prof);
  float x = aAzar.x + sin(uT * 0.35 + r * 12.0) * 0.008;
  vec2 pos = vec2(x * uRes.x, y * (uRes.y + 40.0) - 20.0);
  vec2 clip = pos / uRes * 2.0 - 1.0;
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
  gl_PointSize = (0.8 + prof * 2.2) * uDpr;
  float tit = 0.55 + 0.45 * sin(uT * (0.8 + r * 1.8) + r * 40.0);
  // Aparecen arriba y se apagan abajo, sin cortes.
  vAlfa = tit * (0.18 + prof * 0.5) * smoothstep(0.0, 0.08, y) * smoothstep(1.0, 0.85, y);
  vColor = mix(vec3(0.55, 0.68, 1.0), vec3(1.0, 0.96, 0.88), step(0.86, r));
}
`;

const FRAG = `
precision mediump float;
varying float vAlfa;
varying vec3 vColor;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.05, d) * vAlfa;
  gl_FragColor = vec4(vColor * a, a);
}
`;

function crearEstrellas(canvas: HTMLCanvasElement, n: number, opciones: { dprMax: number; vivo: boolean; fps: number }) {
  const gl = canvas.getContext("webgl", { alpha: true, antialias: false, premultipliedAlpha: true, powerPreference: "low-power" });
  if (!gl) return null;
  const dpr = Math.min(window.devicePixelRatio || 1, opciones.dprMax);
  let semilla = 41;
  const azar = () => ((semilla = (semilla * 16807) % 2147483647) - 1) / 2147483646;
  const datos = new Float32Array(n * 4);
  for (let i = 0; i < n; i++) {
    datos[i * 4] = azar();
    datos[i * 4 + 1] = azar();
    datos[i * 4 + 2] = 0.012 + azar() * 0.03; // fracción de la pantalla por segundo
    datos[i * 4 + 3] = azar();
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
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog) ?? "programa");
  gl.useProgram(prog);
  const b = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, b);
  gl.bufferData(gl.ARRAY_BUFFER, datos, gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, "aAzar");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 4, gl.FLOAT, false, 0, 0);
  const U = { res: gl.getUniformLocation(prog, "uRes"), t: gl.getUniformLocation(prog, "uT"), scroll: gl.getUniformLocation(prog, "uScroll"), dpr: gl.getUniformLocation(prog, "uDpr") };
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE);
  gl.clearColor(0, 0, 0, 0);

  let ancho = 1;
  let alto = 1;
  let tiempo = opciones.vivo ? 0 : 12;
  const pintar = () => {
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform2f(U.res, ancho, alto);
    gl.uniform1f(U.t, tiempo);
    gl.uniform1f(U.scroll, window.scrollY);
    gl.uniform1f(U.dpr, dpr);
    gl.drawArrays(gl.POINTS, 0, n);
  };
  const t0 = performance.now() / 1000;
  const bucle = opciones.vivo
    ? crearBucle((t) => {
        tiempo = t - t0;
        pintar();
      }, opciones.fps)
    : null;
  return {
    bucle,
    medir(w: number, h: number) {
      ancho = w;
      alto = h;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      pintar();
    },
    destruir() {
      bucle?.apagar();
      gl.deleteBuffer(b);
      gl.deleteProgram(prog);
    },
  };
}

export function CapaEstrellas({ celular }: { celular: boolean }) {
  const lienzo = useRef<HTMLCanvasElement>(null);
  const quieto = !!useReducedMotion();
  useEffect(() => {
    const canvas = lienzo.current;
    if (!canvas) return;
    let capa: ReturnType<typeof crearEstrellas> = null;
    try {
      capa = crearEstrellas(canvas, celular ? 150 : 320, { dprMax: celular ? 1.5 : 2, vivo: !quieto, fps: celular ? 30 : 45 });
    } catch {
      capa = null;
    }
    if (!capa) return;
    const medir = () => capa?.medir(canvas.offsetWidth, canvas.offsetHeight);
    const ro = new ResizeObserver(medir);
    ro.observe(canvas);
    medir();
    capa.bucle?.encender();
    return () => {
      ro.disconnect();
      capa?.destruir();
    };
  }, [celular, quieto]);

  // Pegada a la pantalla y sin ocupar espacio (margen negativo del mismo alto); queda detrás de todo.
  return (
    <div
      aria-hidden
      className="pointer-events-none"
      style={{ position: "sticky", top: "var(--tope)", height: "calc(100dvh - var(--tope))", marginBottom: "calc(-1 * (100dvh - var(--tope)))", zIndex: -1 }}
    >
      <canvas ref={lienzo} className="block h-full w-full" />
    </div>
  );
}
