import { motion } from "motion/react";
import { useState, type ReactNode } from "react";
import { useAviso } from "../components/Aviso";
import { BarraProgreso } from "../components/BarraProgreso";
import { Boton } from "../components/Boton";
import { ChipCombo } from "../components/ChipCombo";
import { ContadorAnimado } from "../components/ContadorAnimado";
import { AjustesDeSonido } from "../components/Interruptor";
import { CARAS, CaraDeLeon, Leon, POSES, type PoseLeon } from "../components/Leon";
import { Opcion, type EstadoOpcion } from "../components/Opcion";
import { Tarjeta } from "../components/Tarjeta";
import { Ventana } from "../components/Ventana";
import { Vidas } from "../components/Vidas";
import { lanzarConfeti } from "../lib/confeti";
import { resorteRebote } from "../lib/movimiento";
import { navegar } from "../lib/rutas";
import { sonidos, type NombreSonido } from "../lib/sonidos";
import { vibrar } from "../lib/vibrar";

function Seccion({ titulo, ayuda, indice, children }: { titulo: string; ayuda?: string; indice: number; children: ReactNode }) {
  return (
    <Tarjeta indice={indice}>
      <h2 className="text-tarjeta font-extrabold">{titulo}</h2>
      {ayuda && <p className="mt-1 text-ayuda text-text-soft">{ayuda}</p>}
      <div className="mt-4">{children}</div>
    </Tarjeta>
  );
}

/* ---------- Mini lección: opción, barra, combo y vidas juntos ---------- */

const PREGUNTA = {
  texto: "¿Qué parte de la célula guarda el ADN?",
  opciones: ["El núcleo", "La membrana", "El citoplasma"],
  correcta: 0,
};
const VIDAS = 3;
const PASOS = 5;

function MiniLeccion() {
  const [elegida, setElegida] = useState<number | null>(null);
  const [aciertos, setAciertos] = useState(0);
  const [racha, setRacha] = useState(0);
  const [vidas, setVidas] = useState(VIDAS);
  const aviso = useAviso();

  const respondida = elegida !== null;
  const acerto = elegida === PREGUNTA.correcta;
  const sinVidas = vidas === 0;
  const terminada = aciertos >= PASOS;

  function elegir(i: number) {
    if (respondida || sinVidas || terminada) return;
    setElegida(i);
    if (i === PREGUNTA.correcta) {
      const nueva = racha + 1;
      setRacha(nueva);
      setAciertos((a) => a + 1);
      if (nueva >= 2) sonidos.combo(nueva);
      else sonidos.acierto();
      vibrar("acierto");
      if (aciertos + 1 >= PASOS) {
        setTimeout(() => {
          sonidos.leccionCompleta();
          void lanzarConfeti();
          aviso("¡Eso! Terminaste la prueba.", "exito");
        }, 450);
      }
    } else {
      setRacha(0);
      setVidas((v) => Math.max(0, v - 1));
      sonidos.error();
      vibrar("error");
    }
  }

  function estadoDe(i: number): EstadoOpcion {
    if (!respondida) return "normal";
    if (i === PREGUNTA.correcta && acerto) return "correcta";
    if (i === elegida) return "incorrecta";
    return "normal";
  }

  function reiniciar() {
    setElegida(null);
    setAciertos(0);
    setRacha(0);
    setVidas(VIDAS);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <BarraProgreso valor={aciertos / PASOS} />
        </div>
        <Vidas total={VIDAS} restantes={vidas} />
      </div>
      <ChipCombo racha={racha} />
      <p className="text-[17px] font-extrabold">{PREGUNTA.texto}</p>
      <div className="flex flex-col gap-3">
        {PREGUNTA.opciones.map((o, i) => (
          <Opcion key={o} estado={estadoDe(i)} bloqueada={respondida} onClick={() => elegir(i)}>
            {o}
          </Opcion>
        ))}
      </div>
      {respondida && !terminada && !sinVidas && (
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-boton px-4 py-3 text-[17px] font-extrabold ${acerto ? "bg-success text-text" : "border-2 border-error bg-card text-error-dark"}`}
        >
          {acerto ? "¡Bien! Toca seguir para repetir." : "Casi. Es la parte del centro."}
        </motion.p>
      )}
      {sinVidas && <p className="font-bold text-text-soft">Te quedaste sin vidas. Empieza de nuevo cuando quieras.</p>}
      {terminada || sinVidas ? (
        <Boton variante="secundario" onClick={reiniciar}>
          Empezar de nuevo
        </Boton>
      ) : (
        <Boton variante={acerto ? "exito" : "principal"} deshabilitado={!respondida} onClick={() => setElegida(null)}>
          Seguir
        </Boton>
      )}
    </div>
  );
}

/* ---------- Monedas que cuentan ---------- */

function Moneda() {
  return (
    <svg viewBox="0 0 24 24" className="size-8" aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="var(--reward)" />
      <circle cx="12" cy="12" r="6.5" fill="none" stroke="var(--reward-dark)" strokeWidth="2" />
    </svg>
  );
}

function Monedas() {
  const [monedas, setMonedas] = useState(120);
  const [salto, setSalto] = useState(0);
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <motion.span key={salto} animate={{ scale: [1, 1.25, 1] }} transition={{ duration: 0.3 }}>
          <Moneda />
        </motion.span>
        <ContadorAnimado valor={monedas} className="text-titulo font-black" />
        <span className="text-text-soft">monedas</span>
      </div>
      <Boton
        variante="premio"
        onClick={() => {
          setMonedas((m) => m + 25);
          setSalto((s) => s + 1);
          sonidos.acierto();
        }}
      >
        Sumar 25 monedas
      </Boton>
    </div>
  );
}

/* ---------- Celebración ---------- */

function Celebracion() {
  const [vez, setVez] = useState(0);
  return (
    <div className="flex flex-col gap-4">
      <div className="grid h-52 place-items-center rounded-tarjeta bg-surface">
        {vez === 0 ? (
          <p className="px-6 text-center text-text-soft">Aquí aparece León cuando terminas una lección.</p>
        ) : (
          <Leon key={vez} pose="celebra" alto={190} rebote />
        )}
      </div>
      <Boton
        variante="exito"
        sinSonido
        onClick={() => {
          setVez((v) => v + 1);
          sonidos.leccionCompleta();
          void lanzarConfeti();
        }}
      >
        Celebrar
      </Boton>
    </div>
  );
}

/* ---------- Sonidos ---------- */

const LISTA_SONIDOS: { nombre: NombreSonido; etiqueta: string; tocar: () => void }[] = [
  { nombre: "toque", etiqueta: "Toque", tocar: sonidos.toque },
  { nombre: "acierto", etiqueta: "Acierto", tocar: sonidos.acierto },
  { nombre: "combo", etiqueta: "Combo x4", tocar: () => sonidos.combo(4) },
  { nombre: "error", etiqueta: "Error", tocar: sonidos.error },
  { nombre: "leccionCompleta", etiqueta: "Lección completa", tocar: sonidos.leccionCompleta },
  { nombre: "cofre", etiqueta: "Cofre", tocar: sonidos.cofre },
];

function BotonSonido({ etiqueta, tocar }: { etiqueta: string; tocar: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={tocar}
      whileTap={{ y: 3, boxShadow: "0 1px 0 var(--surface)", transition: { duration: 0.06 } }}
      style={{ boxShadow: "0 3px 0 var(--surface)" }}
      className="flex h-12 cursor-pointer items-center gap-2 rounded-boton border-2 border-surface bg-card px-3 text-left font-bold"
    >
      <svg viewBox="0 0 24 24" className="size-5 shrink-0 text-brand" aria-hidden="true">
        <path d="M8 5.5v13l10-6.5z" fill="currentColor" />
      </svg>
      {etiqueta}
    </motion.button>
  );
}

/* ---------- Colores ---------- */

const COLORES: { nombre: string; variable: string; uso: string; claro?: boolean }[] = [
  { nombre: "Cobalto", variable: "--brand", uso: "Botón principal", claro: true },
  { nombre: "Turquesa", variable: "--success", uso: "Aciertos y progreso" },
  { nombre: "Oro", variable: "--reward", uso: "Monedas, racha, cofre" },
  { nombre: "Terracota", variable: "--error", uso: "Errores y vidas", claro: true },
  { nombre: "Superficie", variable: "--surface", uso: "Tarjetas y opciones" },
  { nombre: "Texto", variable: "--text", uso: "Todo el texto", claro: true },
];

/* ---------- Pantalla ---------- */

const POSES_ORDEN = Object.keys(POSES) as PoseLeon[];

export default function Catalogo() {
  const aviso = useAviso();
  const [ventana, setVentana] = useState(false);

  return (
    <main
      className="mx-auto flex max-w-md flex-col gap-4 px-5"
      style={{
        paddingTop: "calc(env(safe-area-inset-top) + 20px)",
        paddingBottom: "calc(env(safe-area-inset-bottom) + 32px)",
      }}
    >
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-titulo font-black">Catálogo</h1>
          <p className="mt-1 text-text-soft">Las piezas de Auxi Studio. Tócalas todas.</p>
        </div>
        <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={resorteRebote}>
          <CaraDeLeon cara="guino" tamano={56} />
        </motion.div>
      </header>

      <Seccion indice={0} titulo="Mini lección" ayuda="Barra, vidas, combo y opciones trabajando juntos.">
        <MiniLeccion />
      </Seccion>

      <Seccion indice={1} titulo="Botones" ayuda="Se hunden al tocar y vuelven con un rebote.">
        <div className="flex flex-col gap-4">
          <Boton>Comprobar</Boton>
          <Boton variante="exito">Continuar</Boton>
          <Boton variante="premio">Abrir cofre</Boton>
          <Boton variante="secundario">Ahora no</Boton>
          <Boton deshabilitado>Elige una respuesta</Boton>
        </div>
      </Seccion>

      <Seccion indice={2} titulo="Números que cuentan">
        <Monedas />
      </Seccion>

      <Seccion indice={3} titulo="Celebración" ayuda="Confeti, fanfarria y León entrando con rebote.">
        <Celebracion />
      </Seccion>

      <Seccion indice={4} titulo="Avisos" ayuda="Bajan desde arriba y se van solos.">
        <div className="grid grid-cols-2 gap-3">
          <Boton variante="secundario" onClick={() => aviso("¡Eso! Vas en racha.", "exito")}>
            Acierto
          </Boton>
          <Boton variante="secundario" onClick={() => aviso("Casi. Mira esta pista.", "error")}>
            Error
          </Boton>
          <Boton variante="secundario" onClick={() => aviso("Ganaste 10 monedas.", "premio")}>
            Premio
          </Boton>
          <Boton variante="secundario" onClick={() => aviso("Tu avance está guardado.", "info")}>
            Info
          </Boton>
        </div>
      </Seccion>

      <Seccion indice={5} titulo="Ventana" ayuda="Siempre se cierra con la X.">
        <Boton variante="secundario" onClick={() => setVentana(true)}>
          Abrir ventana
        </Boton>
      </Seccion>

      <Seccion indice={6} titulo="Sonidos">
        <AjustesDeSonido />
        <div className="mt-4 grid grid-cols-2 gap-3">
          {LISTA_SONIDOS.map((s) => (
            <BotonSonido key={s.nombre + s.etiqueta} etiqueta={s.etiqueta} tocar={s.tocar} />
          ))}
        </div>
      </Seccion>

      <Seccion indice={7} titulo="Colores">
        <ul className="grid grid-cols-2 gap-3">
          {COLORES.map((c) => (
            <li key={c.variable} className="overflow-hidden rounded-boton border-2 border-surface bg-card">
              <div className="h-14" style={{ background: `var(${c.variable})` }} />
              <div className="px-3 py-2">
                <p className="font-extrabold">{c.nombre}</p>
                <p className="text-ayuda text-text-soft">{c.uso}</p>
              </div>
            </li>
          ))}
        </ul>
      </Seccion>

      <Seccion indice={8} titulo="León" ayuda="Solo aquí se ven todas juntas. En la app, una por pantalla.">
        <ul className="grid grid-cols-3 gap-3">
          {POSES_ORDEN.map((p) => (
            <li key={p} className="flex flex-col items-center gap-1 rounded-boton bg-surface p-2">
              <Leon pose={p} alto={96} />
              <span className="text-ayuda text-text-soft">{POSES[p].archivo.split("-")[0]}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex flex-wrap gap-2">
          {CARAS.map((c) => (
            <CaraDeLeon key={c} cara={c} />
          ))}
        </div>
      </Seccion>

      <div className="pt-2">
        <Boton variante="secundario" onClick={() => navegar("/studio/inicio")}>
          Volver a la portada
        </Boton>
      </div>

      <Ventana abierta={ventana} alCerrar={() => setVentana(false)} titulo="¿Seguimos mañana?">
        <p className="text-text-soft">Tu racha está protegida hoy. Puedes cerrar esta ventana cuando quieras.</p>
        <div className="mt-6">
          <Boton onClick={() => setVentana(false)}>Entendido</Boton>
        </div>
      </Ventana>
    </main>
  );
}
