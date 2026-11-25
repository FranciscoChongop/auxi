import { motion } from "motion/react";
import { useEffect, useState, type ReactNode } from "react";
import { useAviso } from "../components/Aviso";
import { Boton } from "../components/Boton";
import { ContadorAnimado } from "../components/ContadorAnimado";
import { Leon } from "../components/Leon";
import { Escudo, Llama, Moneda } from "../components/Navegacion";
import { Ventana } from "../components/Ventana";
import { lanzarConfeti } from "../lib/confeti";
import { actualizar, useEstado } from "../lib/estado";
import { useCuenta } from "../lib/nube";
import { navegar, reemplazar } from "../lib/rutas";
import { sonidos } from "../lib/sonidos";

function Dato({ indice, titulo, children }: { indice: number; titulo: string; children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.5 + indice * 0.15, type: "spring", stiffness: 420, damping: 22 }}
      className="flex flex-col items-center gap-1 rounded-tarjeta border-2 border-surface bg-card px-2 py-3"
    >
      <span className="text-ayuda font-extrabold text-text-soft">{titulo}</span>
      <span className="flex items-center gap-1 text-[24px] font-black">{children}</span>
    </motion.div>
  );
}

export default function Celebracion() {
  const e = useEstado();
  const c = e.celebracion;
  const aviso = useAviso();
  const cuenta = useCuenta();
  const [guardar, setGuardar] = useState(false);
  const [monedas, setMonedas] = useState(0);
  const [racha, setRacha] = useState(c ? Math.max(0, c.rachaDias - (c.rachaSube ? 1 : 0)) : 0);

  useEffect(() => {
    if (!c) return;
    sonidos.leccionCompleta();
    void lanzarConfeti();
    const t1 = setTimeout(() => setMonedas(c.monedas), 650);
    const t2 = setTimeout(() => setRacha(c.rachaDias), 1000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [c]);

  if (!c) {
    reemplazar("/student/inicio");
    return null;
  }

  function seguir() {
    if (cuenta.modo === "invitado") {
      reemplazar("/student/inicio");
      return;
    }
    if (c!.primera && !e.avisoCuentaVisto && cuenta.modo !== "conectado") {
      setGuardar(true);
      return;
    }
    reemplazar(c!.cofre ? "/student/cofre" : "/student/inicio");
  }

  async function compartir() {
    const texto = `Terminé «${c!.titulo}» en Auxi Student con ${c!.precision} % de precisión. Racha: ${c!.rachaDias} ${c!.rachaDias === 1 ? "día" : "días"}.`;
    try {
      // Con imagen de León cuando el celular lo permite.
      try {
        const r = await fetch("/marketing/logro.jpg");
        const archivo = new File([await r.blob()], "mi-logro-auxi.jpg", { type: "image/jpeg" });
        if (navigator.canShare?.({ files: [archivo] })) {
          await navigator.share({ files: [archivo], title: "Mi logro en Auxi", text: `${texto} ${window.location.origin}/student` });
          return;
        }
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
      }
      if (navigator.share) await navigator.share({ title: "Mi logro en Auxi", text: texto, url: `${window.location.origin}/student` });
      else {
        await navigator.clipboard.writeText(texto);
        aviso("Copiado. Pégalo en tus estados.", "exito");
      }
    } catch {
      // La persona cerró el menú de compartir: no pasa nada.
    }
  }

  const minutos = Math.max(1, Math.round(c.segundos / 60));

  return (
    <main
      className="mx-auto flex min-h-dvh max-w-md flex-col px-5"
      style={{ paddingTop: "calc(env(safe-area-inset-top) + 24px)", paddingBottom: "calc(env(safe-area-inset-bottom) + 20px)" }}
    >
      <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
        <Leon pose="celebra" alto={230} rebote />
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mt-3 text-titulo font-black"
        >
          ¡Lección completa!
        </motion.h1>
        <p className="text-text-soft">
          {c.titulo} · {minutos} min
        </p>

        <div className="mt-5 grid w-full grid-cols-3 gap-3">
          <Dato indice={0} titulo="Monedas">
            <Moneda />+<ContadorAnimado valor={monedas} />
          </Dato>
          <Dato indice={1} titulo="Racha">
            <motion.span animate={racha > 0 && c.rachaSube ? { scale: [1, 1.4, 1], rotate: [0, -8, 0] } : {}} transition={{ delay: 1, duration: 0.45 }}>
              <Llama activa />
            </motion.span>
            <ContadorAnimado valor={racha} />
          </Dato>
          <Dato indice={2} titulo="Precisión">
            <ContadorAnimado valor={c.precision} />%
          </Dato>
        </div>

        {c.usoProtector && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} className="mt-3 flex items-center gap-2 font-bold">
            <Escudo /> Tu protector cuidó tu racha.
          </motion.p>
        )}
        {c.precision < 70 && (
          <p className="mt-3 text-ayuda text-text-soft">Lo que fallaste vuelve en tu repaso. Así se aprende.</p>
        )}
      </div>

      <div className="flex flex-col gap-3 pt-6">
        <Boton onClick={seguir}>Continuar</Boton>
        <Boton variante="secundario" onClick={compartir}>
          Compartir logro
        </Boton>
      </div>

      <Ventana
        abierta={guardar}
        alCerrar={() => {
          setGuardar(false);
          actualizar(() => ({ avisoCuentaVisto: true }));
          reemplazar(c.cofre ? "/student/cofre" : "/student/inicio");
        }}
        titulo="Guarda tu avance"
      >
        <p className="text-text-soft">Crea tu cuenta gratis para no perder tu racha si cambias de celular.</p>
        <div className="mt-5 flex flex-col gap-3">
          <Boton
            onClick={() => {
              actualizar(() => ({ avisoCuentaVisto: true }));
              navegar(`/student/cuenta?volver=${c.cofre ? "/student/cofre" : "/student/inicio"}`);
            }}
          >
            Crear mi cuenta gratis
          </Boton>
          <p className="text-center text-ayuda text-text-soft">Con Google o con tu correo. Si prefieres, ciérralo y sigue jugando.</p>
        </div>
      </Ventana>
    </main>
  );
}
