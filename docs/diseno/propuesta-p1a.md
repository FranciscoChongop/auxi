# Propuesta visual P1A (para aprobar antes del cambio grande)

Bocetos navegables en tu computadora: **http://localhost:5173/propuesta** (solo en desarrollo). Pestañas: Landing, Mi espacio, Auxi Student (con «Cuenta nueva»), Auxi Vida y Sistema; selector Celular 390 / Computadora 1280. Datos de ejemplo; las cajas rayadas son lugares para capturas o imágenes reales.

## Dirección
Auxi Studio se presenta como **un estudio que hace herramientas útiles**, no como un juego. La plataforma es sobria y adulta; la emoción (León, sonidos, confeti) vive dentro de las lecciones de Student y en los logros. Lo memorable está en un solo lugar: el héroe muestra **las apps funcionando** (Student en laptop, Vida en celular) unidas por una línea de órbita estática.

## Decisiones
| Tema | Propuesta | Por qué |
|---|---|---|
| Tipografía | **Figtree** (500/600/700, alojada en el proyecto) para plataforma y paneles; **Nunito** se queda en lecciones, León y celebraciones | Profesional y legible en pantallas chicas; es prima geométrica de Nunito, así el salto entre ambas no se nota. Dos familias en total. |
| Color | Fondo `#F5F6FA`, tinta `#141A4D`, gris `#5B6084`, línea `#DDE0EE`, cobalto `#2430D9` (acciones y Student), teal `#0E5B57` (Vida), oro `#F2B341` solo premios/ahorro | Neutro y tranquilo; cada producto se reconoce por su acento, sin fondos ilustrados detrás del texto. |
| Marca | Órbita **estática**: un aro con un punto de oro, escalable y que no depende del número de apps | La órbita de 3 puntos obligaba a tener exactamente 3 productos. |
| Retícula | 1200 px de ancho útil, 12 columnas, márgenes 16 px en celular y 32 px en computadora | Lo pide el framework; evita la columna de celular perdida en la computadora. |
| Movimiento | 120–220 ms y solo en respuesta a acciones. Se retiran cinta, parallax, órbita girando y apariciones desde transparente | El contenido se ve desde el primer momento. |
| Navegación | `AppShell` común: menú lateral en computadora (marca, selector de app, secciones, ajustes, cuenta); en celular, selector arriba y la barra propia de cada app abajo | Cambiar de app sin buscar el enlace al fondo de Perfil. |
| Mi espacio | Nueva ruta `/mi-espacio` tras iniciar sesión; `/` queda como landing pública | La landing ya no se repite después de entrar. |
| Landing | Encabezado con «Entrar» siempre visible; héroe; «Descubre las aplicaciones» con «Abrir»/«Probar» y «Ver cómo funciona»; «Así funciona Auxi»; «Tu información, bajo tu control»; «En el estudio»; «Creado por Daniel Chong»; CTA final y pie | Primero se entiende el producto; la cuenta va después. |
| Student | Inicio de dos columnas: acción principal (continuar o crear el primer tema), cursos; al lado examen, semana y métodos. Cuenta nueva: un solo primer paso en 3 pasos | La primera acción útil se ve sin scroll. |
| Vida | Disponible estimado con su desglose y «Registrar»; próximos pagos y meta al lado; tabla de movimientos; importar y Protégete como enlaces discretos; **Ocultar montos** | Herramienta financiera adulta, con privacidad a un toque. |

## Lo que necesito que apruebes o cambies
1. **Tipografía Figtree** para la plataforma y los paneles (Nunito queda en lecciones).
2. **Marca estática** (aro + punto de oro). Si prefieres conservar los tres puntos, se adapta.
3. **León en la plataforma:** en esta propuesta no aparece en la landing ni en Mi espacio; sigue en Student y Vida. ¿De acuerdo?
4. **Ruta `/mi-espacio`** para el inicio con sesión.
5. **Textos:** el titular «Herramientas para aprender, organizarte y avanzar.» y el bloque «Creado por Daniel Chong», que necesita tu texto (no invento biografía).

## Lo que viene después de tu visto bueno (P1B y P1C)
1. Sistema de diseño en el código (tokens, Figtree, componentes `AppShell`, `AppSwitcher`, `PageHeader`, `ProductCard`, `EmptyState`, `StatusBadge`…).
2. Landing nueva, páginas públicas de Student y Vida, Mi espacio, regreso a la app desde la que se inició sesión.
3. Inicios de Student y Vida, luego el resto de pantallas en orden de uso.
4. Con las pantallas listas, capturas reales y el archivo de prompts de imágenes (`docs/plataforma/solicitud-imagenes-v2.md`).
