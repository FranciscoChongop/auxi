# Estado de Auxi Studio (plataforma) y de Auxi Student

Plataforma: **Auxi Studio por Daniel Chong** (auxistudio.com). Mini apps: Auxi Student (`/student`, antes llamada Auxi Studio), Auxi Vida (`/vida`) y Vendoe (`/negocio` redirige a vendoe.es).

App publicada: https://auxi-three.vercel.app (Vercel se actualiza solo al subir a `main`; el dominio propio se conecta desde Vercel → Settings → Domains).

- **Plataforma:** portada con León y las tres mini apps, inicio de sesión único en `/entrar`, inicio «¿A dónde quieres entrar?» con una tarjeta por mini app, y páginas `/privacidad` y `/terminos`. `/studio/...` redirige a `/student/...` (también con una redirección permanente en `vercel.json`).
- **Pendiente del dominio:** conectar auxistudio.com en Vercel y en Latinoamérica Hosting; agregar `https://auxistudio.com/**` y `/student` a las URL de retorno de Supabase; poner el dominio en Google Cloud (marca, privacidad y condiciones: `/privacidad` y `/terminos`); verificar el dominio en Resend; cuando exista el dominio, redirigir `auxi-three.vercel.app` al nuevo; llenar `LANDING_URL` cuando la landing esté lista.

## Hecho
- **Fase 1 y 2:** diseño, 7 tipos de juego, camino de niveles, celebración, cofre, métodos (tomate, 5 cajas, Explícaselo a León), entregas, calendario, perfil.
- **Fase 3:** cuentas con Supabase (código de 6 números por correo con Resend), avance en la nube, publicación en Vercel.
- **Crear lecciones sin costo de API:** el prompt va a ChatGPT, Claude o Gemini y el resultado se pega en Auxi (Mis cursos → tema). Lo mismo con el sílabo (entregas, feriados, exámenes y calendario).
- **Monedas:** 2 temas importados gratis, +1 cupo por 60, pase libre por 500, protector por 50.
- **Camino al pase libre:** la persona pide el pase con su @ de Instagram, manda capturas por WhatsApp con un código y el dueño aprueba en `/student/revision` (solo la cuenta `chongdaniel91@gmail.com`).
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
- **Importar movimientos** (`/vida/importar`, gratis): reporte CSV/Excel/PDF, captura o comprobante (OCR en el celular con tesseract.js, con aviso antes de descargar), texto pegado y Gmail. Vista previa «Revisa y confirma» con «Por revisar», posibles duplicados (por número de operación, o por día + monto + nombre), corrección, reglas de categoría, origen guardado, historial y «Deshacer importación». Devoluciones restan a lo gastado; transferencias propias y otras monedas no cuentan para el día.
- **Gmail:** código listo con la autorización oficial de Google (solo lectura), apagado hasta configurarlo. Falta: activar Gmail API y el permiso `gmail.readonly` en Google Cloud, verificación de Google (permiso restringido; en pruebas, máx. 100 cuentas), vincular identidades en Supabase, agregar `/vida/importar` a las URL de retorno de Supabase, actualizar la política de privacidad y poner `VITE_GMAIL_ACTIVO=si`. El permiso dura ≈1 hora y no se guarda: Google pide confirmar en cada sincronización (para sincronizar sin eso hace falta una función de servidor).
- **Sugerencias** (`src/vida/sugerencias.ts`): una por sesión, 7 días sin repetir lo descartado, nada de lo ya hecho, solo en Hoy y apagables en Perfil. Novedades de formatos con `FORMATOS_VERSION` en `src/vida/importar/importar.ts`.
- **Banners de la plataforma:** la portada y el inicio usan banners de imagen (`public/plataforma/*.webp`: hero, hero-movil, student, vida, vendoe, cuenta, autor) con parallax al hacer scroll, cinta de frases en movimiento, figuras que flotan y entradas animadas; todo queda quieto si se reduce el movimiento. Mientras falte una imagen, cada banner muestra su fondo animado de respaldo. Los prompts están en `docs/plataforma/prompts-banners.md`; las imágenes se guardan en `originales/plataforma/` y `npm run imagenes` las convierte. La mascota sale una sola vez (el héroe de la portada).
