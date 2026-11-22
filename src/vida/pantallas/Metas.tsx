import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Boton } from "../../components/Boton";
import { Interruptor } from "../../components/Interruptor";
import { Ventana } from "../../components/Ventana";
import { bonita, hoy } from "../../lib/fechas";
import { entradaEnCascada } from "../../lib/movimiento";
import { metricas } from "../../lib/metricas";
import { navegar, parametro, reemplazar } from "../../lib/rutas";
import { sonidos } from "../../lib/sonidos";
import { vibrar } from "../../lib/vibrar";
import { actualizarVida, aportar, ID_COLCHON, nuevoId, soles, totalFrasco, useVida, type Frasco as TFrasco } from "../estado";
import { aNumero, avisoDeshacer, Cabecera, CampoSoles, Chip, campoTexto, confetiVida, Encabezado, Frasco, LeonVida, Pagina, PieFijo, Soles } from "../ui";

const ANTOJOS = [
  { nombre: "Gaseosa", monto: 3 },
  { nombre: "Snack", monto: 4 },
  { nombre: "Café", monto: 6 },
  { nombre: "Delivery", monto: 20 },
  { nombre: "Ropa", monto: 50 },
];

export default function Metas() {
  const id = parametro("id");
  return id ? <Detalle id={id} /> : <ListaMetas />;
}

function ListaMetas() {
  const e = useVida();
  const [nueva, setNueva] = useState(parametro("nuevo") === "1");
  return (
    <Pagina conBarra>
      <Cabecera>
        <h1 className="text-titulo font-black">Metas</h1>
      </Cabecera>
      <div className="flex flex-col gap-3 px-5 pt-4">
        <p className="text-text-soft">Cada frasco lleva la cuenta de lo que separas. No mueve tu plata: tú decides dónde la guardas.</p>
        {e.frascos.map((f, i) => {
          const total = totalFrasco(f);
          return (
            <motion.button
              key={f.id}
              {...entradaEnCascada(i)}
              type="button"
              onPointerDown={() => sonidos.toque()}
              onClick={() => navegar(`/vida/metas?id=${f.id}`)}
              className="flex cursor-pointer items-center gap-4 rounded-[20px] border-2 border-surface bg-card p-4 text-left"
            >
              <Frasco avance={f.meta ? total / f.meta : 0} tamano={60} />
              <span className="flex-1">
                <span className="flex items-center gap-2">
                  <span className="font-extrabold">{f.nombre}</span>
                  {e.frascoActivo === f.id && <span className="rounded-full bg-surface px-2 text-[12px] font-extrabold text-brand">En Hoy</span>}
                </span>
                <span className="block text-tarjeta font-black">
                  {soles(total)} <span className="text-ayuda font-bold text-text-soft">de {soles(f.meta)}</span>
                </span>
                <span className="text-ayuda text-text-soft">{f.celebrada ? "¡Meta cumplida!" : f.fecha ? `Para el ${bonita(f.fecha)}` : "Sin fecha"}</span>
              </span>
            </motion.button>
          );
        })}
        <Boton variante="secundario" onClick={() => setNueva(true)}>
          Crear una meta
        </Boton>
      </div>
      <FormMeta abierto={nueva} alCerrar={() => setNueva(false)} />
    </Pagina>
  );
}

function FormMeta({ abierto, alCerrar, frasco }: { abierto: boolean; alCerrar: () => void; frasco?: TFrasco }) {
  const [nombre, setNombre] = useState(frasco?.nombre ?? "");
  const [meta, setMeta] = useState(frasco?.meta ? String(frasco.meta) : "");
  const [fecha, setFecha] = useState(frasco?.fecha ?? "");
  const listo = nombre.trim() && aNumero(meta);
  return (
    <Ventana abierta={abierto} alCerrar={alCerrar} titulo={frasco ? "Editar meta" : "Nueva meta"}>
      <div className="flex flex-col gap-4">
        <label className="block">
          <span className="text-ayuda font-extrabold text-text-soft">¿Para qué es?</span>
          <input value={nombre} onChange={(ev) => setNombre(ev.target.value)} placeholder="Zapatillas, viaje, colchón…" className={campoTexto} maxLength={30} />
        </label>
        <CampoSoles etiqueta="¿Cuánto necesitas?" valor={meta} alCambiar={setMeta} />
        <label className="block">
          <span className="text-ayuda font-extrabold text-text-soft">¿Para cuándo? (opcional)</span>
          <input type="date" value={fecha} min={hoy()} onChange={(ev) => setFecha(ev.target.value)} className={campoTexto} />
        </label>
        <Boton
          deshabilitado={!listo}
          onClick={() => {
            const datos = { nombre: nombre.trim(), meta: aNumero(meta), fecha: fecha || undefined };
            if (frasco) actualizarVida((s) => ({ frascos: s.frascos.map((x) => (x.id === frasco.id ? { ...x, ...datos, celebrada: x.celebrada && totalFrasco(x) >= datos.meta } : x)) }));
            else {
              const id = nuevoId("f");
              actualizarVida((s) => ({ frascos: [...s.frascos, { id, aportes: [], celebrada: false, ...datos }], frascoActivo: id }));
              reemplazar(`/vida/metas?id=${id}`);
            }
            sonidos.acierto();
            alCerrar();
          }}
        >
          {frasco ? "Guardar" : "Crear frasco"}
        </Boton>
      </div>
    </Ventana>
  );
}

type Accion = "antojo" | "guardar" | "sacar" | "editar" | null;

function Detalle({ id }: { id: string }) {
  const e = useVida();
  const f = e.frascos.find((x) => x.id === id);
  const [accion, setAccion] = useState<Accion>(null);
  const [nombre, setNombre] = useState("");
  const [monto, setMonto] = useState("");
  const [lluvia, setLluvia] = useState(0);
  const [festejo, setFestejo] = useState(false);
  const [conMontos, setConMontos] = useState(false);
  if (!f)
    return (
      <Pagina>
        <Encabezado titulo="Meta" alVolver={() => navegar("/vida/metas")} />
        <p className="px-5 text-text-soft">No encontré esa meta.</p>
      </Pagina>
    );
  const total = totalFrasco(f);

  const abrir = (a: Accion) => {
    setNombre("");
    setMonto("");
    setAccion(a);
  };

  const sumar = (valor: number, motivo: "antojo" | "manual", nota: string) => {
    if (!valor) return;
    const llego = aportar(f.id, valor, motivo, nota);
    setAccion(null);
    if (valor > 0) {
      setLluvia((n) => n + 1);
      sonidos.acierto();
      vibrar("acierto");
      if (llego)
        setTimeout(() => {
          setFestejo(true);
          sonidos.leccionCompleta();
          confetiVida();
        }, 700);
      else avisoDeshacer(motivo === "antojo" ? `Un antojo menos, ${soles(valor)} más a ${f.nombre}.` : `${soles(valor)} a ${f.nombre}.`);
    } else avisoDeshacer("Listo. Para eso está; lo vuelves a llenar de a poquito.");
  };

  const compartir = async () => {
    const texto = conMontos ? `Completé mi meta «${f.nombre}» de ${soles(f.meta)} con Auxi Vida.` : `Completé mi meta «${f.nombre}» con Auxi Vida. Paso a pasito.`;
    try {
      if (navigator.share) await navigator.share({ text: texto, url: `${location.origin}/vida` });
      else {
        await navigator.clipboard.writeText(`${texto} ${location.origin}/vida`);
        avisoDeshacer("Copiado. Pégalo donde quieras.");
      }
      metricas.invitacion("vida-meta");
    } catch {
      // Cerró el menú de compartir.
    }
  };

  return (
    <Pagina className="flex flex-col">
      <Encabezado titulo={f.nombre} alVolver={() => navegar("/vida/metas")} />
      <div className="flex flex-1 flex-col gap-4 px-5">
        <section className="flex items-center gap-4 rounded-[28px] bg-card p-5">
          <Frasco avance={f.meta ? total / f.meta : 0} tamano={104} lluvia={lluvia} />
          <div className="flex-1">
            <p className="text-ayuda font-extrabold text-text-soft">Llevas</p>
            <Soles valor={total} className="block text-[38px] leading-[42px] font-black text-reward-dark" />
            <p className="text-ayuda text-text-soft">
              de {soles(f.meta)} · {f.meta ? Math.min(100, Math.round((100 * total) / f.meta)) : 0} %{f.fecha ? ` · para el ${bonita(f.fecha)}` : ""}
            </p>
            <button type="button" onClick={() => setAccion("editar")} className="-mx-1 mt-1 min-h-11 cursor-pointer px-1 text-ayuda font-extrabold text-brand">
              Editar meta
            </button>
          </div>
        </section>

        <AnimatePresence>
          {festejo || f.celebrada ? (
            <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center rounded-[20px] bg-reward/25 p-4 text-center">
              <LeonVida pose="celebra" alto={130} rebote />
              <p className="mt-2 text-tarjeta font-black">¡Lo lograste!</p>
              <p className="text-ayuda">Meta cumplida. {festejo ? "+20 monedas." : ""}</p>
              <div className="mt-3 w-full">
                <Interruptor etiqueta="Mostrar el monto al compartir" activo={conMontos} alCambiar={setConMontos} />
              </div>
              <div className="mt-3 flex w-full flex-col gap-2">
                <Boton variante="premio" onClick={compartir}>
                  Compartir mi logro
                </Boton>
                <Boton variante="secundario" onClick={() => navegar("/vida/metas?nuevo=1")}>
                  Crear mi siguiente objetivo
                </Boton>
              </div>
            </motion.section>
          ) : (
            <div className="flex items-center gap-3">
              <LeonVida pose="alcancia" alto={110} />
              <p className="flex-1 rounded-[20px] rounded-bl-[6px] bg-surface p-3 text-[15px] leading-[21px]">¿Te aguantaste un antojo? Regístralo y esa plata pasa al frasco.</p>
            </div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-2 gap-2">
          <Boton variante="secundario" onClick={() => abrir("guardar")}>
            Guardé plata
          </Boton>
          <Boton variante="secundario" onClick={() => abrir("sacar")}>
            Usé una parte
          </Boton>
        </div>
        {e.frascoActivo !== f.id && (
          <button type="button" onClick={() => actualizarVida(() => ({ frascoActivo: f.id }))} className="min-h-11 cursor-pointer font-extrabold text-brand">
            Mostrar esta meta en Hoy
          </button>
        )}

        <section>
          <h2 className="text-tarjeta font-extrabold">Aportes</h2>
          {f.aportes.length === 0 ? (
            <p className="mt-2 text-text-soft">Todavía vacío. El primer sol es el que más cuesta.</p>
          ) : (
            <ul className="mt-2 flex flex-col gap-2">
              {[...f.aportes]
                .reverse()
                .slice(0, 15)
                .map((a) => (
                  <li key={a.id} className="flex min-h-14 items-center justify-between rounded-[16px] bg-card px-4 py-2">
                    <span>
                      <span className="block font-extrabold">{a.nota}</span>
                      <span className="text-ayuda text-text-soft">{bonita(a.fecha)}</span>
                    </span>
                    <span className={`numeros font-black ${a.monto > 0 ? "text-reward-dark" : "text-text-soft"}`}>
                      {a.monto > 0 ? "+ " : "− "}
                      {soles(a.monto)}
                    </span>
                  </li>
                ))}
            </ul>
          )}
        </section>
        {f.id !== ID_COLCHON && (
          <button
            type="button"
            onClick={() => {
              const antes = e.frascos;
              actualizarVida((s) => ({ frascos: s.frascos.filter((x) => x.id !== f.id), frascoActivo: s.frascoActivo === f.id ? ID_COLCHON : s.frascoActivo }));
              avisoDeshacer("Meta borrada.", () => actualizarVida(() => ({ frascos: antes })));
              navegar("/vida/metas");
            }}
            className="mb-2 h-11 cursor-pointer font-extrabold text-error"
          >
            Borrar esta meta
          </button>
        )}
      </div>

      <PieFijo>
        <Boton variante="premio" onClick={() => abrir("antojo")}>
          Antojo ahorrado
        </Boton>
      </PieFijo>

      <Ventana abierta={accion === "antojo"} alCerrar={() => setAccion(null)} titulo="¿Qué no compraste?">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            {ANTOJOS.map((a) => (
              <Chip
                key={a.nombre}
                activo={nombre === a.nombre}
                onClick={() => {
                  setNombre(a.nombre);
                  setMonto(String(a.monto));
                }}
              >
                {a.nombre}
              </Chip>
            ))}
          </div>
          <label className="block">
            <span className="text-ayuda font-extrabold text-text-soft">Antojo</span>
            <input value={nombre} onChange={(ev) => setNombre(ev.target.value)} placeholder="Ese polo, una chela…" className={campoTexto} />
          </label>
          <CampoSoles etiqueta="¿Cuánto costaba?" valor={monto} alCambiar={setMonto} />
          <Boton variante="premio" deshabilitado={!aNumero(monto)} onClick={() => sumar(aNumero(monto), "antojo", `Antojo ahorrado: ${nombre.trim() || "algo"}`)}>
            Echar {aNumero(monto) ? soles(aNumero(monto)) : ""} al frasco
          </Boton>
        </div>
      </Ventana>

      <Ventana abierta={accion === "guardar" || accion === "sacar"} alCerrar={() => setAccion(null)} titulo={accion === "sacar" ? "¿Cuánto usaste?" : "¿Cuánto separaste?"}>
        <div className="flex flex-col gap-4">
          <CampoSoles
            etiqueta="Monto"
            valor={monto}
            alCambiar={setMonto}
            autoFocus
            error={accion === "sacar" && aNumero(monto) > total ? `Solo llevas ${soles(total)} en este frasco.` : null}
          />
          {accion === "sacar" && <p className="text-ayuda text-text-soft">Usarlo en un imprevisto no es fallar: para eso existe.</p>}
          <Boton
            deshabilitado={!aNumero(monto) || (accion === "sacar" && aNumero(monto) > total)}
            onClick={() => (accion === "sacar" ? sumar(-aNumero(monto), "manual", "Lo usé") : sumar(aNumero(monto), "manual", "Guardé plata"))}
          >
            Listo
          </Boton>
        </div>
      </Ventana>

      {accion === "editar" && <FormMeta abierto alCerrar={() => setAccion(null)} frasco={f} />}
    </Pagina>
  );
}
