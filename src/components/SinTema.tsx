import { Boton } from "./Boton";
import { Leon } from "./Leon";
import { navegar } from "../lib/rutas";

/** Lo que se ve cuando todavía no hay ningún tema propio. Invita a agregar el primero. */
export function SinTema({ titulo = "Aún no tienes temas", texto = "Agrega el primero y lo vuelvo juego para ti.", compacto = false }: { titulo?: string; texto?: string; compacto?: boolean }) {
  return (
    <section className={`flex flex-col items-center gap-3 rounded-tarjeta border-2 border-surface bg-card p-5 text-center ${compacto ? "" : "my-2"}`}>
      <Leon pose="anima" alto={compacto ? 110 : 150} rebote />
      <h2 className="text-tarjeta font-extrabold">{titulo}</h2>
      <p className="max-w-[30ch] text-text-soft">{texto}</p>
      <div className="w-full">
        <Boton onClick={() => navegar("/student/cursos")}>Agregar mi primer tema</Boton>
      </div>
    </section>
  );
}
