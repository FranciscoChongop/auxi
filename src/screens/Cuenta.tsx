import { useState } from "react";
import { Boton } from "../components/Boton";
import { Leon } from "../components/Leon";
import { Pantalla } from "../components/Navegacion";
import { salir, useCuenta } from "../lib/nube";
import { parametro, reemplazar } from "../lib/rutas";
import Entrada from "./Entrada";

export default function Cuenta() {
  const cuenta = useCuenta();
  const [volver] = useState(() => parametro("volver") ?? "/teach/inicio");
  if (cuenta.modo === "sin-nube") {
    return (
      <Pantalla titulo="Tu cuenta" atras={volver} conBarra={false}>
        <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
          <Leon pose="anima" alto={200} rebote />
          <p className="text-tarjeta font-extrabold">Las cuentas llegan muy pronto</p>
          <p className="text-text-soft">Mientras, tu avance se guarda en este celular.</p>
        </div>
        <Boton onClick={() => reemplazar(volver)}>Seguir</Boton>
      </Pantalla>
    );
  }

  if (cuenta.modo === "conectado") {
    return (
      <Pantalla titulo="Tu cuenta" atras={volver} conBarra={false}>
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
          <Leon pose="celebra" alto={200} rebote />
          <p className="text-tarjeta font-extrabold">Tu avance está a salvo</p>
          <p className="font-bold break-all text-text-soft">{cuenta.email}</p>
          <p className="flex items-center gap-2 text-ayuda font-bold text-text-soft" aria-live="polite">
            <span className={`size-2 rounded-full ${cuenta.error ? "bg-error" : cuenta.guardando ? "bg-reward" : "bg-success-dark"}`} />
            {cuenta.error ?? (cuenta.guardando ? "Guardando…" : "Todo guardado en tu cuenta")}
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <Boton onClick={() => reemplazar(volver)}>Seguir estudiando</Boton>
          <button
            type="button"
            onClick={async () => {
              await salir();
              reemplazar("/teach");
            }}
            className="h-11 cursor-pointer font-extrabold text-error"
          >
            Cerrar sesión en este celular
          </button>
        </div>
      </Pantalla>
    );
  }

  return <Entrada />;
}
