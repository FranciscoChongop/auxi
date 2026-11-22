import type { Curso } from "./tipos";

/** Temas de ejemplo para quien no tiene material a la mano. */

export const FOTOSINTESIS: Curso = {
  id: "fotosintesis",
  titulo: "La fotosíntesis",
  materia: "Biología",
  unidades: [
    {
      titulo: "Qué es y para qué sirve",
      resumen: "La fotosíntesis es cómo las plantas fabrican su alimento con luz. Además, libera el oxígeno que respiramos.",
      lecciones: [
        {
          titulo: "La idea principal",
          tarjetas: [
            { frente: "Fotosíntesis", reverso: "Las plantas convierten luz, agua y CO₂ en glucosa, que es su alimento. Ejemplo: una hoja al sol." },
            { frente: "Oxígeno", reverso: "Sale como resultado de la fotosíntesis. Gracias a él podemos respirar." },
          ],
          ejercicios: [
            { tipo: "opcion", pregunta: "¿Qué fabrica la planta en la fotosíntesis?", opciones: ["Glucosa", "Sal", "Proteína animal", "Petróleo"], correcta: 0, explicacion: "La planta produce glucosa, que es su alimento.", pista: "Es un tipo de azúcar." },
            { tipo: "vf", afirmacion: "La fotosíntesis libera oxígeno.", respuesta: true, explicacion: "El oxígeno sale como resultado del proceso.", pista: "Piensa en el aire que respiramos cerca de los árboles." },
            { tipo: "completar", frase: "Para la fotosíntesis la planta necesita luz, agua y ___.", respuesta: "CO₂", opciones: ["CO₂", "sal", "azúcar", "tierra"], explicacion: "El dióxido de carbono (CO₂) entra por las hojas.", pista: "Es un gas que entra por las hojas." },
            { tipo: "escribir", pregunta: "¿Qué gas liberan las plantas al hacer fotosíntesis?", respuestas: ["oxígeno", "oxigeno", "o2", "el oxígeno"], explicacion: "Las plantas liberan oxígeno.", pista: "Empieza con O." },
            { tipo: "parejas", pares: [["Luz", "Fuente de energía"], ["Agua", "Entra por la raíz"], ["CO₂", "Entra por las hojas"], ["Glucosa", "Alimento de la planta"]], explicacion: "Cada ingrediente tiene su camino." },
            { tipo: "clasificar", instruccion: "¿Entra o sale de la planta?", grupos: ["Entra", "Sale"], items: [{ texto: "Agua", grupo: 0 }, { texto: "CO₂", grupo: 0 }, { texto: "Oxígeno", grupo: 1 }, { texto: "Luz", grupo: 0 }], explicacion: "Entran luz, agua y CO₂; sale oxígeno.", pista: "Solo una cosa sale al aire." },
          ],
        },
        {
          titulo: "Dónde ocurre",
          tarjetas: [
            { frente: "Cloroplasto", reverso: "Parte de la célula vegetal donde ocurre la fotosíntesis. Está sobre todo en las hojas." },
            { frente: "Clorofila", reverso: "Pigmento verde que atrapa la luz. Por eso las hojas son verdes." },
          ],
          ejercicios: [
            { tipo: "opcion", pregunta: "¿Dónde ocurre la fotosíntesis?", opciones: ["En la raíz", "En los cloroplastos", "En las flores", "En el tallo seco"], correcta: 1, explicacion: "Ocurre en los cloroplastos, sobre todo en las hojas.", pista: "Es una parte pequeña dentro de la célula." },
            { tipo: "completar", frase: "La ___ es el pigmento verde que atrapa la luz.", respuesta: "clorofila", opciones: ["clorofila", "glucosa", "raíz", "savia"], explicacion: "La clorofila da el color verde.", pista: "Su nombre suena parecido a cloroplasto." },
            { tipo: "vf", afirmacion: "Las hojas son verdes por la clorofila.", respuesta: true, explicacion: "La clorofila refleja la luz verde.", pista: "Recuerda la segunda tarjeta." },
            { tipo: "ordenar", instruccion: "Ordena el camino del agua en la planta", pasos: ["La raíz absorbe agua", "El agua sube por el tallo", "Llega a las hojas", "Se usa en la fotosíntesis"], explicacion: "El agua va de abajo hacia arriba.", pista: "Empieza bajo tierra." },
            { tipo: "escribir", pregunta: "¿Cómo se llama el pigmento verde de las hojas?", respuestas: ["clorofila", "la clorofila"], explicacion: "Es la clorofila.", pista: "Empieza con «clo»." },
            { tipo: "parejas", pares: [["Hoja", "Órgano principal"], ["Cloroplasto", "Fábrica de alimento"], ["Clorofila", "Atrapa la luz"], ["Raíz", "Absorbe agua"]], explicacion: "Cada parte cumple una función." },
          ],
        },
      ],
    },
    {
      titulo: "Las dos fases",
      resumen: "Primero la planta captura la energía de la luz. Después usa esa energía para fabricar glucosa con el CO₂.",
      lecciones: [
        {
          titulo: "Fase luminosa",
          tarjetas: [{ frente: "Fase luminosa", reverso: "Necesita luz. Rompe el agua, libera oxígeno y guarda energía para la siguiente fase." }],
          ejercicios: [
            { tipo: "vf", afirmacion: "La fase luminosa necesita luz.", respuesta: true, explicacion: "Por eso se llama luminosa.", pista: "Mira el nombre de la fase." },
            { tipo: "opcion", pregunta: "¿Qué se libera en la fase luminosa?", opciones: ["Glucosa", "Oxígeno", "CO₂", "Sal"], correcta: 1, explicacion: "Al romper el agua se libera oxígeno.", pista: "Sale cuando se rompe el agua." },
            { tipo: "completar", frase: "En la fase luminosa se rompe la molécula de ___.", respuesta: "agua", opciones: ["agua", "glucosa", "sal", "aire"], explicacion: "El agua se rompe y libera oxígeno.", pista: "La planta la toma por la raíz." },
            { tipo: "ordenar", instruccion: "Ordena la fase luminosa", pasos: ["La clorofila atrapa la luz", "Se rompe el agua", "Se libera oxígeno", "Se guarda energía"], explicacion: "Todo empieza con la luz.", pista: "Lo primero es atrapar la luz." },
            { tipo: "vf", afirmacion: "En la fase luminosa se fabrica la glucosa.", respuesta: false, explicacion: "La glucosa se fabrica en la fase oscura.", pista: "Hay otra fase después." },
          ],
        },
        {
          titulo: "Fase oscura",
          tarjetas: [{ frente: "Fase oscura (ciclo de Calvin)", reverso: "No necesita luz directa. Usa la energía guardada y el CO₂ para fabricar glucosa." }],
          ejercicios: [
            { tipo: "opcion", pregunta: "¿Qué se fabrica en la fase oscura?", opciones: ["Oxígeno", "Agua", "Glucosa", "Clorofila"], correcta: 2, explicacion: "La fase oscura produce glucosa.", pista: "Es el alimento de la planta." },
            { tipo: "vf", afirmacion: "La fase oscura usa CO₂.", respuesta: true, explicacion: "El CO₂ es la materia prima de la glucosa.", pista: "La glucosa necesita carbono." },
            { tipo: "clasificar", instruccion: "¿En qué fase pasa?", grupos: ["Luminosa", "Oscura"], items: [{ texto: "Se rompe el agua", grupo: 0 }, { texto: "Se fabrica glucosa", grupo: 1 }, { texto: "Se libera oxígeno", grupo: 0 }, { texto: "Se usa el CO₂", grupo: 1 }], explicacion: "La luminosa libera oxígeno; la oscura fabrica glucosa.", pista: "El oxígeno sale del agua." },
            { tipo: "completar", frase: "A la fase oscura también se le llama ciclo de ___.", respuesta: "Calvin", opciones: ["Calvin", "Krebs", "Newton", "agua"], explicacion: "Se llama ciclo de Calvin.", pista: "Está en la tarjeta de la lección." },
            { tipo: "ordenar", instruccion: "Ordena toda la fotosíntesis", pasos: ["Entra luz, agua y CO₂", "Fase luminosa: se libera oxígeno", "Fase oscura: se usa el CO₂", "Sale glucosa"], explicacion: "Primero entran los ingredientes y al final sale el alimento.", pista: "Al final sale el alimento." },
          ],
        },
      ],
    },
  ],
};

export const CELULA: Curso = {
  id: "celula",
  titulo: "La célula",
  materia: "Biología",
  unidades: [
    {
      titulo: "Las partes de la célula",
      resumen: "La célula es la unidad más pequeña de la vida. Cada parte cumple un trabajo.",
      lecciones: [
        {
          titulo: "Núcleo y membrana",
          tarjetas: [
            { frente: "Núcleo", reverso: "Guarda el ADN, que tiene las instrucciones de la célula." },
            { frente: "Membrana", reverso: "Rodea la célula y controla lo que entra y lo que sale." },
          ],
          ejercicios: [
            { tipo: "opcion", pregunta: "¿Qué parte de la célula guarda el ADN?", opciones: ["El núcleo", "La membrana", "El citoplasma", "La pared"], correcta: 0, explicacion: "El ADN está dentro del núcleo.", pista: "Está en el centro." },
            { tipo: "vf", afirmacion: "La membrana controla lo que entra y sale de la célula.", respuesta: true, explicacion: "Funciona como una puerta con control.", pista: "Piensa en un portero." },
            { tipo: "escribir", pregunta: "¿Qué parte de la célula guarda el ADN?", respuestas: ["núcleo", "nucleo", "el núcleo", "el nucleo"], explicacion: "Es el núcleo.", pista: "Empieza con N." },
            { tipo: "parejas", pares: [["Núcleo", "Guarda el ADN"], ["Membrana", "Controla la entrada"], ["Mitocondria", "Produce energía"], ["Ribosoma", "Fabrica proteínas"]], explicacion: "Cada parte tiene su trabajo." },
          ],
        },
        {
          titulo: "Vegetal o animal",
          tarjetas: [{ frente: "Célula vegetal", reverso: "Tiene pared celular y cloroplastos. La animal no los tiene." }],
          ejercicios: [
            { tipo: "clasificar", instruccion: "¿Solo en la célula vegetal o en ambas?", grupos: ["Solo vegetal", "En ambas"], items: [{ texto: "Pared celular", grupo: 0 }, { texto: "Núcleo", grupo: 1 }, { texto: "Cloroplastos", grupo: 0 }, { texto: "Membrana", grupo: 1 }], explicacion: "Pared y cloroplastos son de la célula vegetal.", pista: "Las plantas hacen fotosíntesis." },
            { tipo: "vf", afirmacion: "La célula animal tiene cloroplastos.", respuesta: false, explicacion: "Los cloroplastos son de las plantas.", pista: "¿Los animales hacen fotosíntesis?" },
            { tipo: "completar", frase: "La célula vegetal tiene una ___ celular rígida.", respuesta: "pared", opciones: ["pared", "boca", "raíz", "hoja"], explicacion: "La pared celular le da forma.", pista: "Como la de una casa." },
          ],
        },
      ],
    },
  ],
};

export const CURSOS: Record<string, Curso> = { [FOTOSINTESIS.id]: FOTOSINTESIS, [CELULA.id]: CELULA };
