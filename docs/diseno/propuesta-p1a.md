# Propuesta visual v4: ecosistema en órbita (para aprobar antes del cambio grande)

> **v4 (24 nov):** lenguaje de «ecosistema»: escenarios de espacio (héroe, ecosistema, cierre), una sección con color propio por app, íconos de app (`src/components/IconoApp.tsx`), historia con celular fijo que cambia al hacer scroll, bento con micro-animaciones, precios con Vendoe como única app de pago, preguntas con contacto, modo claro y oscuro. Código del boceto en `src/propuesta/` (comun.tsx y Landing.tsx). Ruta completa y fases siguientes en `docs/plan-landing-y-sistema.md`.

## Historial

> **Landing v3 (24 nov):** la landing se rehízo más limpia: héroe con qué es y para quién, «Dos apps, una cuenta» con la pantalla de cada app, prueba, «Lo que hace distinto a Auxi», precios, preguntas frecuentes, «Sobre mí» corto y cierre con WhatsApp. Se quitaron la cinta, la órbita girando, los chips que flotan, la franja de privacidad y «Vienen más apps». Detalle y propuestas en `docs/plan-landing-y-sistema.md`; imágenes en `docs/plataforma/solicitud-imagenes-v3.md`. Lo de abajo sigue valiendo para Mi espacio, Student y Vida.

Bocetos navegables en tu computadora: **http://localhost:5173/propuesta** (solo en desarrollo). Pestañas: Landing, Mi espacio, Auxi Student (con «Cuenta nueva»), Auxi Vida y Sistema; selector Celular 390 / Computadora 1280. Datos de ejemplo.

## Qué cambió respecto a P1A
P1A siguió el framework al pie de la letra y quitó lo que hacía a Auxi reconocible: León casi desaparecía, no había movimiento y las imágenes de fieltro se cambiaron por cajas grises. v2 conserva el orden de P1A (landing → Mi espacio → cada app, menú lateral, una acción principal por pantalla) y devuelve el alma.

## Por qué funcionaba lo anterior
- **León es el ancla emocional.** Una cara amable hace que una app de estudio o de plata se sienta cercana y no una obligación.
- **El fieltro es la identidad.** Nadie más en el rubro se ve así; las imágenes cuentan qué hace cada app sin leer.
- **El movimiento premia.** Monedas que suben, racha, confeti: el cerebro aprende que volver vale la pena.
- **Faltaba orden,** no alma: la portada repetía todo después de entrar, no había un lugar propio con todas las apps y algunos efectos se movían sin motivo.

## Dirección v2: estructura adulta, alma de León
| Tema | v2 | Por qué |
|---|---|---|
| Tipografía | **Nunito** 800/900 en títulos y botones (la voz de Auxi); **Figtree** 500 en párrafos, tablas y montos | Nunito da la calidez; Figtree mejora la lectura en textos largos y números. |
| Color | Tokens de `auxi-design`: fondo `#F7F8FC`, cobalto, teal para Vida, turquesa para aciertos, oro solo para premios | Se mantiene lo aprobado; el oro sigue siendo premio. |
| Marca | Órbita de **tres puntos** con el centro dorado; gira despacio solo en la landing | Es la marca que ya tienes; P1A la había cambiado sin necesidad. |
| León | Landing: A1 grande en el héroe y A5 en el cierre, caras chicas en la prueba. Mi espacio: A1 en el saludo. Student: A3 en «Continuar», A1 en cuenta nueva. Vida: B1 en el disponible y caras B8 en consejos | Presente en cada pantalla, una figura grande por bloque. |
| Movimiento | Un momento orquestado al cargar la landing (León rebota, aparece la órbita, saltan los premios). Movimiento continuo y lento solo en órbita, cinta y León flotando. Todo lo demás responde a la persona. Movimiento reducido: todo quieto | Emoción sin ruido. |
| Botones | «Que se hunden» (borde inferior y hundimiento al tocar), 52 px | Respuesta física al toque, como en las lecciones. |
| Landing | Héroe con León y premios → cinta → «Elige tu app» con banners de fieltro → Vendoe aparte → **«Pruébalo aquí mismo»** (una pregunta real con monedas, confeti y pista) → «Una cuenta. Tus datos, bajo tu control.» → «Vienen más apps» → «Hola, soy Daniel Chong» → cierre con León | La prueba hace sentir el producto antes de crear la cuenta. |
| Mi espacio | Saludo con León, racha y monedas; «Continúa donde te quedaste»; mosaico de todas las apps con su imagen y un «Próximamente» | Es la casa del sistema: lo de hoy y lo que viene. |
| Student | Tarjeta cobalto con el camino de niveles (el actual late), racha y monedas arriba, cofre del día con «Ver probabilidades» | El juego se ve desde el inicio. |
| Vida | Disponible que cuenta hasta su valor, León con su moneda, consejo con su cara, barra flotante con «＋ Registrar», «Ocultar montos» | Calidez sin restar seriedad a los montos. |

## Texto del creador (para aprobar)
> **Hola, soy Daniel Chong**
> Me apasiona crear soluciones digitales para negocios y para personas. Auxi Studio es el lugar donde reúno lo que construyo.
> Aquí también comparto lo que aprendo en el camino, incluidos mis errores, porque de ellos sale lo que mejor funciona.
> Te doy la bienvenida. Este espacio es para ti: sácale todo el provecho posible.

## Lo que necesito que apruebes o cambies
1. La dirección v2 en general (estructura de P1A + León, fieltro y movimiento).
2. Titular del héroe: «Apps gratis para estudiar jugando y ordenar tu plata.»
3. El texto del creador de arriba.
4. Nunito + Figtree (o solo Nunito si prefieres una sola letra).
5. La sección «Pruébalo aquí mismo» en la landing.

## Imágenes
Prompts en español en `docs/plataforma/solicitud-imagenes-v2.md` (I-04 a I-08). Las que ya existen se reutilizan.

## Lo que viene después de tu visto bueno (P1B y P1C)
1. Tokens y componentes en el código (`AppShell`, selector de apps, tarjetas de app, botones que se hunden, contadores).
2. Landing nueva, `/mi-espacio`, regreso a la app desde la que se inició sesión.
3. Inicios de Student y Vida; luego el resto de pantallas en orden de uso.
4. Capturas reales con datos de ejemplo.
