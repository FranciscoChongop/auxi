import { useEffect, useRef, useState } from "react";
import { Boton } from "../../components/Boton";
import { useAviso } from "../../components/Aviso";
import { hoy, sumarDias } from "../../lib/fechas";
import { metricas, primerDiaDeUso } from "../../lib/metricas";
import { reemplazar } from "../../lib/rutas";
import { sonidos } from "../../lib/sonidos";
import { CATEGORIAS_GASTO } from "../entender";
import { anotar, desglose, obtenerVida, soles } from "../estado";
import { guardarLogro } from "../logro";
import { aNumero, CampoSoles, Chip, Encabezado, LeonVida, Pagina, PieFijo } from "../ui";

/**
 * Captura de Yape o Plin → gasto. La imagen solo se muestra en el celular y se descarta:
 * nunca se sube ni se guarda. (La lectura automática con IA llega en la Fase V3.)
 */
export default function Captura() {
  const aviso = useAviso();
  const entrada = useRef<HTMLInputElement>(null);
  const [vista, setVista] = useState<string | null>(null);
  const [monto, setMonto] = useState("");
  const [destino, setDestino] = useState("");
  const [categoria, setCategoria] = useState("Otros");
  const [fecha, setFecha] = useState(hoy());
  const h = hoy();

  // La imagen vive solo en memoria y se suelta al salir.
  useEffect(() => () => {
    if (vista) URL.revokeObjectURL(vista);
  }, [vista]);

  const elegir = (f: File | undefined) => {
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      aviso("Eso no parece una imagen. Elige la captura del comprobante.", "error");
      return;
    }
    setVista(URL.createObjectURL(f));
    sonidos.toque();
  };

  const guardar = () => {
    const l = anotar({ tipo: "gasto", monto: aNumero(monto), categoria, nota: destino.trim() ? `Yape/Plin a ${destino.trim()}` : "Pago con Yape/Plin", fecha, origen: "captura" });
    metricas.vidaAnotado({ tipo: "gasto", origen: "captura", primero: l.primero, primerDia: primerDiaDeUso("vida") });
    sonidos.acierto();
    if (vista) URL.revokeObjectURL(vista);
    setVista(null);
    const d = desglose(obtenerVida());
    if (l.primero) {
      guardarLogro({ ...l, quedan: d.quedan });
      reemplazar("/vida/logro");
    } else {
      aviso(d.quedan < 0 ? `Anotado. Hoy te pasaste ${soles(-d.quedan)}; mañana ajustamos.` : `Anotado. Hoy te quedan ${soles(d.quedan)}.`, "exito");
      reemplazar("/vida/hoy");
    }
  };

  return (
    <Pagina className="flex flex-col">
      <Encabezado titulo="Subir captura" />
      <div className="flex flex-1 flex-col px-5 pt-2">
        {!vista ? (
          <div className="flex flex-col items-center text-center">
            <LeonVida pose="detective" alto={190} rebote />
            <h2 className="mt-3 text-titulo font-black">Sube tu comprobante de Yape o Plin</h2>
            <p className="mt-2 text-text-soft">Lo pones al lado y anotas el monto en un toque.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex gap-3">
              <img src={vista} alt="Tu captura (solo en este celular)" className="h-40 w-auto rounded-[16px] border-2 border-surface object-contain" />
              <div className="flex-1">
                <p className="font-extrabold">Mira la captura y escribe lo que ves.</p>
                <p className="mt-1 text-ayuda text-text-soft">Muy pronto León la leerá solo. Por ahora, tú le dictas el monto.</p>
              </div>
            </div>
            <CampoSoles etiqueta="Monto pagado" valor={monto} alCambiar={setMonto} autoFocus />
            <label className="block">
              <span className="text-ayuda font-extrabold text-text-soft">¿A quién? (opcional)</span>
              <input value={destino} onChange={(ev) => setDestino(ev.target.value)} placeholder="Bodega Don Lucho" className="mt-1 h-14 w-full rounded-[16px] border-2 border-surface bg-card px-4 outline-none focus:border-brand" />
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIAS_GASTO.map((c) => (
                <Chip key={c} activo={categoria === c} onClick={() => setCategoria(c)}>
                  {c}
                </Chip>
              ))}
            </div>
            <div className="flex gap-2">
              {[
                ["Hoy", h],
                ["Ayer", sumarDias(h, -1)],
                ["Anteayer", sumarDias(h, -2)],
              ].map(([n, f]) => (
                <Chip key={f} activo={fecha === f} onClick={() => setFecha(f)}>
                  {n}
                </Chip>
              ))}
            </div>
          </div>
        )}
        <p className="mt-5 flex items-start gap-2 rounded-[16px] bg-surface p-3 text-ayuda">
          <svg viewBox="0 0 24 24" className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden="true">
            <path d="M7 11V8a5 5 0 0 1 10 0v3M5.5 11h13v9.5h-13z" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" />
          </svg>
          La captura no se guarda ni se sube: solo se anota el monto y la fecha.
        </p>
      </div>
      <input ref={entrada} type="file" accept="image/*" className="hidden" onChange={(ev) => elegir(ev.target.files?.[0])} />
      <PieFijo>
        {!vista ? (
          <Boton onClick={() => entrada.current?.click()}>Elegir captura</Boton>
        ) : (
          <Boton deshabilitado={!aNumero(monto)} onClick={guardar}>
            Anotar {aNumero(monto) ? soles(aNumero(monto)) : "gasto"}
          </Boton>
        )}
      </PieFijo>
    </Pagina>
  );
}
