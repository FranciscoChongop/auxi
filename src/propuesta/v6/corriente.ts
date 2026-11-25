/**
 * Corriente de partículas por sección (boceto v6): los puntos entran por arriba, como si vinieran
 * de la sección anterior, y forman una órbita alrededor del celular de la app. Al seguir bajando,
 * la órbita gira un poco (ligada al scroll, no a un reloj).
 *
 * Igual que el héroe: WebGL 1 sin librerías y se dibuja SOLO cuando cambia el scroll.
 */

export type Colores = { a: [number, number, number]; b: [number, number, number] };
export type Forma = {
  inicio: [number, number]; // de dónde llega la corriente (borde superior)
  centro: [number, number]; // centro de la órbita (el celular)
  rx: number;
  ry: number;
  giro: number;
};

const VERT = `
attribute float aAng;
attribute vec4 aAzar;   // retraso, tamaño, desvío, azar
uniform vec2 uRes;
uniform vec2 uIni;
uniform vec2 uCentro;
uniform vec4 uOrb;      // rx, ry, cos, sin
uniform float uLlegada;
uniform float uGiro;
uniform float uDpr;
uniform vec3 uColA;
uniform vec3 uColB;
varying vec3 vColor;
varying float vAlfa;
void main() {
  float th = aAng + uGiro * (0.6 + aAzar.w * 0.8);
  vec2 l = vec2(uOrb.x * cos(th), uOrb.y * sin(th)) * (1.0 + aAzar.z);
  vec2 destino = uCentro + vec2(l.x * uOrb.z - l.y * uOrb.w, l.x * uOrb.w + l.y * uOrb.z);
  vec2 ini = uIni + vec2((fract(aAzar.w * 53.1) - 0.5) * min(uRes.x * 0.14, 60.0), -fract(aAzar.w * 17.7) * 80.0);
  float t = clamp(uLlegada * 1.6 - aAzar.x * 0.6, 0.0, 1.0);
  float e = t * t * (3.0 - 2.0 * t);
  vec2 control = vec2(mix(ini.x, destino.x, 0.12), mix(ini.y, destino.y, 0.85)) + vec2((aAzar.w - 0.5) * min(120.0, uRes.x * 0.1), 0.0);
  vec2 pos = (1.0 - e) * (1.0 - e) * ini + 2.0 * (1.0 - e) * e * control + e * e * destino;
  vec2 clip = pos / uRes * 2.0 - 1.0;
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
  gl_PointSize = (1.2 + aAzar.y * 1.8) * (1.0 + sin(e * 3.14159) * 0.4) * uDpr;
  vColor = mix(uColA, uColB, aAzar.y);
  // Llega desde la nada (sin «lluvia» visible en la parte de arriba antes de tiempo).
  vAlfa = smoothstep(0.0, 0.15, t) * (0.45 + aAzar.y * 0.55);
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

export function crearCorriente(canvas: HTMLCanvasElement, n: number, colores: Colores, dprMax: number) {
  const gl = canvas.getContext("webgl", { alpha: true, antialias: false, premultipliedAlpha: true, powerPreference: "low-power" });
  if (!gl) return null; // sin WebGL: la sección se ve igual, solo sin partículas
  const dpr = Math.min(window.devicePixelRatio || 1, dprMax);

  let semilla = 11;
  const azar = () => ((semilla = (semilla * 16807) % 2147483647) - 1) / 2147483646;
  const ang = new Float32Array(n);
  const rnd = new Float32Array(n * 4);
  for (let i = 0; i < n; i++) {
    ang[i] = azar() * Math.PI * 2;
    rnd[i * 4] = azar();
    rnd[i * 4 + 1] = azar();
    rnd[i * 4 + 2] = (azar() - 0.5) * 0.09;
    rnd[i * 4 + 3] = azar();
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
  const buf = (nombre: string, arr: Float32Array, tam: number) => {
    const b = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, b);
    gl.bufferData(gl.ARRAY_BUFFER, arr, gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, nombre);
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, tam, gl.FLOAT, false, 0, 0);
    return b;
  };
  const buffers = [buf("aAng", ang, 1), buf("aAzar", rnd, 4)];
  const u = (x: string) => gl.getUniformLocation(prog, x);
  const U = { res: u("uRes"), ini: u("uIni"), centro: u("uCentro"), orb: u("uOrb"), llegada: u("uLlegada"), giro: u("uGiro"), dpr: u("uDpr"), a: u("uColA"), b: u("uColB") };
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE);
  gl.clearColor(0, 0, 0, 0);

  let ancho = 1;
  let alto = 1;
  let forma: Forma | null = null;
  let llegada = -1;
  let giro = 0;
  let cuadro = 0;

  const pintar = () => {
    cuadro = 0;
    if (!forma) return;
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform2f(U.res, ancho, alto);
    gl.uniform2f(U.ini, forma.inicio[0], forma.inicio[1]);
    gl.uniform2f(U.centro, forma.centro[0], forma.centro[1]);
    gl.uniform4f(U.orb, forma.rx, forma.ry, Math.cos(forma.giro), Math.sin(forma.giro));
    gl.uniform1f(U.llegada, Math.max(0, llegada));
    gl.uniform1f(U.giro, giro);
    gl.uniform1f(U.dpr, dpr);
    gl.uniform3f(U.a, ...colores.a);
    gl.uniform3f(U.b, ...colores.b);
    gl.drawArrays(gl.POINTS, 0, n);
  };
  const pedir = () => {
    if (!cuadro) cuadro = requestAnimationFrame(pintar);
  };

  return {
    medir(w: number, h: number, f: Forma) {
      ancho = w;
      alto = h;
      forma = f;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      pedir();
    },
    /** llegada: 0 → 1 mientras la sección entra; giro: avance mientras la sección pasa. */
    dibujar(l: number, g: number) {
      if (Math.abs(l - llegada) < 0.0005 && Math.abs(g - giro) < 0.0005) return;
      llegada = l;
      giro = g;
      pedir();
    },
    destruir() {
      cancelAnimationFrame(cuadro);
      buffers.forEach((b) => gl.deleteBuffer(b));
      gl.deleteProgram(prog);
    },
  };
}
