/** Nombres y enlaces de la plataforma. Cámbialos solo aquí. */
export const NOMBRE_PLATAFORMA = "Auxi Studio";
export const AUTOR = "Daniel Chong";
export const FRASE_PLATAFORMA = "Mini apps gratis para estudiar y ordenar tu plata.";

/** Pon aquí la dirección de tu landing cuando esté lista; mientras esté vacía, no se muestra el enlace. */
export const LANDING_URL: string = "";

export const VENDOE_URL = "https://www.vendoe.es/";

export type MiniAppInfo = {
  id: "student" | "vida" | "negocio";
  nombre: string;
  frase: string;
  etiqueta: string;
  ruta: string;
  /** Color de la tarjeta (texto blanco encima). */
  color: string;
  sombra: string;
  externa?: boolean;
};

/** Las mini apps de la plataforma. Para sumar una nueva, agrega una fila. */
export const MINI_APPS: MiniAppInfo[] = [
  {
    id: "student",
    nombre: "Auxi Student",
    frase: "Sube lo que te dejaron y estudia jugando, con una IA que te pregunta en vez de copiarte.",
    etiqueta: "Gratis · para estudiantes",
    ruta: "/student",
    color: "#2430D9",
    sombra: "#1A23A6",
  },
  {
    id: "vida",
    nombre: "Auxi Vida",
    frase: "Sabes cuánto puedes gastar hoy, te armas un colchón y no te estafan.",
    etiqueta: "Gratis · para tu plata",
    ruta: "/vida",
    color: "#0E5B57",
    sombra: "#07403D",
  },
  {
    id: "negocio",
    nombre: "Vendoe",
    frase: "La app completa para ordenar y hacer crecer tu negocio.",
    etiqueta: "Para negocios · se abre en otra página",
    ruta: "/negocio",
    color: "#4A4EDB",
    sombra: "#3438A8",
    externa: true,
  },
];
