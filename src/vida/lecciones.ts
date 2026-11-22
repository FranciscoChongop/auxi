/**
 * Camino de plata. Contenido general y educativo, sin recomendar productos.
 * En la Fase V4 se completan los 5 temas con 4 lecciones cada uno.
 */

export type Pregunta = { enunciado: string; opciones: string[]; correcta: number; explicacion: string };
export type Leccion = { id: string; titulo: string; idea: string[]; preguntas: Pregunta[] };
export type TemaPlata = { id: string; titulo: string; lecciones: Leccion[] };

export const CAMINO: TemaPlata[] = [
  {
    id: "colchon",
    titulo: "Tu colchón",
    lecciones: [
      {
        id: "colchon-1",
        titulo: "¿Qué es un colchón?",
        idea: [
          "Un colchón es plata guardada solo para imprevistos: una enfermedad, un día sin trabajo, algo que se malogra.",
          "No es para gustos ni para invertir. Su trabajo es que un mal día no se vuelva una deuda.",
          "Se arma de a poquito: lo importante es que crezca, aunque sea lento.",
        ],
        preguntas: [
          {
            enunciado: "¿Para qué sirve el colchón?",
            opciones: ["Para imprevistos", "Para comprar un celular nuevo", "Para prestarle a un amigo"],
            correcta: 0,
            explicacion: "El colchón es para lo que no planeaste: así no tienes que endeudarte.",
          },
          {
            enunciado: "Se te malogra el celular y lo necesitas para trabajar. ¿De dónde sale la plata?",
            opciones: ["Pido un préstamo rápido", "Del colchón", "Dejo de pagar la luz"],
            correcta: 1,
            explicacion: "Justo para esto existe. Después lo vuelves a llenar de a poquito.",
          },
          {
            enunciado: "¿Qué es mejor para empezar tu colchón?",
            opciones: ["Esperar a ganar más", "Guardar poquito pero seguido", "Guardar todo de golpe un mes"],
            correcta: 1,
            explicacion: "Lo constante gana. S/ 2 diarios son unos S/ 60 al mes.",
          },
        ],
      },
      {
        id: "colchon-2",
        titulo: "¿Cuánto guardar?",
        idea: [
          "Una meta común es juntar lo que gastas en un mes de lo básico, y con el tiempo llegar a tres meses.",
          "Si eso suena lejos, empieza con una meta chiquita: por ejemplo, una semana de gastos.",
          "Guárdalo separado de la plata del día, para no gastarlo sin darte cuenta.",
        ],
        preguntas: [
          {
            enunciado: "Gastas S/ 1 200 al mes en lo básico. ¿Una primera meta razonable?",
            opciones: ["S/ 300, una semana", "S/ 12 000", "No necesito meta"],
            correcta: 0,
            explicacion: "Una semana es un buen primer paso. Luego vas por el mes completo.",
          },
          {
            enunciado: "¿Dónde conviene tener el colchón?",
            opciones: ["Mezclado con la plata del día", "Separado, aparte de lo que gastas", "Prestado a alguien"],
            correcta: 1,
            explicacion: "Separado cuesta más gastarlo por impulso.",
          },
          {
            enunciado: "Usaste parte del colchón en una emergencia. ¿Y ahora?",
            opciones: ["Me siento mal y lo dejo", "Lo vuelvo a llenar de a poquito", "Lo uso todo, total ya empecé"],
            correcta: 1,
            explicacion: "Para eso estaba. Usarlo bien no es fallar.",
          },
        ],
      },
    ],
  },
  { id: "presupuesto", titulo: "Presupuesto del día", lecciones: [] },
  { id: "deudas", titulo: "Intereses y deudas", lecciones: [] },
  { id: "estafas", titulo: "Estafas comunes", lecciones: [] },
  { id: "yape", titulo: "Yape seguro", lecciones: [] },
];

export function buscarLeccion(id: string | null) {
  for (const t of CAMINO) for (const l of t.lecciones) if (l.id === id) return l;
  return null;
}
