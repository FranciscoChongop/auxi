import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { Boton } from "../../components/Boton";
import { Interruptor } from "../../components/Interruptor";
import { hoy, sumarDias } from "../../lib/fechas";
import { metricas, primerDiaDeUso } from "../../lib/metricas";
import { navegar, parametro, reemplazar } from "../../lib/rutas";
import { sonidos } from "../../lib/sonidos";
import { vibrar } from "../../lib/vibrar";
import { CATEGORIAS_GASTO, CATEGORIAS_INGRESO } from "../entender";
import { anotar, desglose, obtenerVida, quitarMovimiento, soles, useVida } from "../estado";
import { guardarLogro } from "../logro";
import { aNumero, avisoDeshacer, CampoSoles, CaraLeonVida, Chip, campoTexto, Encabezado, GrupoUnico, Pagina, PieFijo } from "../ui";

/** Registro rápido: monto, categoría y guardar. La nota es opcional. */
export default function Registrar() {
  const e = useVida();
  const primero = parametro("primero") === "1";
  const [tipo, setTipo] = useState<"gasto" | "ingreso">(parametro("tipo") === "ingreso" ? "ingreso" : "gasto");
  const [monto, setMonto] = useState("");
  const [categoria, setCategoria] = useState<string>(tipo === "gasto" ? "Comida" : "Trabajo");
  const [nota, setNota] = useState("");
  const [verNota, setVerNota] = useState(false);
  const [fecha, setFecha] = useState(hoy());
  const [extra, setExtra] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const guardando = useRef(false);
  const h = hoy();

  const cambiarTipo = (t: "gasto" | "ingreso") => {
    setTipo(t);
    setCategoria(t === "gasto" ? "Comida" : "Trabajo");
  };

  const guardar = () => {
    // Protección contra doble toque.
    if (guardando.current) return;
    const valor = aNumero(monto);
    if (!valor) {
      setError("Escribe el monto, por ejemplo 12.");
      sonidos.error();
      vibrar("error");
      return;
    }
    guardando.current = true;
    const l = anotar({ tipo, monto: valor, categoria, nota: nota.trim() || categoria, fecha, extra: tipo === "ingreso" && extra ? true : undefined, origen: "manual" });
    metricas.vidaAnotado({ tipo, origen: "manual", primero: l.primero, primerDia: primerDiaDeUso("vida") });
    sonidos.acierto();
    vibrar("acierto");
    const d = desglose(obtenerVida());
    if (l.primero) {
      guardarLogro({ ...l, quedan: d.quedan });
      reemplazar("/vida/logro");
      return;
    }
    const texto = !obtenerVida().plan ? "Guardado." : d.quedan < 0 ? `Guardado. Hoy te pasaste ${soles(-d.quedan)}; mañana ajustamos.` : `Guardado. Te quedan ${soles(d.quedan)} hoy.`;
    avisoDeshacer(texto, () => {
      quitarMovimiento(l.id);
    });
    reemplazar("/vida/hoy");
  };

  return (
    <Pagina className="flex flex-col">
      <Encabezado titulo="Registrar" />
      <div className="flex flex-1 flex-col gap-5 px-5 pt-2">
        {primero && (
          <div className="flex items-start gap-3 rounded-[20px] bg-surface p-3">
            <CaraLeonVida cara="risa" />
            <p className="text-[15px] leading-[21px]">¡Ya tienes tu número! Registra tu primer gasto de hoy: monto, categoría y listo.</p>
          </div>
        )}

        <div role="radiogroup" aria-label="Tipo de movimiento" className="grid grid-cols-2 gap-1 rounded-[16px] bg-surface p-1">
          {(["gasto", "ingreso"] as const).map((t) => (
            <button
              key={t}
              type="button"
              role="radio"
              aria-checked={tipo === t}
              onClick={() => cambiarTipo(t)}
              className={`h-11 cursor-pointer rounded-[12px] font-extrabold ${tipo === t ? "bg-card text-brand" : "text-text-soft"}`}
            >
              {t === "gasto" ? "Gasto" : "Ingreso"}
            </button>
          ))}
        </div>

        <CampoSoles
          etiqueta={tipo === "gasto" ? "¿Cuánto gastaste?" : "¿Cuánto entró?"}
          valor={monto}
          alCambiar={(v) => {
            setMonto(v);
            setError(null);
          }}
          autoFocus
          error={error}
        />

        <div>
          <p className="mb-2 text-ayuda font-extrabold text-text-soft">Categoría</p>
          <GrupoUnico etiqueta="Categoría">
            {(tipo === "gasto" ? CATEGORIAS_GASTO : CATEGORIAS_INGRESO).map((c) => (
              <Chip key={c} radio activo={categoria === c} onClick={() => setCategoria(c)}>
                {c}
              </Chip>
            ))}
          </GrupoUnico>
        </div>

        <GrupoUnico etiqueta="Fecha">
          {[
            ["Hoy", h],
            ["Ayer", sumarDias(h, -1)],
          ].map(([n, f]) => (
            <Chip key={f} radio activo={fecha === f} onClick={() => setFecha(f)}>
              {n}
            </Chip>
          ))}
        </GrupoUnico>

        {tipo === "ingreso" && e.plan && e.plan.periodo !== "dia" && (
          <Interruptor etiqueta="Es extra (suma a hoy)" ayuda="Apágalo si es tu pago de siempre: ya está en tu plan." activo={extra} alCambiar={setExtra} />
        )}

        <div>
          {!verNota ? (
            <button type="button" onClick={() => setVerNota(true)} className="min-h-11 cursor-pointer font-extrabold text-brand">
              + Agregar una nota (opcional)
            </button>
          ) : (
            <AnimatePresence>
              <motion.label initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="block">
                <span className="text-ayuda font-extrabold text-text-soft">Nota</span>
                <input value={nota} onChange={(ev) => setNota(ev.target.value)} placeholder="Menú, pasaje, mercado…" className={campoTexto} autoFocus maxLength={40} />
              </motion.label>
            </AnimatePresence>
          )}
        </div>

        <div className="flex flex-wrap gap-x-5 border-t-2 border-surface pt-3">
          <button type="button" onClick={() => navegar(`/vida/anotar${tipo === "ingreso" ? "?tipo=ingreso" : ""}`)} className="min-h-11 cursor-pointer font-extrabold text-brand">
            Escríbeselo a León
          </button>
          <button type="button" onClick={() => navegar("/vida/importar")} className="min-h-11 cursor-pointer font-extrabold text-brand">
            Importar movimientos
          </button>
        </div>
      </div>
      <PieFijo>
        <Boton onClick={guardar}>Guardar {aNumero(monto) ? soles(aNumero(monto)) : ""}</Boton>
      </PieFijo>
    </Pagina>
  );
}
