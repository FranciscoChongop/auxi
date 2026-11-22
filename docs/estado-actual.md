# Estado de Auxi Studio

App publicada: https://auxi-three.vercel.app/studio (Vercel se actualiza solo al subir a `main`).

## Hecho
- **Fase 1 y 2:** diseño, 7 tipos de juego, camino de niveles, celebración, cofre, métodos (tomate, 5 cajas, Explícaselo a León), entregas, calendario, perfil.
- **Fase 3:** cuentas con Supabase (código de 6 números por correo con Resend), avance en la nube, publicación en Vercel.
- **Crear lecciones sin costo de API:** el prompt va a ChatGPT, Claude o Gemini y el resultado se pega en Auxi (Mis cursos → tema). Lo mismo con el sílabo (entregas, feriados, exámenes y calendario).
- **Monedas:** 2 temas importados gratis, +1 cupo por 60, pase libre por 500, protector por 50.
- **Camino al pase libre:** la persona pide el pase con su @ de Instagram, manda capturas por WhatsApp con un código y el dueño aprueba en `/studio/revision` (solo la cuenta `chongdaniel91@gmail.com`).
- **Exámenes y prioridad**, selector curso → tema, bienvenida breve, atención al cliente (WhatsApp 960 650 372).
- **Fase 5 (parte):** repaso espaciado (1, 3 y 7 días) y capa de métricas lista (sin clave no envía nada).

## Pendiente (necesita datos o cuentas del dueño)
- **TikTok y videos** para el Camino al pase libre: agregar filas en `REQUISITOS` de `src/lib/apoyo.ts` con su enlace.
- **PostHog:** crear cuenta y poner `VITE_POSTHOG_KEY` en Vercel para activar las métricas.
- **Google:** activar el proveedor en Supabase y poner `VITE_GOOGLE_ACTIVO=si`.
- **Correos a cualquier persona:** verificar un dominio en Resend (hoy solo llega al correo del dueño).
- **Avisos push** (Android, y iPhone con la app en inicio): requiere un servidor de avisos.
- **Fase 6:** revisión final en Android barato y Safari de iPhone, dominio propio, guía de "Agregar a inicio" ya incluida.

## Cosas a saber
- Las monedas y el pase viven en el avance del usuario (se guardan en su cuenta); la aprobación del pase sí se decide en el servidor.
- Los PNG originales de León están en `originales/leon`; `npm run imagenes` regenera los WebP.
- Pruebas de celular (390 × 844) con Playwright: se guardan fuera del repositorio.

# Estado de Auxi Vida (`/vida`)

- **Fase V0:** imágenes B1–B9 en `public/leon/vida/`, publicidad N1–N8 en `marketing/vida/` (N8 = vista previa del enlace), docs en `docs/vida/`.
- **Fase V1 (prototipo navegable):** bienvenida → 3 preguntas → "Hoy puedes gastar" → primer gasto por chat → celebración y cofre → cuenta (opcional) → inicio. Además: subir captura, colchón con frasco y antojo ahorrado, camino de plata (tema 1 con 2 lecciones), alertas ("¿Esto es estafa?" y pendientes) y perfil con "Mis datos".
- **Sin IA todavía, pero nada fingido:** el presupuesto por día calcula de verdad; el chat entiende frases como «menú 12 y pasaje 3» con reglas; la revisión de estafas busca señales comunes y lo dice; la captura se muestra y la persona escribe el monto (la lectura automática llega en V3).
- **Datos:** viven en el celular (`auxi.vida.v1`), con su propia racha y monedas. La cuenta es la misma de Studio; guardar Vida en la nube es la Fase V2.
- **Código:** `src/vida/` (estado y cálculo en `estado.ts`, frases en `entender.ts`, estafas en `estafa.ts`, lecciones en `lecciones.ts`, pantallas en `pantallas/`).
