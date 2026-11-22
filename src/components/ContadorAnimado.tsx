import { animate, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

type Props = {
  valor: number;
  /** Duración en segundos. auxi-design: 600 ms. */
  duracion?: number;
  className?: string;
};

/** Los números siempre cuentan hacia el nuevo valor, nunca saltan. */
export function ContadorAnimado({ valor, duracion = 0.6, className = "" }: Props) {
  const [mostrado, setMostrado] = useState(valor);
  const anterior = useRef(valor);
  const reducido = useReducedMotion();

  useEffect(() => {
    const desde = anterior.current;
    anterior.current = valor;
    if (reducido || desde === valor) {
      setMostrado(valor);
      return;
    }
    const control = animate(desde, valor, {
      duration: duracion,
      ease: "easeOut",
      onUpdate: (v) => setMostrado(Math.round(v)),
    });
    return () => control.stop();
  }, [valor, duracion, reducido]);

  return (
    <span className={`numeros ${className}`} aria-live="polite">
      {mostrado.toLocaleString("es-PE")}
    </span>
  );
}
