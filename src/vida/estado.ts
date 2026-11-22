import { useSyncExternalStore } from "react";
import { diasEntre, hoy, sumarDias } from "../lib/fechas";

/** Nombre provisional de la mini app: cámbialo solo aquí. */
export const NOMBRE_VIDA = "Auxi Vida";

/** Cómo le llega la plata. "variable" y "ninguno" usan un monto mensual aproximado. */
export type Periodo = "dia" | "semana" | "quincena" | "mes" | "variable" | "ninguno";

/** Respuestas de las preguntas del presupuesto. Todo en soles. */
export type Plan = {
  ingreso: number;
  periodo: Periodo;
  /** Días que trabaja a la semana (solo si cobra por día). */
  diasSemana: number;
  fijos: number;
  fijosEn: string[];
  /** Lo que quiere guardar al mes. */
  ahorro: number;
  /** Desde qué día rige el plan. */
  desde: string;
};

export type Movimiento = {
  id: string;
  tipo: "gasto" | "ingreso";
  monto: number;
  categoria: string;
  nota: string;
  fecha: string;
  /** Ingreso que no estaba en el plan: suma a hoy. */
  extra?: boolean;
  /** Pago fijo (alquiler, luz…): ya está descontado en el plan, no resta del día. */
  fijo?: boolean;
  origen: "chat" | "manual" | "captura" | "pago";
};

export type Aporte = { id: string; fecha: string; monto: number; motivo: "antojo" | "sobrante" | "manual"; nota: string };

/** Un frasco de ahorro. No mueve plata: solo lleva la cuenta de lo que la persona separa. */
export type Frasco = { id: string; nombre: string; meta: number; fecha?: string; aportes: Aporte[]; celebrada: boolean };

/** Pago que se repite cada mes (alquiler, luz, internet, suscripciones). */
export type Pago = { id: string; nombre: string; monto: number; dia: number; avisarDias: number; pagados: string[] };

/** Fecha suelta: DNI, SOAT, brevete, cumpleaños. */
export type Pendiente = { id: string; titulo: string; fecha: string; tipo: string; hecho: boolean };

/** Cómo terminó un día ya pasado: lo que sobró (o faltó) y a dónde fue. */
export type Cierre = { sobra: number; destino: "manana" | "colchon" };

export type Objetivo = "gastar" | "ahorrar" | "pagos" | "estafa";

/** Un caso de Protégete: lo que contó la persona (sin datos sensibles), sus respuestas y el resultado. Solo en este celular. */
export type Caso = {
  id: string;
  tipo: string;
  fecha: string;
  evidencias: { texto: string; enlace?: string; fecha: string; conImagen?: boolean }[];
  respuestas: Record<string, string | string[]>;
  nivel?: "alto" | "medio" | "bajo";
};

export type EstadoVida = {
  iniciado: boolean;
  objetivo: Objetivo | null;
  plan: Plan | null;
  borrador: Partial<Plan> & { paso?: number };
  movimientos: Movimiento[];
  frascos: Frasco[];
  frascoActivo: string;
  sobrante: "manana" | "colchon";
  cierres: Record<string, Cierre>;
  pagos: Pago[];
  pendientes: Pendiente[];
  racha: { dias: number; ultimoDia: string; protectores: number };
  monedas: number;
  cofreDia: string;
  lecciones: Record<string, 1 | 2 | 3>;
  revisiones: number;
  primerAnotado: boolean;
  cuentaOfrecida: boolean;
  misiones: Record<string, boolean>;
  /** Avisos y tarjetas ya cerrados: no vuelven a salir. */
  avisos: Record<string, string>;
  saludoVisto: boolean;
  menosMovimiento: boolean;
  casos: Caso[];
};

const CLAVE = "auxi.vida.v1";
export const ID_COLCHON = "colchon";

function inicial(): EstadoVida {
  return {
    iniciado: false,
    objetivo: null,
    plan: null,
    borrador: {},
    movimientos: [],
    frascos: [{ id: ID_COLCHON, nombre: "Colchón", meta: 0, aportes: [], celebrada: false }],
    frascoActivo: ID_COLCHON,
    sobrante: "manana",
    cierres: {},
    pagos: [],
    pendientes: [],
    racha: { dias: 0, ultimoDia: "", protectores: 1 },
    monedas: 0,
    cofreDia: "",
    lecciones: {},
    revisiones: 0,
    primerAnotado: false,
    cuentaOfrecida: false,
    misiones: {},
    avisos: {},
    saludoVisto: false,
    menosMovimiento: false,
    casos: [],
  };
}

/** Pasa los datos de la versión anterior (un solo colchón) a frascos. */
function migrar(crudo: Record<string, unknown>): EstadoVida {
  const e = { ...inicial(), ...crudo } as EstadoVida & { colchon?: { meta: number; aportes: Aporte[]; metaCelebrada: number } };
  if (e.colchon && !(crudo.frascos as unknown[] | undefined)?.length) {
    e.frascos = [{ id: ID_COLCHON, nombre: "Colchón", meta: e.colchon.meta, aportes: e.colchon.aportes, celebrada: e.colchon.metaCelebrada > 0 }];
  }
  delete e.colchon;
  if (e.plan) e.iniciado = true;
  return e;
}

function cargar(): EstadoVida {
  try {
    const crudo = localStorage.getItem(CLAVE);
    if (crudo) return migrar(JSON.parse(crudo));
  } catch {
    // Sin almacenamiento: empezamos de cero.
  }
  return inicial();
}

let real = cargar();
/** Modo ejemplo: datos inventados que viven solo en memoria y nunca tocan los de la persona. */
let ejemplo: EstadoVida | null = null;
const oyentes = new Set<() => void>();
const avisar = () => oyentes.forEach((o) => o());

export function obtenerVida() {
  return ejemplo ?? real;
}

export const enEjemplo = () => ejemplo !== null;

export function actualizarVida(cambio: (e: EstadoVida) => Partial<EstadoVida>) {
  if (ejemplo) {
    ejemplo = { ...ejemplo, ...cambio(ejemplo) };
    avisar();
    return;
  }
  real = { ...real, ...cambio(real) };
  try {
    localStorage.setItem(CLAVE, JSON.stringify(real));
  } catch {
    // Si no se puede guardar, dura mientras la app esté abierta.
  }
  avisar();
}

export function borrarVida() {
  real = inicial();
  ejemplo = null;
  try {
    localStorage.removeItem(CLAVE);
  } catch {
    // nada
  }
  avisar();
}

export function useVida() {
  return useSyncExternalStore(
    (o) => {
      oyentes.add(o);
      return () => oyentes.delete(o);
    },
    obtenerVida,
    obtenerVida,
  );
}

export function nuevoId(p: string) {
  return `${p}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

/* ---------- Modo ejemplo ---------- */

export function entrarAlEjemplo() {
  const h = hoy();
  const m = (dias: number, tipo: Movimiento["tipo"], monto: number, categoria: string, nota: string): Movimiento => ({
    id: nuevoId("x"),
    tipo,
    monto,
    categoria,
    nota,
    fecha: sumarDias(h, -dias),
    origen: "manual",
  });
  const mes = h.slice(0, 7);
  ejemplo = {
    ...inicial(),
    iniciado: true,
    plan: { ingreso: 70, periodo: "dia", diasSemana: 6, fijos: 650, fijosEn: ["Alquiler", "Luz y agua", "Internet o celular"], ahorro: 120, desde: sumarDias(h, -10) },
    movimientos: [
      m(0, "gasto", 12, "Comida", "Menú"),
      m(0, "gasto", 3, "Transporte", "Pasaje"),
      m(1, "ingreso", 75, "Trabajo", "Turno"),
      m(1, "gasto", 18, "Casa y mercado", "Mercado"),
      m(1, "gasto", 6, "Transporte", "Combi"),
      m(2, "gasto", 25, "Gustos", "Salida"),
      m(3, "gasto", 11, "Comida", "Menú"),
      m(4, "gasto", 9, "Comida", "Desayuno"),
      m(8, "gasto", 30, "Salud", "Farmacia"),
    ],
    frascos: [
      { id: ID_COLCHON, nombre: "Colchón", meta: 300, celebrada: false, aportes: [{ id: "a1", fecha: sumarDias(h, -6), monto: 40, motivo: "manual", nota: "Guardé plata" }, { id: "a2", fecha: sumarDias(h, -2), monto: 20, motivo: "antojo", nota: "Antojo ahorrado: delivery" }] },
      { id: "fx", nombre: "Zapatillas", meta: 180, fecha: sumarDias(h, 60), celebrada: false, aportes: [{ id: "a3", fecha: sumarDias(h, -4), monto: 35, motivo: "manual", nota: "Guardé plata" }] },
    ],
    pagos: [
      { id: "p1", nombre: "Alquiler", monto: 450, dia: 1, avisarDias: 3, pagados: [mes] },
      { id: "p2", nombre: "Internet", monto: 60, dia: Number(sumarDias(h, 1).slice(8)), avisarDias: 3, pagados: [] },
    ],
    racha: { dias: 4, ultimoDia: h, protectores: 1 },
    monedas: 35,
    cofreDia: h,
    primerAnotado: true,
    cuentaOfrecida: true,
    saludoVisto: true,
    avisos: { bienvenida: "x" },
  };
  avisar();
}

export function salirDelEjemplo() {
  ejemplo = null;
  avisar();
}

/* ---------- Plata ---------- */

/** "S/ 35" o "S/ 12.50": dos decimales solo si hacen falta. */
export function soles(n: number) {
  const r = Math.round(n * 100) / 100;
  const entero = Number.isInteger(r);
  return `S/ ${Math.abs(r).toLocaleString("es-PE", { minimumFractionDigits: entero ? 0 : 2, maximumFractionDigits: 2 })}`;
}

const redondear = (n: number) => Math.round(n * 100) / 100;

function diasDelMes(fecha: string) {
  const [a, m] = fecha.split("-").map(Number);
  return new Date(a, m, 0).getDate();
}

export function ingresoMensual(p: Pick<Plan, "ingreso" | "periodo" | "diasSemana">) {
  switch (p.periodo) {
    case "dia":
      return (p.ingreso * p.diasSemana * 52) / 12;
    case "semana":
      return (p.ingreso * 52) / 12;
    case "quincena":
      return p.ingreso * 2;
    default:
      return p.ingreso;
  }
}

export function ingresoPorDia(p: Plan, fecha = hoy()) {
  return ingresoMensual(p) / diasDelMes(fecha);
}

type DatosBase = Pick<Plan, "ingreso" | "periodo" | "diasSemana" | "fijos" | "ahorro">;

/** Lo que se puede gastar en un día sin novedades: (ingreso − fijos − ahorro) ÷ días del mes. */
export function baseDiaria(p: DatosBase, fecha = hoy()) {
  const libre = ingresoMensual(p) - p.fijos - p.ahorro;
  return redondear(Math.max(0, libre) / diasDelMes(fecha));
}

function partePropia(p: Plan) {
  const m = ingresoMensual(p);
  return m > 0 ? Math.max(0, Math.min(1, 1 - p.ahorro / m)) : 1;
}

export type DesgloseDia = {
  base: number;
  arrastre: number;
  ajusteIngresos: number;
  gastado: number;
  ingresado: number;
  disponible: number;
  quedan: number;
};

/** Cuenta de un día: base + lo que pasó de ayer + ajuste por ingresos − gastos (sin contar los pagos fijos). */
export function desglose(e: EstadoVida, fecha = hoy()): DesgloseDia {
  const p = e.plan;
  const delDia = e.movimientos.filter((m) => m.fecha === fecha && !m.fijo);
  const gastado = redondear(delDia.filter((m) => m.tipo === "gasto").reduce((s, m) => s + m.monto, 0));
  const ingresos = delDia.filter((m) => m.tipo === "ingreso");
  const ingresado = redondear(ingresos.reduce((s, m) => s + m.monto, 0));
  if (!p) return { base: 0, arrastre: 0, ajusteIngresos: 0, gastado, ingresado, disponible: 0, quedan: -gastado };
  const base = baseDiaria(p, fecha);
  const ayer = e.cierres[sumarDias(fecha, -1)];
  const arrastre = ayer && ayer.destino === "manana" ? ayer.sobra : 0;
  let ajusteIngresos = 0;
  if (p.periodo === "dia") {
    if (ingresado > 0) ajusteIngresos = (ingresado - ingresoPorDia(p, fecha)) * partePropia(p);
  } else {
    ajusteIngresos = ingresos.filter((m) => m.extra).reduce((s, m) => s + m.monto, 0) * partePropia(p);
  }
  ajusteIngresos = redondear(ajusteIngresos);
  const disponible = redondear(base + arrastre + ajusteIngresos);
  return { base, arrastre, ajusteIngresos, gastado, ingresado, disponible, quedan: redondear(disponible - gastado) };
}

/** Lo del mes que ya está separado: pagos fijos (pagados y por pagar) y ahorro. */
export function separadoDelMes(e: EstadoVida, fecha = hoy()) {
  const mes = fecha.slice(0, 7);
  const pendientes = redondear(e.pagos.filter((p) => !p.pagados.includes(mes)).reduce((s, p) => s + p.monto, 0));
  return { fijos: e.plan?.fijos ?? 0, pagosPendientes: pendientes, ahorro: e.plan?.ahorro ?? 0 };
}

/**
 * Cierra los días pasados en los que se anotó algo: lo que sobró pasa al día siguiente
 * o al colchón (según lo elegido). Si faltó, se descuenta al día siguiente, sin dramas.
 */
export function cerrarDiasPasados() {
  if (enEjemplo()) return;
  const e = obtenerVida();
  if (!e.plan) return;
  const h = hoy();
  const conMovimientos = [...new Set(e.movimientos.filter((m) => !m.fijo).map((m) => m.fecha))].filter((f) => f < h && f >= e.plan!.desde).sort();
  const pendientes = conMovimientos.filter((f) => !e.cierres[f]);
  if (!pendientes.length) return;
  let cierres = { ...e.cierres };
  const nuevos: Aporte[] = [];
  for (const f of pendientes) {
    const d = desglose({ ...e, cierres }, f);
    const sobra = d.quedan;
    const destino = sobra > 0 && e.sobrante === "colchon" ? "colchon" : "manana";
    const tope = d.base * 7;
    cierres = { ...cierres, [f]: { sobra: destino === "manana" ? Math.max(-tope, Math.min(tope, sobra)) : sobra, destino } };
    if (destino === "colchon") nuevos.push({ id: nuevoId("a"), fecha: f, monto: sobra, motivo: "sobrante", nota: "Lo que te sobró" });
  }
  actualizarVida((s) => ({
    cierres,
    frascos: s.frascos.map((x) => (x.id === ID_COLCHON ? { ...x, aportes: [...x.aportes, ...nuevos] } : x)),
  }));
}

export const totalFrasco = (f: Frasco) => redondear(f.aportes.reduce((s, a) => s + a.monto, 0));

export function frascoActivo(e: EstadoVida) {
  return e.frascos.find((f) => f.id === e.frascoActivo) ?? e.frascos[0];
}

/** Suma un aporte a un frasco y dice si con eso llegó a la meta. */
export function aportar(frascoId: string, monto: number, motivo: Aporte["motivo"], nota: string) {
  const f = obtenerVida().frascos.find((x) => x.id === frascoId);
  if (!f) return false;
  const antes = totalFrasco(f);
  const llega = monto > 0 && f.meta > 0 && antes < f.meta && antes + monto >= f.meta && !f.celebrada;
  actualizarVida((s) => ({
    frascos: s.frascos.map((x) => (x.id === frascoId ? { ...x, celebrada: x.celebrada || llega, aportes: [...x.aportes, { id: nuevoId("a"), fecha: hoy(), monto, motivo, nota }] } : x)),
    monedas: s.monedas + (llega ? 20 : 0),
  }));
  return llega;
}

/* ---------- Pagos ---------- */

/** Próxima fecha de un pago mensual (si el mes no tiene ese día, el último día del mes). */
export function proximaFecha(p: Pago, desde = hoy()) {
  const [a, m] = desde.split("-").map(Number);
  for (let i = 0; i < 2; i++) {
    const fecha = new Date(a, m - 1 + i, 1);
    const dia = Math.min(p.dia, new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0).getDate());
    const f = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
    if (!p.pagados.includes(f.slice(0, 7))) return f;
  }
  return desde;
}

export type Compromiso = { id: string; titulo: string; fecha: string; dias: number; monto?: number; tipo: "pago" | "fecha" };

/** Pagos y fechas que vienen, ordenados (los vencidos primero). */
export function compromisos(e: EstadoVida, h = hoy()): Compromiso[] {
  const pagos = e.pagos.map((p) => {
    const fecha = proximaFecha(p, h);
    return { id: p.id, titulo: p.nombre, fecha, dias: diasEntre(h, fecha), monto: p.monto, tipo: "pago" as const };
  });
  const fechas = e.pendientes.filter((p) => !p.hecho).map((p) => ({ id: p.id, titulo: p.titulo, fecha: p.fecha, dias: diasEntre(h, p.fecha), tipo: "fecha" as const }));
  return [...pagos, ...fechas].sort((a, b) => a.fecha.localeCompare(b.fecha));
}

/** Marca el pago del mes como hecho y lo anota (sin restar del día: ya estaba en tus fijos). */
export function marcarPagado(id: string) {
  const e = obtenerVida();
  const p = e.pagos.find((x) => x.id === id);
  if (!p) return;
  const fecha = proximaFecha(p);
  const mes = fecha.slice(0, 7);
  actualizarVida((s) => ({
    pagos: s.pagos.map((x) => (x.id === id ? { ...x, pagados: [...x.pagados, mes] } : x)),
    movimientos: [...s.movimientos, { id: nuevoId("m"), tipo: "gasto", monto: p.monto, categoria: "Servicios", nota: p.nombre, fecha: hoy(), fijo: true, origen: "pago" }],
  }));
}

/* ---------- Racha, monedas y cofre ---------- */

export function rachaVigente(e: EstadoVida) {
  if (!e.racha.ultimoDia) return 0;
  return diasEntre(e.racha.ultimoDia, hoy()) <= 1 ? e.racha.dias : 0;
}

export type Logro = { id: string; rachaSube: boolean; rachaDias: number; usoProtector: boolean; monedas: number; cofre: boolean; primero: boolean };

/** Anota un movimiento y devuelve lo que se celebra (racha de días anotando). */
export function anotar(m: Omit<Movimiento, "id">): Logro {
  const e = obtenerVida();
  const h = hoy();
  let { dias, protectores } = e.racha;
  let rachaSube = false;
  let usoProtector = false;
  if (e.racha.ultimoDia !== h) {
    const pasados = e.racha.ultimoDia ? diasEntre(e.racha.ultimoDia, h) : 99;
    if (pasados === 1) dias += 1;
    else if (pasados === 2 && protectores > 0) {
      protectores -= 1;
      usoProtector = true;
      dias += 1;
    } else dias = 1;
    rachaSube = true;
  }
  const monedas = rachaSube ? 5 : 0;
  const primero = !e.primerAnotado;
  const cofre = e.cofreDia !== h;
  const id = nuevoId("m");
  actualizarVida((s) => ({
    movimientos: [...s.movimientos, { ...m, id }],
    racha: { dias, ultimoDia: h, protectores },
    monedas: s.monedas + monedas,
    primerAnotado: true,
  }));
  return { id, rachaSube, rachaDias: dias, usoProtector, monedas, cofre, primero };
}

/** Quita un movimiento y devuelve una función para recuperarlo. */
export function quitarMovimiento(id: string) {
  const m = obtenerVida().movimientos.find((x) => x.id === id);
  actualizarVida((s) => ({ movimientos: s.movimientos.filter((x) => x.id !== id) }));
  return () => {
    if (m) actualizarVida((s) => ({ movimientos: [...s.movimientos, m] }));
  };
}

export const PREMIOS_COFRE = [
  { monedas: 5, probabilidad: 50 },
  { monedas: 10, probabilidad: 30 },
  { monedas: 20, probabilidad: 15 },
  { monedas: 50, probabilidad: 5 },
];

export function abrirCofre() {
  let r = Math.random() * 100;
  let premio = PREMIOS_COFRE[0];
  for (const p of PREMIOS_COFRE) {
    if (r < p.probabilidad) {
      premio = p;
      break;
    }
    r -= p.probabilidad;
  }
  actualizarVida((s) => ({ cofreDia: hoy(), monedas: s.monedas + premio.monedas }));
  return premio.monedas;
}

export const PRECIO_PROTECTOR = 50;

export function cerrarAviso(id: string) {
  actualizarVida((s) => ({ avisos: { ...s.avisos, [id]: hoy() } }));
}

/* ---------- Resumen y consejo ---------- */

/** Lunes de la semana de una fecha. */
export function lunes(fecha = hoy()) {
  const [a, m, d] = fecha.split("-").map(Number);
  const dia = (new Date(a, m - 1, d).getDay() + 6) % 7;
  return sumarDias(fecha, -dia);
}

export function resumenSemana(e: EstadoVida, desde: string) {
  const hasta = sumarDias(desde, 6);
  const ms = e.movimientos.filter((m) => m.fecha >= desde && m.fecha <= hasta && !m.fijo);
  const entro = redondear(ms.filter((m) => m.tipo === "ingreso").reduce((s, m) => s + m.monto, 0));
  const salio = redondear(ms.filter((m) => m.tipo === "gasto").reduce((s, m) => s + m.monto, 0));
  const porCategoria: Record<string, number> = {};
  for (const m of ms) if (m.tipo === "gasto") porCategoria[m.categoria] = (porCategoria[m.categoria] ?? 0) + m.monto;
  const top = Object.entries(porCategoria).sort((a, b) => b[1] - a[1])[0];
  return { entro, salio, top: top ? { categoria: top[0], monto: redondear(top[1]), parte: salio ? top[1] / salio : 0 } : null, cantidad: ms.length };
}

export type Consejo = { texto: string; accion?: { texto: string; ruta: string } };

/** Una sola sugerencia basada en lo anotado. */
export function consejoDelDia(e: EstadoVida): Consejo {
  const h = hoy();
  if (!e.plan) return { texto: "Responde 3 preguntas y León te dice cuánto puedes gastar cada día.", accion: { texto: "Armar mi número", ruta: "/vida/plan" } };
  if (!e.movimientos.length) return { texto: "Anota tu primer gasto: con lo real, el número del día sale mejor.", accion: { texto: "Registrar", ruta: "/vida/registrar" } };
  const pasados = [1, 2, 3, 4, 5, 6, 7].map((n) => sumarDias(h, -n)).filter((f) => e.cierres[f]?.sobra < 0).length;
  if (pasados >= 3) return { texto: `Te pasaste ${pasados} de los últimos 7 días. Puede que tus números necesiten un ajuste.`, accion: { texto: "Revisar mis números", ruta: "/vida/plan" } };
  const semana = resumenSemana(e, lunes(h));
  if (semana.top && semana.top.parte >= 0.4 && semana.salio >= 30)
    return { texto: `Esta semana, ${semana.top.categoria} se llevó ${soles(semana.top.monto)} (${Math.round(semana.top.parte * 100)} % de tus gastos).` };
  const ahorrado = e.frascos.reduce((s, f) => s + totalFrasco(f), 0);
  if (ahorrado === 0) return { texto: "¿Y si separas S/ 2 hoy para tu colchón? Lo poquito y seguido suma.", accion: { texto: "Ir a metas", ruta: "/vida/metas" } };
  if (!e.pagos.length && (e.plan.fijos ?? 0) > 0) return { texto: "Anota tus pagos fijos y te aviso antes de que venzan.", accion: { texto: "Agregar pago", ruta: "/vida/movimientos?ver=pagos" } };
  return { texto: "Antes de una compra que no planeaste, espera un día. Si mañana la sigues queriendo, ahí ves." };
}
