import { useState } from "react";
import { borrarMiCuenta, useCuenta } from "../lib/nube";
import { reemplazar } from "../lib/rutas";
import { Boton } from "./Boton";
import { Ventana } from "./Ventana";

const PALABRA = "BORRAR";

/** «Borrar mi cuenta»: explica qué se borra, pide escribir BORRAR y no se puede deshacer. */
export function BorrarCuenta() {
  const cuenta = useCuenta();
  const [abierta, setAbierta] = useState(false);
  const [texto, setTexto] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (cuenta.modo !== "conectado") return null;

  const cerrar = () => {
    if (ocupado) return;
    setAbierta(false);
    setTexto("");
    setError(null);
  };

  const borrar = async () => {
    setOcupado(true);
    setError(null);
    const r = await borrarMiCuenta();
    setOcupado(false);
    if (r) return setError(r);
    setAbierta(false);
    reemplazar("/");
  };

  return (
    <>
      <button type="button" onClick={() => setAbierta(true)} className="mt-2 h-11 cursor-pointer font-extrabold text-error underline underline-offset-4">
        Borrar mi cuenta
      </button>
      <Ventana abierta={abierta} alCerrar={cerrar} titulo="¿Borrar tu cuenta de Auxi?">
        <div className="flex flex-col gap-3">
          <p>Se borra para siempre y no se puede deshacer:</p>
          <ul className="list-disc pl-5 text-ayuda">
            <li>Tu cuenta ({cuenta.email}) y tu acceso con correo o Google.</li>
            <li>Tu avance de Auxi Student: cursos, temas, PDF, lecciones, racha y entregas.</li>
            <li>Tus monedas, cupos, pase libre y solicitudes de apoyo.</li>
            <li>Tus datos de Auxi Vida, en la cuenta y en este dispositivo.</li>
          </ul>
          <p className="text-ayuda text-text-soft">Si usaste Auxi en otros dispositivos, lo guardado solo allí se queda en esos navegadores hasta que lo borres desde ellos.</p>
          <label className="block">
            <span className="font-bold">
              Para confirmar, escribe <b>{PALABRA}</b>
            </span>
            <input
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              autoComplete="off"
              autoCapitalize="characters"
              className="mt-1 h-14 w-full rounded-boton border-2 border-surface bg-card px-4 text-[17px] font-semibold outline-none focus:border-error"
              aria-describedby={error ? "error-borrar" : undefined}
            />
          </label>
          {error && (
            <p id="error-borrar" role="alert" className="rounded-boton border-2 border-error bg-card px-4 py-3 font-bold text-error-dark">
              {error}
            </p>
          )}
          <Boton variante="secundario" deshabilitado={texto.trim().toUpperCase() !== PALABRA || ocupado} onClick={borrar}>
            {ocupado ? "Borrando…" : "Sí, borrar mi cuenta"}
          </Boton>
          <Boton onClick={cerrar}>No, mejor no</Boton>
        </div>
      </Ventana>
    </>
  );
}
