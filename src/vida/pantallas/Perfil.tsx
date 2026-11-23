import { useState, type ReactNode } from "react";
import { ApoyaAlCreador } from "../../components/ApoyaAlCreador";
import { useAviso } from "../../components/Aviso";
import { Boton } from "../../components/Boton";
import { AjustesDeSonido } from "../../components/Interruptor";
import { Escudo, Llama, Moneda } from "../../components/Navegacion";
import { Ventana } from "../../components/Ventana";
import { hoy } from "../../lib/fechas";
import { metricas } from "../../lib/metricas";
import { useCuenta } from "../../lib/nube";
import { navegar, reemplazar } from "../../lib/rutas";
import { sonidos } from "../../lib/sonidos";
import { actualizarVida, borrarVida, NOMBRE_VIDA, obtenerVida, PRECIO_PROTECTOR, rachaVigente, useVida } from "../estado";
import { Chip, Encabezado, GrupoUnico, LeonVida, Pagina } from "../ui";
import { Interruptor } from "../../components/Interruptor";
import { WHATSAPP_REVISION } from "../../lib/apoyo";
import { activarSugerencias } from "../sugerencias";

const VENDOE_URL = "https://www.vendoe.es/";

const MISIONES = [
  { id: "compartir", texto: "Comparte tu racha", premio: 20 },
  { id: "invitar", texto: "Invita a alguien a Vida", premio: 40 },
];

function Bloque({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="rounded-[20px] border-2 border-surface bg-card p-4">
      <h2 className="mb-3 text-tarjeta font-extrabold">{titulo}</h2>
      {children}
    </section>
  );
}

export default function Perfil() {
  const e = useVida();
  const aviso = useAviso();
  const cuenta = useCuenta();
  const [borrar, setBorrar] = useState(false);
  const dias = rachaVigente(e);

  const premiar = (id: string, premio: number) => {
    if (e.misiones[id]) return;
    actualizarVida((s) => ({ misiones: { ...s.misiones, [id]: true }, monedas: s.monedas + premio }));
    sonidos.acierto();
    aviso(`¡Gracias! +${premio} monedas.`, "premio");
  };

  const compartir = async (id: string, premio: number) => {
    const texto = id === "invitar" ? "Yo anoto mis gastos con León en Auxi Vida y sé cuánto puedo gastar cada día. Es gratis." : `Llevo ${dias} días anotando mis gastos con León en Auxi Vida.`;
    try {
      if (navigator.share) await navigator.share({ title: NOMBRE_VIDA, text: texto, url: `${location.origin}/vida` });
      else await navigator.clipboard.writeText(`${texto} ${location.origin}/vida`);
      if (id === "invitar") metricas.invitacion("vida");
      premiar(id, premio);
    } catch {
      // Cerró el menú sin compartir: la misión queda disponible.
    }
  };

  const comprarProtector = () => {
    if (e.monedas < PRECIO_PROTECTOR) return;
    actualizarVida((s) => ({ monedas: s.monedas - PRECIO_PROTECTOR, racha: { ...s.racha, protectores: s.racha.protectores + 1 } }));
    sonidos.acierto();
    aviso("Protector listo. Cuida tu racha si un día no anotas.", "premio");
  };

  const exportar = () => {
    const s = obtenerVida();
    const filas = [["fecha", "tipo", "monto", "moneda", "categoria", "nota", "origen", "operacion"], ...s.movimientos.map((m) => [m.fecha, m.clase ?? m.tipo, String(m.monto), m.moneda ?? "PEN", m.categoria, m.nota, m.origen, m.operacion ?? ""])];
    const csv = filas.map((f) => f.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `auxi-vida-${hoy()}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    aviso("Listo: se descargó tu archivo con todo lo que anotaste.", "exito");
  };

  return (
    <Pagina>
      <Encabezado titulo="Perfil y ajustes" />
      <div className="flex flex-col gap-4 px-5 pt-2 pb-6">
        <div className="flex items-center gap-4">
          <LeonVida pose="icono" alto={72} />
          <div>
            <p className="text-tarjeta font-extrabold">Tu perfil</p>
            <p className="text-ayuda break-all text-text-soft">{cuenta.modo === "conectado" ? cuenta.email : "Lo que anotas se guarda en este celular."}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Dato icono={<Llama activa={dias > 0} className="size-7" />} valor={String(dias)} texto="días anotando" />
          <Dato icono={<Moneda className="size-7" />} valor={String(e.monedas)} texto="monedas" />
          <Dato icono={<Escudo className="size-7" />} valor={String(e.racha.protectores)} texto="protectores" />
        </div>

        <div className="flex items-center gap-3 rounded-[20px] bg-surface p-4">
          <p className="flex-1 text-ayuda">
            <b className="text-[15px]">Protector de racha</b>
            <br />
            Si un día no anotas, cuida tu racha. Cuesta {PRECIO_PROTECTOR} monedas.
          </p>
          <button
            type="button"
            disabled={e.monedas < PRECIO_PROTECTOR}
            onClick={comprarProtector}
            className="h-11 cursor-pointer rounded-[12px] bg-card px-3 font-extrabold text-brand disabled:cursor-default disabled:text-text-soft"
          >
            Comprar
          </button>
        </div>

        <Bloque titulo="Tu plan">
          <p className="font-extrabold">Lo que sobra al final del día</p>
          <div className="mt-2">
            <GrupoUnico etiqueta="Lo que sobra al final del día">
              <Chip radio activo={e.sobrante === "manana"} onClick={() => actualizarVida(() => ({ sobrante: "manana" }))}>
                Pasa a mañana
              </Chip>
              <Chip radio activo={e.sobrante === "colchon"} onClick={() => actualizarVida(() => ({ sobrante: "colchon" }))}>
                Va al colchón
              </Chip>
            </GrupoUnico>
          </div>
          <div className="mt-4">
            <Boton variante="secundario" onClick={() => navegar("/vida/plan")}>
              Cambiar mis números
            </Boton>
          </div>
        </Bloque>

        <Bloque titulo="Misiones de apoyo">
          <p className="mb-3 text-ayuda text-text-soft">Son opcionales y nunca bloquean nada. Si quieres ayudarnos, te damos monedas.</p>
          <ul className="flex flex-col gap-2">
            {MISIONES.map((m) => {
              const hecha = !!e.misiones[m.id];
              return (
                <li key={m.id} className="flex items-center gap-3 rounded-[14px] bg-surface px-3 py-2">
                  <span className="flex-1 font-bold">{m.texto}</span>
                  <span className="flex items-center gap-1 text-ayuda font-black">
                    <Moneda className="size-4" />+{m.premio}
                  </span>
                  <button
                    type="button"
                    disabled={hecha}
                    onClick={() => compartir(m.id, m.premio)}
                    className="h-11 min-w-20 cursor-pointer rounded-[10px] bg-card px-3 text-[15px] font-extrabold text-brand disabled:cursor-default disabled:text-text-soft"
                  >
                    {hecha ? "Hecha" : "Hacer"}
                  </button>
                </li>
              );
            })}
          </ul>
        </Bloque>

        <Bloque titulo="Ajustes">
          <div className="flex flex-col gap-3">
            <AjustesDeSonido />
            <Interruptor
              etiqueta="Reducir movimiento"
              ayuda="Menos animaciones y sin confeti."
              activo={e.menosMovimiento}
              alCambiar={(v) => actualizarVida(() => ({ menosMovimiento: v }))}
            />
            <Interruptor
              etiqueta="Sugerencias de Auxi Vida"
              ayuda="Tarjetas que te cuentan funciones útiles, como importar movimientos. Máximo una por visita."
              activo={e.sugerencias.activas}
              alCambiar={activarSugerencias}
            />
          </div>
          <ApoyaAlCreador />
        </Bloque>

        <Bloque titulo="Importar movimientos">
          <p className="text-ayuda text-text-soft">Tus fuentes, el historial de importaciones y tus reglas de categorías.</p>
          <div className="mt-3">
            <Boton variante="secundario" onClick={() => navegar("/vida/importar")}>
              Ver mis fuentes
            </Boton>
          </div>
        </Bloque>

        <Bloque titulo="Recordatorios">
          <p className="text-ayuda text-text-soft">Tus pagos y fechas salen en Hoy los días antes que elijas en cada uno. Los avisos al celular llegan pronto.</p>
          <div className="mt-3">
            <Boton variante="secundario" onClick={() => navegar("/vida/movimientos?ver=pagos")}>
              Mis pagos y fechas
            </Boton>
          </div>
        </Bloque>

        <Bloque titulo="Ayuda">
          <a href={WHATSAPP_REVISION} target="_blank" rel="noopener noreferrer" className="flex min-h-12 items-center justify-between font-extrabold">
            Escríbenos por WhatsApp <span className="text-brand">Abrir</span>
          </a>
          <button type="button" onClick={() => navegar("/vida/protegete?urgente=1")} className="flex min-h-12 w-full cursor-pointer items-center justify-between font-extrabold">
            Ya pagué o compartí mis datos <span className="text-brand">Ver pasos</span>
          </button>
        </Bloque>

        <Bloque titulo="Mis datos">
          <p className="text-ayuda text-text-soft">Tus datos son tuyos y viven en este celular. Las capturas no se guardan; de tus revisiones solo guardo el texto con claves y números ocultos.</p>
          <div className="mt-3 flex flex-col gap-2">
            <Boton variante="secundario" onClick={exportar}>
              Descargar lo que anoté
            </Boton>
            <button type="button" onClick={() => setBorrar(true)} className="h-11 cursor-pointer font-extrabold text-error">
              Borrar todo lo de Vida
            </button>
            <a href="/teach/privacidad" className="flex min-h-11 items-center justify-center text-ayuda font-extrabold text-brand underline">
              Política de privacidad
            </a>
          </div>
        </Bloque>

        <a href="/" className="flex min-h-14 items-center justify-between rounded-[20px] border-2 border-surface bg-card px-4 font-extrabold">
          <span>
            Todas mis mini apps
            <span className="block text-ayuda font-semibold text-text-soft">Vuelve a Auxi Studio para elegir otra.</span>
          </span>
          <span className="text-brand">Abrir</span>
        </a>

        <a href="/teach" className="flex min-h-14 items-center justify-between rounded-[20px] border-2 border-surface bg-card px-4 font-extrabold">
          <span>
            Ir a Auxi Teach
            <span className="block text-ayuda font-semibold text-text-soft">Para estudiar jugando, con la misma cuenta.</span>
          </span>
          <span className="text-brand">Abrir</span>
        </a>

        <section className="flex items-center gap-4 rounded-[20px] bg-surface p-4">
          <img src="/brand/vendoe.svg" alt="Vendoe" className="h-10 w-auto" />
          <div className="flex-1">
            <p className="font-extrabold">¿Tienes un negocio?</p>
            <p className="text-ayuda text-text-soft">Conoce Vendoe, la app para vender más.</p>
          </div>
          <button
            type="button"
            onClick={() => {
              metricas.clicVendoe("vida-perfil");
              window.open(VENDOE_URL, "_blank", "noopener");
            }}
            className="h-11 cursor-pointer rounded-[10px] bg-card px-3 font-extrabold text-negocio"
          >
            Ver
          </button>
        </section>

        <p className="pb-2 text-center text-ayuda text-text-soft">Auxi Vida no mueve tu plata, no presta y no recomienda productos financieros. Todo es información general.</p>
      </div>

      <Ventana abierta={borrar} alCerrar={() => setBorrar(false)} titulo="¿Borrar todo lo de Vida?">
        <p className="text-text-soft">Se borran tus números, movimientos, metas, pagos y revisiones de este celular. No se puede deshacer. Auxi Teach no se toca.</p>
        <div className="mt-5 flex flex-col gap-3">
          <Boton
            variante="secundario"
            onClick={() => {
              borrarVida();
              setBorrar(false);
              reemplazar("/vida");
            }}
          >
            Sí, borrar todo
          </Boton>
          <Boton onClick={() => setBorrar(false)}>No, mejor no</Boton>
        </div>
      </Ventana>
    </Pagina>
  );
}

function Dato({ icono, valor, texto }: { icono: ReactNode; valor: string; texto: string }) {
  return (
    <div className="flex flex-col items-center rounded-[20px] bg-card p-3 text-center">
      {icono}
      <span className="numeros text-tarjeta font-black">{valor}</span>
      <span className="text-[13px] leading-[17px] font-bold text-text-soft">{texto}</span>
    </div>
  );
}
