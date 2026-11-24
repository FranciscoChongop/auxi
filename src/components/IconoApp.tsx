import { useId, useState } from "react";

/**
 * Íconos de las apps de Auxi Studio. Misma familia que el logo (la A con su órbita): volumen con degradé,
 * brillo de vidrio arriba, una órbita que cruza el ícono con sus esferas y el objeto de cada app al centro.
 * - Auxi Student: birrete (estudiar) con borla dorada.
 * - Auxi Vida: moneda dorada «S/» con un brote (tu plata que crece).
 * - Vendoe: bolsa de compras (vender).
 * Si existe una versión 3D en public/marca/icono-<app>.webp, se usa esa imagen.
 */
export type AppConIcono = "student" | "vida" | "vendoe";

const NOMBRE: Record<AppConIcono, string> = { student: "Auxi Student", vida: "Auxi Vida", vendoe: "Vendoe" };

const COLORES: Record<AppConIcono, { arriba: string; medio: string; abajo: string; canto: string; esfera: string }> = {
  student: { arriba: "#6A78FF", medio: "#2F3BE6", abajo: "#161C9C", canto: "#0E1370", esfera: "#5FE3DC" },
  vida: { arriba: "#2BB3A9", medio: "#0E6E68", abajo: "#06403C", canto: "#032826", esfera: "#9AA2FF" },
  vendoe: { arriba: "#8E92FF", medio: "#4A4EDB", abajo: "#2A2DA0", canto: "#1B1E78", esfera: "#5FE3DC" },
};

/** Imágenes 3D que no existen: se recuerdan para no volver a pedirlas en cada ícono. */
const sinImagen = new Set<AppConIcono>();

export function IconoApp({ app, tamano = 40, decorativo = false }: { app: AppConIcono; tamano?: number; decorativo?: boolean }) {
  const [imagen, setImagen] = useState(!sinImagen.has(app));
  const id = useId().replace(/:/g, "");
  const c = COLORES[app];
  const accesible = decorativo ? { "aria-hidden": true as const } : { role: "img", "aria-label": NOMBRE[app] };

  if (imagen)
    return (
      <img
        src={`/marca/icono-${app}.webp`}
        alt={decorativo ? "" : NOMBRE[app]}
        width={tamano}
        height={tamano}
        className="shrink-0"
        draggable={false}
        onError={() => {
          sinImagen.add(app);
          setImagen(false);
        }}
      />
    );

  return (
    <svg viewBox="0 0 64 64" width={tamano} height={tamano} className="shrink-0" {...accesible}>
      <defs>
        <linearGradient id={`f${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={c.arriba} />
          <stop offset=".55" stopColor={c.medio} />
          <stop offset="1" stopColor={c.abajo} />
        </linearGradient>
        <linearGradient id={`b${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity=".45" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`o${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity=".95" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity=".55" />
        </linearGradient>
        <radialGradient id={`oro${id}`} cx=".35" cy=".3" r=".75">
          <stop offset="0" stopColor="#FFE9A8" />
          <stop offset=".45" stopColor="#F7BE45" />
          <stop offset="1" stopColor="#C98A1C" />
        </radialGradient>
        <radialGradient id={`e${id}`} cx=".35" cy=".3" r=".8">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset=".35" stopColor={c.esfera} />
          <stop offset="1" stopColor={c.abajo} />
        </radialGradient>
        <linearGradient id={`g${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#DCE0FF" />
        </linearGradient>
        <clipPath id={`c${id}`}>
          <rect x="3" y="3" width="58" height="56" rx="17" />
        </clipPath>
      </defs>

      {/* Volumen: canto inferior + cuerpo con degradé + brillo de vidrio */}
      <rect x="3" y="6" width="58" height="56" rx="17" fill={c.canto} />
      <rect x="3" y="3" width="58" height="56" rx="17" fill={`url(#f${id})`} />
      <g clipPath={`url(#c${id})`}>
        <ellipse cx="32" cy="6" rx="40" ry="22" fill={`url(#b${id})`} />
      </g>
      <rect x="3.75" y="3.75" width="56.5" height="54.5" rx="16.3" fill="none" stroke="#FFFFFF" strokeOpacity=".22" strokeWidth="1.5" />

      {/* Órbita: mitad de atrás (detrás del objeto) */}
      <path d="M8 38 C 10 26, 54 20, 56 30" fill="none" stroke={`url(#o${id})`} strokeOpacity=".5" strokeWidth="2.6" strokeLinecap="round" />

      {app === "student" && (
        <g>
          {/* Birrete */}
          <path d="M21 30.5v7.2c0 3 5 5.3 11 5.3s11-2.3 11-5.3v-7.2l-11 5z" fill="#C9CEF7" />
          <path d="M21 30.5v7.2c0 3 5 5.3 11 5.3s11-2.3 11-5.3" fill="none" stroke="#FFFFFF" strokeOpacity=".5" strokeWidth="1" />
          <path d="M32 17 L50 25.5 L32 34 L14 25.5 Z" fill={`url(#g${id})`} />
          <path d="M32 17 L50 25.5 L32 34" fill="none" stroke="#FFFFFF" strokeWidth="1" strokeOpacity=".9" />
          {/* Borla */}
          <path d="M32 25.5 L44.5 29 V38" fill="none" stroke={`url(#oro${id})`} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="32" cy="25.5" r="2.2" fill={`url(#oro${id})`} />
          <path d="M42.8 37.5h3.4l.8 4.2h-5z" fill={`url(#oro${id})`} />
        </g>
      )}

      {app === "vida" && (
        <g>
          {/* Brote */}
          <path d="M32 21v-6" stroke="#7CF0E8" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M32.3 15.4c.3-4.3 4-7 8.6-6.5.1 4.5-3.6 7.2-8.6 6.5z" fill="#7CF0E8" />
          <path d="M31.7 16.4c-.4-3.6-3.5-5.9-7.3-5.4 0 3.7 3.3 6 7.3 5.4z" fill="#C2FAF6" />
          {/* Moneda con canto */}
          <circle cx="32" cy="35.5" r="13.5" fill="#B57813" />
          <circle cx="32" cy="33.5" r="13.5" fill={`url(#oro${id})`} />
          <circle cx="32" cy="33.5" r="9.6" fill="none" stroke="#C98A1C" strokeWidth="1.6" />
          <text x="32" y="37.6" textAnchor="middle" fontFamily="Nunito, ui-rounded, sans-serif" fontWeight="900" fontSize="11.5" fill="#8A5A08">
            S/
          </text>
          <ellipse cx="27" cy="27" rx="4" ry="2.2" fill="#FFFFFF" fillOpacity=".55" transform="rotate(-30 27 27)" />
        </g>
      )}

      {app === "vendoe" && (
        <g>
          {/* Bolsa */}
          <path d="M25 24v-2.5a7 7 0 0 1 14 0V24" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
          <path d="M18.5 24.5h27l-1.8 18.5a3.5 3.5 0 0 1-3.5 3.2H23.8a3.5 3.5 0 0 1-3.5-3.2z" fill={`url(#g${id})`} />
          <path d="M18.5 24.5h27" stroke="#FFFFFF" strokeWidth="1" />
          <circle cx="25" cy="29" r="1.6" fill={c.medio} />
          <circle cx="39" cy="29" r="1.6" fill={c.medio} />
          <path d="M26.5 35.5c1.8 2.3 9.2 2.3 11 0" fill="none" stroke={c.medio} strokeWidth="2" strokeLinecap="round" />
        </g>
      )}

      {/* Órbita: mitad de adelante (pasa por delante del objeto) y sus esferas */}
      <path d="M56 30 C 58 40, 14 50, 8 38" fill="none" stroke={`url(#o${id})`} strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="51.5" cy="38.8" r="4.4" fill={`url(#oro${id})`} />
      <circle cx="11" cy="31" r="3" fill={`url(#e${id})`} />
    </svg>
  );
}
