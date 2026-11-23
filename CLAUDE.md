# Auxi: contexto del proyecto

Lee este archivo completo antes de cualquier tarea. Responde y escribe todos los textos de la app en español peruano sencillo.

Para cualquier tarea de **Auxi Vida** (`/vida`), lee también `docs/vida/vida.md` (y `docs/vida/pantallas.md` y `docs/vida/fases.md`).

## Qué es Auxi

**Auxi Studio por Daniel Chong** es la plataforma (dominio auxistudio.com): un mundo de mini apps gratuitas con una sola cuenta. La portada y el inicio (`/`) viven en `src/screens/Plataforma.tsx`; nombres y mini apps se cambian solo en `src/lib/plataforma.ts`. Las mini apps de hoy:

- **Auxi Teach** (estudiantes, `/teach`): la primera que se construyó. Antes se llamaba Auxi Studio; `/studio/...` redirige a `/teach/...`.
- **Auxi Vida** (personas, `/vida`).
- **Vendoe** (negocios): app aparte con su propio dominio. `/negocio` cuenta el clic y redirige a vendoe.es.

La plataforma es el gancho gratuito; el producto de pago es **Vendoe**. Cada mini app tiene su propia URL de entrada para medir su tráfico por separado (la mini app de cada evento: `teach`, `vida`, `negocio` o `plataforma`). Más adelante se sumarán más mini apps (una fila en `MINI_APPS`) y un enlace a la landing de Daniel (`LANDING_URL`).

Al leer el resto de este archivo, donde dice «Studio» se refiere a **Auxi Teach**.

## La promesa de Studio

"Sube lo que te dejaron y estudia jugando, con una IA que te pregunta en vez de copiarte."

La app debe sentirse como Duolingo: muy interactiva, animada, con premios inmediatos. Visualmente minimalista (colores tranquilos); toda la emoción viene del movimiento, el sonido y los premios.

## Funciones de Studio versión 1

1. Camino de niveles con vidas, aciertos y celebración (base: la app actual "Estudia jugando", en `/legacy`).
2. "Sube lo que tengas": PDF, foto de apuntes o texto pegado → lección con preguntas.
3. Repaso inteligente: vuelve a preguntar lo que fallaste en días siguientes (repaso espaciado).
4. Pista antes que respuesta: al subir la foto de un ejercicio, primero una pista; la respuesta solo si la pide.
5. Sílabo → "Mis entregas" con avisos 7, 3 y 1 día antes.
6. "Tu semana en 5 minutos": bloques de estudio entre el trabajo.
7. Métodos de estudio con minijuegos: Pomodoro ("El tomate"), Las 5 cajas (Leitner) y "Explícaselo a León" (Feynman).
8. Racha con protector, tarjeta diaria al entrar y cofre al completar la primera lección del día.
9. Check-in de ánimo y acceso visible a ayuda profesional.
10. Misiones de apoyo opcionales (ver abajo) y enlace a Vendoe en el perfil.

Versión 2 (NO construir ahora): Modo Pre de admisión, salas de estudio, pausar apps, ligas, modo sin internet.

## Mascota: León

Un camaleón cobalto con panza, aros de ojos y marcas en turquesa. En Studio lleva mochila turquesa y un lápiz amarillo detrás de la cresta; lentes finos en modo concentración. Aparece SOLO como imagen fija (PNG/WebP sin fondo) en `public/leon/`. No se anima por partes ni en video; como máximo entra con un fundido o un pequeño rebote del contenedor.

Personalidad y voz: curioso, ingenioso, amable. Habla como un amigo listo. Nunca regaña, nunca se burla, nunca culpa por fallar un día. Frases cortas.

Imágenes disponibles (cuando lleguen): A1 saluda, A2 celebra, A3 concentrado, A4 pensativo, A5 anima, A6 sorprendido, A7 duerme, A8 hoja de caras, A9 ícono. Mientras no existan, usa un placeholder circular con el color de marca y el texto "León".

## Diseño

Sigue SIEMPRE la skill `auxi-design` (en `.claude/skills/auxi-design/SKILL.md`): colores, tipografía, botones, animaciones, sonidos y tono. Usa también la skill `frontend-design` para que nada se vea genérico.

## Stack

- React + TypeScript + Vite, como PWA instalable (vite-plugin-pwa). Debe funcionar igual en iPhone (Safari) y Android (Chrome).
- Tailwind CSS con los tokens de `auxi-design` como variables CSS.
- Motion (motion.dev) para animaciones; canvas-confetti para confeti.
- Sonidos cortos con Web Audio API (archivos propios en `public/sounds/` o generados).
- Supabase para cuentas (Google y correo) y datos (más adelante; al inicio, datos locales de ejemplo).
- API de Claude solo desde funciones del servidor, nunca con la clave en el navegador.
- PostHog para métricas; Vercel para publicar.

## Reglas de experiencia

- Decisión del dueño: hay que iniciar sesión (correo + contraseña o código, y Google) para usar la app. La portada solo ofrece "Iniciar sesión o crear cuenta". Después: 5 preguntas obligatorias (nombre, año de nacimiento, carrera, universidad, país; solo métricas), un recorrido de bienvenida de solo tocar "Siguiente" (sin jugar ni leer de más) y una guía de inicio en la pantalla principal que lleva a cada parte (se cierra con X).
- Una acción principal por pantalla; el botón principal abajo, al alcance del pulgar.
- Todo toque responde en menos de 100 ms con movimiento y, si corresponde, sonido.
- Vibración solo en Android (`navigator.vibrate`); en iPhone no existe en la web: compensar con sonido y animación.
- En iPhone, mostrar una guía animada de 3 pasos para "Agregar a inicio" (las notificaciones solo funcionan así).
- Debe cargar rápido en un Android barato con datos móviles: imágenes WebP, código dividido por pantalla.
- Áreas táctiles de al menos 44 × 44 px. Contraste de texto mínimo 4,5.

## Reglas de negocio y honestidad (no negociables)

- Ninguna ventana obliga a jugar para entrar; todas se cierran con una X visible.
- Nada de premios falsos, cuentas regresivas falsas ni probabilidades escondidas. Si hay cofre o sorpresa, las probabilidades se muestran.
- Nada de "tu mascota se muere" ni culpa por perder la racha. Existe protector de racha y recuperación de racha.
- Misiones de apoyo (comentar el video, seguir en Instagram, compartir un logro, invitar, opinar): siempre opcionales, nunca bloquean funciones; el premio por opinar es el mismo si la opinión es buena o mala; solo se publica una opinión con permiso expreso.
- Monedas (decisión del dueño): lo básico siempre es gratis (jugar, repasar, métodos, entregas). Las monedas abren solo lo extra: más temas importados con IA (2 gratis; +1 cupo = 60 monedas; pase libre de por vida = 500). Lo ya importado nunca se bloquea. Se ganan estudiando, con el cofre y con misiones opcionales; los precios y premios se muestran siempre. Las misiones funcionan por confianza (no se verifica un seguimiento o comentario).
- Crear lecciones: sin costo de API. La persona pasa el material por su propia IA (ChatGPT, Claude o Gemini) con el prompt de Auxi y pega el resultado.
- No inventar cifras, testimonios ni resultados ("sube tus notas") en ningún texto.
- Studio no hace terapia: el check-in de ánimo solo acompaña y muestra dónde pedir ayuda profesional.

## Métricas a instrumentar desde el día 1

Activación (primera lección terminada el primer día), retención día 7 y día 30, invitaciones, clics a Vendoe. Cada evento lleva la mini app de origen.

## Forma de trabajar

- Trabaja por fases (ver `docs/fases.md`). Al terminar cada fase, muestra la vista previa y espera mi visto bueno.
- Antes de cambios grandes, explica el plan en 3 a 5 líneas.
- Después de cada pantalla, pruébala con la skill `webapp-testing` en tamaño de celular (390 × 844) y corrige lo que se vea mal.
- Haz commits pequeños con mensajes claros en español.
