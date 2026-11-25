/** Íconos propios de la landing v6 (trazo blanco, sin logos ajenos). */
/* ---------- Íconos (SVG propio, sin logos ajenos) ---------- */
export const IconoStudent = ({ s }: { s: number }) => (
  <svg width={s} height={s} viewBox="0 0 32 32" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <rect x="8" y="5" width="18" height="23" rx="3" />
    <path d="M5 10h5M5 16h5M5 22h5M13 11h9M13 16h9M13 21h6" />
  </svg>
);
export const IconoVida = ({ s }: { s: number }) => (
  <svg width={s} height={s} viewBox="0 0 32 32" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M6 10.5V24a3 3 0 0 0 3 3h16a2 2 0 0 0 2-2v-4M6 10.5A3 3 0 0 1 9 7.5h13v3" />
    <path d="M6 10.5h19a2 2 0 0 1 2 2V15" />
    <rect x="19" y="15" width="9" height="6" rx="2" />
    <circle cx="22.5" cy="18" r=".6" fill="#fff" />
  </svg>
);

