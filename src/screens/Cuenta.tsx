import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useAviso } from "../components/Aviso";
import { Boton } from "../components/Boton";
import { CaraDeLeon, Leon } from "../components/Leon";
import { Pantalla } from "../components/Navegacion";
import { lanzarConfeti } from "../lib/confeti";
import { entrarConGoogle, pedirCodigo, salir, useCuenta, verificarCodigo } from "../lib/nube";
import { parametro, reemplazar } from "../lib/rutas";
import { sonidos } from "../lib/sonidos";

function LogoGoogle() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
      <path fill="#4285F4" d="M22.5 12.3c0-.8-.1-1.5-.2-2.2H12v4.2h5.9a5 5 0 0 1-2.2 3.3v2.7h3.5c2.1-1.9 3.3-4.7 3.3-8Z" />
      <path fill="#34A853" d="M12 23c3 0 5.5-1 7.3-2.7l-3.5-2.7c-1 .7-2.3 1.1-3.8 1.1-2.9 0-5.4-2-6.3-4.6H2.1v2.8A11 11 0 0 0 12 23Z" />
      <path fill="#FBBC05" d="M5.7 14.1a6.6 6.6 0 0 1 0-4.2V7.1H2.1a11 11 0 0 0 0 9.8l3.6-2.8Z" />
      <path fill="#EA4335" d="M12 5.4c1.6 0 3.1.6 4.2 1.7l3.1-3.1A11 11 0 0 0 2.1 7.1l3.6 2.8C6.6 7.4 9.1 5.4 12 5.4Z" />
    </svg>
  );
}

/** Se muestra solo cuando Google ya está activado en Supabase (VITE_GOOGLE_ACTIVO=si). */
const GOOGLE_ACTIVO = import.meta.env.VITE_GOOGLE_ACTIVO === "si";

const correoValido = (c: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(c.trim());

export default function Cuenta() {
  const cuenta = useCuenta();
  const aviso = useAviso();
  const [volver] = useState(() => parametro("volver") ?? "/studio/inicio");
  const [paso, setPaso] = useState<"correo" | "codigo">("correo");
  const [email, setEmail] = useState("");
  const [codigo, setCodigo] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [espera, setEspera] = useState(0);
  const entradaCodigo = useRef<HTMLInputElement>(null);
  const yaCelebrado = useRef(cuenta.modo === "conectado");

  // Cuando la sesión se abre (código o vuelta desde Google), celebramos una vez.
  useEffect(() => {
    if (cuenta.modo === "conectado" && !yaCelebrado.current) {
      yaCelebrado.current = true;
      sonidos.acierto();
      void lanzarConfeti();
      aviso("¡Listo! Tu avance está guardado en tu cuenta.", "exito");
    }
  }, [cuenta.modo, aviso]);

  useEffect(() => {
    if (espera <= 0) return;
    const t = setTimeout(() => setEspera((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [espera]);

  async function enviar() {
    setEnviando(true);
    setError(null);
    const e = await pedirCodigo(email.trim().toLowerCase());
    setEnviando(false);
    if (e) return setError(e);
    setPaso("codigo");
    setEspera(60);
  }

  async function entrar() {
    setEnviando(true);
    setError(null);
    const e = await verificarCodigo(email.trim().toLowerCase(), codigo);
    setEnviando(false);
    if (e) {
      sonidos.error();
      setError(e);
    }
  }

  async function google() {
    setError(null);
    const e = await entrarConGoogle();
    if (e) setError(e);
  }

  if (cuenta.modo === "sin-nube") {
    return (
      <Pantalla titulo="Tu cuenta" atras={volver} conBarra={false}>
        <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
          <Leon pose="anima" alto={200} rebote />
          <p className="text-tarjeta font-extrabold">Las cuentas llegan muy pronto</p>
          <p className="text-text-soft">Mientras, tu avance se guarda en este celular.</p>
        </div>
        <Boton onClick={() => reemplazar(volver)}>Seguir</Boton>
      </Pantalla>
    );
  }

  if (cuenta.modo === "conectado") {
    return (
      <Pantalla titulo="Tu cuenta" atras={volver} conBarra={false}>
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
          <Leon pose="celebra" alto={200} rebote />
          <p className="text-tarjeta font-extrabold">Tu avance está a salvo</p>
          <p className="font-bold break-all text-text-soft">{cuenta.email}</p>
          <p className="flex items-center gap-2 text-ayuda font-bold text-text-soft" aria-live="polite">
            <span className={`size-2 rounded-full ${cuenta.error ? "bg-error" : cuenta.guardando ? "bg-reward" : "bg-success-dark"}`} />
            {cuenta.error ?? (cuenta.guardando ? "Guardando…" : "Todo guardado en tu cuenta")}
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <Boton onClick={() => reemplazar(volver)}>Seguir estudiando</Boton>
          <button
            type="button"
            onClick={async () => {
              await salir();
              reemplazar("/studio");
            }}
            className="h-11 cursor-pointer font-extrabold text-error"
          >
            Cerrar sesión en este celular
          </button>
        </div>
      </Pantalla>
    );
  }

  return (
    <Pantalla titulo="Guarda tu avance" atras={volver} conBarra={false}>
      <div className="flex items-center gap-3">
        <CaraDeLeon cara="guino" tamano={56} />
        <p className="font-bold">Crea tu cuenta gratis o entra. Así no pierdes tu racha si cambias de celular.</p>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {paso === "correo" ? (
          <motion.div key="correo" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} className="flex flex-col gap-4">
            {GOOGLE_ACTIVO && (
              <>
                <Boton variante="secundario" onClick={google}>
                  <span className="flex items-center justify-center gap-3 text-text">
                    <LogoGoogle /> Seguir con Google
                  </span>
                </Boton>
                <div className="flex items-center gap-3 text-ayuda font-bold text-text-soft" aria-hidden="true">
                  <span className="h-0.5 flex-1 bg-surface" /> o con tu correo <span className="h-0.5 flex-1 bg-surface" />
                </div>
              </>
            )}
            <label className="block font-bold">
              Tu correo
              <input
                type="email"
                inputMode="email"
                autoComplete="email"
                value={email}
                onChange={(ev) => setEmail(ev.target.value)}
                onKeyDown={(ev) => ev.key === "Enter" && correoValido(email) && !enviando && enviar()}
                placeholder="nombre@correo.com"
                className="mt-1 h-14 w-full rounded-boton border-2 border-surface bg-card px-4 text-[17px] font-semibold text-text outline-none placeholder:text-text-soft focus:border-brand"
              />
            </label>
            <Boton deshabilitado={!correoValido(email) || enviando} onClick={enviar}>
              {enviando ? "Enviando…" : "Enviarme el acceso"}
            </Boton>
            <p className="text-center text-ayuda text-text-soft">Te llega un correo para entrar. Sin contraseñas.</p>
          </motion.div>
        ) : (
          <motion.div key="codigo" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} className="flex flex-col gap-4">
            <div className="flex flex-col items-center gap-3 rounded-tarjeta bg-surface p-5 text-center">
              <motion.svg viewBox="0 0 24 24" className="size-14 text-brand" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 1.6 }} aria-hidden="true">
                <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="5.5" width="18" height="13" rx="2.5" />
                  <path d="M3.5 7l8.5 6 8.5-6" />
                </g>
              </motion.svg>
              <p className="text-tarjeta font-extrabold">Revisa tu correo</p>
              <p>
                Te envié un correo a <span className="font-extrabold break-all">{email}</span>. Ábrelo en este celular y toca{" "}
                <span className="font-extrabold">«Sign in»</span>.
              </p>
              <p className="text-ayuda text-text-soft">Si no lo ves en un minuto, revisa spam o promociones.</p>
            </div>
            <details className="rounded-tarjeta border-2 border-surface bg-card p-3">
              <summary className="flex min-h-11 cursor-pointer items-center font-extrabold text-brand">¿Te llegó un código de números?</summary>
              <div className="mt-2 flex flex-col gap-3">
                <input
                  ref={entradaCodigo}
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={8}
                  value={codigo}
                  onChange={(ev) => setCodigo(ev.target.value.replace(/\D/g, ""))}
                  onKeyDown={(ev) => ev.key === "Enter" && codigo.length >= 6 && !enviando && entrar()}
                  aria-label="Código de números"
                  placeholder="••••••"
                  className="numeros h-16 w-full rounded-boton border-2 border-surface bg-card text-center text-[30px] font-black tracking-[0.4em] text-text outline-none placeholder:text-surface focus:border-brand"
                />
                <Boton deshabilitado={codigo.length < 6 || enviando} onClick={entrar}>
                  {enviando ? "Revisando…" : "Entrar con el código"}
                </Boton>
              </div>
            </details>
            <div className="flex justify-between">
              <button type="button" onClick={() => { setPaso("correo"); setCodigo(""); setError(null); }} className="h-11 cursor-pointer font-extrabold text-brand">
                Cambiar correo
              </button>
              <button type="button" disabled={espera > 0 || enviando} onClick={enviar} className="h-11 cursor-pointer font-extrabold text-brand disabled:text-text-soft">
                {espera > 0 ? `Reenviar en ${espera} s` : "Reenviar correo"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} role="alert" className="rounded-boton border-2 border-error bg-card px-4 py-3 font-bold text-error-dark">
          {error}
        </motion.p>
      )}

      <p className="mt-auto text-center text-ayuda text-text-soft">Solo usamos tu correo para tu cuenta. Nunca publicamos nada sin tu permiso.</p>
    </Pantalla>
  );
}
