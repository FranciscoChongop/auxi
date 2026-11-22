import { useState } from "react";
import { Boton } from "../components/Boton";
import { CaraDeLeon } from "../components/Leon";
import { actualizar, useEstado, type DatosPersona } from "../lib/estado";
import { metricas } from "../lib/metricas";
import { salir } from "../lib/nube";
import { reemplazar } from "../lib/rutas";

const PAISES = ["Perú", "México", "Colombia", "Chile", "Argentina", "Ecuador", "Bolivia", "España", "Estados Unidos", "Otro"];
const UNIVERSIDADES = [
  "UNMSM (San Marcos)", "PUCP", "UNI", "Universidad de Lima", "UPC", "UNFV", "UNALM (La Molina)", "Universidad del Pacífico",
  "USMP", "UPN", "UCV", "UTP", "Cayetano Heredia", "UNSA (Arequipa)", "UNT (Trujillo)", "UNSAAC (Cusco)", "UNAC (Callao)",
  "Instituto o colegio", "Otra",
];
const CARRERAS = [
  "Administración", "Contabilidad", "Derecho", "Psicología", "Medicina", "Enfermería", "Ingeniería Industrial", "Ingeniería de Sistemas",
  "Ingeniería Civil", "Economía", "Marketing", "Educación", "Arquitectura", "Comunicaciones", "Odontología", "Nutrición", "Otra",
];
const ANIO_ACTUAL = new Date().getFullYear();
const ANIOS = Array.from({ length: ANIO_ACTUAL - 10 - 1950 + 1 }, (_, i) => ANIO_ACTUAL - 10 - i);

const campo =
  "mt-1 h-14 w-full rounded-boton border-2 border-surface bg-card px-4 text-[17px] font-semibold text-text outline-none placeholder:text-text-soft focus:border-brand";

/** Edad en rangos, para métricas sin datos personales. */
const rango = (anio: number) => {
  const edad = ANIO_ACTUAL - anio;
  return edad < 18 ? "menos de 18" : edad < 23 ? "18-22" : edad < 28 ? "23-27" : edad < 35 ? "28-34" : "35 o más";
};

/** Una sola vez, después de crear la cuenta: ayuda a saber quién usa Auxi. Se puede saltar. */
export default function Datos() {
  const e = useEstado();
  const previo = e.datos;
  const [nombre, setNombre] = useState(previo?.nombre ?? "");
  const [anio, setAnio] = useState(previo?.anio ? String(previo.anio) : "");
  const [carrera, setCarrera] = useState(previo?.carrera ?? "");
  const [universidad, setUniversidad] = useState(previo?.universidad ?? "");
  const [pais, setPais] = useState(previo?.pais ?? "Perú");

  function guardar() {
    const datos: DatosPersona = {
      nombre: nombre.trim().slice(0, 40),
      anio: anio ? Number(anio) : null,
      carrera: carrera.trim().slice(0, 60),
      universidad: universidad.trim().slice(0, 60),
      pais,
    };
    actualizar(() => ({ datos }));
    metricas.perfilCompletado({ pais, carrera: datos.carrera, universidad: datos.universidad, edad: datos.anio ? rango(datos.anio) : "sin dato" });
    reemplazar("/studio/inicio");
  }

  const completo = nombre.trim().length >= 2 && !!anio && carrera.trim().length >= 2 && universidad.trim().length >= 2 && !!pais;

  return (
    <main
      className="mx-auto flex min-h-dvh max-w-md flex-col gap-4 px-5"
      style={{ paddingTop: "calc(env(safe-area-inset-top) + 20px)", paddingBottom: "calc(env(safe-area-inset-bottom) + 20px)" }}
    >
      <div className="flex items-center gap-3">
        <CaraDeLeon cara="guino" tamano={56} />
        <div>
          <h1 className="text-[24px] leading-tight font-black">Cuéntanos de ti</h1>
          <p className="font-bold text-text-soft">Responde las 5 preguntas para empezar.</p>
        </div>
      </div>

      <label className="block font-bold">
        ¿Cómo te llamas?
        <input type="text" autoComplete="given-name" value={nombre} onChange={(ev) => setNombre(ev.target.value)} placeholder="Tu nombre" className={campo} />
      </label>
      <label className="block font-bold">
        Año en que naciste
        <select value={anio} onChange={(ev) => setAnio(ev.target.value)} className={campo}>
          <option value="">Elige tu año</option>
          {ANIOS.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </label>
      <label className="block font-bold">
        ¿Qué estudias?
        <input list="carreras" type="text" value={carrera} onChange={(ev) => setCarrera(ev.target.value)} placeholder="Elige o escribe tu carrera" className={campo} />
        <datalist id="carreras">
          {CARRERAS.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      </label>
      <label className="block font-bold">
        ¿Dónde estudias?
        <input list="universidades" type="text" value={universidad} onChange={(ev) => setUniversidad(ev.target.value)} placeholder="Elige o escribe tu universidad" className={campo} />
        <datalist id="universidades">
          {UNIVERSIDADES.map((u) => (
            <option key={u} value={u} />
          ))}
        </datalist>
      </label>
      <label className="block font-bold">
        País
        <select value={pais} onChange={(ev) => setPais(ev.target.value)} className={campo}>
          {PAISES.map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>
      </label>

      <p className="text-ayuda text-text-soft">
        Usamos estos datos solo para entender quién usa Auxi y mejorarlo. No se publican ni se venden. Tu nombre no se usa en estadísticas. Puedes cambiar estos datos cuando quieras.
      </p>

      <div className="mt-auto flex flex-col gap-2 pt-2">
        <Boton deshabilitado={!completo} onClick={guardar}>
          Guardar y empezar
        </Boton>
        <button
          type="button"
          onClick={async () => {
            await salir();
            reemplazar("/studio");
          }}
          className="h-11 cursor-pointer font-extrabold text-text-soft"
        >
          Cerrar sesión
        </button>
      </div>
    </main>
  );
}
