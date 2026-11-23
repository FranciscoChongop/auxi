import { useEffect } from "react";
import { Boton } from "../../components/Boton";
import { useCuenta } from "../../lib/nube";
import { reemplazar } from "../../lib/rutas";
import Entrada from "../../screens/Entrada";
import { actualizarVida } from "../estado";
import { CaraLeonVida, LeonVida, Pagina, PieFijo } from "../ui";

/** Después del primer gasto: crear la cuenta Auxi (la misma de Auxi Teach). Siempre se puede dejar para después. */
export default function Cuenta() {
  const cuenta = useCuenta();
  useEffect(() => {
    actualizarVida(() => ({ cuentaOfrecida: true }));
  }, []);
  const despues = () => reemplazar("/vida/hoy");

  if (cuenta.modo === "cargando") return <div className="min-h-dvh bg-bg" />;

  if (cuenta.modo === "invitado") {
    return (
      <div className="relative">
        <button
          type="button"
          onClick={despues}
          aria-label="Ahora no, cerrar"
          className="absolute right-4 z-10 grid size-11 cursor-pointer place-items-center rounded-full bg-surface"
          style={{ top: "calc(env(safe-area-inset-top) + 20px)" }}
        >
          <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </button>
        <Entrada titulo="Auxi Vida" cabecera={<CaraLeonVida cara="risa" tamano={64} />} />
      </div>
    );
  }

  const conectado = cuenta.modo === "conectado";
  return (
    <Pagina className="flex flex-col">
      <div className="flex flex-1 flex-col items-center px-5 text-center" style={{ paddingTop: "calc(env(safe-area-inset-top) + 40px)" }}>
        <LeonVida pose="saluda" alto={200} rebote />
        <h1 className="mt-4 text-titulo font-black">{conectado ? "Ya estás con tu cuenta Auxi" : "Tu avance está en este celular"}</h1>
        <p className="mt-2 max-w-xs text-text-soft">
          {conectado
            ? `Entraste como ${cuenta.email ?? "tu cuenta"}. Es la misma cuenta de Auxi Teach. En esta versión de prueba, lo que anotas en Vida se guarda en este celular; pronto se guardará también en tu cuenta.`
            : "Las cuentas aún no están activadas aquí. Todo lo que anotas se guarda en este celular."}
        </p>
      </div>
      <PieFijo>
        <Boton onClick={despues}>Ir a Hoy</Boton>
      </PieFijo>
    </Pagina>
  );
}
