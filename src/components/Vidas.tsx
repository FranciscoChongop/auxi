import { AnimatePresence, motion } from "motion/react";

const CORAZON =
  "M12 21s-7.5-4.6-9.6-9.3C.9 8.3 3 4.5 6.6 4.5c2.1 0 3.7 1.2 4.6 2.7.9-1.5 2.5-2.7 4.6-2.7 3.6 0 5.7 3.8 4.2 7.2C18.9 16.4 12 21 12 21z";

function Corazon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d={CORAZON} fill="currentColor" />
    </svg>
  );
}

// Cada mitad sale hacia su lado, gira y cae: el corazón se agrieta.
const mitad = (lado: -1 | 1) => ({
  quieta: { x: 0, y: 0, rotate: 0, opacity: 1 },
  cae: {
    x: [0, lado * 2, lado * 7],
    y: [0, 0, 26],
    rotate: [0, lado * 8, lado * 28],
    opacity: [1, 1, 0],
    transition: { duration: 0.35, times: [0, 0.3, 1], ease: "easeIn" as const },
  },
});

type Props = {
  total?: number;
  restantes: number;
};

export function Vidas({ total = 3, restantes }: Props) {
  return (
    <div className="flex items-center gap-1" role="img" aria-label={`Te quedan ${restantes} de ${total} vidas`}>
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className="relative grid size-7 place-items-center">
          {/* Hueco que queda cuando se pierde la vida */}
          <Corazon className="absolute size-7 text-surface" />
          <AnimatePresence initial={false}>
            {i < restantes && (
              <motion.span
                key="llena"
                className="absolute inset-0"
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1, transition: { type: "spring", stiffness: 500, damping: 18 } }}
                exit="cae"
              >
                <motion.span
                  variants={mitad(-1)}
                  initial="quieta"
                  className="absolute inset-0"
                  style={{ clipPath: "polygon(0 0, 52% 0, 44% 40%, 56% 62%, 48% 100%, 0 100%)" }}
                >
                  <Corazon className="size-7 text-error" />
                </motion.span>
                <motion.span
                  variants={mitad(1)}
                  initial="quieta"
                  className="absolute inset-0"
                  style={{ clipPath: "polygon(52% 0, 100% 0, 100% 100%, 48% 100%, 56% 62%, 44% 40%)" }}
                >
                  <Corazon className="size-7 text-error" />
                </motion.span>
              </motion.span>
            )}
          </AnimatePresence>
        </span>
      ))}
    </div>
  );
}
