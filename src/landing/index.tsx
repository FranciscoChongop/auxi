/**
 * Landing del ecosistema AUXI Studio (portada para quien no ha iniciado sesión).
 * Aprobada en /propuesta como v6; aquí se adapta a la app real:
 * - «celular» según el ancho real de la pantalla (cambia si se gira o se redimensiona).
 * - --tope: 0px (en la propuesta es el alto de su barra de herramientas).
 * - Los enlaces internos («/entrar», «/student», «/privacidad»…) navegan sin recargar la página.
 */
import "@fontsource/figtree/latin-500.css";
import "@fontsource/figtree/latin-600.css";
import "@fontsource/figtree/latin-700.css";
import { useEffect, useState, type MouseEvent } from "react";
import { ponerColorDeBarra } from "../lib/instalar";
import { navegar } from "../lib/rutas";
import { HeroV6 } from "./HeroV6";

const CONSULTA_CELULAR = "(max-width: 767px)";

function useCelular() {
  const [celular, setCelular] = useState(() => window.matchMedia(CONSULTA_CELULAR).matches);
  useEffect(() => {
    const mq = window.matchMedia(CONSULTA_CELULAR);
    const cambio = () => setCelular(mq.matches);
    mq.addEventListener("change", cambio);
    return () => mq.removeEventListener("change", cambio);
  }, []);
  return celular;
}

/** Rutas propias de la app que se abren sin recargar (lo demás, como /negocio, se abre normal). */
const RUTAS_INTERNAS = ["/entrar", "/student", "/vida", "/privacidad", "/terminos"];

export default function Landing() {
  const celular = useCelular();

  useEffect(() => {
    // La landing es oscura: así la barra del navegador y el rebote del scroll no se ven blancos.
    const anterior = document.body.style.backgroundColor;
    document.body.style.backgroundColor = "#080E25";
    const barra = ponerColorDeBarra("#080E25");
    return () => {
      document.body.style.backgroundColor = anterior;
      ponerColorDeBarra(barra || "#F7F8FC");
    };
  }, []);

  const alClic = (e: MouseEvent<HTMLDivElement>) => {
    const a = (e.target as HTMLElement).closest("a");
    if (!a || a.target === "_blank" || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    const href = a.getAttribute("href") ?? "";
    if (RUTAS_INTERNAS.some((r) => href === r || href.startsWith(`${r}/`))) {
      e.preventDefault();
      navegar(href);
    }
  };

  return (
    <div onClick={alClic} style={{ ["--tope" as string]: "0px", minHeight: "100dvh", background: "#080E25" }}>
      <HeroV6 celular={celular} />
    </div>
  );
}
