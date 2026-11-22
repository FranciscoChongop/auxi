import { Boton } from "../components/Boton";
import { useAviso } from "../components/Aviso";
import { Leon } from "../components/Leon";
import { actualizar } from "../lib/estado";
import { navegar } from "../lib/rutas";

/** Primera pantalla. No pide cuenta: primero se juega. */
export default function Bienvenida() {
  const aviso = useAviso();
  return (
    <main
      className="mx-auto flex min-h-dvh max-w-md flex-col px-5"
      style={{ paddingTop: "calc(env(safe-area-inset-top) + 24px)", paddingBottom: "calc(env(safe-area-inset-bottom) + 20px)" }}
    >
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <Leon pose="saluda" alto={280} rebote />
        <h1 className="mt-6 text-titulo font-black">Estudia jugando con León</h1>
        <p className="mt-3 max-w-[30ch] text-text-soft">
          Sube lo que te dejaron y estudia jugando, con una IA que te pregunta en vez de copiarte.
        </p>
      </div>
      <div className="flex flex-col gap-3 pt-6">
        <Boton
          onClick={() => {
            actualizar(() => ({ bienvenidaVista: true }));
            navegar("/studio/material");
          }}
        >
          Empezar
        </Boton>
        <button
          type="button"
          onClick={() => aviso("Las cuentas llegan muy pronto.", "info")}
          className="h-11 cursor-pointer text-[16px] font-extrabold text-brand"
        >
          Ya tengo cuenta
        </button>
      </div>
    </main>
  );
}
