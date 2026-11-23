# Banners de la plataforma Auxi Studio: prompts para generar las imágenes

Regla: **la mascota sale una sola vez** (en la portada, desde su imagen A1). Estos banners **no llevan mascota, personas, texto ni logos**. Todo el texto de la página se escribe en código, así nunca sale mal escrito.

## Cómo usarlas
1. Genera cada imagen con el prompt de abajo (pega primero el **bloque de estilo**, luego el prompt de esa imagen).
2. Guarda el PNG o JPG en `originales/plataforma/` con **este nombre exacto**: `hero`, `hero-movil`, `student`, `vida`, `vendoe`, `cuenta`, `autor` (por ejemplo `student.png`).
3. Ejecuta `npm run imagenes`. Se convierten a WebP en `public/plataforma/`.
4. Refresca la página: cada banner cambia solo. Mientras falte una imagen, la página muestra un fondo animado de respaldo.

## Bloque de estilo (pegar al inicio de CADA prompt)
```text
Soft 3D render, handmade felt-and-matte-clay look with subtle fabric fiber texture, rounded chunky shapes, gentle studio lighting, soft shadows, premium clean advertising banner, uncluttered composition. Absolutely no text, letters, numbers, logos, watermarks, people, faces, characters or mascots, and no real brands.
```

Si tu herramienta tiene casilla de **negative prompt**, pon: `text, letters, numbers, logo, watermark, person, face, character, mascot, chameleon, brand name`.

## 1. `hero` (portada, horizontal 21:9, 1792×768)
```text
A deep night-blue cosmic scene: one large glowing central orb in cobalt blue (#2430D9) with three smaller orbs circling it on thin dotted ring paths: one cobalt blue (#2430D9), one deep turquoise (#0E5B57) with a golden accent, one indigo (#4A4EDB). Tiny soft golden star shapes and sparkles scattered around. Background gradient from navy (#0B1140) to deep blue, with a subtle teal glow in the lower right. Wide 21:9 format, centered composition, all key elements inside the central 60% of the width, calm empty space in the middle for overlaid content.
```

## 2. `hero-movil` (portada en celular, vertical 4:5, 1080×1350)
```text
The same night-blue cosmic scene, vertical 4:5 format: the glowing cobalt orb (#2430D9) with three smaller orbs (cobalt #2430D9, deep turquoise #0E5B57 with a golden accent, indigo #4A4EDB) circling it on thin dotted ring paths, placed in the upper half. Tiny golden stars and sparkles around. Navy (#0B1140) to deep blue gradient, subtle teal glow at the bottom. The lower third stays calm and empty for overlaid text.
```

## 3. `student` (Auxi Student, horizontal 3:2, 1536×1024)
```text
Floating study objects arranged around a glowing winding path of rounded stepping stones that climbs diagonally: a stack of notebooks with blank pages, a chunky yellow pencil, an open book with blank pages, a lightbulb, rounded check-mark badges and golden stars. Palette: cobalt blue (#2430D9), white, warm yellow (#F2B341), mint turquoise (#5FE3DC). Objects clustered in the right two-thirds, calm empty area at the lower left.
```

## 4. `vida` (Auxi Vida, horizontal 3:2, 1536×1024)
```text
A glass jar filling up with golden coins embossed only with a simple star (no letters), a few coins falling into it, a soft turquoise shield with a check mark beside it, and a smartphone whose screen shows only simple rounded colored bars (no numbers or text). Palette: deep turquoise (#0E5B57), bright turquoise (#5FE3DC), gold (#F2B341), cream. Jar on the right, calm empty area at the lower left.
```

## 5. `vendoe` (Vendoe, horizontal 3:2, 1536×1024)
```text
A cheerful small shop stall with a striped awning in indigo (#4A4EDB) and white, shelves with plain cardboard boxes and shopping bags, a rising step-chart made of rounded blocks, a blank price tag and a receipt with abstract lines (no text or numbers). Palette: indigo (#4A4EDB), white, gold (#F2B341), soft lilac. Stall on the right, calm empty area at the lower left.
```

## 6. `cuenta` (franja «Una sola cuenta», 21:9, 1792×768)
```text
Three glossy rounded spheres in a horizontal row on the right half, linked by a single smooth golden ring that threads through all of them: one cobalt blue (#2430D9), one deep turquoise (#0E5B57), one indigo (#4A4EDB), each with a tiny golden star. Soft gradient background from cobalt to deep teal. Spheres in the middle horizontal band with plenty of calm empty space above, below and on the left.
```

## 7. `autor` (franja «Creado por Daniel Chong», 21:9, 1792×768)
```text
A tidy creator's desk seen from a slight angle, on the right half: a laptop whose screen shows an abstract grid of rounded colored squares (no text), a notebook with a pencil, a small green plant and a coffee cup. Several rounded app-icon tiles in cobalt (#2430D9), turquoise (#5FE3DC) and indigo (#4A4EDB) float up from the screen like they are leaving it. Palette: soft cream, cobalt blue, mint turquoise, a touch of gold. Calm empty area on the left third, no people.
```

## Si algo sale mal
- **Le salieron letras o números:** vuelve a generar y agrega «no text» otra vez al final.
- **No se parece al resto:** usa la primera imagen que te guste como **referencia de estilo** en las demás.
- **Se ve recargada:** agrega «simple, fewer objects, large calm negative space».
- **Los bordes importan poco:** la página recorta un poco las imágenes en celular y en computadora, y las mueve despacio al hacer scroll. Por eso lo importante va en el centro.
