/**
 * Pieza 4 de la landing v6: invitación a opinar y «Antes de entrar» (preguntas frecuentes).
 *
 * Aquí las partículas se apartan: la lectura manda. Solo queda un brillo quieto y lejano.
 * Las respuestas dicen únicamente lo que la app hace hoy (nada de gratis para siempre, ni conexión con bancos).
 */
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState } from "react";

const WHATSAPP_IDEA = `https://wa.me/51960650372?text=${encodeURIComponent("Hola Daniel, probé Auxi y tengo una idea:")}`;

const PREGUNTAS: { p: string; r: string }[] = [
  {
    p: "¿Es gratis?",
    r: "Student y Vida son gratis por ahora y no te pedimos tarjeta. Hay monedas para lo extra, como importar más temas con IA; se ganan usando la app y los precios siempre se muestran. Vendoe es aparte.",
  },
  { p: "¿Necesito una cuenta?", r: "Sí. Entras con tu correo o con Google, y la misma cuenta sirve para Student y para Vida." },
  {
    p: "¿Cómo preparo mis preguntas?",
    r: "Copias el pedido de Auxi y lo pegas en tu propia IA (ChatGPT, Claude o Gemini) junto con tu material. Luego pegas el resultado en Auxi y revisas las preguntas antes de jugar. Así no pagas nada por usar IA.",
  },
  { p: "¿Vida se conecta a mi banco?", r: "No. Vida no mueve plata ni ve tu cuenta del banco. Lo que te muestra como disponible es un estimado con lo que tú registras." },
  { p: "¿Dónde se guardan mis datos?", r: "En tu cuenta de Auxi, para que no los pierdas si cambias de celular. Nunca te pedimos claves ni datos de tarjetas." },
  { p: "¿Funciona en mi celular?", r: "Sí, desde el navegador, en Android y en iPhone. También puedes agregarla a tu pantalla de inicio para abrirla como una app." },
];

function Pregunta({ p, r, abierta, alTocar, id }: { p: string; r: string; abierta: boolean; alTocar: () => void; id: string }) {
  const quieto = !!useReducedMotion();
  return (
    <div className="v6-faq-item">
      <h3 style={{ margin: 0 }}>
        <button type="button" aria-expanded={abierta} aria-controls={`${id}-r`} id={`${id}-p`} onClick={alTocar} className="v6-faq-boton">
          <span>{p}</span>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden style={{ transform: abierta ? "rotate(45deg)" : "none", transition: "transform .25s ease" }}>
            <path d="M11 4v14M4 11h14" />
          </svg>
        </button>
      </h3>
      <AnimatePresence initial={false}>
        {abierta && (
          <motion.div
            id={`${id}-r`}
            role="region"
            aria-labelledby={`${id}-p`}
            initial={quieto ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={quieto ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: "hidden" }}
          >
            <p className="v6-faq-respuesta">{r}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function PreguntasV6({ celular }: { celular: boolean }) {
  const [abierta, setAbierta] = useState<number | null>(null);
  return (
    <>
      <style>{`
        .v6 .v6-faq-item { border-bottom: 1px solid rgba(255,255,255,.12); }
        .v6 .v6-faq-boton { width:100%; display:flex; align-items:center; justify-content:space-between; gap:16px; min-height:64px; padding:14px 2px;
          text-align:left; color:#fff; font-family:inherit; font-size:${celular ? 18 : 20}px; font-weight:600; background:none; border:0; cursor:pointer; }
        .v6 .v6-faq-boton:hover span { color:#C9D2FF; }
        .v6 .v6-faq-respuesta { margin:0; padding:0 40px 22px 2px; font-size:${celular ? 16 : 17}px; line-height:1.6; color:#C5CEE3; max-width:62ch; }
      `}</style>

      {/* Opinión: franja abierta y breve. */}
      <section id="opinion" className="relative isolate overflow-hidden" style={{ padding: celular ? "64px 20px" : "110px 64px" }}>
        <div
          aria-hidden
          className="pointer-events-none absolute -z-10"
          style={{ inset: 0, background: "radial-gradient(50% 70% at 50% 50%, rgba(242,179,65,.09), transparent 70%), radial-gradient(40% 60% at 30% 50%, rgba(36,48,217,.18), transparent 70%)" }}
        />
        <div className="mx-auto flex items-center justify-between gap-8" style={{ maxWidth: 1100, flexDirection: celular ? "column" : "row", alignItems: celular ? "flex-start" : "center" }}>
          <div>
            <h2 className="v6-h1" style={{ fontSize: celular ? 32 : 52, lineHeight: 1.08 }}>
              Pruébalo.
              <br />
              <span style={{ color: "#F2B341" }}>Cuéntame qué mejorarías.</span>
            </h2>
            <p style={{ marginTop: 14, fontSize: celular ? 17 : 19, color: "var(--texto-2)" }}>Student y Vida son gratis por ahora.</p>
          </div>
          <div className="flex flex-col" style={{ alignItems: celular ? "stretch" : "flex-end", width: celular ? "100%" : "auto", gap: 10 }}>
            <a href={WHATSAPP_IDEA} target="_blank" rel="noopener" className="v6-cta" aria-label="Compartir una idea por WhatsApp (se abre en otra pestaña)">
              Compartir una idea
            </a>
            <span style={{ fontSize: 13, color: "var(--texto-2)", textAlign: celular ? "center" : "right" }}>Se abre WhatsApp con un mensaje listo para escribir</span>
          </div>
        </div>
      </section>

      {/* Preguntas frecuentes: título al costado en computadora, una columna en celular. */}
      <section id="preguntas" style={{ padding: celular ? "40px 20px 80px" : "60px 64px 120px" }}>
        <div className="mx-auto" style={{ maxWidth: 1100, display: "grid", gridTemplateColumns: celular ? "1fr" : "340px 1fr", gap: celular ? 20 : 64, alignItems: "start" }}>
          <div style={{ position: celular ? "static" : "sticky", top: "calc(var(--tope) + 40px)" }}>
            <h2 className="v6-h1" style={{ fontSize: celular ? 32 : 44, lineHeight: 1.1 }}>
              Antes de entrar
            </h2>
            <p style={{ marginTop: 12, fontSize: 16, color: "var(--texto-2)" }}>Lo que más nos preguntan.</p>
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,.12)" }}>
            {PREGUNTAS.map((q, i) => (
              <Pregunta key={q.p} id={`v6-faq-${i}`} p={q.p} r={q.r} abierta={abierta === i} alTocar={() => setAbierta(abierta === i ? null : i)} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
