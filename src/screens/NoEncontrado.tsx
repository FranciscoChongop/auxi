import { useEffect, useRef } from "react";

/** Dirección que no existe: se dice claro y se ofrece volver (antes caía en silencio en Auxi Student). */
export default function NoEncontrado() {
  const titulo = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    document.title = "Página no encontrada · Auxi Studio";
    titulo.current?.focus();
  }, []);
  const enlace = "inline-flex min-h-11 items-center justify-center rounded-boton px-5 font-extrabold";
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-5 text-center">
      <p className="text-ayuda font-extrabold tracking-wide text-text-soft">Error 404</p>
      <h1 ref={titulo} tabIndex={-1} className="mt-2 text-titulo font-black outline-none">
        No encontramos esta página
      </h1>
      <p className="mt-2 text-text-soft">Puede que el enlace esté incompleto o que la página haya cambiado de lugar.</p>
      <div className="mt-6 flex w-full flex-col gap-3">
        <a href="/" className={`${enlace} bg-brand text-white`}>
          Ir a Auxi Studio
        </a>
        <div className="flex justify-center gap-4">
          <a href="/student" className="inline-flex min-h-11 items-center font-extrabold text-brand underline">
            Auxi Student
          </a>
          <a href="/vida" className="inline-flex min-h-11 items-center font-extrabold text-brand underline">
            Auxi Vida
          </a>
        </div>
      </div>
    </main>
  );
}
