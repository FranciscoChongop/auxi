import { useState } from "react";
import { useAviso } from "../components/Aviso";
import { Boton } from "../components/Boton";
import { CaraDeLeon } from "../components/Leon";
import { Pantalla } from "../components/Navegacion";
import { actualizar, nuevoId, useEstado } from "../lib/estado";
import { bonita, hoy } from "../lib/fechas";
import { useCuenta } from "../lib/nube";
import { useRuta } from "../lib/rutas";
import { sonidos } from "../lib/sonidos";

/** Número de atención al cliente (Perú). */
const NUMERO = "960650372";
const WHATSAPP = `https://wa.me/51${NUMERO}`;
const TELEFONO = `tel:+51${NUMERO}`;

const TIPOS = ["No carga o se traba", "No me llega el código", "Mis lecciones o la IA", "Monedas o premios", "Otra cosa"];

const PREGUNTAS: { p: string; r: string }[] = [
  {
    p: "No me llega el código del correo",
    r: "Revisa spam y promociones, espera un minuto y toca «Reenviar código». Si sigue sin llegar, escríbenos con el correo que usaste.",
  },
  {
    p: "La IA me devolvió el ejemplo vacío",
    r: "Casi siempre es porque no pudo abrir tu PDF. Espera a que termine de cargarlo antes de pegar el prompt, prueba con otra IA o pega el texto en el chat.",
  },
  {
    p: "¿Cómo creo lecciones de mi material?",
    r: "Mis cursos → Agregar curso → Agregar tema. Copia el prompt, súbelo con tu material a ChatGPT, Claude o Gemini, y pega lo que te responda.",
  },
  {
    p: "Perdí mi avance",
    r: "Si entraste con tu correo, tu avance está en tu cuenta: toca «Ya tengo cuenta» en el celular nuevo. Sin cuenta, el avance vive solo en ese celular.",
  },
  {
    p: "¿Cómo gano monedas?",
    r: "Con lecciones, el cofre diario, los tomates y las misiones opcionales. Mira todo en Mis monedas.",
  },
];

export default function Ayuda() {
  const e = useEstado();
  const aviso = useAviso();
  const cuenta = useCuenta();
  const ruta = useRuta();
  const [tipo, setTipo] = useState(TIPOS[0]);
  const [texto, setTexto] = useState("");
  const [tecnicos, setTecnicos] = useState(true);
  const [correo, setCorreo] = useState(false);
  const [abierta, setAbierta] = useState<number | null>(null);

  function enviar() {
    const partes = [`Hola, quiero reportar un problema en Auxi Student.`, ``, `Tipo: ${tipo}`, `Qué pasó: ${texto.trim()}`];
    if (tecnicos) {
      partes.push(``, `Datos técnicos:`, `- Pantalla: ${ruta}`, `- Celular: ${navigator.userAgent.slice(0, 120)}`, `- Fecha: ${hoy()}`);
    }
    if (correo && cuenta.email) partes.push(`- Mi correo: ${cuenta.email}`);
    window.open(`${WHATSAPP}?text=${encodeURIComponent(partes.join("\n"))}`, "_blank", "noopener");
    actualizar((s) => ({ reportes: [{ id: nuevoId("r"), fecha: hoy(), tipo, texto: texto.trim() }, ...s.reportes].slice(0, 20) }));
    sonidos.acierto();
    aviso("Listo. Se abrió WhatsApp para enviar tu reporte.", "exito");
    setTexto("");
  }

  return (
    <Pantalla titulo="Atención al cliente" atras="/student/perfil">
      <div className="-mt-2 flex items-center gap-3">
        <CaraDeLeon cara="feliz" tamano={48} />
        <p className="font-bold">¿Algo no funciona o tienes una duda? Cuéntanos y lo resolvemos.</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <a
          href={WHATSAPP}
          target="_blank"
          rel="noopener noreferrer"
          className="grid h-14 place-items-center rounded-boton bg-success text-[17px] font-extrabold text-text"
          style={{ boxShadow: "0 4px 0 var(--success-dark)" }}
        >
          WhatsApp
        </a>
        <a href={TELEFONO} className="grid h-14 place-items-center rounded-boton border-2 border-surface bg-card text-[17px] font-extrabold text-brand" style={{ boxShadow: "0 4px 0 var(--surface)" }}>
          Llamar
        </a>
      </div>
      <p className="-mt-2 text-center text-ayuda text-text-soft">Atención al cliente: {NUMERO.replace(/(\d{3})(\d{3})(\d{3})/, "$1 $2 $3")}</p>

      <section className="rounded-tarjeta border-2 border-surface bg-card p-4">
        <h2 className="mb-3 text-tarjeta font-extrabold">Reportar una falla</h2>
        <div role="radiogroup" aria-label="Tipo de problema" className="flex flex-wrap gap-2">
          {TIPOS.map((t) => (
            <button
              key={t}
              type="button"
              role="radio"
              aria-checked={tipo === t}
              onClick={() => setTipo(t)}
              className={`min-h-11 cursor-pointer rounded-full border-2 px-4 text-[15px] font-extrabold ${tipo === t ? "border-brand bg-surface text-brand" : "border-surface bg-card text-text-soft"}`}
            >
              {t}
            </button>
          ))}
        </div>
        <textarea
          value={texto}
          onChange={(ev) => setTexto(ev.target.value)}
          placeholder="¿Qué pasó? Cuéntalo con tus palabras."
          aria-label="Qué pasó"
          className="mt-3 h-32 w-full resize-none rounded-boton border-2 border-surface bg-bg p-3 text-[16px] font-semibold text-text outline-none focus:border-brand"
        />
        <label className="mt-2 flex min-h-11 cursor-pointer items-center gap-3 font-bold">
          <input type="checkbox" checked={tecnicos} onChange={(ev) => setTecnicos(ev.target.checked)} className="size-5 accent-[var(--brand)]" />
          Incluir datos técnicos (pantalla y celular)
        </label>
        {cuenta.email && (
          <label className="flex min-h-11 cursor-pointer items-center gap-3 font-bold">
            <input type="checkbox" checked={correo} onChange={(ev) => setCorreo(ev.target.checked)} className="size-5 accent-[var(--brand)]" />
            Incluir mi correo para ubicar mi cuenta
          </label>
        )}
        <div className="mt-3">
          <Boton deshabilitado={texto.trim().length < 10} onClick={enviar}>
            {texto.trim().length < 10 ? "Cuéntanos un poco más" : "Enviar por WhatsApp"}
          </Boton>
        </div>
        <p className="mt-2 text-center text-ayuda text-text-soft">Se abre WhatsApp con tu mensaje listo. Tú lo envías.</p>
      </section>

      {e.reportes.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="text-tarjeta font-extrabold">Tus reportes</h2>
          {e.reportes.slice(0, 5).map((r) => (
            <div key={r.id} className="rounded-boton bg-surface px-4 py-3">
              <p className="text-ayuda font-extrabold text-text-soft">
                {bonita(r.fecha)} · {r.tipo}
              </p>
              <p className="font-semibold">{r.texto}</p>
            </div>
          ))}
          <p className="text-ayuda text-text-soft">Te respondemos por WhatsApp.</p>
        </section>
      )}

      <section className="flex flex-col gap-2">
        <h2 className="text-tarjeta font-extrabold">Dudas frecuentes</h2>
        {PREGUNTAS.map((q, i) => (
          <div key={q.p} className="overflow-hidden rounded-tarjeta border-2 border-surface bg-card">
            <button
              type="button"
              onClick={() => setAbierta(abierta === i ? null : i)}
              aria-expanded={abierta === i}
              className="flex min-h-14 w-full cursor-pointer items-center justify-between gap-3 px-4 text-left font-extrabold"
            >
              {q.p}
              <svg viewBox="0 0 24 24" className={`size-4 shrink-0 text-text-soft transition-transform ${abierta === i ? "rotate-180" : ""}`} aria-hidden="true">
                <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </button>
            {abierta === i && <p className="px-4 pb-4 text-text-soft">{q.r}</p>}
          </div>
        ))}
      </section>
    </Pantalla>
  );
}
