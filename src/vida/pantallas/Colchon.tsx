import { motion } from "motion/react";
import { useState } from "react";
import { Boton } from "../../components/Boton";
import { useAviso } from "../../components/Aviso";
import { Ventana } from "../../components/Ventana";
import { bonita, hoy } from "../../lib/fechas";
import { entradaEnCascada } from "../../lib/movimiento";
import { sonidos } from "../../lib/sonidos";
import { vibrar } from "../../lib/vibrar";
import { actualizarVida, nuevoId, obtenerVida, soles, totalColchon, useVida, type Aporte } from "../estado";
import { aNumero, CampoSoles, Chip, confetiVida, Encabezado, Frasco, LeonVida, Pagina, PieFijo, Soles } from "../ui";

const ANTOJOS = [
  { nombre: "Gaseosa", monto: 3 },
  { nombre: "Snack", monto: 4 },
  { nombre: "Café", monto: 6 },
  { nombre: "Delivery", monto: 20 },
  { nombre: "Ropa", monto: 50 },
];

type Accion = "antojo" | "guardar" | "sacar" | "meta" | null;

export default function Colchon() {
  const e = useVida();
  const aviso = useAviso();
  const total = totalColchon(e);
  const meta = e.colchon.meta;
  const [accion, setAccion] = useState<Accion>(null);
  const [nombre, setNombre] = useState("");
  const [monto, setMonto] = useState("");
  const [lluvia, setLluvia] = useState(0);
  const [festejo, setFestejo] = useState(false);
  const lista = [...e.colchon.aportes].reverse().slice(0, 12);

  const abrir = (a: Accion) => {
    setNombre("");
    setMonto(a === "meta" ? String(meta || "") : "");
    setAccion(a);
  };

  const aportar = (valor: number, motivo: Aporte["motivo"], nota: string) => {
    if (!valor) return;
    const antes = totalColchon(obtenerVida());
    actualizarVida((s) => ({ colchon: { ...s.colchon, aportes: [...s.colchon.aportes, { id: nuevoId("a"), fecha: hoy(), monto: valor, motivo, nota }] } }));
    setAccion(null);
    if (valor > 0) {
      setLluvia((n) => n + 1);
      sonidos.acierto();
      vibrar("acierto");
      const ahora = antes + valor;
      const s = obtenerVida();
      if (s.colchon.meta && antes < s.colchon.meta && ahora >= s.colchon.meta && s.colchon.metaCelebrada !== s.colchon.meta) {
        actualizarVida((x) => ({ colchon: { ...x.colchon, metaCelebrada: x.colchon.meta }, monedas: x.monedas + 20 }));
        setTimeout(() => {
          setFestejo(true);
          sonidos.leccionCompleta();
          void confetiVida();
        }, 700);
      } else {
        aviso(motivo === "antojo" ? `Un antojo menos, ${soles(valor)} más al colchón.` : `${soles(valor)} al colchón.`, "premio");
      }
    } else {
      aviso("Listo. Para eso está el colchón; lo vuelves a llenar de a poquito.", "info");
    }
  };

  const compartir = async () => {
    const texto = `Llené mi colchón de ${soles(meta)} con Auxi Vida. Paso a pasito.`;
    try {
      if (navigator.share) await navigator.share({ text: texto, url: `${location.origin}/vida` });
      else {
        await navigator.clipboard.writeText(`${texto} ${location.origin}/vida`);
        aviso("Copiado. Pégalo donde quieras.", "exito");
      }
    } catch {
      // La persona cerró el menú de compartir.
    }
  };

  return (
    <Pagina className="flex flex-col">
      <Encabezado titulo="Tu colchón" />
      <div className="flex flex-1 flex-col px-5">
        <section className="relative flex items-center gap-4 rounded-[28px] bg-card p-5">
          <Frasco avance={meta ? total / meta : 0} tamano={110} lluvia={lluvia} />
          <div className="flex-1">
            <p className="text-ayuda font-extrabold text-text-soft">Llevas</p>
            <Soles valor={total} className="block text-[40px] leading-[44px] font-black text-reward-dark" />
            <p className="text-ayuda text-text-soft">
              de {soles(meta)} · {meta ? Math.min(100, Math.round((100 * total) / meta)) : 0} %
            </p>
            <button type="button" onClick={() => abrir("meta")} className="-mx-1 mt-1 min-h-11 cursor-pointer px-1 text-ayuda font-extrabold text-brand">
              Cambiar meta
            </button>
          </div>
        </section>

        <div className="mt-5 flex items-center gap-3">
          <LeonVida pose={festejo ? "celebra" : "alcancia"} alto={120} rebote />
          <p className="flex-1 rounded-[20px] rounded-bl-[6px] bg-surface p-3 text-[15px] leading-[21px]">
            {festejo ? "¡Llegaste a tu meta! Eso se celebra." : "¿Te aguantaste un antojo? Anótalo y esa plata pasa al frasco."}
          </p>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <Boton variante="secundario" onClick={() => abrir("guardar")}>
            Guardé plata
          </Boton>
          <Boton variante="secundario" onClick={() => abrir("sacar")}>
            Usé una parte
          </Boton>
        </div>

        {festejo && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-4 rounded-[20px] bg-reward/30 p-4">
            <p className="font-extrabold">Meta cumplida: {soles(meta)}. +20 monedas.</p>
            <div className="mt-3">
              <Boton variante="premio" onClick={compartir}>
                Compartir mi logro
              </Boton>
            </div>
          </motion.div>
        )}

        <section className="mt-6">
          <h2 className="text-tarjeta font-extrabold">Movimientos del frasco</h2>
          {lista.length === 0 ? (
            <p className="mt-2 text-text-soft">Todavía vacío. El primer sol es el que más cuesta.</p>
          ) : (
            <ul className="mt-2 flex flex-col gap-2">
              {lista.map((a, i) => (
                <motion.li key={a.id} {...entradaEnCascada(i)} className="flex min-h-14 items-center justify-between rounded-[16px] bg-card px-4 py-2">
                  <span>
                    <span className="block font-extrabold">{a.nota}</span>
                    <span className="text-ayuda text-text-soft">{bonita(a.fecha)}</span>
                  </span>
                  <span className={`numeros font-black ${a.monto > 0 ? "text-reward-dark" : "text-text-soft"}`}>
                    {a.monto > 0 ? "+ " : "− "}
                    {soles(a.monto)}
                  </span>
                </motion.li>
              ))}
            </ul>
          )}
        </section>
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
            <input value={nombre} onChange={(ev) => setNombre(ev.target.value)} placeholder="Ese polo, una chela…" className="mt-1 h-14 w-full rounded-[16px] border-2 border-surface bg-card px-4 outline-none focus:border-brand" />
          </label>
          <CampoSoles etiqueta="¿Cuánto costaba?" valor={monto} alCambiar={setMonto} />
          <Boton variante="premio" deshabilitado={!aNumero(monto)} onClick={() => aportar(aNumero(monto), "antojo", `Antojo ahorrado: ${nombre.trim() || "algo"}`)}>
            Echar {aNumero(monto) ? soles(aNumero(monto)) : ""} al frasco
          </Boton>
        </div>
      </Ventana>

      <Ventana abierta={accion === "guardar" || accion === "sacar"} alCerrar={() => setAccion(null)} titulo={accion === "sacar" ? "¿Cuánto usaste?" : "¿Cuánto guardaste?"}>
        <div className="flex flex-col gap-4">
          <CampoSoles etiqueta="Monto" valor={monto} alCambiar={setMonto} autoFocus />
          {accion === "sacar" && <p className="text-ayuda text-text-soft">Usarlo en un imprevisto no es fallar: para eso existe.</p>}
          <Boton
            deshabilitado={!aNumero(monto) || (accion === "sacar" && aNumero(monto) > total)}
            onClick={() => (accion === "sacar" ? aportar(-aNumero(monto), "manual", "Lo usé") : aportar(aNumero(monto), "manual", "Guardé plata"))}
          >
            Listo
          </Boton>
        </div>
      </Ventana>

      <Ventana abierta={accion === "meta"} alCerrar={() => setAccion(null)} titulo="Tu meta">
        <div className="flex flex-col gap-4">
          <p className="text-ayuda text-text-soft">Una buena primera meta: lo que gastas en una semana. Después, un mes.</p>
          <CampoSoles etiqueta="Meta del colchón" valor={monto} alCambiar={setMonto} autoFocus />
          <Boton
            deshabilitado={!aNumero(monto)}
            onClick={() => {
              actualizarVida((s) => ({ colchon: { ...s.colchon, meta: aNumero(monto) } }));
              setAccion(null);
              setFestejo(false);
            }}
          >
            Guardar meta
          </Boton>
        </div>
      </Ventana>
    </Pagina>
  );
}
