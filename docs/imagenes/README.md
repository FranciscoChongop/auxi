# Pedidos de imágenes (espacio único)

Aquí se piden todas las imágenes nuevas, de ahora en adelante.

## Cómo entregarlas
1. **Guarda el archivo en la carpeta indicada, con el nombre exacto.** Si mandas la imagen en el chat mientras Claude trabaja, no se guarda en el disco.
2. Corre:
   ```
   npm run imagenes
   ```
   Convierte las imágenes a WebP y las deja en `public/`.
3. La app las usa sola: mientras falten, se ve un respaldo.

## Pendientes
| Código | Para qué | Archivo | Carpeta | Estado |
|---|---|---|---|---|
| ICO-1 | Ícono 3D de Auxi Student | `icono-student.png` (1024 × 1024, fondo transparente) | `originales/marca/` | Opcional: hoy se usa el ícono en código |
| ICO-2 | Ícono 3D de Auxi Vida | `icono-vida.png` | `originales/marca/` | Opcional |
| ICO-3 | Ícono 3D de Vendoe | `icono-vendoe.png` (si Vendoe ya tiene logo, usa ese) | `originales/marca/` | Opcional |
| MOT-1 | Video del camino de Auxi Student | `student.mp4` / `.webm` / `-poster.webp` | `public/motion/` | Ver `docs/motion/brief-agentes.md` |
| MOT-2 | Video del camino de Auxi Vida | `vida.mp4` / `.webm` / `-poster.webp` | `public/motion/` | Ver `docs/motion/brief-agentes.md` |
| APP-1 a 3 | Mosaicos de Mi espacio (ya los mandaste en el chat) | `app-student.png`, `app-vida.png`, `app-vendoe.png` | `originales/plataforma/` | Falta guardarlos |
| HERO | Libro con vistos + billetera (ya lo mandaste) | `hero.png` y `hero-movil.png` | `originales/plataforma/` | Falta guardarlos. La landing v5 ya no lo necesita: queda para las imágenes que se ven al compartir el enlace |

## Prompts de los íconos 3D (ICO-1 a ICO-3)
Bloque común (va al inicio de cada prompt):
> Ícono de app en 3D, mismo estilo que el logo de Auxi Studio: una «A» azul cobalto brillante con una órbita y esferas de colores (dorada, turquesa y violeta). Forma de *squircle* (cuadrado de esquinas muy redondeadas) con volumen, degradé suave de arriba claro a abajo oscuro, brillo de vidrio en la parte superior y un canto inferior más oscuro. Una órbita blanca brillante cruza el ícono en diagonal, pasa por delante del objeto central y lleva una esfera dorada y una esfera pequeña turquesa. Iluminación suave de estudio, sombras limpias, acabado brillante tipo plástico pulido. Fondo transparente. 1024 × 1024. Sin letras, salvo que se indique.

1. **Auxi Student:** «[bloque común] Degradé azul cobalto (#6A78FF arriba, #2430D9 al medio, #161C9C abajo). Objeto central: un birrete de graduación blanco con un leve tono lila, borla dorada que cuelga a la derecha.»
2. **Auxi Vida:** «[bloque común] Degradé verde azulado (#2BB3A9 arriba, #0E5B57 al medio, #06403C abajo). Objeto central: una moneda dorada gruesa con el canto visible y el símbolo «S/» grabado, y un brote turquesa de dos hojas que sale de arriba de la moneda. Esfera pequeña violeta en lugar de turquesa.»
3. **Vendoe:** «[bloque común] Degradé índigo (#8E92FF arriba, #4A4EDB al medio, #2A2DA0 abajo). Objeto central: una bolsa de compras blanca con asas y una sonrisa simple.»

**Se aceptan si:**
- Se distinguen a 32 px.
- Los tres se ven de la misma familia que el logo.
- El fondo es transparente de verdad (sin blanco alrededor).
