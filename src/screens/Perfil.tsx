import { motion } from "motion/react";
import { BorrarCuenta } from "../components/BorrarCuenta";
import { ganarMonedas } from "../lib/billetera";
import { useState, type ReactNode } from "react";
import { useAviso } from "../components/Aviso";
import { Boton } from "../components/Boton";
import { AjustesDeSonido } from "../components/Interruptor";
import { CaraDeLeon, type CaraLeon } from "../components/Leon";
import { Escudo, Llama, Moneda, Pantalla } from "../components/Navegacion";
import { ApoyaAlCreador, INSTAGRAM_URL } from "../components/ApoyaAlCreador";
import { useEsAdministrador } from "../lib/apoyo";
import { metricas } from "../lib/metricas";
import { PonEnInicio } from "../components/PonEnInicio";
import { Ventana } from "../components/Ventana";
import { actualizar, rachaVigente, reiniciarTodo, useEstado } from "../lib/estado";
import { hoy } from "../lib/fechas";
import { ponerClave, salir, useCuenta } from "../lib/nube";
import { navegar, reemplazar } from "../lib/rutas";
import { sonidos } from "../lib/sonidos";

const VENDOE_URL = "https://www.vendoe.es/";

const ANIMOS: { valor: number; texto: string; cara: CaraLeon; respuesta: string }[] = [
  { valor: 5, texto: "Muy bien", cara: "guino", respuesta: "¡Qué bueno! Aprovechemos esa energía." },
  { valor: 4, texto: "Bien", cara: "feliz", respuesta: "Buen día para avanzar un poco." },
  { valor: 3, texto: "Más o menos", cara: "lentes", respuesta: "Gracias por contarme. Vamos a tu ritmo." },
  { valor: 2, texto: "Con sueño", cara: "tierno", respuesta: "Una lección corta y a descansar. Dormir también es estudiar." },
  { valor: 1, texto: "Mal", cara: "sorpresa", respuesta: "Gracias por contármelo. Hablar con alguien ayuda mucho." },
];

const MISIONES = [
  { id: "compartir", texto: "Comparte un logro", premio: 20 },
  { id: "invitar", texto: "Invita a alguien a estudiar", premio: 40 },
  { id: "opinar", texto: "Danos tu opinión", premio: 30 },
];

function Bloque({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="rounded-tarjeta border-2 border-surface bg-card p-4">
      <h2 className="mb-3 text-tarjeta font-extrabold">{titulo}</h2>
      {children}
    </section>
  );
}

export default function Perfil() {
  const e = useEstado();
  const aviso = useAviso();
  const cuenta = useCuenta();
  const esAdmin = useEsAdministrador();
  const [ayuda, setAyuda] = useState(false);
  const [opinion, setOpinion] = useState(false);
  const [textoOpinion, setTextoOpinion] = useState("");
  const [permiso, setPermiso] = useState(false);
  const [borrar, setBorrar] = useState(false);
  const [claveAbierta, setClaveAbierta] = useState(false);
  const [clave, setClave] = useState("");
  const [claveError, setClaveError] = useState<string | null>(null);
  const animoHoy = e.animo.find((a) => a.dia === hoy());
  const precision = e.totales.respuestas ? Math.round((100 * e.totales.aciertos) / e.totales.respuestas) : 0;

  function premiar(id: string, premio: number) {
    if (e.misiones[id]) return;
    actualizar((s) => ({ misiones: { ...s.misiones, [id]: true }, monedas: s.monedas + premio }));
    void ganarMonedas(`mision:${id}`, 0, `mision-${id}`);
    sonidos.acierto();
    aviso(`¡Gracias! +${premio} monedas.`, "premio");
  }

  async function compartir(id: string, texto: string, premio: number) {
    try {
      if (navigator.share) await navigator.share({ title: "Auxi Student", text: texto, url: location.origin + "/student" });
      else await navigator.clipboard.writeText(`${texto} ${location.origin}/student`);
      if (id === "invitar") metricas.invitacion("compartir");
      premiar(id, premio);
    } catch {
      // Cerró el menú sin compartir: la misión queda disponible.
    }
  }

  function hacerMision(id: string, premio: number) {
    if (id === "compartir") compartir(id, `Llevo ${rachaVigente(e)} días de racha estudiando con León en Auxi Student.`, premio);
    if (id === "invitar") compartir(id, "Estudia jugando conmigo en Auxi Student. Es gratis.", premio);
    if (id === "opinar") setOpinion(true);
    if (id === "instagram") {
      window.open(INSTAGRAM_URL, "_blank", "noopener");
      premiar(id, premio);
    }
  }

  return (
    <Pantalla titulo="Perfil">
      <div className="flex items-center gap-4">
        <CaraDeLeon cara="feliz" tamano={72} />
        <div>
          <p className="text-tarjeta font-extrabold">Estudiante de Auxi</p>
          <p className="text-ayuda break-all text-text-soft">
            {cuenta.modo === "conectado" ? cuenta.email : "Tu avance se guarda en este celular."}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => navegar("/student/monedas")}
        className="flex min-h-14 cursor-pointer items-center justify-between rounded-tarjeta border-2 border-surface bg-card px-4 text-left"
      >
        <span>
          <span className="block font-extrabold">En qué usar tus monedas</span>
          <span className="block text-ayuda text-text-soft">Más temas, pase libre y protectores</span>
        </span>
        <span className="font-extrabold text-brand">Ver</span>
      </button>

      <div className="grid grid-cols-3 gap-3">
        {[
          { t: "Racha", v: rachaVigente(e), i: <Llama activa={rachaVigente(e) > 0} /> },
          { t: "Monedas", v: e.monedas, i: <Moneda /> },
          { t: "Protectores", v: e.racha.protectores, i: <Escudo /> },
        ].map((x) => (
          <div key={x.t} className="flex flex-col items-center gap-1 rounded-tarjeta bg-surface py-3">
            {x.i}
            <span className="numeros text-[22px] font-black">{x.v}</span>
            <span className="text-ayuda font-bold text-text-soft">{x.t}</span>
          </div>
        ))}
      </div>

      <Bloque titulo="Tus números">
        <ul className="flex flex-col gap-2 font-bold">
          <li className="flex justify-between"><span>Lecciones terminadas</span><span className="numeros">{e.totales.lecciones}</span></li>
          <li className="flex justify-between"><span>Precisión</span><span className="numeros">{precision} %</span></li>
          <li className="flex justify-between"><span>Minutos estudiando</span><span className="numeros">{e.totales.minutos}</span></li>
        </ul>
      </Bloque>

      <Bloque titulo="¿Cómo te sientes hoy?">
        <div className="grid grid-cols-5 gap-1">
          {ANIMOS.map((a) => (
            <motion.button
              key={a.valor}
              type="button"
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                sonidos.toque();
                actualizar((s) => ({ animo: [...s.animo.filter((x) => x.dia !== hoy()), { dia: hoy(), valor: a.valor }].slice(-60) }));
              }}
              aria-pressed={animoHoy?.valor === a.valor}
              className={`flex cursor-pointer flex-col items-center gap-1 rounded-[12px] border-2 py-2 ${animoHoy?.valor === a.valor ? "border-brand bg-surface" : "border-transparent"}`}
            >
              <CaraDeLeon cara={a.cara} tamano={44} />
              <span className="text-[12px] leading-4 font-extrabold">{a.texto}</span>
            </motion.button>
          ))}
        </div>
        {animoHoy && (
          <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-3 font-bold">
            {ANIMOS.find((a) => a.valor === animoHoy.valor)?.respuesta}
          </motion.p>
        )}
        <button
          type="button"
          onClick={() => setAyuda(true)}
          className={`mt-3 flex min-h-12 w-full cursor-pointer items-center justify-center rounded-boton border-2 px-3 font-extrabold ${animoHoy && animoHoy.valor <= 2 ? "border-brand bg-brand text-white" : "border-surface text-brand"}`}
        >
          ¿Necesitas hablar con alguien?
        </button>
      </Bloque>

      <section className="rounded-tarjeta bg-brand p-4 text-white" style={{ boxShadow: "0 4px 0 var(--brand-dark)" }}>
        <h2 className="text-tarjeta font-extrabold">Camino al pase libre</h2>
        <p className="mt-1 text-ayuda font-semibold opacity-90">
          {e.pasePorVida ? "Ya tienes el pase libre de por vida." : "Apoya a @soydanielchong y estudia sin límite de temas, para siempre. Lo revisamos a mano."}
        </p>
        <div className="mt-3">
          <Boton variante="secundario" onClick={() => navegar("/student/apoyo")}>
            {e.pasePorVida ? "Ver mi pase" : "Empezar"}
          </Boton>
        </div>
        {esAdmin && (
          <button type="button" onClick={() => navegar("/student/revision")} className="mt-1 h-11 w-full cursor-pointer font-extrabold underline underline-offset-4">
            Panel de revisión
          </button>
        )}
      </section>

      <Bloque titulo="Misiones de apoyo">
        <p className="mb-3 text-ayuda text-text-soft">Son opcionales y nunca bloquean nada. Si quieres ayudarnos, te damos monedas.</p>
        <ul className="flex flex-col gap-2">
          {MISIONES.map((m) => {
            const hecha = !!e.misiones[m.id];
            return (
              <li key={m.id} className="flex items-center gap-3 rounded-boton bg-surface px-3 py-2">
                <span className="flex-1 font-bold">{m.texto}</span>
                <span className="flex items-center gap-1 text-ayuda font-black">
                  <Moneda className="size-4" />+{m.premio}
                </span>
                <button
                  type="button"
                  disabled={hecha}
                  onClick={() => hacerMision(m.id, m.premio)}
                  className="h-11 min-w-20 cursor-pointer rounded-[10px] bg-card px-3 text-[15px] font-extrabold text-brand disabled:cursor-default disabled:text-text-soft"
                >
                  {hecha ? "Hecha" : "Hacer"}
                </button>
              </li>
            );
          })}
        </ul>
      </Bloque>

      <button
        type="button"
        onClick={() => navegar("/student/ayuda")}
        className="flex min-h-16 cursor-pointer items-center gap-3 rounded-tarjeta border-2 border-surface bg-card px-4 py-3 text-left"
      >
        <CaraDeLeon cara="feliz" tamano={44} />
        <span className="flex-1">
          <span className="block font-extrabold">Atención al cliente</span>
          <span className="block text-ayuda text-text-soft">Reporta una falla o escríbenos por WhatsApp</span>
        </span>
        <span className="font-extrabold text-brand">Abrir</span>
      </button>

      <Bloque titulo="Ajustes">
        <button
          type="button"
          onClick={() => navegar("/student/cuenta?volver=/student/perfil")}
          className="mb-2 flex min-h-12 w-full cursor-pointer items-center justify-between gap-3 text-left"
        >
          <span>
            <span className="block font-bold">Cuenta</span>
            <span className="block text-ayuda text-text-soft">
              {cuenta.modo === "conectado" ? (cuenta.guardando ? "Guardando…" : "Todo guardado") : "Crea tu cuenta para no perder tu avance"}
            </span>
          </span>
          <span className="font-extrabold text-brand">{cuenta.modo === "conectado" ? "Ver" : "Crear"}</span>
        </button>
        <AjustesDeSonido />
        <div className="mt-3 flex min-h-11 items-center justify-between">
          <span className="font-bold">Avisos de entregas</span>
          <span className="text-ayuda font-bold text-text-soft">Muy pronto</span>
        </div>
        <button type="button" onClick={() => navegar("/student/tour")} className="flex min-h-11 w-full cursor-pointer items-center justify-between font-bold text-left">
          Ver la guía de Auxi otra vez
          <span className="text-ayuda font-extrabold text-brand">Ver</span>
        </button>
        <PonEnInicio nombre="Auxi Student" />
        <ApoyaAlCreador />
        {cuenta.modo === "conectado" && (
          <button type="button" onClick={() => setClaveAbierta(true)} className="flex min-h-11 w-full cursor-pointer items-center justify-between font-bold text-left">
            Crear o cambiar mi contraseña
            <span className="text-ayuda font-extrabold text-brand">Abrir</span>
          </button>
        )}
        {cuenta.modo === "conectado" && (
          <button
            type="button"
            onClick={async () => {
              await salir();
              reemplazar("/student");
            }}
            className="mt-3 h-12 w-full cursor-pointer rounded-boton border-2 border-error font-extrabold text-error"
          >
            Cerrar sesión
          </button>
        )}
        <button type="button" onClick={() => setBorrar(true)} className="mt-2 h-11 cursor-pointer font-extrabold text-error">
          Borrar mi avance de este celular
        </button>
        <BorrarCuenta />
      </Bloque>

      <button
        type="button"
        onClick={() => navegar("/")}
        className="flex min-h-14 cursor-pointer items-center justify-between rounded-tarjeta border-2 border-surface bg-card px-4 text-left"
      >
        <span>
          <span className="block font-extrabold">Todas mis mini apps</span>
          <span className="block text-ayuda text-text-soft">Vuelve a Auxi Studio para elegir otra</span>
        </span>
        <span className="font-extrabold text-brand">Abrir</span>
      </button>

      <section className="flex items-center gap-4 rounded-tarjeta bg-surface p-4">
        <img src="/brand/vendoe.svg" alt="Vendoe" className="h-10 w-auto" />
        <div className="flex-1">
          <p className="font-extrabold">¿Tienes un negocio?</p>
          <p className="text-ayuda text-text-soft">Conoce Vendoe, la app para vender más.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            metricas.clicVendoe("perfil");
            window.open(VENDOE_URL, "_blank", "noopener");
          }}
          className="h-11 cursor-pointer rounded-[10px] bg-card px-3 font-extrabold text-negocio"
        >
          Ver
        </button>
      </section>

      <Ventana abierta={ayuda} alCerrar={() => setAyuda(false)} titulo="Hablar con alguien">
        <p className="text-text-soft">León te acompaña, pero no reemplaza a un profesional. Si lo necesitas, aquí te escuchan gratis:</p>
        <div className="mt-4 flex flex-col gap-3">
          <a href="tel:113" className="flex min-h-14 items-center justify-between rounded-boton bg-surface px-4 font-extrabold">
            <span>
              Línea 113, opción 5
              <span className="block text-ayuda font-bold text-text-soft">Salud mental, Minsa. Gratis.</span>
            </span>
            <span className="text-brand">Llamar</span>
          </a>
          <a href="tel:106" className="flex min-h-14 items-center justify-between rounded-boton bg-surface px-4 font-extrabold">
            <span>
              106 · SAMU
              <span className="block text-ayuda font-bold text-text-soft">Si es una emergencia.</span>
            </span>
            <span className="text-brand">Llamar</span>
          </a>
        </div>
      </Ventana>

      <Ventana abierta={opinion} alCerrar={() => setOpinion(false)} titulo="Tu opinión">
        <p className="text-text-soft">Lo bueno y lo malo nos sirve igual. El premio es el mismo.</p>
        <textarea
          value={textoOpinion}
          onChange={(ev) => setTextoOpinion(ev.target.value)}
          className="mt-3 h-32 w-full resize-none rounded-boton border-2 border-surface bg-card p-3 font-semibold outline-none focus:border-brand"
          aria-label="Tu opinión"
        />
        <label className="mt-3 flex min-h-11 cursor-pointer items-center gap-3 font-bold">
          <input type="checkbox" checked={permiso} onChange={(ev) => setPermiso(ev.target.checked)} className="size-5 accent-[var(--brand)]" />
          Pueden publicar mi opinión
        </label>
        <div className="mt-4">
          <Boton
            deshabilitado={textoOpinion.trim().length < 5}
            onClick={() => {
              setOpinion(false);
              setTextoOpinion("");
              premiar("opinar", 30);
            }}
          >
            Enviar opinión
          </Boton>
        </div>
      </Ventana>

      <Ventana abierta={claveAbierta} alCerrar={() => setClaveAbierta(false)} titulo="Tu contraseña">
        <p className="text-text-soft">Con una contraseña entras con tu correo sin esperar un código.</p>
        <input
          type="password"
          autoComplete="new-password"
          value={clave}
          onChange={(ev) => setClave(ev.target.value)}
          placeholder="Mínimo 8 caracteres"
          className="mt-3 h-14 w-full rounded-boton border-2 border-surface bg-card px-4 text-[17px] font-semibold text-text outline-none focus:border-brand"
        />
        {claveError && <p role="alert" className="mt-2 font-bold text-error-dark">{claveError}</p>}
        <div className="mt-4">
          <Boton
            deshabilitado={clave.length < 8}
            onClick={async () => {
              const r = await ponerClave(clave);
              if (r) return setClaveError(r);
              setClave("");
              setClaveError(null);
              setClaveAbierta(false);
              aviso("Contraseña guardada.", "exito");
            }}
          >
            Guardar contraseña
          </Boton>
        </div>
      </Ventana>

      <Ventana abierta={borrar} alCerrar={() => setBorrar(false)} titulo="¿Borrar tu avance?">
        <p className="text-text-soft">Se borran tu racha, monedas y lecciones de este celular. No se puede deshacer.</p>
        <div className="mt-5 flex flex-col gap-3">
          <Boton variante="secundario" onClick={() => setBorrar(false)}>
            Mejor no
          </Boton>
          <button
            type="button"
            onClick={() => {
              reiniciarTodo();
              reemplazar("/student");
            }}
            className="h-12 cursor-pointer font-extrabold text-error"
          >
            Sí, borrar todo
          </button>
        </div>
      </Ventana>
    </Pantalla>
  );
}
