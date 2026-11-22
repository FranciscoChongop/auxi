export const INSTAGRAM_URL = "https://www.instagram.com/soydanielchong/";

function LogoInstagram({ className = "size-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="2.2">
        <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
        <circle cx="12" cy="12" r="4" />
      </g>
      <circle cx="17.2" cy="6.8" r="1.2" fill="currentColor" />
    </svg>
  );
}

/**
 * Marca discreta "Apoya al creador" que lleva al Instagram del creador.
 * - lateral: pestaña pequeña al costado, solo en pantallas grandes.
 * - normal: fila dentro de Perfil → Ajustes (así se ve en el celular).
 */
export function ApoyaAlCreador({ lateral = false }: { lateral?: boolean }) {
  if (lateral) {
    return (
      <a
        href={INSTAGRAM_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed top-1/2 right-0 z-30 hidden -translate-y-1/2 items-center gap-2 rounded-l-[12px] border-2 border-r-0 border-surface bg-card px-2 py-3 text-[12px] font-extrabold text-text-soft opacity-70 transition-opacity [writing-mode:vertical-rl] hover:text-brand hover:opacity-100 focus-visible:opacity-100 md:flex"
        aria-label="Apoya al creador en Instagram, @soydanielchong"
      >
        <LogoInstagram className="size-4 rotate-90" />
        Apoya al creador
      </a>
    );
  }
  return (
    <a
      href={INSTAGRAM_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-2 flex min-h-11 items-center justify-between rounded-boton text-text-soft"
    >
      <span className="flex items-center gap-2 font-bold">
        <LogoInstagram />
        Apoya al creador
      </span>
      <span className="text-ayuda font-extrabold text-brand">@soydanielchong</span>
    </a>
  );
}
