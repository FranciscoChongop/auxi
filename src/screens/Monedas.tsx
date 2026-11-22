import { motion } from "motion/react";
import type { ReactNode } from "react";
import { useAviso } from "../components/Aviso";
import { Boton } from "../components/Boton";
import { ContadorAnimado } from "../components/ContadorAnimado";
import { Escudo, Moneda, Pantalla } from "../components/Navegacion";
import { lanzarConfeti } from "../lib/confeti";
import { useEstado } from "../lib/estado";
import { entradaEnCascada } from "../lib/movimiento";
import { navegar } from "../lib/rutas";
import { sonidos } from "../lib/sonidos";
import { comprar, cupoTotal, FORMAS_DE_GANAR, importadosUsados, PRECIO_CUPO, PRECIO_PASE, PRECIO_PROTECTOR } from "../lib/tienda";

function Producto({ indice, icono, titulo, detalle, precio, deshabilitado, etiqueta, onClick }: {
  indice: number;
  icono: ReactNode;
  titulo: string;
  detalle: string;
  precio: number;
  deshabilitado?: boolean;
  etiqueta?: string;
  onClick: () => void;
}) {
  return (
    <motion.div {...entradaEnCascada(indice)} className="flex items-center gap-3 rounded-tarjeta border-2 border-surface bg-card p-4">
      <span className="grid size-12 shrink-0 place-items-center rounded-[12px] bg-surface">{icono}</span>
      <span className="flex-1">
        <span className="block font-extrabold">{titulo}</span>
        <span className="block text-ayuda text-text-soft">{detalle}</span>
      </span>
      <button
        type="button"
        disabled={deshabilitado}
        onClick={onClick}
        className="flex h-11 min-w-20 cursor-pointer items-center justify-center gap-1 rounded-boton bg-reward px-3 font-black text-text disabled:cursor-default disabled:bg-surface disabled:text-text-soft"
      >
        {etiqueta ?? (
          <>
            <Moneda className="size-4" />
            {precio}
          </>
        )}
      </button>
    </motion.div>
  );
}

export default function Monedas() {
  const e = useEstado();
  const aviso = useAviso();

  function comprarYa(tipo: "cupo" | "pase" | "protector", mensaje: string) {
    const r = comprar(tipo);
    if (r.ok) {
      sonidos.acierto();
      void lanzarConfeti();
      aviso(mensaje, "premio");
    } else {
      sonidos.error();
      aviso(`Te faltan ${r.faltan} monedas.`, "info");
    }
  }

  return (
    <Pantalla titulo="Monedas" atras="/studio/perfil">
      <div className="flex items-center gap-3 rounded-tarjeta bg-brand p-4 text-white" style={{ boxShadow: "0 4px 0 var(--brand-dark)" }}>
        <Moneda className="size-12" />
        <div>
          <p className="numeros text-[40px] leading-none font-black">
            <ContadorAnimado valor={e.monedas} />
          </p>
          <p className="text-ayuda font-bold opacity-90">monedas</p>
        </div>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-tarjeta font-extrabold">En qué usarlas</h2>
        <p className="-mt-1 text-ayuda text-text-soft">
          {e.pasePorVida
            ? "Tienes el pase libre: temas importados sin límite, para siempre."
            : `Usas ${importadosUsados(e)} de ${cupoTotal(e)} temas importados. Lo que ya importaste nunca se bloquea.`}
        </p>
        <Producto
          indice={0}
          icono={<span className="text-[22px] font-black text-brand">+1</span>}
          titulo="Un tema más"
          detalle="Otro cupo para importar un tema con tu IA"
          precio={PRECIO_CUPO}
          deshabilitado={e.pasePorVida}
          etiqueta={e.pasePorVida ? "Ya tienes" : undefined}
          onClick={() => comprarYa("cupo", "Tienes un cupo más.")}
        />
        <Producto
          indice={1}
          icono={<span className="text-[22px] font-black text-brand">∞</span>}
          titulo="Pase libre de por vida"
          detalle="Temas importados sin límite, para siempre"
          precio={PRECIO_PASE}
          deshabilitado={e.pasePorVida}
          etiqueta={e.pasePorVida ? "Activo" : undefined}
          onClick={() => comprarYa("pase", "¡Pase libre activado! Sin límite de temas.")}
        />
        <Producto
          indice={2}
          icono={<Escudo className="size-7" />}
          titulo="Protector de racha"
          detalle={`Cuida tu racha un día. Tienes ${e.racha.protectores}.`}
          precio={PRECIO_PROTECTOR}
          onClick={() => comprarYa("protector", "Protector agregado.")}
        />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-tarjeta font-extrabold">Cómo conseguirlas</h2>
        <ul className="flex flex-col gap-2">
          {FORMAS_DE_GANAR.map((f) => (
            <li key={f.texto} className="flex items-center gap-3 rounded-boton bg-surface px-4 py-3">
              <span className="flex-1">
                <span className="block font-extrabold">{f.texto}</span>
                <span className="block text-ayuda text-text-soft">{f.detalle}</span>
              </span>
              <span className="flex items-center gap-1 font-black">
                <Moneda className="size-4" />
                {f.monedas}
              </span>
            </li>
          ))}
        </ul>
        <Boton variante="secundario" onClick={() => navegar("/studio/perfil")}>
          Ver las misiones de apoyo
        </Boton>
        <p className="text-center text-ayuda text-text-soft">
          Las misiones son opcionales y funcionan por confianza: no comprobamos si seguiste o comentaste. El premio es igual para todos.
        </p>
      </section>
    </Pantalla>
  );
}
