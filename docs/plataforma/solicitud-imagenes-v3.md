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
