import { motion } from "motion/react";
import { useState } from "react";

export const POSES = {
  saluda: { archivo: "A1-saluda", alt: "León te saluda" },
  celebra: { archivo: "A2-celebra", alt: "León celebra" },
  concentrado: { archivo: "A3-concentrado", alt: "León lee concentrado" },
  pensativo: { archivo: "A4-pensativo", alt: "León piensa" },
  anima: { archivo: "A5-anima", alt: "León te anima" },
  sorprendido: { archivo: "A6-sorprendido", alt: "León sorprendido" },
  duerme: { archivo: "A7-duerme", alt: "León duerme" },
  caras: { archivo: "A8-caras", alt: "Seis caras de León" },
  icono: { archivo: "A9-icono", alt: "León" },
} as const;

export type PoseLeon = keyof typeof POSES;

type Props = {
  pose: PoseLeon;
  /** Alto en px. El ancho se ajusta solo. */
  alto?: number;
  /** Entra con un pequeño rebote del contenedor (nunca se anima por partes). */
  rebote?: boolean;
  className?: string;
};

/** Reemplazo mientras no exista la imagen: círculo de marca con el texto "León". */
export function LeonReemplazo({ tamano }: { tamano: number }) {
  return (
    <div
      className="grid place-items-center rounded-full bg-brand font-black text-white"
      style={{ width: tamano, height: tamano, fontSize: Math.max(12, tamano / 5) }}
      role="img"
      aria-label="León"
    >
      León
    </div>
  );
}

export function Leon({ pose, alto = 200, rebote = false, className = "" }: Props) {
  const [falla, setFalla] = useState(false);
  const { archivo, alt } = POSES[pose];

  return (
    <motion.div
      className={`flex justify-center ${className}`}
      style={{ height: alto }}
      initial={rebote ? { opacity: 0, scale: 0.85, y: 12 } : { opacity: 0 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={rebote ? { type: "spring", stiffness: 420, damping: 14 } : { duration: 0.24 }}
    >
      {falla ? (
        <LeonReemplazo tamano={Math.min(alto, 160)} />
      ) : (
        <img
          src={`/leon/${archivo}.webp`}
          alt={alt}
          onError={() => setFalla(true)}
          className={`h-full w-auto object-contain ${pose === "icono" ? "rounded-[22%]" : ""}`}
          decoding="async"
          draggable={false}
        />
      )}
    </motion.div>
  );
}

export const CARAS = ["feliz", "guino", "sorpresa", "lengua", "tierno", "lentes"] as const;
export type CaraLeon = (typeof CARAS)[number];

/** En Auxi Vida, las mismas caras salen de la hoja B8 (León con su canguro). */
const CARA_EN_VIDA: Record<CaraLeon, string> = { feliz: "feliz", guino: "risa", sorpresa: "sorpresa", lengua: "serio", tierno: "tierno", lentes: "curioso" };

/** Cara pequeña de León (hoja A8, o B8 dentro de Vida) en un círculo de 40 px, para mensajes. */
export function CaraDeLeon({ cara = "feliz", tamano = 40 }: { cara?: CaraLeon; tamano?: number }) {
  const [falla, setFalla] = useState(false);
  const enVida = typeof document !== "undefined" && document.documentElement.classList.contains("vida");
  if (falla) return <LeonReemplazo tamano={tamano} />;
  return (
    <span
      className="inline-grid shrink-0 place-items-center overflow-hidden rounded-full bg-surface"
      style={{ width: tamano, height: tamano }}
    >
      <img
        src={enVida ? `/leon/vida/caras/${CARA_EN_VIDA[cara]}.webp` : `/leon/caras/${cara}.webp`}
        alt=""
        onError={() => setFalla(true)}
        className="size-full object-cover"
        style={{ objectPosition: "50% 20%" }}
        draggable={false}
      />
    </span>
  );
}
