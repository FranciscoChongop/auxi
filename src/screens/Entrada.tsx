import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Boton } from "../components/Boton";
import { CaraDeLeon } from "../components/Leon";
import { errorDeEntrada, crearCuentaConClave, entrarConClave, entrarConGoogle, pedirCodigo, verificarCodigo } from "../lib/nube";
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

/** Se muestra el botón de Google cuando ya está activado en Supabase (se apaga con VITE_GOOGLE_ACTIVO=no). */
const GOOGLE_ACTIVO = import.meta.env.VITE_GOOGLE_ACTIVO !== "no";

const correoValido = (c: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(c.trim());
const campo =
  "mt-1 h-14 w-full rounded-boton border-2 border-surface bg-card px-4 text-[17px] font-semibold text-text outline-none placeholder:text-text-soft focus:border-brand";

type Modo = "entrar" | "crear" | "codigo" | "codigo-enviado" | "confirmar";

/** Puerta de Auxi: hay que iniciar sesión o crear la cuenta (gratis) para entrar. */
export default function Entrada() {
  const [modo, setModo] = useState<Modo>("entrar");
  const [email, setEmail] = useState("");
  const [clave, setClave] = useState("");
  const [ver, setVer] = useState(false);
  const [codigo, setCodigo] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [espera, setEspera] = useState(0);
  const [nota, setNota] = useState<string | null>(null);
  const [errorGoogle] = useState(() => errorDeEntrada());
  const entradaCodigo = useRef<HTMLInputElement>(null);
  const correo = email.trim().toLowerCase();

  useEffect(() => {
    if (espera <= 0) return;
    const t = setTimeout(() => setEspera((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [espera]);

  const cambiarModo = (m: Modo) => {
    setModo(m);
    setNota(null);
    setError(null);
    setCodigo("");
  };

  async function correr(accion: () => Promise<string | null>, alTerminar?: (r: string | null) => void) {
    setOcupado(true);
    setError(null);
    const r = await accion();
    setOcupado(false);
    if (alTerminar) return alTerminar(r);
    if (r) {
      sonidos.error();
      setError(r);
    }
  }

  const entrar = () => correr(() => entrarConClave(correo, clave));
  const crear = () =>
    correr(
      () => crearCuentaConClave(correo, clave),
      async (r) => {
        if (r !== "confirmar" && r !== "existe") {
          if (r) {
            sonidos.error();
            setError(r);
          }
          return;
        }
        // La cuenta se confirma con un código de números que llega al correo.
        setOcupado(true);
        const e = await pedirCodigo(correo);
        setOcupado(false);
        if (e) return setError(e);
        setNota(r === "existe" ? "Ese correo ya tenía cuenta. Con este código entras." : "Para activar tu cuenta, escribe el código que te enviamos.");
        setModo("codigo-enviado");
        setEspera(60);
        setTimeout(() => entradaCodigo.current?.focus(), 250);
      },
    );
  const enviarCodigo = () =>
    correr(
      () => pedirCodigo(correo),
      (r) => {
        if (r) return setError(r);
        setModo("codigo-enviado");
        setEspera(60);
        setTimeout(() => entradaCodigo.current?.focus(), 250);
      },
    );
  const verificar = () => correr(() => verificarCodigo(correo, codigo));
  const google = async () => {
    setError(null);
    const e = await entrarConGoogle();
    if (e) setError(e);
  };

  const conClave = modo === "entrar" || modo === "crear";
  const claveOk = clave.length >= (modo === "crear" ? 8 : 1);
  const puedeEnviar = correoValido(email) && claveOk && !ocupado;

  return (
    <main
      className="mx-auto flex min-h-dvh max-w-md flex-col gap-5 px-5"
      style={{ paddingTop: "calc(env(safe-area-inset-top) + 24px)", paddingBottom: "calc(env(safe-area-inset-bottom) + 20px)" }}
    >
      <div className="flex items-center gap-3">
        <CaraDeLeon cara="guino" tamano={64} />
        <div>
          <h1 className="text-[26px] leading-tight font-black">Auxi Studio</h1>
          <p className="font-bold text-text-soft">Entra a tu cuenta. Es gratis.</p>
        </div>
      </div>

      {modo === "confirmar" && (
        <div className="flex flex-col gap-4">
          <div className="rounded-tarjeta bg-surface p-4 text-center">
            <p className="text-tarjeta font-extrabold">Revisa tu correo</p>
            <p className="mt-1">
              Te enviamos un enlace a <span className="font-extrabold break-all">{correo}</span>. Ábrelo para activar tu cuenta y luego entra aquí.
            </p>
          </div>
          <Boton onClick={() => cambiarModo("entrar")}>Ya lo abrí, entrar</Boton>
        </div>
      )}

      {conClave && (
        <motion.div key={modo} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4">
          <div role="tablist" className="grid grid-cols-2 gap-1 rounded-boton bg-surface p-1">
            {(["entrar", "crear"] as const).map((m) => (
              <button
                key={m}
                type="button"
                role="tab"
                aria-selected={modo === m}
                onClick={() => cambiarModo(m)}
                className={`h-11 cursor-pointer rounded-boton font-extrabold ${modo === m ? "bg-card text-brand" : "text-text-soft"}`}
              >
                {m === "entrar" ? "Entrar" : "Crear cuenta"}
              </button>
            ))}
          </div>

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

          <form
            className="flex flex-col gap-4"
            onSubmit={(ev) => {
              ev.preventDefault();
              if (puedeEnviar) void (modo === "crear" ? crear() : entrar());
            }}
          >
            <label className="block font-bold">
              Tu correo
              <input type="email" inputMode="email" autoComplete="email" value={email} onChange={(ev) => setEmail(ev.target.value)} placeholder="nombre@correo.com" className={campo} />
            </label>
            <label className="block font-bold">
              Tu contraseña
              <span className="relative block">
                <input
                  type={ver ? "text" : "password"}
                  autoComplete={modo === "crear" ? "new-password" : "current-password"}
                  value={clave}
                  onChange={(ev) => setClave(ev.target.value)}
                  placeholder={modo === "crear" ? "Mínimo 8 caracteres" : "Tu contraseña"}
                  className={`${campo} pr-24`}
                />
                <button
                  type="button"
                  onClick={() => setVer((v) => !v)}
                  aria-pressed={ver}
                  className="absolute top-2.5 right-2 h-11 min-w-11 cursor-pointer px-2 font-extrabold text-brand"
                >
                  {ver ? "Ocultar" : "Ver"}
                </button>
              </span>
            </label>
            <Boton tipo="submit" deshabilitado={!puedeEnviar}>
              {ocupado ? "Un momento…" : modo === "crear" ? "Crear mi cuenta" : "Entrar"}
            </Boton>
          </form>

          <button type="button" onClick={() => cambiarModo("codigo")} className="h-11 cursor-pointer font-extrabold text-brand">
            {modo === "entrar" ? "Olvidé mi contraseña" : "Prefiero entrar con un código al correo"}
          </button>
        </motion.div>
      )}

      {modo === "codigo" && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4">
          <p className="font-bold">Te enviamos un código de números a tu correo. Con él entras sin contraseña.</p>
          <label className="block font-bold">
            Tu correo
            <input type="email" inputMode="email" autoComplete="email" value={email} onChange={(ev) => setEmail(ev.target.value)} placeholder="nombre@correo.com" className={campo} />
          </label>
          <Boton deshabilitado={!correoValido(email) || ocupado} onClick={enviarCodigo}>
            {ocupado ? "Enviando…" : "Enviarme un código"}
          </Boton>
          <button type="button" onClick={() => cambiarModo("entrar")} className="h-11 cursor-pointer font-extrabold text-brand">
            Volver
          </button>
        </motion.div>
      )}

      {modo === "codigo-enviado" && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4">
          <div className="rounded-tarjeta bg-surface p-4 text-center">
            <p className="text-tarjeta font-extrabold">Revisa tu correo</p>
            <p className="mt-1">
              Te envié un código de números a <span className="font-extrabold break-all">{correo}</span>. Mira también en spam.
            </p>
            {nota && <p className="mt-2 font-bold text-brand">{nota}</p>}
          </div>
          <input
            ref={entradaCodigo}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={8}
            value={codigo}
            onChange={(ev) => setCodigo(ev.target.value.replace(/\D/g, ""))}
            onKeyDown={(ev) => ev.key === "Enter" && codigo.length >= 6 && !ocupado && verificar()}
            aria-label="Código de números"
            placeholder="••••••"
            className="numeros h-16 w-full rounded-boton border-2 border-surface bg-card text-center text-[30px] font-black tracking-[0.4em] text-text outline-none placeholder:text-surface focus:border-brand"
          />
          <Boton deshabilitado={codigo.length < 6 || ocupado} onClick={verificar}>
            {ocupado ? "Revisando…" : "Entrar"}
          </Boton>
          <div className="flex justify-between">
            <button type="button" onClick={() => cambiarModo("codigo")} className="h-11 cursor-pointer font-extrabold text-brand">
              Cambiar correo
            </button>
            <button type="button" disabled={espera > 0 || ocupado} onClick={enviarCodigo} className="h-11 cursor-pointer font-extrabold text-brand disabled:text-text-soft">
              {espera > 0 ? `Reenviar en ${espera} s` : "Reenviar código"}
            </button>
          </div>
        </motion.div>
      )}

      {errorGoogle && !error && (
        <p role="alert" className="rounded-boton border-2 border-error bg-card px-4 py-3 font-bold text-error-dark">
          No se pudo entrar con Google. Prueba de nuevo o usa tu correo. ({errorGoogle.slice(0, 80)})
        </p>
      )}

      {error && (
        <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} role="alert" className="rounded-boton border-2 border-error bg-card px-4 py-3 font-bold text-error-dark">
          {error}
        </motion.p>
      )}

      <p className="mt-auto text-center text-ayuda text-text-soft">Con tu cuenta tu avance y tu racha se guardan y los llevas a cualquier celular. Nunca publicamos nada sin tu permiso.</p>
    </main>
  );
}
