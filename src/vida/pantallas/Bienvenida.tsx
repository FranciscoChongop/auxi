import { motion } from "motion/react";
import { Boton } from "../../components/Boton";
import { navegar } from "../../lib/rutas";
import { entradaEnCascada } from "../../lib/movimiento";
import { LeonVida, MarcaVida, Pagina, PieFijo } from "../ui";

const PUNTOS = [
  { titulo: "Cuánto puedes gastar hoy", texto: "Un número claro cada día, no una tabla del mes." },
  { titulo: "Tu colchón crece", texto: "Lo que no gastas puede ir a tu frasco." },
  { titulo: "Que no te estafen", texto: "León revisa ese mensaje raro contigo." },
];

export default function Bienvenida() {
  return (
    <Pagina className="flex flex-col">
      <div className="flex items-center justify-between px-5" style={{ paddingTop: "calc(env(safe-area-inset-top) + 16px)" }}>
        <MarcaVida />
        <a href="/studio" className="flex min-h-11 items-center text-ayuda font-extrabold text-text-soft">
          ¿Eres estudiante? Studio
        </a>
      </div>

      <div className="relative mx-5 mt-5 overflow-hidden rounded-[28px] bg-success/50 pt-6">
        <div className="absolute -right-10 -bottom-16 size-56 rounded-full bg-card/60" aria-hidden="true" />
        <LeonVida pose="saluda" alto={230} rebote className="relative" />
      </div>

      <div className="px-5 pt-6">
        <h1 className="text-titulo font-black">Tu plata, día a día, con León</h1>
        <ul className="mt-4 flex flex-col gap-3">
          {PUNTOS.map((p, i) => (
            <motion.li key={p.titulo} {...entradaEnCascada(i + 2)} className="flex gap-3">
              <span className="mt-1.5 size-3 shrink-0 rounded-full bg-reward shadow-[0_2px_0_var(--reward-dark)]" aria-hidden="true" />
              <span>
                <span className="block font-extrabold">{p.titulo}</span>
                <span className="text-ayuda text-text-soft">{p.texto}</span>
              </span>
            </motion.li>
          ))}
        </ul>
      </div>

      <PieFijo>
        <Boton onClick={() => navegar("/vida/plan")}>Empezar</Boton>
        <p className="mt-3 text-center text-ayuda text-text-soft">Gratis. Auxi Vida no mueve tu plata ni presta.</p>
      </PieFijo>
    </Pagina>
  );
}
