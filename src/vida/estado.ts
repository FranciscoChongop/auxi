import { useSyncExternalStore } from "react";
import { diasEntre, hoy, sumarDias } from "../lib/fechas";

/** Nombre provisional de la mini app: cámbialo solo aquí. */
export const NOMBRE_VIDA = "Auxi Vida";

export type Periodo = "dia" | "semana" | "mes";

/** Respuestas de las 3 preguntas. Todo en soles. */
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
  /** Solo ingresos de quien cobra por semana o por mes: suma a hoy porque no estaba en el plan. */
  extra?: boolean;
  origen: "chat" | "manual" | "captura";
};

export type Aporte = { id: string; fecha: string; monto: number; motivo: "antojo" | "sobrante" | "manual"; nota: string };

export type Pendiente = { id: string; titulo: string; fecha: string; tipo: string; hecho: boolean };

/** Cómo terminó un día ya pasado: lo que sobró (o faltó) y a dónde fue. */
export type Cierre = { sobra: number; destino: "manana" | "colchon" };

export type EstadoVida = {
  plan: Plan | null;
  movimientos: Movimiento[];
  colchon: { meta: number; aportes: Aporte[]; metaCelebrada: number };
  /** Qué hacer con lo que sobra al final del día. */
  sobrante: "manana" | "colchon";
  cierres: Record<string, Cierre>;
  pendientes: Pendiente[];
  racha: { dias: number; ultimoDia: string; protectores: number };
  monedas: number;
  cofreDia: string;
  tarjetaCerrada: string;
  lecciones: Record<string, 1 | 2 | 3>;
  revisiones: number;
  primerAnotado: boolean;
  cuentaOfrecida: boolean;
  misiones: Record<string, boolean>;
};

const CLAVE = "auxi.vida.v1";

function inicial(): EstadoVida {
  return {
    plan: null,
    movimientos: [],
    colchon: { meta: 0, aportes: [], metaCelebrada: 0 },
    sobrante: "manana",
    cierres: {},
    pendientes: [],
    racha: { dias: 0, ultimoDia: "", protectores: 1 },
    monedas: 0,
    cofreDia: "",
    tarjetaCerrada: "",
    lecciones: {},
    revisiones: 0,
    primerAnotado: false,
    cuentaOfrecida: false,
    misiones: {},
  };
}

function cargar(): EstadoVida {
  try {
    const crudo = localStorage.getItem(CLAVE);
    if (crudo) return { ...inicial(), ...JSON.parse(crudo) };
  } catch {
    // Sin almacenamiento: empezamos de cero.
  }
  return inicial();
}

let estado = cargar();
const oyentes = new Set<() => void>();

export function obtenerVida() {
  return estado;
}

export function actualizarVida(cambio: (e: EstadoVida) => Partial<EstadoVida>) {
  estado = { ...estado, ...cambio(estado) };
  try {
    localStorage.setItem(CLAVE, JSON.stringify(estado));
  } catch {
    // Si no se puede guardar, dura mientras la app esté abierta.
  }
  oyentes.forEach((o) => o());
}

export function borrarVida() {
  estado = inicial();
  try {
    localStorage.removeItem(CLAVE);
  } catch {
    // nada
  }
  oyentes.forEach((o) => o());
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

/* ---------- Plata ---------- */

/** "S/ 35" o "S/ 12.50": dos decimales solo si hacen falta. */
export function soles(n: number) {
  const r = Math.round(n * 100) / 100;
  const entero = Number.isInteger(r);
  return `S/ ${Math.abs(r).toLocaleString("es-PE", { minimumFractionDigits: entero ? 0 : 2, maximumFractionDigits: 2 })}`;
}

const redondear = (n: number) => Math.round(n * 100) / 100;

/** Días del mes de una fecha AAAA-MM-DD. */
function diasDelMes(fecha: string) {
  const [a, m] = fecha.split("-").map(Number);
  return new Date(a, m, 0).getDate();
}

export function ingresoMensual(p: Pick<Plan, "ingreso" | "periodo" | "diasSemana">) {
  if (p.periodo === "mes") return p.ingreso;
  if (p.periodo === "semana") return (p.ingreso * 52) / 12;
  return (p.ingreso * p.diasSemana * 52) / 12;
}

/** Lo que gana en un día normal, repartido en todos los días (también los que descansa). */
export function ingresoPorDia(p: Plan, fecha = hoy()) {
  return ingresoMensual(p) / diasDelMes(fecha);
}

/** Lo que se puede gastar en un día sin novedades: (ingreso − fijos − ahorro) ÷ días del mes. */
export function baseDiaria(p: Pick<Plan, "ingreso" | "periodo" | "diasSemana" | "fijos" | "ahorro">, fecha = hoy()) {
  const libre = ingresoMensual(p) - p.fijos - p.ahorro;
  return redondear(Math.max(0, libre) / diasDelMes(fecha));
}

/** Parte del ingreso que se guarda (para no gastar todo lo extra). */
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

/** Cuenta de un día: base + lo que pasó de ayer + ajuste por ingresos − gastos. */
export function desglose(e: EstadoVida, fecha = hoy()): DesgloseDia {
  const p = e.plan;
  const delDia = e.movimientos.filter((m) => m.fecha === fecha);
  const gastado = redondear(delDia.filter((m) => m.tipo === "gasto").reduce((s, m) => s + m.monto, 0));
  const ingresos = delDia.filter((m) => m.tipo === "ingreso");
  const ingresado = redondear(ingresos.reduce((s, m) => s + m.monto, 0));
  if (!p) return { base: 0, arrastre: 0, ajusteIngresos: 0, gastado, ingresado, disponible: 0, quedan: -gastado };
  const base = baseDiaria(p, fecha);
  const ayer = e.cierres[sumarDias(fecha, -1)];
  const arrastre = ayer && ayer.destino === "manana" ? ayer.sobra : 0;
  let ajusteIngresos = 0;
  if (p.periodo === "dia") {
    // Quien cobra por día: si anotó lo que ganó, se usa lo real en vez de lo esperado.
    if (ingresado > 0) ajusteIngresos = (ingresado - ingresoPorDia(p, fecha)) * partePropia(p);
  } else {
    ajusteIngresos = ingresos.filter((m) => m.extra).reduce((s, m) => s + m.monto, 0) * partePropia(p);
  }
  ajusteIngresos = redondear(ajusteIngresos);
  const disponible = redondear(base + arrastre + ajusteIngresos);
  return { base, arrastre, ajusteIngresos, gastado, ingresado, disponible, quedan: redondear(disponible - gastado) };
}

/**
 * Cierra los días pasados en los que se anotó algo: lo que sobró pasa al día siguiente
 * o al colchón (según lo elegido). Si faltó, se descuenta al día siguiente, sin dramas.
 * Los días sin anotar no se cierran: no sabemos qué pasó.
 */
export function cerrarDiasPasados() {
  const e = obtenerVida();
  if (!e.plan) return;
  const h = hoy();
  const conMovimientos = [...new Set(e.movimientos.map((m) => m.fecha))].filter((f) => f < h && f >= e.plan!.desde).sort();
  const pendientes = conMovimientos.filter((f) => !e.cierres[f]);
  if (!pendientes.length) return;
  let cierres = { ...e.cierres };
  const aportes = [...e.colchon.aportes];
  for (const f of pendientes) {
    const d = desglose({ ...e, cierres }, f);
    const sobra = d.quedan;
    const destino = sobra > 0 && e.sobrante === "colchon" ? "colchon" : "manana";
    // Lo que se arrastra no se acumula sin fin: como máximo una semana de base.
    const tope = d.base * 7;
    cierres = { ...cierres, [f]: { sobra: destino === "manana" ? Math.max(-tope, Math.min(tope, sobra)) : sobra, destino } };
    if (destino === "colchon") aportes.push({ id: nuevoId("a"), fecha: f, monto: sobra, motivo: "sobrante", nota: "Lo que te sobró" });
  }
  actualizarVida((s) => ({ cierres, colchon: { ...s.colchon, aportes } }));
}

export function totalColchon(e: EstadoVida) {
  return redondear(e.colchon.aportes.reduce((s, a) => s + a.monto, 0));
}

/* ---------- Racha, monedas y cofre ---------- */

export function rachaVigente(e: EstadoVida) {
  if (!e.racha.ultimoDia) return 0;
  return diasEntre(e.racha.ultimoDia, hoy()) <= 1 ? e.racha.dias : 0;
}

export type Logro = { rachaSube: boolean; rachaDias: number; usoProtector: boolean; monedas: number; cofre: boolean; primero: boolean };

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
  actualizarVida((s) => ({
    movimientos: [...s.movimientos, { ...m, id: nuevoId("m") }],
    racha: { dias, ultimoDia: h, protectores },
    monedas: s.monedas + monedas,
    primerAnotado: true,
  }));
  return { rachaSube, rachaDias: dias, usoProtector, monedas, cofre, primero };
}

/** Premios del cofre: las probabilidades se muestran tal cual en la pantalla. */
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
