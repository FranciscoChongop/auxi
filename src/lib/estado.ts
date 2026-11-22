import { useSyncExternalStore } from "react";
import type { InfoArchivo } from "./archivos";
import { diasEntre, hoy, sumarDias } from "./fechas";

/** Todo lo que la app recuerda en este celular. En la Fase 3 se sincroniza con la cuenta. */
export type Resultado = { estrellas: 1 | 2 | 3; precision: number };

export type Entrega = { id: string; titulo: string; curso: string; fecha: string };

/** Un curso de la persona (Mis cursos), con sus temas y PDF. */
export type Tema = { id: string; nombre: string; archivos: InfoArchivo[] };
export type MiCurso = { id: string; nombre: string; color: number; profesor?: string; temas: Tema[] };

export type Celebracion = {
  titulo: string;
  monedas: number;
  precision: number;
  segundos: number;
  rachaSube: boolean;
  rachaDias: number;
  usoProtector: boolean;
  cofre: boolean;
  primera: boolean;
};

export type Estado = {
  bienvenidaVista: boolean;
  cursoId: string | null;
  progreso: Record<string, Record<string, Resultado>>;
  errores: Record<string, string[]>;
  monedas: number;
  racha: { dias: number; ultimoDia: string; protectores: number };
  cofreDia: string;
  totales: { lecciones: number; respuestas: number; aciertos: number; minutos: number };
  cajas: Record<string, number>;
  entregas: Entrega[];
  huecos: string[];
  animo: { dia: string; valor: number }[];
  misiones: Record<string, boolean>;
  tarjetaDia: string;
  guiaIphoneVista: boolean;
  avisoCuentaVisto: boolean;
  metodoRecomendado: string | null;
  celebracion: Celebracion | null;
  misCursos: MiCurso[];
  estudiando: { cursoId: string; temaId: string } | null;
  /** Lecciones terminadas por día, para la semana de racha y la meta diaria. */
  diasEstudio: Record<string, number>;
  metaDiaria: number;
};

const CLAVE = "auxi.studio.v1";

function ejemploEntregas(): Entrega[] {
  const h = hoy();
  return [
    { id: "e1", titulo: "Informe de laboratorio", curso: "Biología", fecha: sumarDias(h, 2) },
    { id: "e2", titulo: "Práctica calificada 2", curso: "Matemática", fecha: sumarDias(h, 6) },
    { id: "e3", titulo: "Exposición grupal", curso: "Comunicación", fecha: sumarDias(h, 13) },
  ];
}

function inicial(): Estado {
  return {
    bienvenidaVista: false,
    cursoId: null,
    progreso: {},
    errores: {},
    monedas: 0,
    racha: { dias: 0, ultimoDia: "", protectores: 1 },
    cofreDia: "",
    totales: { lecciones: 0, respuestas: 0, aciertos: 0, minutos: 0 },
    cajas: {},
    entregas: ejemploEntregas(),
    huecos: [],
    animo: [],
    misiones: {},
    tarjetaDia: "",
    guiaIphoneVista: false,
    avisoCuentaVisto: false,
    metodoRecomendado: null,
    celebracion: null,
    misCursos: [],
    estudiando: null,
    diasEstudio: {},
    metaDiaria: 2,
  };
}

function cargar(): Estado {
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

export function obtener() {
  return estado;
}

export function actualizar(cambio: (e: Estado) => Partial<Estado>) {
  estado = { ...estado, ...cambio(estado) };
  try {
    localStorage.setItem(CLAVE, JSON.stringify(estado));
  } catch {
    // Si no se puede guardar, el avance dura mientras la app esté abierta.
  }
  oyentes.forEach((o) => o());
}

export function reiniciarTodo() {
  estado = inicial();
  try {
    localStorage.removeItem(CLAVE);
  } catch {
    // nada
  }
  oyentes.forEach((o) => o());
}

function suscribir(o: () => void) {
  oyentes.add(o);
  return () => oyentes.delete(o);
}

export function useEstado() {
  return useSyncExternalStore(suscribir, obtener, obtener);
}

/** La racha vale si practicaste hoy o ayer. Si no, está en pausa (nunca "se muere"). */
export function rachaVigente(e: Estado) {
  if (!e.racha.ultimoDia) return 0;
  const d = diasEntre(e.racha.ultimoDia, hoy());
  return d <= 1 ? e.racha.dias : 0;
}

export function rachaEnPausa(e: Estado) {
  return e.racha.dias > 0 && rachaVigente(e) === 0;
}

/** Guarda una lección terminada y devuelve lo que se celebra. */
export function registrarLeccion(datos: {
  cursoId: string;
  claveNodo: string;
  titulo: string;
  respuestas: number;
  aciertos: number;
  segundos: number;
  fallados: string[];
}) {
  const e = obtener();
  const h = hoy();
  const precision = datos.respuestas ? Math.round((100 * datos.aciertos) / datos.respuestas) : 100;
  const estrellas: 1 | 2 | 3 = precision >= 90 ? 3 : precision >= 70 ? 2 : 1;
  const monedas = 10 + (precision >= 90 ? 5 : 0);

  // Racha: sube una vez por día. Si pasaron días, el protector la cuida.
  let { dias, protectores } = e.racha;
  let rachaSube = false;
  let usoProtector = false;
  if (e.racha.ultimoDia !== h) {
    const pasados = e.racha.ultimoDia ? diasEntre(e.racha.ultimoDia, h) : 99;
    if (pasados === 1) dias += 1;
    else if (pasados > 1 && pasados <= 2 && protectores > 0) {
      protectores -= 1;
      usoProtector = true;
      dias += 1;
    } else dias = 1;
    rachaSube = true;
  }

  const anterior = e.progreso[datos.cursoId]?.[datos.claveNodo];
  const mejor: Resultado = !anterior || anterior.precision < precision ? { estrellas, precision } : anterior;
  const cofre = e.cofreDia !== h;
  const primera = e.totales.lecciones === 0;
  const erroresCurso = new Set([...(e.errores[datos.cursoId] ?? []), ...datos.fallados]);

  const celebracion: Celebracion = {
    titulo: datos.titulo,
    monedas,
    precision,
    segundos: datos.segundos,
    rachaSube,
    rachaDias: dias,
    usoProtector,
    cofre,
    primera,
  };

  actualizar((s) => ({
    monedas: s.monedas + monedas,
    racha: { dias, ultimoDia: h, protectores },
    progreso: { ...s.progreso, [datos.cursoId]: { ...s.progreso[datos.cursoId], [datos.claveNodo]: mejor } },
    errores: { ...s.errores, [datos.cursoId]: [...erroresCurso].slice(-40) },
    totales: {
      lecciones: s.totales.lecciones + 1,
      respuestas: s.totales.respuestas + datos.respuestas,
      aciertos: s.totales.aciertos + datos.aciertos,
      minutos: s.totales.minutos + Math.max(1, Math.round(datos.segundos / 60)),
    },
    celebracion,
    diasEstudio: { ...s.diasEstudio, [h]: (s.diasEstudio[h] ?? 0) + 1 },
  }));
  return celebracion;
}

export function nuevoId(prefijo: string) {
  return `${prefijo}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;
}

/** Quita de la lista de repaso lo que ya respondiste bien. */
export function quitarErrores(cursoId: string, refs: string[]) {
  actualizar((s) => ({
    errores: { ...s.errores, [cursoId]: (s.errores[cursoId] ?? []).filter((r) => !refs.includes(r)) },
  }));
}
