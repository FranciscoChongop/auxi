/**
 * Rueda del mouse más pausada y suave (solo computadora con mouse): cada giro avanza menos y la página
 * llega con un deslizamiento corto, para que cada transición se alcance a ver.
 * No toca el dedo en celulares (ahí se siente trabado), ni el teclado, ni la barra de desplazamiento,
 * ni Ctrl + rueda (zoom del navegador). No se usa con «reducir movimiento».
 */
export function suavizarRueda({ factor = 0.5, suavidad = 0.08 } = {}) {
  let objetivo = window.scrollY;
  let actual = window.scrollY;
  let raf = 0;
  let propio = 0;
  const maximo = () => document.documentElement.scrollHeight - window.innerHeight;

  const paso = () => {
    actual += (objetivo - actual) * suavidad;
    if (Math.abs(objetivo - actual) < 0.5) actual = objetivo;
    propio = actual;
    window.scrollTo(0, actual);
    raf = actual !== objetivo ? requestAnimationFrame(paso) : 0;
  };

  const alRueda = (e: WheelEvent) => {
    if (e.ctrlKey || e.defaultPrevented) return;
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return; // gestos horizontales: los deja pasar
    e.preventDefault();
    const delta = e.deltaMode === 1 ? e.deltaY * 40 : e.deltaMode === 2 ? e.deltaY * window.innerHeight : e.deltaY;
    if (!raf) actual = objetivo = window.scrollY;
    objetivo = Math.max(0, Math.min(maximo(), objetivo + delta * factor));
    if (!raf) raf = requestAnimationFrame(paso);
  };

  // Si la página se movió por otra vía (teclado, barra, enlace), se sincroniza y se detiene el deslizamiento.
  const alScroll = () => {
    if (Math.abs(window.scrollY - propio) < 2) return;
    cancelAnimationFrame(raf);
    raf = 0;
    actual = objetivo = window.scrollY;
  };

  window.addEventListener("wheel", alRueda, { passive: false });
  window.addEventListener("scroll", alScroll, { passive: true });
  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener("wheel", alRueda);
    window.removeEventListener("scroll", alScroll);
  };
}
