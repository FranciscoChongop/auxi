# Ruta de trabajo: landing v3, Vida en la cuenta y revisión general

Pedido de Daniel (23 nov 2026): la landing está recargada y con información innecesaria; Student **y Vida** deben guardarse en la cuenta; «Sobre mí» ocupa mucho; menos animación continua; información realmente útil; revisar toda la web dos veces, corregir lo que se pueda sin aprobación y listar lo que sí la necesita; imágenes nuevas con propósito.

Si el trabajo se corta, se retoma desde el primer paso que no esté marcado ✅.

## Pasos
1. ✅ Habilidad de diagnóstico: se sugirieron QA Bug Hunter y A11y Enforcer (Daniel los activa con un clic). Mientras tanto se usa la skill del proyecto `webapp-testing` (Playwright).
2. ✅ Revisión 1 (automática, 47 rutas × celular y computadora): rutas, redirecciones, consola, red, imágenes rotas, desbordes, áreas táctiles, encabezados.
3. ✅ Corregir lo encontrado en la revisión 1 (casi todo eran falsos positivos; ver tabla).
4. ✅ **Vida guardada en la cuenta** (falta que Daniel corra el SQL)
   - SQL nuevo `supabase/migraciones/2026-11-24-vida-en-la-cuenta.sql`: tabla `vida_datos (user_id, estado jsonb, actualizado)` con RLS por usuario. Daniel lo corre en Supabase.
   - `src/vida/estado.ts`: al entrar con cuenta, baja lo guardado y lo une con lo del celular (por id, sin duplicar); cada cambio se sube con espera corta. Sin la tabla instalada, sigue funcionando local como hoy.
   - Textos que decían «Vida se queda en tu celular» → «se guarda en tu cuenta» (landing, Perfil de Vida, privacidad).
   - Prueba automática de la unión.
5. ✅ **Landing v3** (en `/propuesta`, pestaña Landing). Orden:
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
6. ✅ Revisión 2: repetir la revisión automática + recorrido manual de la landing v3, Mi espacio y las dos apps; corregir.
7. ✅ Prompts de imágenes v3 (`docs/plataforma/solicitud-imagenes-v3.md`): cada imagen explica algo de su sección (León haciendo la acción concreta, pantallas reales), no relleno.
8. ✅ Actualizar `docs/diseno/propuesta-p1a.md`, commit, y lista de propuestas para aprobar.

## Hallazgos de la revisión 1
| # | Dónde | Hallazgo | Acción |
|---|---|---|---|
| R1-1 | `/student/perfil` | Interruptor sin nombre | Falso positivo: tiene `<label for>` |
| R1-2 | `/student/ayuda` | Casilla de 18×20 px | Falso positivo: toda la fila (44 px) es su etiqueta |
| R1-3 | `/vida/plan` | Campo de monto de 38 px | Corregido: el campo ocupa toda la caja de 64 px |
| R1-4 | `/privacidad`, `/terminos` | Enlaces de correo y WhatsApp de 23 px | Enlaces dentro de un párrafo (excepción de WCAG 2.5.8); sin cambio |
| R1-5 | `/negocio` | Redirige a Vendoe (correcto) | Sin cambio |
| R1-6 | `/studio/...` | Redirige a `/student/...` (correcto) | Sin cambio |
| R1-7 | `/entrar` | En desarrollo con `VITE_SIN_LOGIN` vuelve a `/` (correcto: no hay cuenta que pedir) | Sin cambio; se prueba en la versión publicada |
| R1-8 | Todas | Sin errores de consola, sin imágenes rotas, sin desbordes horizontales | — |

## Hallazgos de la revisión 2
- Las 47 rutas, en celular y computadora: sin errores de consola, sin imágenes rotas, sin desbordes; redirecciones `/studio` → `/student` y `/negocio` → Vendoe correctas.
- Landing v3: todas las áreas táctiles miden 44 px (el boceto se ve más chico porque el marco se escala); el único enlace pequeño es «Vendoe» dentro de una frase (permitido).
- `npm test`: 8 de 8. `npm run build`: sin errores.

## Propuestas que necesitan aprobación de Daniel
1. **Correr el SQL** `supabase/migraciones/2026-11-24-vida-en-la-cuenta.sql` en Supabase. Hasta entonces Vida sigue solo en el equipo, aunque los textos ya dicen «en tu cuenta»: hay que correrlo antes de publicar.
2. **Privacidad:** guardar datos de dinero en la nube cambia lo que promete la política. Se actualizó el texto, pero conviene una revisión legal antes del lanzamiento.
3. **Textos de la landing v3:** titular «Estudia jugando y ordena tu plata, gratis.», las 6 preguntas frecuentes y la sección de precios.
4. **WhatsApp:** la landing usa el número que ya está en Privacidad. ¿Es el correcto para atender dudas?
5. **Monedas:** la landing dice que se ganan usando la app. ¿Confirmas que no se venderán con dinero?
6. **Opiniones reales:** no hay testimonios y no se inventan. Propuesta: sumar una sección cuando haya opiniones reales con permiso (la misión «opinar» ya pide permiso para publicar).
7. **«Vienen más apps»** sale de la landing y queda solo en Mi espacio.
8. **Imágenes v3** (I-10 a I-13) según `docs/plataforma/solicitud-imagenes-v3.md`.
9. **Límite conocido:** la primera vez que un equipo se enlaza con la cuenta se unen ambas copias de Vida; algo borrado en un equipo puede volver si el otro aún lo tenía. Después, manda la copia más nueva.
10. **Tercera revisión:** si activas QA Bug Hunter y A11y Enforcer, hago una pasada más con ellos.

## Pedido del 24 nov (después de ver la landing v3)
Decisiones de Daniel: revisión legal de privacidad, textos de la landing y número de WhatsApp aprobados. «Vienen más apps» queda solo en Mi espacio. Las monedas no se venden con dinero **por ahora** (más adelante, según métricas, podría haber algo de pago).

1. ⬜ Íconos propios de Auxi Student (libro abierto con visto bueno y chispa) y Auxi Vida (moneda con brote), misma familia que el logo; se usan donde se habla de cada app.
2. ⬜ Escaparate animado por app (reemplaza tarjeta + celular chico): escenario de color propio (cobalto / verde azulado), texto grande que cambia por paso, barras de avance tipo historias, celular grande con elementos que salen de él (motion graphics). Se pausa y no corre fuera de pantalla ni con movimiento reducido.
3. ⬜ Modo oscuro en todo el boceto (botón sol/luna en el encabezado y selector en la barra de la propuesta). En la app real se guardará en ajustes.
4. ⬜ Revisar en celular, computadora y oscuro; commit.

## Pedido del 24 nov (2): ecosistema profesional, «que todo se sienta wow»
Daniel: el recorrido y la landing se sienten simples, «como hechos por un niño»; en computadora sobra espacio en blanco en «Dos apps, una cuenta». Quiere un **ecosistema profesional** (Auxi Studio como un sistema en órbita, sin tomarlo literal), con motion graphics, referencias reales y cuidado en cada detalle, **en la landing y en todas las apps**.

Imágenes entregadas (hay que guardarlas en `originales/plataforma/`): `hero.png`, `hero-movil.png`, `app-student.png`, `app-vida.png`, `app-vendoe.png`. Las anteriores de héroe pasaron a `originales/plataforma/anteriores/`.

### Fase A (esta): lenguaje visual v4 + landing
1. ⬜ Referencias (patrones de landings de producto de primer nivel).
2. ⬜ Código del boceto separado en `src/propuesta/` (piezas comunes y landing aparte).
3. ⬜ Tokens v4 con modo claro y oscuro; íconos de app (Student, Vida, Vendoe).
4. ⬜ Landing v4: encabezado de vidrio fijo; héroe a todo el ancho con la imagen nueva, León y órbitas que se dibujan; sección «Ecosistema» (mapa orbital de las apps + principios); por app: cabecera con su imagen, historia con celular fijo que cambia al hacer scroll (computadora) o escaparate automático (celular), y bento de funciones con micro-animaciones (incluida la pregunta de prueba); Vendoe; precios; preguntas + contacto; sobre mí; cierre; pie.
5. ⬜ Mi espacio, Student y Vida del boceto con íconos, imágenes nuevas y modo oscuro.
6. ⬜ Revisión en celular, computadora y oscuro; commit.

### Fases siguientes (después del visto bueno)
- **B:** sistema de diseño v4 en el código real (tokens, `AppShell`, componentes) + landing real en `/` y `/mi-espacio`.
- **C:** todas las pantallas de Auxi Student con el nuevo lenguaje (inicio, lección, camino, métodos, entregas, perfil…).
- **D:** todas las pantallas de Auxi Vida (hoy, registrar, movimientos, metas, Protégete, importar, perfil…).
- **E:** revisión completa x2 y capturas reales para la landing.
