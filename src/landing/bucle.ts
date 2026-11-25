/**
 * Bucle de dibujo con tope de cuadros por segundo (30 en celular) que se enciende solo cuando
 * la escena está a la vista. Si la pestaña se oculta, el navegador ya pausa requestAnimationFrame.
 */
export function crearBucle(pintar: (t: number) => void, fps: number) {
  let activo = false;
  let raf = 0;
  let ultimo = 0;
  const intervalo = 1000 / fps - 2;
  const paso = (ahora: number) => {
    raf = requestAnimationFrame(paso);
    if (ahora - ultimo < intervalo) return;
    ultimo = ahora;
    pintar(ahora / 1000);
  };
  return {
    encender() {
      if (activo) return;
      activo = true;
      raf = requestAnimationFrame(paso);
    },
    apagar() {
      activo = false;
      cancelAnimationFrame(raf);
    },
    get activo() {
      return activo;
    },
  };
}

/** Enciende el bucle mientras el elemento se ve (con un margen) y lo apaga fuera de pantalla. */
export function vigilar(el: Element, bucle: ReturnType<typeof crearBucle>) {
  const io = new IntersectionObserver(([e]) => (e.isIntersecting ? bucle.encender() : bucle.apagar()), { rootMargin: "100px" });
  io.observe(el);
  return () => {
    io.disconnect();
    bucle.apagar();
  };
}
