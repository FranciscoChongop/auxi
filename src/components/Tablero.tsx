import { motion } from "motion/react";
import type { ReactNode } from "react";
import type { Curso } from "../data/tipos";
import { proximoExamen, temasPorPrioridad, type Nodo } from "../lib/curso";
import { rachaEnPausa, rachaVigente, type Estado } from "../lib/estado";
import { DIAS_CORTOS, diaDeHoy, diasEntre, hoy, sumarDias } from "../lib/fechas";
import { entradaEnCascada } from "../lib/movimiento";
import { navegar } from "../lib/rutas";
import { estudiarTema } from "../lib/tienda";
import { FilaTema } from "./FilaTema";
import { SelectorTema } from "./SelectorTema";
import { textoExamen } from "./FilaTema";
import { sonidos } from "../lib/sonidos";
import { vibrar } from "../lib/vibrar";
import { Boton } from "./Boton";
import { COLORES_CURSO } from "./Formulario";
import { CaraDeLeon, Leon } from "./Leon";
import { CambiarApp } from "./CambiarApp";
import { Escudo, Llama, Marcadores } from "./Navegacion";

/* ---------- Saludo ---------- */

export function Saludo() {
  const h = new Date().getHours();
  const saludo = h < 12 ? "Buenos días" : h < 19 ? "Buenas tardes" : "Buenas noches";
  return (
    <header className="flex items-center justify-between gap-3">
      <div>
        <p className="text-ayuda font-bold text-text-soft">{saludo}</p>
        <h1 className="text-[24px] leading-7 font-black md:text-[30px] md:leading-9">¿Qué estudiamos hoy?</h1>
      </div>
      {/* En computadora la racha, las monedas y el selector de apps están en el menú lateral. */}
      <div className="flex items-center gap-1 md:hidden">
        <Marcadores />
        <CambiarApp actual="student" />
      </div>
    </header>
  );
}

/* ---------- Semana de racha + meta del día ---------- */

function Anillo({ valor }: { valor: number }) {
  const r = 22;
  const c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 56 56" className="size-14 -rotate-90" aria-hidden="true">
      <circle cx="28" cy="28" r={r} fill="none" stroke="var(--surface)" strokeWidth="7" />
      <motion.circle
        cx="28"
        cy="28"
        r={r}
        fill="none"
        stroke="var(--success)"
        strokeWidth="7"
        strokeLinecap="round"
        strokeDasharray={c}
        initial={{ strokeDashoffset: c }}
        animate={{ strokeDashoffset: c * (1 - Math.min(1, valor)) }}
        transition={{ type: "spring", stiffness: 120, damping: 20, delay: 0.2 }}
      />
    </svg>
  );
}

export function SemanaYMeta({ e }: { e: Estado }) {
  const h = hoy();
  const lunes = sumarDias(h, -diaDeHoy());
  const dias = DIAS_CORTOS.map((d, i) => ({ d, fecha: sumarDias(lunes, i) }));
  const hechasHoy = e.diasEstudio[h] ?? 0;
  const meta = e.metaDiaria;
  const racha = rachaVigente(e);
  const pausa = rachaEnPausa(e);

  return (
    <motion.section {...entradaEnCascada(0)} className="rounded-tarjeta border-2 border-surface bg-card p-4">
      <div className="flex items-center gap-4">
        <div className="relative grid place-items-center">
          <Anillo valor={hechasHoy / meta} />
          <span className="numeros absolute text-[15px] font-black">
            {Math.min(hechasHoy, meta)}/{meta}
          </span>
        </div>
        <div className="flex-1">
          <p className="font-extrabold">{hechasHoy >= meta ? "¡Meta de hoy cumplida!" : "Meta de hoy"}</p>
          <p className="text-ayuda text-text-soft">
            {hechasHoy >= meta
              ? "Todo lo que hagas ahora es extra."
              : `${meta - hechasHoy} ${meta - hechasHoy === 1 ? "lección" : "lecciones"} más y listo.`}
          </p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-7 gap-1">
        {dias.map(({ d, fecha }) => {
          const estudio = (e.diasEstudio[fecha] ?? 0) > 0;
          const esHoy = fecha === h;
          const futuro = diasEntre(h, fecha) > 0;
          return (
            <div key={fecha} className="flex flex-col items-center gap-1">
              <span
                className={`grid size-10 place-items-center rounded-full ${esHoy ? "ring-2 ring-brand ring-offset-2 ring-offset-card" : ""} ${estudio ? "bg-reward/25" : "bg-surface"} ${futuro ? "opacity-50" : ""}`}
              >
                {estudio ? <Llama activa className="size-5" /> : <span className="size-2 rounded-full bg-text-soft/30" />}
              </span>
              <span className={`text-[12px] font-extrabold ${esHoy ? "text-brand" : "text-text-soft"}`}>{d}</span>
            </div>
          );
        })}
      </div>
      <p className="mt-3 flex items-center gap-2 text-ayuda font-bold text-text-soft">
        {pausa ? (
          <>
            <CaraDeLeon cara="tierno" tamano={28} /> Tu racha está en pausa. Una lección la vuelve a encender.
          </>
        ) : (
          <>
            <Escudo className="size-5" />
            {racha > 0 ? `Racha de ${racha} ${racha === 1 ? "día" : "días"}` : "Empieza tu racha hoy"} · {e.racha.protectores}{" "}
            {e.racha.protectores === 1 ? "protector" : "protectores"}
          </>
        )}
      </p>
    </motion.section>
  );
}

/* ---------- Sigue donde te quedaste ---------- */

export function Continuar({ e, curso, actual, avance }: { e: Estado; curso: Curso; actual?: Nodo; avance: number }) {
  const mio = e.estudiando && e.misCursos.find((c) => c.id === e.estudiando!.cursoId);
  const tema = mio && mio.temas.find((t) => t.id === e.estudiando!.temaId);
  const titulo = tema ? tema.nombre : curso.titulo;
  const sub = mio ? mio.nombre : curso.materia;

  return (
    <motion.section
      {...entradaEnCascada(1)}
      className="rounded-tarjeta bg-brand p-4 text-white"
      style={{ boxShadow: "0 4px 0 var(--brand-dark)" }}
    >
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-ayuda font-bold opacity-85">Sigue donde te quedaste · {sub}</p>
          <p className="mt-1 text-[22px] leading-7 font-black">{titulo}</p>
          <p className="mt-1 text-[15px] font-semibold opacity-90">{actual ? `Siguiente: ${actual.titulo}` : "¡Tema terminado!"}</p>
        </div>
        <Leon pose="saluda" alto={104} className="-mt-1 -mr-1 shrink-0" />
      </div>
      <div className="mt-4 flex items-center gap-3">
        <div className="h-3 flex-1 overflow-hidden rounded-full bg-white/25">
          <motion.div
            className="h-full rounded-full bg-success"
            initial={{ width: 0 }}
            animate={{ width: `${avance * 100}%` }}
            transition={{ type: "spring", stiffness: 160, damping: 22, delay: 0.3 }}
          />
        </div>
        <span className="numeros text-ayuda font-black">{Math.round(avance * 100)} %</span>
      </div>
      <div className="mt-4">
        <Boton variante="secundario" onClick={() => navegar(actual ? `/student/leccion?n=${actual.clave}` : "/student/material")}>
          {actual ? (avance > 0 ? "Continuar" : "Empezar") : "Estudiar otro tema"}
        </Boton>
      </div>
      <div className="mt-1 flex justify-center">
        <SelectorTema variante="enlace-claro" />
      </div>
    </motion.section>
  );
}

/* ---------- Hoy: clases y próxima entrega ---------- */

function Fila({ izquierda, children, derecha, onClick, color }: { izquierda: ReactNode; children: ReactNode; derecha?: ReactNode; onClick: () => void; color?: string }) {
  return (
    <button type="button" onClick={onClick} className="flex min-h-14 w-full cursor-pointer items-center gap-3 overflow-hidden rounded-boton bg-bg py-2 pr-3 text-left">
      <span className="w-1.5 self-stretch rounded-r-full" style={{ background: color ?? "transparent" }} />
      <span className="numeros w-14 shrink-0 text-[15px] font-black">{izquierda}</span>
      <span className="min-w-0 flex-1">{children}</span>
      {derecha}
    </button>
  );
}

export function Hoy({ e }: { e: Estado }) {
  const pendientes = [...e.entregas].filter((x) => x.tipo !== "feriado" && diasEntre(hoy(), x.fecha) >= 0).sort((a, b) => a.fecha.localeCompare(b.fecha));
  const proxima = pendientes[0];
  const color = (nombre: string) => COLORES_CURSO[e.misCursos.find((c) => c.nombre.toLowerCase() === nombre.toLowerCase())?.color ?? 0];
  const faltan = proxima ? diasEntre(hoy(), proxima.fecha) : 0;

  return (
    <motion.section {...entradaEnCascada(3)} className="rounded-tarjeta border-2 border-surface bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-tarjeta font-extrabold">Próxima entrega</h2>
        <span className="text-ayuda font-bold text-text-soft">{new Date().toLocaleDateString("es-PE", { weekday: "long", day: "numeric", month: "long" })}</span>
      </div>
      {proxima ? (
        <Fila
          izquierda={<span className={`text-ayuda ${faltan <= 1 ? "text-error" : "text-text-soft"}`}>{faltan === 0 ? "Hoy" : faltan === 1 ? "Mañana" : `${faltan} días`}</span>}
          color={color(proxima.curso)}
          onClick={() => navegar("/student/entregas")}
        >
          <span className="block truncate font-extrabold">{proxima.titulo}</span>
          <span className="block text-ayuda text-text-soft">
            {proxima.curso}
            {pendientes.length > 1 ? ` · y ${pendientes.length - 1} más` : ""}
          </span>
        </Fila>
      ) : (
        <Fila izquierda={<CaraDeLeon cara="feliz" tamano={36} />} onClick={() => navegar("/student/entregas")} derecha={<span className="font-black text-brand">Ver</span>}>
          <span className="block font-extrabold">Nada pendiente</span>
          <span className="block text-ayuda text-text-soft">Pega tu sílabo y te aviso antes de cada entrega.</span>
        </Fila>
      )}
    </motion.section>
  );
}

/* ---------- Accesos rápidos ---------- */

function Acceso({ titulo, ayuda, icono, onClick, insignia }: { titulo: string; ayuda: string; icono: ReactNode; onClick: () => void; insignia?: number }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      onPointerDown={() => {
        sonidos.toque();
        vibrar("toque");
      }}
      whileTap={{ y: 3, boxShadow: "0 1px 0 var(--surface)", transition: { duration: 0.06 } }}
      style={{ boxShadow: "0 4px 0 var(--surface)" }}
      className="relative flex min-h-16 cursor-pointer items-center gap-3 rounded-tarjeta border-2 border-surface bg-card p-3 text-left"
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-[12px] bg-surface text-brand">{icono}</span>
      <span className="min-w-0">
        <span className="block truncate font-extrabold">{titulo}</span>
        <span className="block truncate text-[13px] leading-4 text-text-soft">{ayuda}</span>
      </span>
      {!!insignia && (
        <span className="numeros absolute top-2 right-2 grid h-6 min-w-6 place-items-center rounded-full bg-error px-1.5 text-[13px] font-black text-white">{insignia}</span>
      )}
    </motion.button>
  );
}

const t = { fill: "none", stroke: "currentColor", strokeWidth: 2.3, strokeLinecap: "round", strokeLinejoin: "round" } as const;
const Ic = ({ d }: { d: string }) => (
  <svg viewBox="0 0 24 24" className="size-6" aria-hidden="true">
    <path {...t} d={d} />
  </svg>
);

export function Accesos({ errores }: { errores: number }) {
  return (
    <motion.section {...entradaEnCascada(5)} className="flex flex-col gap-3">
      <h2 className="text-tarjeta font-extrabold">Todo en un toque</h2>
      <div className="grid grid-cols-2 gap-3">
        <Acceso titulo="Repaso" ayuda={errores ? "2 minutos" : "Nada pendiente"} insignia={errores} onClick={() => navegar("/student/leccion?n=repaso")} icono={<Ic d="M4 12a8 8 0 1 0 2.4-5.7M4 4.5v4h4" />} />
        <Acceso titulo="Mis cursos" ayuda="Temas y exámenes" onClick={() => navegar("/student/cursos")} icono={<Ic d="M5 4.5h11a3 3 0 0 1 3 3v12H8a3 3 0 0 1-3-3zM5 16.5a3 3 0 0 1 3-3h11" />} />
        <Acceso titulo="El tomate" ayuda="25 min de foco" onClick={() => navegar("/student/metodos/tomate")} icono={<Ic d="M12 6.5c-1.5-2-4-2-5-1M12 6.5c1.5-2 4-2 5-1M12 6.5V4M5 13.5a7 7 0 1 0 14 0 7 7 0 0 0-14 0z" />} />
        <Acceso titulo="Las 5 cajas" ayuda="Tarjetas rápidas" onClick={() => navegar("/student/metodos/cajas")} icono={<Ic d="M3.5 9h17v10.5H3.5zM6 9V5.5h12V9M10 13h4" />} />
        <Acceso titulo="Explícaselo a León" ayuda="Gana estrellas" onClick={() => navegar("/student/metodos/leon")} icono={<Ic d="M5 5.5h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-6l-4 3.5v-3.5H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2z" />} />
        <Acceso titulo="Calendario" ayuda="Entregas y feriados" onClick={() => navegar("/student/entregas?ver=calendario")} icono={<Ic d="M5 5.5h14a1 1 0 0 1 1 1V19a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6.5a1 1 0 0 1 1-1zM4 10h16M8 3.5v4M16 3.5v4" />} />
        <Acceso titulo="Importar sílabo" ayuda="Arma tus fechas" onClick={() => navegar("/student/silabo")} icono={<Ic d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5M9 13h6M9 17h4" />} />
        <Acceso titulo="Mis monedas" ayuda="Qué puedes obtener" onClick={() => navegar("/student/monedas")} icono={<Ic d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 8v8M9.5 10.5h4a1.5 1.5 0 0 1 0 3h-3a1.5 1.5 0 0 0 0 3h4" />} />
      </div>
    </motion.section>
  );
}

/* ---------- Mis temas (los primeros por prioridad) ---------- */

export function MisTemas({ e }: { e: Estado }) {
  const temas = temasPorPrioridad(e).slice(0, 3);
  if (!temas.length) return null;
  return (
    <motion.section {...entradaEnCascada(2)} className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-tarjeta font-extrabold">Mis temas</h2>
        <button type="button" onClick={() => navegar("/student/cursos")} className="h-11 cursor-pointer px-1 font-extrabold text-brand">
          Ver todos
        </button>
      </div>
      {temas.map((t, i) => (
        <FilaTema key={t.tema.id} info={t} indice={i} onClick={() => estudiarTema(t, navegar)} />
      ))}
    </motion.section>
  );
}

/* ---------- Resumen del camino (el camino completo vive en /student/camino) ---------- */

export function ResumenCamino({ curso, lista }: { curso: Curso; lista: Nodo[] }) {
  const actual = lista.find((n) => n.abierto && !n.hecho);
  const hechos = lista.filter((n) => n.hecho).length;
  return (
    <motion.button
      {...entradaEnCascada(1)}
      type="button"
      onClick={() => navegar("/student/camino")}
      onPointerDown={() => {
        sonidos.toque();
        vibrar("toque");
      }}
      whileTap={{ y: 5, boxShadow: "0 1px 0 var(--success-dark)", transition: { duration: 0.06 } }}
      style={{ boxShadow: "0 6px 0 var(--success-dark)" }}
      className="flex cursor-pointer flex-col gap-4 rounded-[20px] bg-success p-5 text-left text-text"
    >
      <span className="flex items-start justify-between gap-3">
        <span className="min-w-0">
          <span className="block text-[28px] leading-8 font-black">Tu camino</span>
          <span className="block font-bold">Aquí juegas: niveles y minijuegos</span>
          <span className="mt-1 block truncate text-ayuda font-bold opacity-80">
            {curso.titulo} · {hechos} de {lista.length} niveles
          </span>
        </span>
        <span className="shrink-0 rounded-full bg-text px-5 py-3 text-[17px] font-black text-white">Jugar</span>
      </span>
      <span className="relative flex items-center justify-between px-1" aria-hidden="true">
        <span className="absolute inset-x-4 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-white/50" />
        {lista.slice(0, 7).map((n) => (
          <span
            key={n.clave}
            className={`relative grid place-items-center rounded-full ${n === actual ? "size-12 bg-brand ring-4 ring-white" : "size-9"} ${n.hecho ? "bg-text" : n === actual ? "" : "bg-white/70"}`}
          >
            {n.hecho ? (
              <svg viewBox="0 0 24 24" className="size-5"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="white" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
            ) : n === actual ? (
              <svg viewBox="0 0 24 24" className="size-6"><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" fill="white" /></svg>
            ) : null}
          </span>
        ))}
      </span>
    </motion.button>
  );
}

/* ---------- ¿Tienes un examen? ---------- */

export function TarjetaExamen({ e }: { e: Estado }) {
  const prox = proximoExamen(e);
  if (!prox) {
    return (
      <motion.button
        {...entradaEnCascada(0)}
        type="button"
        onClick={() => navegar("/student/examen")}
        onPointerDown={() => sonidos.toque()}
        whileTap={{ y: 3, boxShadow: "0 1px 0 var(--surface)", transition: { duration: 0.06 } }}
        style={{ boxShadow: "0 4px 0 var(--surface)" }}
        className="flex cursor-pointer items-center gap-3 rounded-tarjeta border-2 border-surface bg-card p-3 text-left"
      >
        <CaraDeLeon cara="sorpresa" tamano={52} />
        <span className="flex-1">
          <span className="block text-tarjeta font-extrabold">¿Tienes un examen?</span>
          <span className="block text-ayuda text-text-soft">Cuéntame y armo tu plan.</span>
        </span>
        <span className="font-black text-brand">Contar</span>
      </motion.button>
    );
  }
  const urgente = prox.diasExamen! <= 3;
  return (
    <motion.section {...entradaEnCascada(0)} className={`rounded-tarjeta border-2 p-4 ${urgente ? "border-error bg-card" : "border-surface bg-card"}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={`text-ayuda font-extrabold ${urgente ? "text-error" : "text-text-soft"}`}>{textoExamen(prox.diasExamen!)}</p>
          <p className="truncate text-[20px] leading-6 font-black">{prox.tema.nombre}</p>
          <p className="truncate text-ayuda text-text-soft">{prox.curso.nombre}</p>
        </div>
        <CaraDeLeon cara={urgente ? "sorpresa" : "lentes"} tamano={48} />
      </div>
      {prox.contenido && (
        <div className="mt-3 flex items-center gap-2">
          <span className="h-2 flex-1 overflow-hidden rounded-full bg-surface">
            <span className="block h-full rounded-full bg-success" style={{ width: `${Math.round(prox.avance * 100)}%` }} />
          </span>
          <span className="numeros text-[12px] font-extrabold text-text-soft">{Math.round(prox.avance * 100)} %</span>
        </div>
      )}
      <div className="mt-3">
        <Boton variante={urgente ? "premio" : "principal"} onClick={() => estudiarTema(prox, navegar)}>
          {prox.contenido ? "Estudiar para el examen" : "Subir mi material"}
        </Boton>
      </div>
      <button type="button" onClick={() => navegar("/student/examen")} className="mt-1 h-11 w-full cursor-pointer font-extrabold text-brand">
        Anotar otro examen
      </button>
    </motion.section>
  );
}
