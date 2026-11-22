import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Boton } from "../../components/Boton";
import { Ventana } from "../../components/Ventana";
import { bonita, hoy, sumarDias } from "../../lib/fechas";
import { parametro, reemplazar } from "../../lib/rutas";
import { sonidos } from "../../lib/sonidos";
import { CATEGORIAS_GASTO, CATEGORIAS_INGRESO } from "../entender";
import { actualizarVida, nuevoId, obtenerVida, soles, useVida, type FuenteImportacion, type Importacion } from "../estado";
import { conectarGmail, desconectarGmail, escucharRegresoDeGoogle, GMAIL_DISPONIBLE, sincronizarGmail, tienePermisoVigente } from "../importar/gmail";
import {
  borrarImportadosDe,
  deshacerImportacion,
  FallaImportar,
  FORMATOS,
  FORMATOS_VERSION,
  guardarImportacion,
  listoParaGuardar,
  MENSAJE_ERROR,
  NOMBRE_FUENTE,
  procesarArchivo,
  procesarTexto,
  type ErrorImportar,
} from "../importar/importar";
import { sugerirCategoria, type Candidato, type Clase } from "../importar/leer";
import { aNumero, avisoDeshacer, CampoSoles, Chip, campoTexto, Encabezado, GrupoUnico, LeonVida, Pagina, PieFijo } from "../ui";

type Modo = { tipo: "inicio" } | { tipo: "texto" } | { tipo: "procesando"; etapa: string } | { tipo: "error"; error: ErrorImportar } | { tipo: "vista"; candidatos: Candidato[]; fuente: FuenteImportacion; detalle: string } | { tipo: "listo"; imp: Importacion; primera: boolean };

const OCR_OK = "auxi.vida.ocrAceptado";
const ocrAceptado = () => {
  try {
    return localStorage.getItem(OCR_OK) === "1";
  } catch {
    return false;
  }
};

export default function Importar() {
  const e = useVida();
  const [modo, setModo] = useState<Modo>(parametro("fuente") === "texto" ? { tipo: "texto" } : { tipo: "inicio" });
  const [presentar] = useState(() => !obtenerVida().importarVisto);
  const [pedirOcr, setPedirOcr] = useState<File | null>(null);
  const [verGmail, setVerGmail] = useState(parametro("fuente") === "gmail");
  const entradaReporte = useRef<HTMLInputElement>(null);
  const entradaComprobante = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (presentar) actualizarVida(() => ({ importarVisto: true }));
    if (GMAIL_DISPONIBLE) escucharRegresoDeGoogle();
  }, [presentar]);

  // Abrir directo el selector si se llegó desde una sugerencia.
  useEffect(() => {
    if (parametro("fuente") === "comprobante") setTimeout(() => entradaComprobante.current?.click(), 350);
  }, []);

  const procesar = async (archivo: File) => {
    if (archivo.type.startsWith("image/") && !ocrAceptado()) {
      setPedirOcr(archivo);
      return;
    }
    setModo({ tipo: "procesando", etapa: "Leyendo archivo" });
    try {
      const r = await procesarArchivo(archivo, (etapa) => setModo({ tipo: "procesando", etapa }));
      setModo({ tipo: "vista", candidatos: r.candidatos, fuente: r.fuente, detalle: archivo.name.slice(0, 40) });
    } catch (err) {
      sonidos.error();
      setModo({ tipo: "error", error: err instanceof FallaImportar ? err.tipo : "lectura" });
    }
  };

  const elegir = (lista: FileList | null) => {
    const f = lista?.[0];
    if (f) void procesar(f);
  };

  if (modo.tipo === "procesando") return <Procesando etapa={modo.etapa} />;
  if (modo.tipo === "error") return <ErrorEstado error={modo.error} alVolver={() => setModo({ tipo: "inicio" })} alPegar={() => setModo({ tipo: "texto" })} alReconectar={() => setVerGmail(true)} />;
  if (modo.tipo === "texto") return <PegarTexto alVolver={() => setModo({ tipo: "inicio" })} alListo={(candidatos) => setModo({ tipo: "vista", candidatos, fuente: "texto", detalle: "Texto pegado" })} alError={(error) => setModo({ tipo: "error", error })} alEtapa={(etapa) => setModo({ tipo: "procesando", etapa })} />;
  if (modo.tipo === "vista")
    return (
      <VistaPrevia
        candidatos={modo.candidatos}
        fuente={modo.fuente}
        alCancelar={() => setModo({ tipo: "inicio" })}
        alGuardar={(cs) => {
          const primera = !obtenerVida().importaciones.some((i) => !i.deshecha);
          const imp = guardarImportacion(cs, modo.fuente, modo.detalle);
          actualizarVida(() => ({ formatosVistos: FORMATOS_VERSION }));
          sonidos.acierto();
          setModo({ tipo: "listo", imp, primera });
        }}
      />
    );
  if (modo.tipo === "listo") return <Listo imp={modo.imp} primera={modo.primera} alOtra={() => setModo({ tipo: "inicio" })} />;

  const importados = e.movimientos.filter((m) => m.importacion);
  const masReciente = importados.reduce<string | null>((max, m) => (!max || m.fecha > max ? m.fecha : max), null);
  const historial = [...e.importaciones].reverse();

  return (
    <Pagina>
      <Encabezado titulo="Importar movimientos" />
      <div className="flex flex-col gap-4 px-5 pb-8">
        <AnimatePresence>
          {presentar && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 rounded-[20px] bg-surface p-3">
              <LeonVida pose="celular" alto={96} rebote />
              <p className="flex-1 text-[15px] leading-[21px]">Trae tus movimientos sin escribirlos uno por uno. Yo los leo y tú revisas todo antes de guardar.</p>
            </motion.div>
          )}
        </AnimatePresence>

        <section className="flex flex-col gap-2">
          <Opcion
            titulo="Subir un reporte de movimientos"
            detalle="Si Yape, tu banco o tu billetera te deja descargar tus movimientos (CSV, Excel o PDF)."
            icono="M6 3.5h8l4 4V20.5H6zM14 3.5v4h4M9 12h6M9 15.5h6"
            onClick={() => entradaReporte.current?.click()}
          />
          <Opcion titulo="Subir una captura o comprobante" detalle="Una imagen o un PDF de un pago o de un depósito." icono="M4 8h3l2-2.5h6L17 8h3v11H4zM12 16.5a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4z" onClick={() => entradaComprobante.current?.click()} />
          <Opcion titulo="Pegar el texto de un correo o comprobante" detalle="Copia el texto y pégalo. Sirve para SMS y notificaciones." icono="M8 4.5h8v3H8zM6 6h-.5A1.5 1.5 0 0 0 4 7.5v12A1.5 1.5 0 0 0 5.5 21h13a1.5 1.5 0 0 0 1.5-1.5v-12A1.5 1.5 0 0 0 18.5 6H18" onClick={() => setModo({ tipo: "texto" })} />
          <Opcion
            titulo="Conectar Gmail"
            detalle={!GMAIL_DISPONIBLE ? "Aún no disponible. Mientras tanto, sube tus archivos o pega el texto." : e.gmail?.email ? `Conectado: ${e.gmail.email}` : "Para traer comprobantes de tu correo cuando tú lo pidas."}
            icono="M3.5 6.5h17v11h-17zM3.5 7l8.5 6 8.5-6"
            onClick={() => setVerGmail(true)}
            apagada={!GMAIL_DISPONIBLE}
          />
        </section>
        <input ref={entradaReporte} type="file" accept=".csv,.xlsx,.pdf,text/csv,application/pdf" className="hidden" onChange={(ev) => (elegir(ev.target.files), (ev.target.value = ""))} />
        <input ref={entradaComprobante} type="file" accept="image/*,.pdf,application/pdf" className="hidden" onChange={(ev) => (elegir(ev.target.files), (ev.target.value = ""))} />

        <p className="rounded-[16px] bg-surface p-3 text-ayuda">
          Yape no siempre envía tus movimientos por correo, así que puede que tu correo no los tenga todos. Lo que importes se lee en tu celular; los archivos y capturas no se guardan.
        </p>

        <section className="rounded-[20px] bg-card p-4" aria-label="Estado de tus fuentes">
          <h2 className="font-extrabold">Tus fuentes</h2>
          <ul className="mt-2 flex flex-col gap-1 text-ayuda">
            <li>
              <b>Gmail:</b> {!GMAIL_DISPONIBLE ? "aún no disponible" : e.gmail?.email ? (e.gmail.revocado ? "sin permiso (vuelve a conectar)" : `conectado${e.gmail.ultimaSync ? `, última sincronización ${new Date(e.gmail.ultimaSync).toLocaleString("es-PE", { dateStyle: "medium", timeStyle: "short" })}` : ""}`) : "no conectado"}
            </li>
            <li>
              <b>Archivos y texto:</b> {e.importaciones.filter((i) => !i.deshecha && i.fuente !== "gmail").length} importaciones
            </li>
            <li>
              <b>Importado hasta:</b> {masReciente ? bonita(masReciente) : "aún nada"}
            </li>
          </ul>
          <details className="mt-3">
            <summary className="min-h-11 cursor-pointer font-extrabold text-brand">Qué puedo leer</summary>
            <ul className="mt-1 flex flex-col gap-2 text-ayuda">
              {FORMATOS.map((f) => (
                <li key={f.id}>
                  <b>{f.nombre}:</b> {f.detalle}
                </li>
              ))}
            </ul>
          </details>
        </section>

        {e.reglas.length > 0 && (
          <section className="rounded-[20px] bg-card p-4">
            <h2 className="font-extrabold">Tus reglas</h2>
            <ul className="mt-2 flex flex-col gap-1">
              {e.reglas.map((r) => (
                <li key={r.id} className="flex min-h-11 items-center justify-between gap-2 text-ayuda">
                  <span>
                    Si dice «{r.contiene}» → <b>{r.categoria}</b>
                  </span>
                  <button type="button" onClick={() => actualizarVida((s) => ({ reglas: s.reglas.filter((x) => x.id !== r.id) }))} className="min-h-11 cursor-pointer px-2 font-extrabold text-error">
                    Quitar
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section>
          <h2 className="text-tarjeta font-extrabold">Historial de importaciones</h2>
          {historial.length === 0 ? (
            <p className="mt-2 text-text-soft">Aún no importas nada.</p>
          ) : (
            <ul className="mt-2 flex flex-col gap-2">
              {historial.map((i) => (
                <FilaHistorial key={i.id} imp={i} />
              ))}
            </ul>
          )}
        </section>
      </div>

      <Ventana abierta={!!pedirOcr} alCerrar={() => setPedirOcr(null)} titulo="Leer la imagen en tu celular">
        <p className="text-text-soft">Para leer capturas uso un lector que funciona en tu celular, sin enviar la imagen a nadie. La primera vez descarga unos MB (mejor con wifi). Después funciona más rápido.</p>
        <p className="mt-2 text-ayuda text-text-soft">Puede equivocarse con fotos borrosas: tú revisas todo antes de guardar.</p>
        <div className="mt-5 flex flex-col gap-3">
          <Boton
            onClick={() => {
              try {
                localStorage.setItem(OCR_OK, "1");
              } catch {
                // nada
              }
              const f = pedirOcr;
              setPedirOcr(null);
              if (f) void procesar(f);
            }}
          >
            Sí, leer la imagen
          </Boton>
          <Boton
            variante="secundario"
            onClick={() => {
              setPedirOcr(null);
              setModo({ tipo: "texto" });
            }}
          >
            Prefiero pegar el texto
          </Boton>
        </div>
      </Ventana>

      <GmailVentana
        abierta={verGmail}
        alCerrar={() => setVerGmail(false)}
        alVista={(candidatos) => {
          setVerGmail(false);
          setModo({ tipo: "vista", candidatos, fuente: "gmail", detalle: "Gmail" });
        }}
        alEtapa={(etapa) => setModo({ tipo: "procesando", etapa })}
        alError={(error) => setModo({ tipo: "error", error })}
      />
    </Pagina>
  );
}

function Opcion({ titulo, detalle, icono, onClick, apagada = false }: { titulo: string; detalle: string; icono: string; onClick: () => void; apagada?: boolean }) {
  return (
    <motion.button
      type="button"
      whileTap={{ y: 3, boxShadow: "0 1px 0 var(--surface)" }}
      style={{ boxShadow: "0 4px 0 var(--surface)" }}
      onPointerDown={() => sonidos.toque()}
      onClick={onClick}
      className={`flex min-h-20 cursor-pointer items-center gap-4 rounded-[20px] border-2 border-surface bg-card p-4 text-left ${apagada ? "opacity-70" : ""}`}
    >
      <span className="grid size-11 shrink-0 place-items-center rounded-full bg-surface text-brand">
        <svg viewBox="0 0 24 24" className="size-6" aria-hidden="true">
          <path d={icono} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span>
        <span className="block font-extrabold">{titulo}</span>
        <span className="text-ayuda text-text-soft">{detalle}</span>
      </span>
    </motion.button>
  );
}

function FilaHistorial({ imp }: { imp: Importacion }) {
  const [confirmar, setConfirmar] = useState(false);
  return (
    <li className="rounded-[16px] bg-card px-4 py-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-extrabold">
            {NOMBRE_FUENTE[imp.fuente]} · {imp.ids.length} {imp.ids.length === 1 ? "movimiento" : "movimientos"}
          </p>
          <p className="text-ayuda text-text-soft">
            {bonita(imp.fecha)} · {imp.detalle}
            {imp.deshecha ? " · deshecha" : ""}
          </p>
        </div>
        {!imp.deshecha && (
          <button type="button" onClick={() => setConfirmar(true)} className="min-h-11 shrink-0 cursor-pointer text-ayuda font-extrabold text-error">
            Deshacer
          </button>
        )}
      </div>
      <Ventana abierta={confirmar} alCerrar={() => setConfirmar(false)} titulo="¿Deshacer esta importación?">
        <p className="text-text-soft">Se quitan los {imp.ids.length} movimientos que entraron con ella. Lo que registraste a mano no se toca.</p>
        <div className="mt-5 flex flex-col gap-3">
          <Boton
            variante="secundario"
            onClick={() => {
              const n = deshacerImportacion(imp.id);
              setConfirmar(false);
              avisoDeshacer(`Listo, quité ${n} ${n === 1 ? "movimiento" : "movimientos"}.`);
            }}
          >
            Sí, deshacer
          </Boton>
          <Boton onClick={() => setConfirmar(false)}>No, dejarla</Boton>
        </div>
      </Ventana>
    </li>
  );
}

/* ---------- Procesando: estado real, sin porcentajes ---------- */

function Procesando({ etapa }: { etapa: string }) {
  const menos = obtenerVida().menosMovimiento;
  return (
    <Pagina className="flex flex-col">
      <div className="flex flex-1 flex-col items-center justify-center px-5 text-center" role="status" aria-live="polite">
        <motion.div animate={menos ? {} : { rotate: [0, -4, 4, 0] }} transition={{ duration: 1.4, repeat: Infinity }}>
          <LeonVida pose="detective" alto={170} />
        </motion.div>
        <AnimatePresence mode="wait">
          <motion.p key={etapa} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="mt-4 text-tarjeta font-extrabold">
            {etapa}…
          </motion.p>
        </AnimatePresence>
        <div className="mt-4 flex gap-1.5" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <motion.span key={i} className="size-2.5 rounded-full bg-brand" animate={menos ? {} : { opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }} />
          ))}
        </div>
      </div>
    </Pagina>
  );
}

/* ---------- Estados de error ---------- */

function ErrorEstado({ error, alVolver, alPegar, alReconectar }: { error: ErrorImportar; alVolver: () => void; alPegar: () => void; alReconectar: () => void }) {
  const m = MENSAJE_ERROR[error];
  return (
    <Pagina className="flex flex-col">
      <Encabezado titulo="Importar movimientos" alVolver={alVolver} />
      <div className="flex flex-1 flex-col items-center px-5 pt-6 text-center" role="alert">
        <LeonVida pose="anima" alto={170} rebote />
        <h1 className="mt-4 text-titulo font-black">{m.titulo}</h1>
        <p className="mt-2 max-w-xs text-text-soft">{m.texto}</p>
      </div>
      <PieFijo>
        <div className="flex flex-col gap-3">
          {error === "permiso" ? (
            <Boton onClick={alReconectar}>Volver a conectar Gmail</Boton>
          ) : error === "sin-conexion" ? (
            <Boton onClick={alVolver}>Intentar de nuevo</Boton>
          ) : (
            <Boton onClick={alVolver}>Probar con otro archivo</Boton>
          )}
          <Boton variante="secundario" onClick={alPegar}>
            Pegar el texto
          </Boton>
        </div>
      </PieFijo>
    </Pagina>
  );
}

/* ---------- Pegar texto ---------- */

function PegarTexto({ alVolver, alListo, alError, alEtapa }: { alVolver: () => void; alListo: (c: Candidato[]) => void; alError: (e: ErrorImportar) => void; alEtapa: (e: string) => void }) {
  const [texto, setTexto] = useState("");
  return (
    <Pagina className="flex flex-col">
      <Encabezado titulo="Pegar texto" alVolver={alVolver} />
      <div className="flex flex-1 flex-col gap-3 px-5">
        <p className="text-text-soft">Pega el texto de un correo, un SMS o un comprobante. Puedes pegar varios a la vez, separados por líneas en blanco.</p>
        <p className="rounded-[16px] bg-reward/25 p-3 text-ayuda">Antes de pegar, borra contraseñas o códigos si los hubiera. No los necesito.</p>
        <textarea
          value={texto}
          onChange={(ev) => setTexto(ev.target.value)}
          rows={9}
          placeholder={"Ej.: ¡Yapeaste! S/ 25.00 a Bodega Lucho\n22 nov. 2026 - 10:41 a. m.\nNº de operación: 12345678"}
          className="w-full resize-none rounded-[20px] border-2 border-surface bg-card p-4 text-[16px] outline-none placeholder:text-text-soft focus:border-brand"
          aria-label="Texto del correo o comprobante"
        />
      </div>
      <PieFijo>
        <Boton
          deshabilitado={!texto.trim()}
          onClick={async () => {
            try {
              alListo(await procesarTexto(texto, alEtapa));
            } catch (err) {
              sonidos.error();
              alError(err instanceof FallaImportar ? err.tipo : "lectura");
            }
          }}
        >
          Revisar el texto
        </Boton>
      </PieFijo>
    </Pagina>
  );
}

/* ---------- Vista previa: revisa y confirma ---------- */

const ETIQUETA_TIPO = (c: Candidato) => (c.clase === "devolucion" ? "Devolución" : c.clase === "propia" ? "Entre mis cuentas" : c.tipo === "ingreso" ? "Ingreso" : "Gasto");

function VistaPrevia({ candidatos, fuente, alCancelar, alGuardar }: { candidatos: Candidato[]; fuente: FuenteImportacion; alCancelar: () => void; alGuardar: (cs: Candidato[]) => void }) {
  const [lista, setLista] = useState(candidatos);
  const [editando, setEditando] = useState<Candidato | null>(null);
  const [reglasNuevas, setReglasNuevas] = useState<{ contiene: string; categoria: string }[]>([]);
  const [guardando, setGuardando] = useState(false);
  const elegidos = lista.filter((c) => c.incluir);
  const incompletos = elegidos.filter((c) => !listoParaGuardar(c));
  const porRevisar = lista.filter((c) => c.dudas.length).length;
  const duplicados = lista.filter((c) => c.duplicado).length;
  const hayIngresos = lista.some((c) => c.tipo === "ingreso" && c.clase === "normal");

  const cambiar = (clave: string, cambio: Partial<Candidato>) => setLista((l) => l.map((c) => (c.clave === clave ? { ...c, ...cambio } : c)));

  return (
    <Pagina className="flex flex-col">
      <Encabezado titulo="Revisa y confirma" alVolver={alCancelar} />
      <div className="flex flex-1 flex-col gap-3 px-5">
        <div>
          <h1 className="text-tarjeta font-black">
            Encontramos {lista.length} {lista.length === 1 ? "movimiento" : "movimientos"}. Revisa y confirma.
          </h1>
          <p className="text-ayuda text-text-soft">
            {NOMBRE_FUENTE[fuente]} · {elegidos.length} elegidos{porRevisar ? ` · ${porRevisar} por revisar` : ""}
            {duplicados ? ` · ${duplicados} posibles duplicados` : ""}
          </p>
        </div>
        {hayIngresos && <p className="rounded-[16px] bg-surface p-3 text-ayuda">Un comprobante leído no prueba que la plata llegó. Confírmalo en tu app o en tu banco.</p>}
        <div className="flex gap-4">
          <button type="button" onClick={() => setLista((l) => l.map((c) => ({ ...c, incluir: true })))} className="min-h-11 cursor-pointer text-ayuda font-extrabold text-brand">
            Elegir todos
          </button>
          <button type="button" onClick={() => setLista((l) => l.map((c) => ({ ...c, incluir: false })))} className="min-h-11 cursor-pointer text-ayuda font-extrabold text-brand">
            Quitar todos
          </button>
        </div>
        <ul className="flex flex-col gap-2">
          {lista.map((c) => (
            <li key={c.clave} className={`rounded-[16px] border-2 bg-card ${c.incluir ? "border-surface" : "border-dashed border-surface opacity-70"}`}>
              <div className="flex items-start gap-2 p-2">
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={c.incluir}
                  aria-label={`Incluir ${c.contraparte ?? c.descripcion}`}
                  onClick={() => cambiar(c.clave, { incluir: !c.incluir })}
                  className={`mt-1 grid size-11 shrink-0 cursor-pointer place-items-center rounded-[12px] border-2 ${c.incluir ? "border-brand bg-brand text-white" : "border-text-soft/40"}`}
                >
                  {c.incluir && (
                    <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
                      <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
                <button type="button" onClick={() => setEditando(c)} className="min-w-0 flex-1 cursor-pointer py-1 text-left">
                  <span className="flex items-start justify-between gap-2">
                    <span className="truncate font-extrabold">{c.contraparte ?? c.descripcion}</span>
                    <span className={`numeros shrink-0 font-black ${c.tipo === "ingreso" ? "text-brand" : ""}`}>
                      {c.monto === null ? "Falta" : `${c.tipo === "ingreso" ? "+" : "−"} ${c.moneda === "PEN" ? soles(c.monto) : `${c.moneda} ${c.monto}`}`}
                    </span>
                  </span>
                  <span className="block text-ayuda text-text-soft">
                    {ETIQUETA_TIPO(c)} · {c.categoria} · {c.fecha ? bonita(c.fecha) : "sin fecha"}
                    {c.operacion ? ` · Op. ${c.operacion}` : ""}
                  </span>
                  {c.dudas.length > 0 && (
                    <span className="mt-1 inline-block rounded-full bg-reward/35 px-2 py-0.5 text-[12px] font-extrabold">Por revisar: {c.dudas.join(" · ")}</span>
                  )}
                  {c.duplicado && <span className="mt-1 block text-[13px] leading-[17px] font-bold text-text-soft">{c.duplicado.nivel === "probable" ? "Probable duplicado. " : "Posible duplicado. "}{c.duplicado.detalle}</span>}
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <PieFijo>
        {incompletos.length > 0 && <p className="mb-2 text-center text-ayuda font-bold text-error">Completa la fecha o el monto de {incompletos.length} o desmárcalos.</p>}
        <Boton
          deshabilitado={!elegidos.length || incompletos.length > 0 || guardando}
          onClick={() => {
            if (guardando) return;
            setGuardando(true);
            if (reglasNuevas.length) actualizarVida((s) => ({ reglas: [...s.reglas, ...reglasNuevas.map((r) => ({ id: nuevoId("r"), ...r }))] }));
            alGuardar(elegidos);
          }}
        >
          Guardar {elegidos.length} {elegidos.length === 1 ? "movimiento" : "movimientos"}
        </Boton>
      </PieFijo>

      <EditarCandidato
        c={editando}
        alCerrar={() => setEditando(null)}
        alGuardar={(c, regla) => {
          cambiar(c.clave, c);
          if (regla) setReglasNuevas((r) => [...r.filter((x) => x.contiene !== regla.contiene), regla]);
          setEditando(null);
        }}
      />
    </Pagina>
  );
}

const TIPOS_EDIT: { id: string; nombre: string; tipo: "gasto" | "ingreso"; clase: Clase }[] = [
  { id: "gasto", nombre: "Gasto", tipo: "gasto", clase: "normal" },
  { id: "ingreso", nombre: "Ingreso", tipo: "ingreso", clase: "normal" },
  { id: "devolucion", nombre: "Devolución", tipo: "ingreso", clase: "devolucion" },
  { id: "propia", nombre: "Entre mis cuentas", tipo: "gasto", clase: "propia" },
];

function EditarCandidato({ c, alCerrar, alGuardar }: { c: Candidato | null; alCerrar: () => void; alGuardar: (c: Candidato, regla?: { contiene: string; categoria: string }) => void }) {
  const [borrador, setBorrador] = useState<Candidato | null>(null);
  const [monto, setMonto] = useState("");
  const [regla, setRegla] = useState(false);
  if (c && borrador?.clave !== c.clave) {
    setBorrador(c);
    setMonto(c.monto === null ? "" : String(c.monto));
    setRegla(false);
  }
  const b = borrador;
  const tipoId = b ? (b.clase !== "normal" ? b.clase : b.tipo) : "gasto";
  const categorias = b?.clase === "devolucion" ? ["Devolución"] : b?.clase === "propia" ? ["Entre mis cuentas"] : b?.tipo === "ingreso" ? [...CATEGORIAS_INGRESO] : [...CATEGORIAS_GASTO];
  const set = (x: Partial<Candidato>) => setBorrador((v) => (v ? { ...v, ...x } : v));

  return (
    <Ventana abierta={!!c} alCerrar={() => (setBorrador(null), alCerrar())} titulo="Corregir movimiento">
      {b && (
        <div className="flex max-h-[72dvh] flex-col gap-4 overflow-y-auto pb-1 [&>*]:shrink-0">
          <GrupoUnico etiqueta="Tipo">
            {TIPOS_EDIT.map((t) => (
              <Chip
                key={t.id}
                radio
                activo={tipoId === t.id}
                onClick={() => {
                  const nuevo = { ...b, tipo: t.tipo, clase: t.clase };
                  set({ tipo: t.tipo, clase: t.clase, categoria: sugerirCategoria(nuevo, obtenerVida().reglas), dudas: b.dudas.filter((d) => d !== "¿Es gasto o ingreso?") });
                }}
              >
                {t.nombre}
              </Chip>
            ))}
          </GrupoUnico>
          <CampoSoles etiqueta={`Monto${b.moneda !== "PEN" ? ` (${b.moneda})` : ""}`} valor={monto} alCambiar={setMonto} error={aNumero(monto) ? null : "Falta el monto."} />
          <GrupoUnico etiqueta="Moneda">
            {["PEN", "USD"].map((m) => (
              <Chip key={m} radio activo={b.moneda === m} onClick={() => set({ moneda: m, dudas: b.dudas.filter((d) => d !== "Revisa la moneda" && !d.startsWith("En ")).concat(m !== "PEN" ? [`En ${m}: no suma a tu presupuesto en soles`] : []) })}>
                {m === "PEN" ? "Soles" : "Dólares"}
              </Chip>
            ))}
          </GrupoUnico>
          <label className="block">
            <span className="text-ayuda font-extrabold text-text-soft">Fecha</span>
            <input
              type="date"
              value={b.fecha ?? ""}
              max={sumarDias(hoy(), 1)}
              onChange={(ev) => set({ fecha: ev.target.value || null, dudas: b.dudas.filter((d) => d !== "Falta la fecha" && d !== "Revisa el año" && !d.startsWith("Fecha del correo")) })}
              className={`${campoTexto} ${b.fecha ? "" : "border-error"}`}
            />
            {!b.fecha && <span className="mt-1 block text-ayuda font-bold text-error">Falta la fecha.</span>}
          </label>
          <label className="block">
            <span className="text-ayuda font-extrabold text-text-soft">{b.tipo === "ingreso" ? "¿De quién?" : "¿A quién o dónde?"}</span>
            <input value={b.contraparte ?? ""} onChange={(ev) => set({ contraparte: ev.target.value || null })} className={campoTexto} maxLength={40} />
          </label>
          <div>
            <p className="mb-2 text-ayuda font-extrabold text-text-soft">Categoría</p>
            <GrupoUnico etiqueta="Categoría">
              {categorias.map((k) => (
                <Chip key={k} radio activo={b.categoria === k} onClick={() => set({ categoria: k })}>
                  {k}
                </Chip>
              ))}
            </GrupoUnico>
          </div>
          {b.contraparte && b.clase === "normal" && (
            <label className="flex min-h-11 cursor-pointer items-center gap-3">
              <input type="checkbox" checked={regla} onChange={(ev) => setRegla(ev.target.checked)} className="size-6 accent-[var(--brand)]" />
              <span className="font-bold">Usar «{b.categoria}» siempre que diga «{b.contraparte}»</span>
            </label>
          )}
          <Boton
            deshabilitado={!aNumero(monto)}
            onClick={() => {
              // Lo que la persona revisó deja de estar «Por revisar»; solo queda el aviso de otra moneda.
              alGuardar({ ...b, monto: aNumero(monto), dudas: b.dudas.filter((d) => d.startsWith("En ")) }, regla && b.contraparte ? { contiene: b.contraparte, categoria: b.categoria } : undefined);
              setBorrador(null);
            }}
          >
            Listo
          </Boton>
        </div>
      )}
    </Ventana>
  );
}

/* ---------- Listo: confirmación breve con el número real ---------- */

function Listo({ imp, primera, alOtra }: { imp: Importacion; primera: boolean; alOtra: () => void }) {
  const n = imp.ids.length;
  return (
    <Pagina className="flex flex-col">
      <div className="flex flex-1 flex-col items-center justify-center px-5 text-center" role="status">
        <motion.span initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 420, damping: 16 }} className="grid size-20 place-items-center rounded-full bg-brand text-white">
          <svg viewBox="0 0 24 24" className="size-10" aria-hidden="true">
            <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.span>
        <h1 className="mt-4 text-titulo font-black">
          Importamos {n} {n === 1 ? "movimiento" : "movimientos"}
        </h1>
        <p className="mt-2 max-w-xs text-text-soft">{primera ? "Tu resumen ya está actualizado." : "Ya están en tus movimientos, con su origen."}</p>
      </div>
      <PieFijo>
        <div className="flex flex-col gap-3">
          <Boton onClick={() => reemplazar("/vida/movimientos")}>Ver mis movimientos</Boton>
          <div className="grid grid-cols-2 gap-2">
            <Boton variante="secundario" onClick={alOtra}>
              Importar otro
            </Boton>
            <Boton
              variante="secundario"
              onClick={() => {
                const q = deshacerImportacion(imp.id);
                avisoDeshacer(`Importación deshecha: quité ${q}.`);
                alOtra();
              }}
            >
              Deshacer
            </Boton>
          </div>
        </div>
      </PieFijo>
    </Pagina>
  );
}

/* ---------- Gmail ---------- */

function GmailVentana({
  abierta,
  alCerrar,
  alVista,
  alEtapa,
  alError,
}: {
  abierta: boolean;
  alCerrar: () => void;
  alVista: (c: Candidato[]) => void;
  alEtapa: (e: string) => void;
  alError: (e: ErrorImportar) => void;
}) {
  const e = useVida();
  const [desde, setDesde] = useState(e.gmail?.hasta ?? sumarDias(hoy(), -30));
  const [hasta, setHasta] = useState(hoy());
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [borrar, setBorrar] = useState(false);
  const conectado = !!e.gmail?.email;
  const vigente = tienePermisoVigente();

  if (!GMAIL_DISPONIBLE)
    return (
      <Ventana abierta={abierta} alCerrar={alCerrar} titulo="Conectar Gmail">
        <p className="text-text-soft">Todavía no está disponible: falta terminar la autorización con Google. No te pediré tu contraseña: cuando esté listo, usarás el permiso oficial de Google.</p>
        <p className="mt-2 text-text-soft">Mientras tanto, puedes subir tus reportes o capturas, o pegar el texto de tus correos.</p>
        <div className="mt-5">
          <Boton onClick={alCerrar}>Entendido</Boton>
        </div>
      </Ventana>
    );

  return (
    <Ventana abierta={abierta} alCerrar={alCerrar} titulo={conectado ? "Tu Gmail" : "Conectar Gmail"}>
      <div className="flex max-h-[72dvh] flex-col gap-4 overflow-y-auto pb-1 [&>*]:shrink-0">
        {!conectado || e.gmail?.revocado || !vigente ? (
          <>
            <div className="rounded-[16px] bg-surface p-3 text-ayuda">
              <p className="font-extrabold">Antes de conectar</p>
              <ul className="mt-1 flex list-disc flex-col gap-1 pl-5">
                <li>Entrarás a Google y él te pedirá permiso. Nunca te pediré tu contraseña.</li>
                <li>El permiso es «ver tus correos» (solo lectura). Técnicamente permite leer todo tu correo.</li>
                <li>Auxi Vida solo busca correos que parecen comprobantes de pago, en las fechas que elijas, y los lee en tu celular.</li>
                <li>No guardo el texto de tus correos: solo el monto, la fecha, el nombre y el número de operación de lo que confirmes.</li>
                <li>Por seguridad, Google pide confirmar de nuevo cada vez que sincronizas.</li>
                <li>Puedes quitar el permiso cuando quieras, aquí o en tu cuenta de Google.</li>
              </ul>
            </div>
            {mensaje && <p className="text-ayuda font-bold text-error">{mensaje}</p>}
            <Boton
              onClick={async () => {
                setMensaje(null);
                const r = await conectarGmail();
                if (r) setMensaje(r);
              }}
            >
              {conectado ? "Volver a dar permiso" : "Continuar con Google"}
            </Boton>
          </>
        ) : (
          <>
            <p className="text-ayuda text-text-soft">
              Conectado: <b className="text-text">{e.gmail?.email}</b>
              {e.gmail?.ultimaSync ? ` · última sincronización: ${new Date(e.gmail.ultimaSync).toLocaleString("es-PE", { dateStyle: "medium", timeStyle: "short" })}` : ""}
              {e.gmail?.hasta ? ` · importado hasta el ${bonita(e.gmail.hasta)}` : ""}
            </p>
            <div className="grid grid-cols-2 gap-2">
              <label className="block">
                <span className="text-ayuda font-extrabold text-text-soft">Desde</span>
                <input type="date" value={desde} max={hasta} onChange={(ev) => setDesde(ev.target.value)} className={campoTexto} />
              </label>
              <label className="block">
                <span className="text-ayuda font-extrabold text-text-soft">Hasta</span>
                <input type="date" value={hasta} min={desde} max={hoy()} onChange={(ev) => setHasta(ev.target.value)} className={campoTexto} />
              </label>
            </div>
            <Boton
              deshabilitado={!desde || !hasta}
              onClick={async () => {
                alCerrar();
                alEtapa("Conectando con Gmail");
                try {
                  const cs = await sincronizarGmail(desde, hasta, alEtapa);
                  if (!cs.length) alError("vacio");
                  else alVista(cs);
                } catch (err) {
                  alError(err instanceof FallaImportar ? err.tipo : "lectura");
                }
              }}
            >
              Sincronizar ahora
            </Boton>
          </>
        )}
        {conectado && (
          <div className="flex flex-col gap-1 border-t-2 border-surface pt-3">
            <button
              type="button"
              onClick={async () => {
                await desconectarGmail();
                avisoDeshacer("Gmail desconectado. Lo ya importado se queda.");
                alCerrar();
              }}
              className="min-h-11 cursor-pointer font-extrabold text-brand"
            >
              Desconectar Gmail
            </button>
            <button type="button" onClick={() => setBorrar(true)} className="min-h-11 cursor-pointer font-extrabold text-error">
              Eliminar lo importado desde Gmail
            </button>
            <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer" className="flex min-h-11 items-center justify-center text-ayuda font-extrabold text-text-soft underline">
              Revisar permisos en tu cuenta de Google
            </a>
          </div>
        )}
        {borrar && (
          <div className="rounded-[16px] border-2 border-error p-3">
            <p className="font-bold">Se borran todos los movimientos que entraron desde Gmail. No se puede deshacer.</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Boton variante="secundario" onClick={() => setBorrar(false)}>
                No
              </Boton>
              <Boton
                onClick={() => {
                  const n = borrarImportadosDe("gmail");
                  setBorrar(false);
                  avisoDeshacer(`Borré ${n} movimientos de Gmail.`);
                }}
              >
                Sí, borrar
              </Boton>
            </div>
          </div>
        )}
      </div>
    </Ventana>
  );
}

