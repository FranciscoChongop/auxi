# Ruta de trabajo: landing v3, Vida en la cuenta y revisión general

Pedido de Daniel (23 nov 2026): la landing está recargada y con información innecesaria; Student **y Vida** deben guardarse en la cuenta; «Sobre mí» ocupa mucho; menos animación continua; información realmente útil; revisar toda la web dos veces, corregir lo que se pueda sin aprobación y listar lo que sí la necesita; imágenes nuevas con propósito.

Si el trabajo se corta, se retoma desde el primer paso que no esté marcado ✅.

## Pasos
1. ✅ Habilidad de diagnóstico: se sugirieron QA Bug Hunter y A11y Enforcer (Daniel los activa con un clic). Mientras tanto se usa la skill del proyecto `webapp-testing` (Playwright).
2. ✅ Revisión 1 (automática, 47 rutas × celular y computadora): rutas, redirecciones, consola, red, imágenes rotas, desbordes, áreas táctiles, encabezados.
3. ⬜ Corregir lo encontrado en la revisión 1 (lista abajo).
4. ⬜ **Vida guardada en la cuenta**
   - SQL nuevo `supabase/migraciones/2026-11-24-vida-en-la-cuenta.sql`: tabla `vida_datos (user_id, estado jsonb, actualizado)` con RLS por usuario. Daniel lo corre en Supabase.
   - `src/vida/estado.ts`: al entrar con cuenta, baja lo guardado y lo une con lo del celular (por id, sin duplicar); cada cambio se sube con espera corta. Sin la tabla instalada, sigue funcionando local como hoy.
   - Textos que decían «Vida se queda en tu celular» → «se guarda en tu cuenta» (landing, Perfil de Vida, privacidad).
   - Prueba automática de la unión.
5. ⬜ **Landing v3** (en `/propuesta`, pestaña Landing). Orden:
   1. Encabezado fijo compacto: logo, Apps · Precios · Preguntas, «Entrar» y «Crear cuenta gratis».
   2. Héroe: qué es, para quién y qué ganas, en 5 segundos. León con una sola entrada (sin flotar ni girar sin parar).
   3. Apps: Student y Vida con **vista real de la pantalla** (no ilustración genérica) y 3 beneficios concretos cada una; Vendoe en una línea.
   4. Pruébalo + Así funciona (3 pasos) en un solo bloque.
   5. Por qué Auxi (propuesta de valor): te pregunta en vez de copiarte; sin costo de IA (usas la tuya); sin trampas (probabilidades a la vista, sin cuentas regresivas falsas); todo guardado en tu cuenta.
   6. Precios: gratis lo básico; monedas solo para lo extra (2 temas con IA gratis, +1 cupo = 60, pase de por vida = 500); cómo se ganan.
   7. Preguntas frecuentes (desplegables).
   8. Sobre mí compacto (foto chica + 2 frases + Instagram).
   9. Cierre: CTA + WhatsApp (falta el número).
   10. Pie.
   - Se quitan: cinta que se mueve, órbita girando sin parar, chips que flotan, franja de 3 cajas de privacidad, «Vienen más apps» (queda en Mi espacio).
6. ⬜ Revisión 2: repetir la revisión automática + recorrido manual de la landing v3, Mi espacio y las dos apps; corregir.
7. ⬜ Prompts de imágenes v3 (`docs/plataforma/solicitud-imagenes-v3.md`): cada imagen explica algo de su sección (León haciendo la acción concreta, pantallas reales), no relleno.
8. ⬜ Actualizar `docs/diseno/propuesta-p1a.md`, commit, y lista de propuestas para aprobar.

## Hallazgos de la revisión 1
| # | Dónde | Hallazgo | Acción |
|---|---|---|---|
| R1-1 | `/student/perfil` | Un botón sin nombre accesible | Corregir (aria-label) |
| R1-2 | `/student/ayuda` | Casilla de 18×20 px | Agrandar área táctil a 44 px |
| R1-3 | `/vida/plan` | Campo de 38 px de alto | Subir a 44 px |
| R1-4 | `/privacidad`, `/terminos` | Enlaces de correo y WhatsApp de 23 px de alto | Darles área táctil de 44 px |
| R1-5 | `/negocio` | Redirige a Vendoe (correcto) | Sin cambio |
| R1-6 | `/studio/...` | Redirige a `/student/...` (correcto) | Sin cambio |
| R1-7 | `/entrar` | En desarrollo con `VITE_SIN_LOGIN` vuelve a `/` (correcto: no hay cuenta que pedir) | Sin cambio; se prueba en la versión publicada |
| R1-8 | Todas | Sin errores de consola, sin imágenes rotas, sin desbordes horizontales | — |

## Propuestas que necesitan aprobación de Daniel
(se completa al final)
