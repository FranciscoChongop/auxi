/**
 * Pieza 4 de la landing v6: invitación a opinar y «Antes de entrar» (preguntas frecuentes).
 *
 * Aquí manda la lectura: solo siguen cayendo los puntos de luz de fondo (estrellas.tsx). «Antes de entrar» aparece
 * palabra por palabra y cada pregunta tiene su animación al abrirse (barra de luz, respuesta que se enfoca, chispa).
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

const SUAVE = [0.22, 1, 0.36, 1] as const;

function Pregunta({ p, r, abierta, alTocar, id, indice }: { p: string; r: string; abierta: boolean; alTocar: () => void; id: string; indice: number }) {
  const quieto = !!useReducedMotion();
  return (
    // Cada pregunta entra subiendo, una tras otra, cuando la lista aparece en pantalla.
    <motion.div
      className={`v6-faq-item ${abierta ? "abierta" : ""}`}
      initial={quieto ? false : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: indice * 0.07, ease: SUAVE }}
    >
      {/* Barra de luz a la izquierda y brillo de fondo cuando está abierta. */}
      <motion.span aria-hidden className="v6-faq-barra" initial={false} animate={{ scaleY: abierta ? 1 : 0, opacity: abierta ? 1 : 0 }} transition={{ duration: quieto ? 0 : 0.35, ease: SUAVE }} />
      <h3 style={{ margin: 0 }}>
        <motion.button
          type="button"
          aria-expanded={abierta}
          aria-controls={`${id}-r`}
          id={`${id}-p`}
          onClick={alTocar}
          className="v6-faq-boton"
          whileTap={quieto ? undefined : { scale: 0.985 }}
        >
          <motion.span animate={{ x: abierta && !quieto ? 6 : 0 }} transition={{ duration: 0.3, ease: SUAVE }}>
            {p}
          </motion.span>
          <motion.span className="v6-faq-signo" animate={{ rotate: abierta ? 135 : 0, scale: abierta ? 1.08 : 1 }} transition={{ duration: quieto ? 0 : 0.35, ease: SUAVE }}>
            <svg width="20" height="20" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
              <path d="M11 4v14M4 11h14" />
            </svg>
          </motion.span>
        </motion.button>
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
            transition={{ duration: 0.4, ease: SUAVE }}
            style={{ overflow: "hidden" }}
          >
            {/* La respuesta aparece desenfocada y se aclara, y una chispa recorre el borde. */}
            <motion.p
              className="v6-faq-respuesta"
              initial={quieto ? false : { opacity: 0, y: 10, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.45, delay: 0.08, ease: SUAVE }}
            >
              {r}
            </motion.p>
            {!quieto && (
              <motion.span
                aria-hidden
                className="v6-faq-chispa"
                initial={{ left: "0%", opacity: 0 }}
                animate={{ left: ["0%", "100%"], opacity: [0, 1, 0] }}
                transition={{ duration: 0.9, ease: "easeInOut" }}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/** Título que aparece palabra por palabra (sube y se enfoca) y una línea de luz que se dibuja debajo. */
function TituloRevelado({ texto, tamano }: { texto: string; tamano: number }) {
  const quieto = !!useReducedMotion();
  const palabras = texto.split(" ");
  return (
    <div>
      <h2 className="v6-h1" style={{ fontSize: tamano, lineHeight: 1.1 }} aria-label={texto}>
        {palabras.map((w, i) => (
          <motion.span
            key={i}
            aria-hidden
            style={{ display: "inline-block", marginRight: "0.25em" }}
            initial={quieto ? false : { opacity: 0, y: 28, filter: "blur(10px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, delay: i * 0.12, ease: SUAVE }}
          >
            {w}
          </motion.span>
        ))}
      </h2>
      <motion.span
        aria-hidden
        className="v6-faq-linea"
        initial={quieto ? false : { scaleX: 0, opacity: 0 }}
        whileInView={{ scaleX: 1, opacity: 1 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.9, delay: 0.35, ease: SUAVE }}
      />
    </div>
  );
}

export function PreguntasV6({ celular }: { celular: boolean }) {
  const [abierta, setAbierta] = useState<number | null>(null);
  return (
    <>
      <style>{`
        .v6 .v6-faq-item { position:relative; border-bottom: 1px solid rgba(255,255,255,.12); transition: background-color .3s ease; }
        .v6 .v6-faq-item.abierta { background: linear-gradient(90deg, rgba(36,48,217,.14), rgba(36,48,217,0) 70%); }
        .v6 .v6-faq-barra { position:absolute; left:-14px; top:14px; bottom:14px; width:3px; border-radius:3px; transform-origin:top;
          background: linear-gradient(180deg, #5FE3DC, #2430D9); box-shadow: 0 0 14px rgba(95,227,220,.6); }
        .v6 .v6-faq-signo { display:grid; place-items:center; width:36px; height:36px; flex:none; border-radius:50%; border:1px solid rgba(255,255,255,.18); }
        .v6 .v6-faq-item.abierta .v6-faq-signo { border-color: rgba(95,227,220,.6); color:#5FE3DC; }
        .v6 .v6-faq-chispa { position:absolute; bottom:-1px; width:60px; height:2px; margin-left:-30px; border-radius:2px;
          background: linear-gradient(90deg, transparent, #5FE3DC, transparent); box-shadow: 0 0 10px #5FE3DC; pointer-events:none; }
        .v6 .v6-faq-linea { display:block; margin-top:16px; width:120px; height:2px; border-radius:2px; transform-origin:left;
          background: linear-gradient(90deg, #5FE3DC, #F2B341); box-shadow: 0 0 12px rgba(95,227,220,.5); }
        .v6 .v6-faq-boton { width:100%; display:flex; align-items:center; justify-content:space-between; gap:16px; min-height:64px; padding:14px 2px;
          text-align:left; color:#fff; font-family:inherit; font-size:${celular ? 18 : 20}px; font-weight:600; background:none; border:0; cursor:pointer; padding-left:${celular ? 4 : 10}px; }
        .v6 .v6-faq-boton:hover span { color:#C9D2FF; }
        .v6 .v6-faq-respuesta { margin:0; padding:0 48px 22px ${celular ? 4 : 10}px; font-size:${celular ? 16 : 17}px; line-height:1.6; color:#C5CEE3; max-width:62ch; }
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
            <TituloRevelado texto="Antes de entrar" tamano={celular ? 32 : 44} />
            <motion.p
              style={{ marginTop: 12, fontSize: 16, color: "var(--texto-2)" }}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              Lo que más nos preguntan.
            </motion.p>
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,.12)" }}>
            {PREGUNTAS.map((q, i) => (
              <Pregunta key={q.p} id={`v6-faq-${i}`} indice={i} p={q.p} r={q.r} abierta={abierta === i} alTocar={() => setAbierta(abierta === i ? null : i)} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
