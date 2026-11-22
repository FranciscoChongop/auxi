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

- **Navegación:** Hoy · Movimientos · ＋ Registrar · Metas · Protégete; perfil arriba a la derecha. En computadora, menú lateral y Hoy en dos columnas.
- **Entrada:** bienvenida → «¿Qué quieres resolver primero?» (gastar, ahorrar, pagos o revisar algo sospechoso, esto último sin registrarse). «Ver un ejemplo» usa datos inventados que viven solo en memoria.
- **Presupuesto:** por día, semana, quincena, mes, variable o «ahora no tengo ingresos»; 1 a 7 días de trabajo; el avance de las preguntas se guarda. Hoy muestra el disponible *estimado* con pagos y ahorro separados.
- **Registro rápido** (monto, categoría, guardar) con deshacer; chat con León y captura como alternativas. **Movimientos:** resumen semanal, buscador, filtros, edición. **Pagos y fechas:** pagos mensuales con aviso en Hoy (1, 3 o 7 días antes) y fechas sueltas.
- **Metas:** varios frascos con meta y fecha opcional; antojo ahorrado; celebración solo al cumplir la meta; compartir sin montos por defecto.
- **Protégete:** un asistente para 6 situaciones (cuéntame → preguntas → resultado con señales, lo que no se pudo comprobar y pasos → añadir más información), «Ya pagué o compartí mis datos» con pasos por caso e historial privado borrable. Sin IA todavía: reglas, y lo dice. Faltan canales de denuncia verificados.
- **Datos:** viven en el celular (`auxi.vida.v1`). Guardarlos en la cuenta es la Fase V2.
- **Código:** `src/vida/` (`estado.ts` datos y cálculo, `entender.ts` frases del chat, `protege.ts` revisiones, `pantallas/`).
