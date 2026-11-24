/**
 * Íconos de cada app de Auxi Studio. Misma familia que el logo: formas redondeadas, color propio
 * y un borde inferior más oscuro que da volumen (como los botones que se hunden).
 * - Auxi Student: libro abierto con un visto bueno turquesa y una chispa dorada (aprender jugando).
 * - Auxi Vida: moneda dorada con un brote (tu plata que crece).
 */
export type AppConIcono = "student" | "vida" | "vendoe";

const NOMBRE: Record<AppConIcono, string> = { student: "Auxi Student", vida: "Auxi Vida", vendoe: "Vendoe" };

export function IconoApp({ app, tamano = 40, decorativo = false }: { app: AppConIcono; tamano?: number; decorativo?: boolean }) {
  const accesible = decorativo ? { "aria-hidden": true as const } : { role: "img", "aria-label": NOMBRE[app] };
  if (app === "vendoe")
    return (
      <svg viewBox="0 0 48 48" width={tamano} height={tamano} className="shrink-0" {...accesible}>
        <rect x="2" y="5" width="44" height="41" rx="13" fill="#3236A8" />
        <rect x="2" y="2" width="44" height="41" rx="13" fill="#4A4EDB" />
        {/* Toldo a rayas */}
        <path d="M10 12h28v6H10z" fill="#FFFFFF" />
        <path d="M10 12h7v6h-7zM24 12h7v6h-7z" fill="#2B2FA8" />
        <path d="M10 18a3.5 3.5 0 0 0 7 0 3.5 3.5 0 0 0 7 0 3.5 3.5 0 0 0 7 0 3.5 3.5 0 0 0 7 0z" fill="#FFFFFF" />
        {/* Bolsa */}
        <rect x="16.5" y="25" width="15" height="12" rx="3" fill="#5FE3DC" />
        <path d="M20.5 25.5v-1.8a3.5 3.5 0 0 1 7 0v1.8" fill="none" stroke="#5FE3DC" strokeWidth="2.2" />
        <circle cx="35" cy="34.5" r="3.2" fill="#F2B341" />
      </svg>
    );
  if (app === "student")
    return (
      <svg viewBox="0 0 48 48" width={tamano} height={tamano} className="shrink-0" {...accesible}>
        <rect x="2" y="5" width="44" height="41" rx="13" fill="#1A23A6" />
        <rect x="2" y="2" width="44" height="41" rx="13" fill="#2430D9" />
        <path d="M10 15.2c4.8-1.8 9.6-1.3 14 1.5v17.8c-4.4-2.8-9.2-3.3-14-1.5z" fill="#FFFFFF" />
        <path d="M38 15.2c-4.8-1.8-9.6-1.3-14 1.5v17.8c4.4-2.8 9.2-3.3 14-1.5z" fill="#E6E8FA" />
        <path d="M27.6 25l2.7 2.7 4.9-5.6" fill="none" stroke="#2FB7B0" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M13.5 20.5h6.5M13.5 24.5h5" stroke="#B9BEDD" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M36.5 5.6l1.2 3.2 3.2 1.2-3.2 1.2-1.2 3.2-1.2-3.2-3.2-1.2 3.2-1.2z" fill="#F2B341" />
      </svg>
    );
  return (
    <svg viewBox="0 0 48 48" width={tamano} height={tamano} className="shrink-0" {...accesible}>
      <rect x="2" y="5" width="44" height="41" rx="13" fill="#07403D" />
      <rect x="2" y="2" width="44" height="41" rx="13" fill="#0E5B57" />
      <circle cx="24" cy="28" r="11.5" fill="#C98A1C" />
      <circle cx="24" cy="27" r="11.5" fill="#F2B341" />
      <circle cx="24" cy="27" r="7.6" fill="none" stroke="#C98A1C" strokeWidth="2" />
      <path d="M24 15.5V11" stroke="#5FE3DC" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M24.2 11.4c.2-3.6 3.2-5.9 7-5.5.1 3.7-3 6-7 5.5z" fill="#5FE3DC" />
      <path d="M23.8 12.2c-.3-3-2.9-4.9-6-4.5 0 3 2.7 5 6 4.5z" fill="#A6F2EE" />
    </svg>
  );
}
