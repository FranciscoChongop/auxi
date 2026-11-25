/**
 * Partículas del héroe v6 (boceto en /propuesta).
 *
 * Un solo grupo de puntos: forma la mano digital y, al bajar, se suelta (primero las puntas de los dedos)
 * y viaja en corriente hasta las dos órbitas del ecosistema. Pensado para celulares modestos:
 * - WebGL 1 sin librerías (este archivo es todo el motor).
 * - Movimiento suave continuo (la mano respira, las órbitas giran, el polvo titila) SOLO mientras se ve,
 *   con tope de cuadros por segundo (30 en celular). Con «reducir movimiento» se dibuja solo al hacer scroll.
 * - Si no hay WebGL, dibuja los puntos una vez con Canvas 2D y se queda quieto.
 */
import { crearBucle } from "./bucle";

export type Anillo = { rx: number; ry: number; giro: number };
export type Geometria = {
  /** Caja donde se dibuja la mano digital (px CSS del escenario). */
  mano: { x: number; y: number; w: number; h: number };
  /** Centro y escala de las órbitas, al inicio (p = 0) y al final (p = 1). */
  centro0: [number, number];
  centro1: [number, number];
  escala0: number;
  escala1: number;
  anillos: [Anillo, Anillo];
};

export type Escena = {
  dibujar: (p: number) => void;
  medir: (w: number, h: number, g: Geometria) => void;
  destruir: () => void;
  webgl: boolean;
  bucle: ReturnType<typeof crearBucle> | null;
};

const suave = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** Centro y escala de las órbitas para un avance p (lo usan también las capas DOM, para que todo calce). */
export function orbitaEn(g: Geometria, p: number) {
  const e = suave(0.25, 0.95, p);
  return {
    cx: g.centro0[0] + (g.centro1[0] - g.centro0[0]) * e,
    cy: g.centro0[1] + (g.centro1[1] - g.centro0[1]) * e,
    s: g.escala0 + (g.escala1 - g.escala0) * e,
  };
}

/** Punto de un anillo (coordenadas locales, escala 1) para el ángulo θ. */
export function puntoAnillo(a: Anillo, theta: number): [number, number] {
  const x = a.rx * Math.cos(theta);
  const y = a.ry * Math.sin(theta);
  const c = Math.cos(a.giro);
  const s = Math.sin(a.giro);
  return [x * c - y * s, x * s + y * c];
}

/** Lee la plantilla (puntos claros sobre negro) y elige n puntos, más probables donde la imagen es más clara. */
export async function muestrearMano(url: string, n: number) {
  const img = new Image();
  img.decoding = "async";
  img.src = url;
  await img.decode();
  const c = document.createElement("canvas");
  c.width = img.naturalWidth;
  c.height = img.naturalHeight;
  const ctx = c.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0);
  const { data, width, height } = ctx.getImageData(0, 0, c.width, c.height);
  const pesos = new Float32Array(width * height);
  let total = 0;
  for (let i = 0; i < width * height; i++) {
    const v = data[i * 4] / 255;
    const w = v > 0.12 ? v * v : 0;
    total += w;
    pesos[i] = total;
  }
  // Semilla fija: la mano sale igual en cada visita.
  let semilla = 7;
  const azar = () => ((semilla = (semilla * 16807) % 2147483647) - 1) / 2147483646;
  const u = new Float32Array(n);
  const v = new Float32Array(n);
  const brillo = new Float32Array(n);
  for (let k = 0; k < n; k++) {
    const objetivo = azar() * total;
    let lo = 0;
    let hi = pesos.length - 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (pesos[mid] < objetivo) lo = mid + 1;
      else hi = mid;
    }
    const x = lo % width;
    const y = (lo / width) | 0;
    u[k] = (x + azar()) / width;
    v[k] = (y + azar()) / height;
    brillo[k] = data[lo * 4] / 255;
  }
  return { u, v, brillo, azar, aspecto: width / height };
}

const VERT = `
attribute vec2 aMano;     // u, v dentro de la caja de la mano (0..1); en el polvo: posición en pantalla (0..1)
attribute vec3 aAnillo;   // ángulo, anillo (0 / 1; 2 = polvo de fondo), desvío radial
attribute vec4 aAzar;     // retraso, tamaño, brillo, azar
uniform vec2 uRes;
uniform vec4 uCaja;       // x, y, w, h de la mano
uniform float uP;
uniform float uEntrada;
uniform float uT;         // segundos (movimiento suave continuo)
uniform vec2 uCentro;
uniform float uEscala;
uniform vec4 uA;          // rx, ry, cos, sin
uniform vec4 uB;
uniform float uDpr;
varying vec3 vColor;
varying float vAlfa;

vec2 enAnillo(vec4 r, float th, float d) {
  vec2 l = vec2(r.x * cos(th), r.y * sin(th)) * (1.0 + d);
  return uCentro + vec2(l.x * r.z - l.y * r.w, l.x * r.w + l.y * r.z) * uEscala;
}

void main() {
  float r = aAzar.w;
  // Titileo propio de cada punto.
  float tit = 0.5 + 0.5 * sin(uT * (0.7 + r * 1.6) + r * 40.0);

  if (aAnillo.y > 1.5) {
    // Polvo de estrellas de fondo: deriva lenta y, al bajar, sube con distinta profundidad (paralaje).
    vec2 base = aMano * uRes;
    vec2 deriva = vec2(sin(uT * 0.07 * (0.5 + r) + r * 6.28), cos(uT * 0.05 * (0.5 + r) + r * 12.0)) * 22.0;
    vec2 pos = base + deriva - vec2(0.0, uP * uRes.y * 0.25 * (0.3 + aAzar.y));
    pos = mod(pos + 40.0, uRes + 80.0) - 40.0;
    vec2 clip = pos / uRes * 2.0 - 1.0;
    gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
    gl_PointSize = (0.9 + aAzar.y * 1.6) * uDpr;
    vColor = mix(vec3(0.45, 0.6, 1.0), vec3(0.95, 0.97, 1.0), aAzar.z);
    vAlfa = (0.16 + 0.6 * tit * aAzar.z) * clamp(uEntrada * 2.0, 0.0, 1.0);
    return;
  }

  // La mano «respira»: cada punto se mece apenas (1–2 px).
  vec2 mano = uCaja.xy + aMano * uCaja.zw + vec2(sin(uT * 0.9 + r * 30.0), cos(uT * 0.8 + r * 20.0)) * 1.4;
  // Entrada: los puntos llegan desde una nube suelta y forman la mano.
  vec2 suelto = mano + (vec2(fract(r * 91.7), fract(r * 37.3)) - 0.5) * vec2(uRes.x * 0.5, uRes.y * 0.6);
  float ent = smoothstep(0.0, 1.0, clamp(uEntrada * 1.35 - aAzar.x * 0.35, 0.0, 1.0));
  vec2 inicio = mix(suelto, mano, ent);

  // Las órbitas giran despacio, cada una en un sentido.
  float giro = uT * (aAnillo.y < 0.5 ? 0.09 : -0.07) * (0.8 + r * 0.4);
  vec2 destino = aAnillo.y < 0.5 ? enAnillo(uA, aAnillo.x + giro, aAnillo.z) : enAnillo(uB, aAnillo.x + giro, aAnillo.z);
  // Primero se sueltan las puntas de los dedos (retraso bajo), al final la muñeca.
  float t = clamp(uP * 1.9 - aAzar.x * 0.9, 0.0, 1.0);
  float e = t * t * (3.0 - 2.0 * t);
  // Corriente: curva que baja y luego sube hacia la órbita.
  vec2 control = mix(inicio, destino, 0.5) + vec2((r - 0.5) * uRes.x * 0.18, uRes.y * 0.16);
  vec2 pos = (1.0 - e) * (1.0 - e) * inicio + 2.0 * (1.0 - e) * e * control + e * e * destino;

  vec2 clip = pos / uRes * 2.0 - 1.0;
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);

  float viaje = sin(e * 3.14159);
  float b = aAzar.z;
  gl_PointSize = (1.4 + aAzar.y * 1.8) * (0.7 + b * 0.55) * (1.0 + viaje * 0.5) * uDpr;
  vec3 cobalto = vec3(0.12, 0.24, 1.0);
  vec3 celeste = vec3(0.42, 0.64, 1.0);
  vec3 turquesa = vec3(0.37, 0.89, 0.86);
  vec3 cManos = mix(mix(cobalto, celeste, b), turquesa, smoothstep(0.82, 1.0, b) * 0.6);
  vec3 cOrbita = mix(turquesa, vec3(0.92, 0.96, 1.0), aAzar.y * 0.6);
  vColor = mix(cManos, cOrbita, e);
  vAlfa = (0.45 + b * 0.55) * mix(0.25, 1.0, ent) * mix(1.0, 0.8, e) * (0.72 + 0.28 * tit);
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

type Datos = Awaited<ReturnType<typeof muestrearMano>>;

/**
 * opciones.polvo: estrellas de fondo extra (no forman la mano).
 * opciones.vivo: movimiento suave continuo mientras se ve (bucle con tope de fps); si es false, solo se dibuja al hacer scroll.
 */
export function crearEscena(canvas: HTMLCanvasElement, datos: Datos, opciones: { entrada: boolean; dprMax: number; polvo: number; vivo: boolean; fps: number }): Escena {
  const n = datos.u.length;
  const total = n + opciones.polvo;
  const dpr = Math.min(window.devicePixelRatio || 1, opciones.dprMax);
  let ancho = 1;
  let alto = 1;
  let geo: Geometria | null = null;
  let p = 0;
  let entrada = opciones.entrada ? 0 : 1;
  let tiempo = 0;
  let cuadro = 0;

  // Datos por punto (iguales en WebGL y en el respaldo 2D; el 2D solo usa los n de la mano).
  const mano = new Float32Array(total * 2);
  const anillo = new Float32Array(total * 3);
  const azar = new Float32Array(total * 4);
  for (let i = 0; i < total; i++) {
    const esPolvo = i >= n;
    mano[i * 2] = esPolvo ? datos.azar() : datos.u[i];
    mano[i * 2 + 1] = esPolvo ? datos.azar() : datos.v[i];
    anillo[i * 3] = datos.azar() * Math.PI * 2;
    anillo[i * 3 + 1] = esPolvo ? 2 : datos.azar() < 0.58 ? 0 : 1;
    anillo[i * 3 + 2] = (datos.azar() - 0.5) * 0.07;
    // Retraso: 1 - u (la punta del índice está a la derecha de la plantilla).
    azar[i * 4] = esPolvo ? 0 : Math.min(1, Math.max(0, 1 - datos.u[i] + (datos.azar() - 0.5) * 0.15));
    azar[i * 4 + 1] = datos.azar();
    azar[i * 4 + 2] = esPolvo ? datos.azar() : datos.brillo[i];
    azar[i * 4 + 3] = datos.azar();
  }

  const gl = canvas.getContext("webgl", { alpha: true, antialias: false, premultipliedAlpha: true, powerPreference: "low-power" });

  if (!gl) {
    // Respaldo: Canvas 2D, un solo dibujo quieto de la mano (o de la órbita si p ≥ 0,5).
    const ctx = canvas.getContext("2d")!;
    const dibujar2d = (pp: number) => {
      if (!geo) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, ancho, alto);
      const o = orbitaEn(geo, pp);
      for (let i = 0; i < n; i++) {
        const b = azar[i * 4 + 2];
        let x: number;
        let y: number;
        if (pp < 0.5) {
          x = geo.mano.x + datos.u[i] * geo.mano.w;
          y = geo.mano.y + datos.v[i] * geo.mano.h;
          ctx.fillStyle = `rgba(${Math.round(36 + 60 * b)},${Math.round(84 + 143 * b)},${Math.round(255 - 35 * b)},${0.35 + b * 0.6})`;
        } else {
          const a = geo.anillos[anillo[i * 3 + 1] as 0 | 1];
          const [lx, ly] = puntoAnillo(a, anillo[i * 3]);
          x = o.cx + lx * o.s;
          y = o.cy + ly * o.s;
          ctx.fillStyle = "rgba(95,227,220,.8)";
        }
        ctx.fillRect(x - 0.8, y - 0.8, 1.6, 1.6);
      }
    };
    return {
      webgl: false,
      bucle: null,
      medir(w, h, g) {
        ancho = w;
        alto = h;
        geo = g;
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
        dibujar2d(p);
      },
      dibujar(pp) {
        if (pp < 0.5 !== p < 0.5) dibujar2d(pp);
        p = pp;
      },
      destruir() {},
    };
  }

  const shader = (tipo: number, src: string) => {
    const s = gl.createShader(tipo)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? "shader");
    return s;
  };
  const prog = gl.createProgram()!;
  gl.attachShader(prog, shader(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  gl.useProgram(prog);

  const atributo = (nombre: string, arr: Float32Array, tam: number) => {
    const b = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, b);
    gl.bufferData(gl.ARRAY_BUFFER, arr, gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, nombre);
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, tam, gl.FLOAT, false, 0, 0);
    return b;
  };
  const buffers = [atributo("aMano", mano, 2), atributo("aAnillo", anillo, 3), atributo("aAzar", azar, 4)];
  const u = (nombre: string) => gl.getUniformLocation(prog, nombre);
  const U = { res: u("uRes"), caja: u("uCaja"), p: u("uP"), entrada: u("uEntrada"), t: u("uT"), centro: u("uCentro"), escala: u("uEscala"), a: u("uA"), b: u("uB"), dpr: u("uDpr") };

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE); // suma de luz: los puntos que se cruzan brillan más
  gl.clearColor(0, 0, 0, 0);

  const pintar = () => {
    cuadro = 0;
    if (!geo) return;
    const o = orbitaEn(geo, p);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform2f(U.res, ancho, alto);
    gl.uniform4f(U.caja, geo.mano.x, geo.mano.y, geo.mano.w, geo.mano.h);
    gl.uniform1f(U.p, p);
    gl.uniform1f(U.entrada, entrada);
    gl.uniform1f(U.t, tiempo);
    gl.uniform2f(U.centro, o.cx, o.cy);
    gl.uniform1f(U.escala, o.s);
    const [A, B] = geo.anillos;
    gl.uniform4f(U.a, A.rx, A.ry, Math.cos(A.giro), Math.sin(A.giro));
    gl.uniform4f(U.b, B.rx, B.ry, Math.cos(B.giro), Math.sin(B.giro));
    gl.uniform1f(U.dpr, dpr);
    gl.drawArrays(gl.POINTS, 0, total);
  };

  // Movimiento continuo (solo si se permite): el reloj avanza y se pinta a fps limitados.
  const t0 = performance.now() / 1000;
  const bucle = opciones.vivo
    ? crearBucle((t) => {
        tiempo = t - t0;
        pintar();
      }, opciones.fps)
    : null;
  const pedir = () => {
    if (!cuadro && !bucle?.activo) cuadro = requestAnimationFrame(pintar);
  };

  // Entrada inicial: 1,4 s.
  let rafEntrada = 0;
  if (entrada < 1) {
    const inicio = performance.now();
    const paso = (t: number) => {
      entrada = Math.min(1, (t - inicio) / 1400);
      if (!bucle?.activo) pintar();
      if (entrada < 1) rafEntrada = requestAnimationFrame(paso);
    };
    rafEntrada = requestAnimationFrame(paso);
    // Si la pestaña estaba oculta (sin cuadros), igual termina de formar la mano.
    setTimeout(() => {
      if (entrada < 1) {
        cancelAnimationFrame(rafEntrada);
        entrada = 1;
        pintar();
      }
    }, 1700);
  }

  return {
    webgl: true,
    bucle,
    medir(w, h, g) {
      ancho = w;
      alto = h;
      geo = g;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      pedir();
    },
    dibujar(pp) {
      if (Math.abs(pp - p) < 0.0005) return;
      p = pp;
      pedir();
    },
    destruir() {
      bucle?.apagar();
      cancelAnimationFrame(cuadro);
      cancelAnimationFrame(rafEntrada);
      buffers.forEach((b) => gl.deleteBuffer(b));
      gl.deleteProgram(prog);
    },
  };
}
