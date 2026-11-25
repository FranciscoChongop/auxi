/**
 * Constelación 3D detrás del celular de cada app (boceto v6).
 *
 * Una nube de estrellas en 3D (más densa en su «cáscara») unidas con líneas finas a sus vecinas, que gira
 * despacio alrededor del celular y avanza un poco con el scroll. Las estrellas llegan bajando desde la sección
 * anterior y, cuando se acomodan, aparecen las líneas. Además, polvo de estrellas suelto en toda la sección.
 *
 * WebGL 1 sin librerías. Vecinas calculadas una sola vez al crear. Bucle con tope de fps solo mientras se ve;
 * con «reducir movimiento», se dibuja una vez y al hacer scroll.
 */
import { crearBucle } from "./bucle";

export type Colores = { a: [number, number, number]; b: [number, number, number] };
export type FormaNube = { inicio: [number, number]; centro: [number, number]; radio: [number, number] };

const VERT = `
attribute vec3 aPos;      // posición en la nube (unidad) o, en el polvo, x/y en la sección (0..1)
attribute vec4 aAzar;     // retraso, tamaño, tipo (0 nube, 1 polvo), azar
uniform vec2 uRes;
uniform vec2 uIni;
uniform vec2 uCentro;
uniform vec2 uRadio;
uniform float uLlegada;
uniform float uGiro;
uniform float uT;
uniform float uDpr;
uniform float uLinea;
uniform vec3 uColA;
uniform vec3 uColB;
varying vec3 vColor;
varying float vAlfa;
varying float vLinea;
void main() {
  float r = aAzar.w;
  vLinea = uLinea;
  float tit = 0.5 + 0.5 * sin(uT * (0.8 + r * 1.8) + r * 41.0);

  if (aAzar.z > 0.5) {
    vec2 base = aPos.xy * uRes;
    vec2 deriva = vec2(sin(uT * 0.08 * (0.5 + r) + r * 9.0), cos(uT * 0.06 * (0.5 + r) + r * 4.0)) * 26.0 - vec2(0.0, uGiro * 70.0 * (0.3 + aAzar.y));
    vec2 pos = mod(base + deriva + 40.0, uRes + 80.0) - 40.0;
    vec2 clip = pos / uRes * 2.0 - 1.0;
    gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
    gl_PointSize = (1.0 + aAzar.y * 1.8) * uDpr;
    vColor = mix(uColA, vec3(1.0), 0.45 + aAzar.y * 0.4);
    vAlfa = (0.18 + 0.62 * tit * aAzar.y) * smoothstep(0.0, 0.6, uLlegada);
    return;
  }

  // Giro 3D: alrededor del eje vertical (tiempo + scroll) con una leve inclinación fija.
  float a = uT * 0.14 + uGiro * 0.9;
  vec3 p = aPos;
  p = vec3(p.x * cos(a) + p.z * sin(a), p.y, -p.x * sin(a) + p.z * cos(a));
  float b = 0.32;
  p = vec3(p.x, p.y * cos(b) - p.z * sin(b), p.y * sin(b) + p.z * cos(b));
  float persp = 1.0 / (1.0 + p.z * 0.35);
  vec2 destino = uCentro + p.xy * uRadio * persp;

  vec2 ini = uIni + vec2((fract(r * 53.1) - 0.5) * min(uRes.x * 0.14, 60.0), -fract(r * 17.7) * 80.0);
  float t = clamp(uLlegada * 1.6 - aAzar.x * 0.6, 0.0, 1.0);
  float e = t * t * (3.0 - 2.0 * t);
  vec2 control = vec2(mix(ini.x, destino.x, 0.12), mix(ini.y, destino.y, 0.85)) + vec2((r - 0.5) * min(120.0, uRes.x * 0.1), 0.0);
  vec2 pos = (1.0 - e) * (1.0 - e) * ini + 2.0 * (1.0 - e) * e * control + e * e * destino;
  vec2 clip = pos / uRes * 2.0 - 1.0;
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);

  float profundidad = smoothstep(1.2, -1.0, p.z); // lo de adelante brilla más
  gl_PointSize = (1.3 + aAzar.y * 2.2) * persp * (1.0 + sin(e * 3.14159) * 0.4) * uDpr;
  vColor = mix(uColA, uColB, aAzar.y * 0.8 + profundidad * 0.2);
  float alfa = smoothstep(0.0, 0.15, t) * (0.35 + 0.65 * profundidad) * (0.6 + 0.4 * tit);
  // Las líneas aparecen cuando las estrellas ya llegaron.
  vAlfa = uLinea > 0.5 ? alfa * 0.22 * smoothstep(0.75, 1.0, uLlegada) : alfa;
}
`;

const FRAG = `
precision mediump float;
varying vec3 vColor;
varying float vAlfa;
varying float vLinea;
void main() {
  float a = vAlfa;
  if (vLinea < 0.5) a *= smoothstep(0.5, 0.05, length(gl_PointCoord - 0.5));
  gl_FragColor = vec4(vColor * a, a);
}
`;

export function crearConstelacion(canvas: HTMLCanvasElement, n: number, polvo: number, colores: Colores, opciones: { dprMax: number; vivo: boolean; fps: number; vecinas: number }) {
  const gl = canvas.getContext("webgl", { alpha: true, antialias: true, premultipliedAlpha: true, powerPreference: "low-power" });
  if (!gl) return null; // sin WebGL: la sección se ve igual, solo sin estrellas
  const dpr = Math.min(window.devicePixelRatio || 1, opciones.dprMax);
  const total = n + polvo;

  let semilla = 31;
  const azar = () => ((semilla = (semilla * 16807) % 2147483647) - 1) / 2147483646;
  const pos = new Float32Array(total * 3);
  const rnd = new Float32Array(total * 4);
  for (let i = 0; i < total; i++) {
    if (i < n) {
      // Dirección al azar en la esfera; 65 % en la cáscara, el resto dentro.
      const u = azar() * 2 - 1;
      const th = azar() * Math.PI * 2;
      const s = Math.sqrt(1 - u * u);
      const rr = azar() < 0.65 ? 0.82 + azar() * 0.18 : Math.cbrt(azar()) * 0.8;
      pos[i * 3] = s * Math.cos(th) * rr;
      pos[i * 3 + 1] = u * rr;
      pos[i * 3 + 2] = s * Math.sin(th) * rr;
    } else {
      pos[i * 3] = azar();
      pos[i * 3 + 1] = azar();
      pos[i * 3 + 2] = 0;
    }
    rnd[i * 4] = azar();
    rnd[i * 4 + 1] = azar();
    rnd[i * 4 + 2] = i < n ? 0 : 1;
    rnd[i * 4 + 3] = azar();
  }

  // Líneas: cada estrella se une a sus vecinas más cercanas (una sola vez, al crear).
  const pares: number[] = [];
  const limite = 0.24 * 0.24;
  for (let i = 0; i < n; i++) {
    const cerca: [number, number][] = [];
    for (let j = i + 1; j < n; j++) {
      const dx = pos[i * 3] - pos[j * 3];
      const dy = pos[i * 3 + 1] - pos[j * 3 + 1];
      const dz = pos[i * 3 + 2] - pos[j * 3 + 2];
      const d = dx * dx + dy * dy + dz * dz;
      if (d < limite) cerca.push([d, j]);
    }
    cerca.sort((x, y) => x[0] - y[0]);
    for (const [, j] of cerca.slice(0, opciones.vecinas)) pares.push(i, j);
  }
  const lPos = new Float32Array(pares.length * 3);
  const lRnd = new Float32Array(pares.length * 4);
  pares.forEach((k, m) => {
    lPos.set(pos.subarray(k * 3, k * 3 + 3), m * 3);
    lRnd.set(rnd.subarray(k * 4, k * 4 + 4), m * 4);
  });

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
  const crear = (arr: Float32Array) => {
    const b = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, b);
    gl.bufferData(gl.ARRAY_BUFFER, arr, gl.STATIC_DRAW);
    return b;
  };
  const bPos = crear(pos);
  const bRnd = crear(rnd);
  const bLPos = crear(lPos);
  const bLRnd = crear(lRnd);
  const locPos = gl.getAttribLocation(prog, "aPos");
  const locRnd = gl.getAttribLocation(prog, "aAzar");
  gl.enableVertexAttribArray(locPos);
  gl.enableVertexAttribArray(locRnd);
  const usar = (bp: WebGLBuffer, br: WebGLBuffer) => {
    gl.bindBuffer(gl.ARRAY_BUFFER, bp);
    gl.vertexAttribPointer(locPos, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, br);
    gl.vertexAttribPointer(locRnd, 4, gl.FLOAT, false, 0, 0);
  };
  const u = (x: string) => gl.getUniformLocation(prog, x);
  const U = { res: u("uRes"), ini: u("uIni"), centro: u("uCentro"), radio: u("uRadio"), llegada: u("uLlegada"), giro: u("uGiro"), t: u("uT"), dpr: u("uDpr"), linea: u("uLinea"), a: u("uColA"), b: u("uColB") };
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE);
  gl.clearColor(0, 0, 0, 0);

  let ancho = 1;
  let alto = 1;
  let forma: FormaNube | null = null;
  let llegada = -1;
  let giro = 0;
  let tiempo = 0;
  let cuadro = 0;
  const pintar = () => {
    cuadro = 0;
    if (!forma) return;
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform2f(U.res, ancho, alto);
    gl.uniform2f(U.ini, ...forma.inicio);
    gl.uniform2f(U.centro, ...forma.centro);
    gl.uniform2f(U.radio, ...forma.radio);
    gl.uniform1f(U.llegada, Math.max(0, llegada));
    gl.uniform1f(U.giro, giro);
    gl.uniform1f(U.t, tiempo);
    gl.uniform1f(U.dpr, dpr);
    gl.uniform3f(U.a, ...colores.a);
    gl.uniform3f(U.b, ...colores.b);
    if (llegada > 0.75 && pares.length) {
      gl.uniform1f(U.linea, 1);
      usar(bLPos, bLRnd);
      gl.drawArrays(gl.LINES, 0, pares.length);
    }
    gl.uniform1f(U.linea, 0);
    usar(bPos, bRnd);
    gl.drawArrays(gl.POINTS, 0, total);
  };
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
  return {
    bucle,
    medir(w: number, h: number, f: FormaNube) {
      ancho = w;
      alto = h;
      forma = f;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      pedir();
    },
    dibujar(l: number, g: number) {
      if (Math.abs(l - llegada) < 0.0005 && Math.abs(g - giro) < 0.0005) return;
      llegada = l;
      giro = g;
      pedir();
    },
    destruir() {
      bucle?.apagar();
      cancelAnimationFrame(cuadro);
      [bPos, bRnd, bLPos, bLRnd].forEach((b) => gl.deleteBuffer(b));
      gl.deleteProgram(prog);
    },
  };
}
