import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { Boton } from "../../components/Boton";
import { entradaEnCascada } from "../../lib/movimiento";
import { navegar } from "../../lib/rutas";
import { actualizarVida, entrarAlEjemplo, obtenerVida } from "../estado";
import { LeonVida, MarcaVida, Pagina, PieFijo } from "../ui";

const PUNTOS = [
  { titulo: "Cuánto puedes gastar hoy", texto: "Un número estimado cada día, en pocos pasos." },
  { titulo: "Metas que se ven crecer", texto: "Frascos para tu colchón y para lo que quieras." },
  { titulo: "Protégete antes de pagar", texto: "León revisa contigo ese mensaje, enlace o vendedor." },
];

export default function Bienvenida() {
  // León saluda con rebote solo la primera vez.
  const [primera] = useState(() => !obtenerVida().saludoVisto);
  useEffect(() => {
    if (primera) actualizarVida(() => ({ saludoVisto: true }));
  }, [primera]);

  return (
    <Pagina className="flex flex-col">
      <div className="flex items-center justify-between px-5" style={{ paddingTop: "calc(env(safe-area-inset-top) + 16px)" }}>
        <MarcaVida />
        <a href="/student" className="flex min-h-11 items-center text-ayuda font-extrabold text-text-soft">
          ¿Eres estudiante? Auxi Student
        </a>
      </div>

      <div className="relative mx-5 mt-5 overflow-hidden rounded-[28px] bg-success/50 pt-6">
        <div className="absolute -right-10 -bottom-16 size-56 rounded-full bg-card/60" aria-hidden="true" />
        <LeonVida pose="saluda" alto={220} rebote={primera} className="relative" />
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
        <div className="flex flex-col gap-3">
          <Boton onClick={() => navegar("/vida/empezar")}>Empezar</Boton>
          <Boton
            variante="secundario"
            onClick={() => {
              entrarAlEjemplo();
              navegar("/vida/hoy");
            }}
          >
            Ver un ejemplo sin dar mis datos
          </Boton>
        </div>
        <p className="mt-3 text-center text-ayuda text-text-soft">Gratis. Auxi Vida no mueve tu plata ni presta.</p>
        <p className="mt-1 flex justify-center gap-4 text-ayuda font-extrabold">
          <a href="/student/privacidad" className="min-h-11 content-center text-brand underline">
            Privacidad
          </a>
          <a href="/student/terminos" className="min-h-11 content-center text-brand underline">
            Condiciones
          </a>
        </p>
      </PieFijo>
    </Pagina>
  );
}
