# Solicitud de imágenes v3: cada imagen explica algo

En v2, varias imágenes eran relleno: libros, globos y planetas que podrían estar en cualquier web. En v3, cada imagen muestra **la acción concreta** de su sección: lo que la persona hace o gana. Si una sección se entiende mejor con una pantalla real o un ícono, **no lleva ilustración**.

## Qué se queda, qué se va y qué se reemplaza
| Imagen actual | Decisión | Por qué |
|---|---|---|
| `hero`, `hero-movil` | **Reemplazar** (I-10) | El cielo de fieltro no dice qué hace Auxi |
| `student`, `vida`, `vendoe` | **Reemplazar** en Mi espacio (I-11 a I-13); en la landing ya no se usan | Libros, monedas y tienda genéricos |
| `cuenta`, `autor`, `estudio` | **Se retiran** de la landing | Sus secciones se quitaron o usan otra cosa (foto real, íconos) |
| `espacio`, `espacio-movil`, `proximamente` | Se quedan | Cumplen su papel en Mi espacio |
| `presentacion` (tu foto) | Se queda | «Sobre mí» compacto |
| `og-*` | Se quedan como fondo | Se les pone nombre, frase y León en P1B |
| Pantallas de Student y Vida en la landing | **Capturas reales** (C-01, C-02) | Lo que más convence es ver la app de verdad |

## Reglas para todas
- **Estilo:** ilustración 3D de fieltro hecha a mano, costuras visibles, luz de estudio suave. Paleta: cobalto #2430D9, azul noche #141A4D, turquesa #5FE3DC, verde azulado #0E5B57, índigo #4A4EDB y oro #F2B341 solo en monedas y premios.
- **Una sola idea por imagen**, con un objeto protagonista grande y como máximo 3 objetos de apoyo.
- Sin letras, números, logos, personas ni animales. **León no se genera**: la app lo pone encima, así que cada imagen deja su espacio libre.
- Espacio limpio para el texto donde se indica.

## Prompts

### I-10 · Héroe de la landing (`hero.png` 1600 × 900 y `hero-movil.png` 900 × 1200)
Idea: «tus apuntes se vuelven preguntas, tu plata se vuelve claridad».
> Ilustración 3D de fieltro hecha a mano sobre fondo azul noche liso. A la derecha, un cuaderno abierto de fieltro del que salen volando tres tarjetas de pregunta turquesa con un visto bueno cosido; junto a él, una billetera pequeña de fieltro verde azulado con dos monedas doradas asomando. Entre ambos queda un espacio vacío con un halo de luz suave para poner a la mascota encima. La mitad izquierda queda lisa y oscura para un título en blanco. Costuras visibles, luz de estudio suave, sin letras ni números, sin personas ni animales.

Versión celular: mismos objetos en el tercio superior, más pequeños, con el halo al centro; los dos tercios inferiores quedan lisos.

### I-11 · Mosaico de Auxi Student en Mi espacio (`app-student.png`, 800 × 800)
Idea: «una pregunta que se gana».
> Ilustración 3D de fieltro, fondo cobalto liso. Al centro, una tarjeta de fieltro blanca grande con tres botones redondeados debajo; el del medio es turquesa con un visto bueno cosido. Encima de la tarjeta salta una moneda dorada con un pequeño destello. El tercio inferior queda liso para un título en blanco. Sin letras ni números.

### I-12 · Mosaico de Auxi Vida en Mi espacio (`app-vida.png`, 800 × 800)
Idea: «lo que puedes gastar hoy».
> Ilustración 3D de fieltro, fondo verde azulado profundo liso. Al centro, un frasco de vidrio de fieltro lleno hasta la mitad de monedas doradas, con una línea cosida que marca el nivel de hoy. Al lado, una hoja de calendario de fieltro con un solo día marcado con un círculo turquesa, sin números. El tercio inferior queda liso para un título en blanco.

### I-13 · Mosaico de Vendoe en Mi espacio (`app-vendoe.png`, 800 × 800)
Idea: «vender desde el celular».
> Ilustración 3D de fieltro, fondo índigo liso. Un mostrador pequeño de tienda de fieltro con un toldo a rayas índigo y blanco; sobre el mostrador, un celular de fieltro con una bolsa de compras turquesa en la pantalla y una moneda dorada al lado. El tercio inferior queda liso para un título en blanco. Sin letras ni números.

## Capturas reales (no se generan)
Se toman cuando estén listas las pantallas nuevas (fase P1B), con datos de ejemplo, en 390 × 844:
- **C-01 · Auxi Student:** una pregunta respondida bien, con «¡Eso!» y la moneda ganada.
- **C-02 · Auxi Vida:** «Hoy» con el disponible estimado y los últimos movimientos.

Reemplazan los bocetos de celular que hoy se ven en «Dos apps, una cuenta».

## Cómo entregarlas
Guárdalas en `originales/plataforma/` con el nombre exacto y corre:
```
npm run imagenes
```

## Entregadas el 24 nov (falta guardarlas)
Llegaron en el chat, pero hay que guardarlas en `originales/plataforma/` con estos nombres y correr `npm run imagenes`:
`hero.png` (libro con vistos + billetera, ancho), `hero-movil.png` (vertical), `app-student.png` (tarjeta con visto + moneda), `app-vida.png` (frasco + calendario), `app-vendoe.png` (puesto con toldo). Mientras no estén, la landing muestra un fondo de respaldo.

## Animaciones cortas opcionales (video de imagen a video)
Para darle vida al héroe y a las cabeceras de cada app sin pesar mucho: clips de 5 a 6 s, en bucle perfecto, sin cortes de cámara, 1080p, que luego se convierten a WebM/MP4 livianos (menos de 1,5 MB) con la imagen fija como póster. En la app se reproducen sin sonido, solo si la persona no pidió «reducir movimiento», y se pausan fuera de pantalla.

Usa cada imagen entregada como **primer cuadro** y este texto:

- **Héroe (hero.png):** «Animación stop-motion de fieltro, cámara fija. Las tres tarjetas turquesa con visto bueno flotan suavemente sobre el libro abierto, subiendo y bajando unos milímetros a distinto ritmo; las páginas del libro se mueven apenas, como con una brisa; una de las monedas doradas de la billetera se asoma un poco y vuelve a su lugar; el halo de luz azul respira lento. Movimiento sutil y continuo, bucle perfecto, sin personas, sin texto, sin cambiar la composición ni el encuadre.»
- **Auxi Student (app-student.png):** «Stop-motion de fieltro, cámara fija. La moneda dorada salta desde la tarjeta, gira media vuelta en el aire mostrando su borde cosido y cae de nuevo sobre la tarjeta; el botón turquesa con visto bueno se hunde y vuelve al tocarlo la moneda; la chispa blanca parpadea una vez. Bucle perfecto, sin texto.»
- **Auxi Vida (app-vida.png):** «Stop-motion de fieltro, cámara fija. Dos monedas doradas caen dentro del frasco y el nivel sube un poco; la línea cosida del frasco se ilumina suave; el círculo turquesa del calendario se dibuja alrededor del día. Bucle perfecto, sin texto ni números.»
- **Vendoe (app-vendoe.png):** «Stop-motion de fieltro, cámara fija. El toldo a rayas se mece levemente; la bolsa turquesa en la pantalla del celular rebota una vez; la moneda dorada rueda un poco hacia el celular y se detiene. Bucle perfecto, sin texto.»

Revisa que el primer y el último cuadro coincidan (bucle sin salto) y que no aparezcan letras, manos ni objetos nuevos.
