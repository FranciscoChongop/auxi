# Solicitud de imágenes v2 (Auxi Studio)

Imágenes para la propuesta v2 («estructura adulta, alma de León»). Puedes verlas en uso en **http://localhost:5173/propuesta**, donde las cajas rayadas marcan los espacios que faltan.

## Cómo entregarlas
1. Genera cada imagen con el prompt de abajo, sin texto dentro.
2. Guárdala en `originales/plataforma/` con el **nombre exacto** que se indica (PNG o JPG).
3. Corre `npm run imagenes`: se convierte sola a WebP (máximo 1600 px) en `public/plataforma/`.

**León no se genera.** Se usan siempre sus imágenes oficiales de `public/leon/` (A1 a A9 y B1 a B9), puestas encima del banner por la app. Por eso cada banner deja libre el espacio donde va León.

## Bloque de estilo (pegar al inicio de cada prompt)
> Ilustración 3D de fieltro y lana hecha a mano, con costuras visibles y textura suave de tela. Iluminación de estudio cálida y suave, sombras cortas, poca profundidad de campo. Paleta: azul cobalto #2430D9, azul noche #141A4D, turquesa #5FE3DC, verde azulado #0E5B57, índigo #4A4EDB y toques de oro #F2B341. Fondo limpio, sin ruido. Composición ordenada con un área amplia y tranquila para poner texto encima. Sin letras, números, logotipos, marcas, personas ni animales. Sin neón, sin degradados llamativos, sin brillos exagerados.

## Lo que ya existe (se reutiliza tal cual)
| Archivo | Dónde va en v2 |
|---|---|
| `hero.webp` / `hero-movil.webp` | Héroe de la landing (León A1 encima, a la derecha en computadora y arriba en celular) y, por ahora, cabecera de Mi espacio |
| `student.webp`, `vida.webp`, `vendoe.webp` | Tarjetas de cada app en la landing y en Mi espacio |
| `cuenta.webp` | Franja «Una cuenta. Tus datos, bajo tu control.» |
| `autor.webp` | Sección «Hola, soy Daniel Chong» (mientras no haya foto real) |

## Estado (23 de noviembre)
| Archivo | Estado |
|---|---|
| `estudio` (I-04) | Recibida y en uso: «Vienen más apps» |
| `espacio` y `espacio-movil` (I-05) | Recibidas y en uso: saludo de Mi espacio |
| `proximamente` (I-06) | Recibida y en uso: mosaico de Mi espacio |
| `og-plataforma`, `og-student`, `og-vida` (I-07) | Recibidas; se arman con nombre, frase y León en la fase P1B |
| `presentacion` (foto para «Hola, soy Daniel Chong») | Falta guardarla en `originales/plataforma/presentacion.png` |
| Logo de Auxi Studio | Falta guardarlo en `originales/marca/logo.png` (con fondo blanco); `npm run imagenes` saca el símbolo y quita el fondo |

## Imágenes nuevas

### I-04 · En el estudio (`estudio.png`, 1600 × 900, horizontal)
Uso: sección «Vienen más apps» de la landing. Debe sugerir trabajo en marcha sin prometer nada concreto.
> [Bloque de estilo]. Mesa de taller vista de tres cuartos, con piezas de fieltro modulares a medio armar: bloques redondeados cobalto, turquesa e índigo encajando entre sí como piezas de construcción, un carrete de hilo dorado, una regla de fieltro y una pieza central cubierta con una tela suave índigo, como algo por revelar. Fondo azul noche liso que se aclara hacia el centro. Deja el tercio izquierdo más despejado. Sin texto, sin fechas, sin nombres.

Evitar: pantallas con interfaces, candados grandes, relojes o calendarios (parecen fecha de lanzamiento).

### I-05 · Cabecera de Mi espacio (`espacio.png`, 1600 × 500, y `espacio-movil.png`, 900 × 560)
Uso: el saludo «Hola, Daniel» con León A1 a la derecha. Hoy se usa `hero.webp` como reemplazo.
> [Bloque de estilo]. Banner panorámico de un rincón acogedor: un escritorio de fieltro azul noche visto de frente, con una lámpara pequeña dorada encendida, un cuaderno turquesa abierto, una alcancía pequeña de fieltro verde azulado y una planta. Todo ocupa la franja central-izquierda baja. El cuarto derecho del encuadre queda libre y oscuro, con un halo suave, para colocar encima a la mascota. El tercio superior izquierdo queda tranquilo para un saludo en texto blanco.

Versión celular: mismo escenario más cerrado, con objetos abajo y el espacio libre arriba a la derecha.

### I-06 · Próximamente (`proximamente.png`, 800 × 800, cuadrada)
Uso: el mosaico «Próximamente · En el estudio» de Mi espacio (hoy es una caja punteada con candado).
> [Bloque de estilo]. Una caja de regalo de fieltro índigo con un lazo de lana dorada, ligeramente entreabierta, de la que sale una luz suave turquesa. Alrededor, tres estrellas pequeñas de fieltro dorado. Fondo índigo claro liso. Objeto centrado que ocupa el 55 % del cuadro, con margen amplio abajo para un título corto.

### I-07 · Imágenes para compartir (Open Graph, 1200 × 630)
Uso: la vista previa cuando alguien comparte el enlace por WhatsApp o redes. La app pondrá encima el nombre, una frase y a León.

- `og-plataforma.png`
  > [Bloque de estilo]. Fondo azul noche con una órbita de fieltro dorada que cruza en diagonal, tres esferas pequeñas de fieltro (cobalto, verde azulado e índigo) sobre la órbita y algunas estrellas doradas. Toda la decoración va en el 40 % derecho; el 60 % izquierdo queda liso para texto.
- `og-student.png`
  > [Bloque de estilo]. Fondo cobalto con un libro abierto de fieltro, un lápiz amarillo, fichas de preguntas turquesa y una moneda dorada, agrupados en el 40 % derecho. El 60 % izquierdo queda liso para texto.
- `og-vida.png`
  > [Bloque de estilo]. Fondo verde azulado profundo con un frasco de fieltro con monedas doradas, un escudo turquesa suave y un celular de fieltro sin pantalla visible, agrupados en el 40 % derecho. El 60 % izquierdo queda liso para texto.

### I-08 · Foto real de Daniel (opcional, `daniel.jpg`, mínimo 1200 × 1500, vertical 4:5)
No se genera con IA. Una foto tuya real, de medio cuerpo, con luz natural y fondo liso claro o azul. Ropa sin marcas visibles. Si no la envías, la sección usa `autor.webp`.

## Criterios para aceptar una imagen
- Sin texto, letras ni números legibles, ni siquiera en objetos (libros, pantallas, etiquetas).
- Mismo material de fieltro que los banners actuales; no plástico ni foto realista.
- El área para texto se ve lisa: el texto blanco encima debe leerse con contraste de 4,5 o más (la app agrega un velo oscuro, pero no debe pelear con objetos detrás).
- El espacio de León queda libre: nada importante donde se coloca la mascota.
- Recortada a 390 px de ancho (celular), el motivo principal sigue reconocible.
- Peso final en WebP: menos de 250 KB (lo hace `npm run imagenes`; si pesa más, se baja la calidad).

## Capturas reales
Las capturas de Student y Vida para la landing y las tiendas se hacen **después** de implementar las pantallas nuevas (P1B y P1C), con datos de ejemplo, en 390 × 844 y 1280 × 800. No se usan datos ni nombres reales.
