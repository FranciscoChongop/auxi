# Brief para agentes de motion graphics · Auxi Studio

Este documento es para quien haga los motion graphics de la landing (persona o agente). Todo lo necesario está en el repositorio `auxi-starter`.

## 1. Qué hay que hacer
Dos videos cortos, uno por app, que muestran **el camino** de la app, no un tutorial de uso:

| App | Camino (4 escenas) |
|---|---|
| **Auxi Student** | Sube tu PDF → se vuelve un minijuego → juegas de distintas formas → ganas y vuelves mañana |
| **Auxi Vida** | Anotas un gasto en segundos → ves cuánto te queda hoy → lo que sobra va a tu colchón → revisas un mensaje antes de pagar |

Cada video se reproduce **dentro de un celular** en la landing, sin sonido y en bucle. Tiene que entenderse sin leer nada más.

## 2. Referencia viva (empieza por aquí)
Ya existe una versión hecha en código, con el guion, los tiempos y el estilo exactos:
- **Verla:** `npm run dev` y abrir `http://localhost:5173/propuesta` → pestaña **Motion**. También se ve dentro de la landing, en la pestaña **Landing**.
- **Código:** `src/propuesta/motion/Motion.tsx`. Cada escena es una función: `StudentSube`, `StudentMinijuego`, `StudentFormas`, `StudentGana`, `VidaAnota`, `VidaDia`, `VidaAhorra`, `VidaRevisa`.

El video debe **igualar o superar** esa versión: más profundidad, transiciones de cámara más ricas y mejor ritmo.

## 3. Dónde está cada cosa
| Recurso | Carpeta |
|---|---|
| León (imágenes fijas oficiales, WebP sin fondo) | `public/leon/` (A1 saluda, A2 celebra, A3 concentrado…; caras en `public/leon/caras/`) |
| León de Auxi Vida | `public/leon/vida/` (B1 a B9; caras en `public/leon/vida/caras/`) |
| Logo de Auxi Studio | `public/marca/logo.webp` (completo) y `public/marca/simbolo.webp` (solo la A con su órbita) |
| Íconos de cada app | `src/components/IconoApp.tsx` (SVG). Versión 3D, si existe: `public/marca/icono-<app>.webp` |
| Ilustraciones de fieltro | `public/plataforma/` |
| Colores, letras y tono | `.claude/skills/auxi-design/SKILL.md` |
| Reglas del proyecto | `CLAUDE.md` |

## 4. Estilo
- **Colores:** cobalto `#2430D9` (Student), verde azulado `#0E5B57` (Vida), turquesa `#5FE3DC` (aciertos), oro `#F2B341` (solo premios), texto `#141A4D`, fondo de pantalla `#F7F8FC` (Student) y `#F3FAF8` (Vida).
- **Letras:** Nunito 900/800 para títulos y números, Figtree 500 para textos. Todo en español peruano sencillo.
- **Movimiento:** resortes suaves (rigidez ~320, amortiguación ~22), entradas de 200 a 400 ms, sin destellos ni parpadeos rápidos (máximo 3 por segundo). Solo transform y opacity.
- **León:** **solo con sus imágenes oficiales**. Se puede mover, escalar o hacer rebotar la imagen completa, **nunca animarlo por partes** ni redibujarlo.
- **Honestidad:** las preguntas se crean con la IA de la persona (ChatGPT, Claude o Gemini), no con una IA de Auxi. Nada de cifras, testimonios ni premios inventados. En Vida, el monto del día es un «estimado» y no el saldo del banco.

## 5. Guion y tiempos (bucle de unos 15 s)

### Auxi Student
| Seg. | Escena | Qué se ve | Texto en pantalla |
|---|---|---|---|
| 0–3,6 | Sube tu PDF | Un PDF cae en la zona de carga, se llena la barra de lectura y el dedo toca «Crear mi minijuego» | «Nuevo tema» · «Listo: 8 preguntas» |
| 3,6–7 | Se vuelve un minijuego | El PDF se encoge y estalla en 4 tarjetas de juego (Elige la correcta, Verdadero o falso, Une las parejas, Completa la frase); cara de León: «¡Listo!» | «Tu minijuego» · «Hecho con tu propia IA» |
| 7–11,8 | Juega de distintas formas | Carrusel 3D de formas de jugar: Elige la correcta, Verdadero o falso, Une las parejas, El tomate, Explícaselo a León | «¿Cómo quieres jugar?» |
| 11,8–15,4 | Gana y vuelve mañana | León celebra, +30 monedas, la racha sube de 4 a 5 y aparece el repaso de mañana | «¡Tema completado!» |

### Auxi Vida
| Seg. | Escena | Qué se ve | Texto en pantalla |
|---|---|---|---|
| 0–3,6 | Anota en segundos | Se teclea S/ 12, se toca «Comida» y «Guardar», y aparece el aviso «Guardado» | «Registrar gasto» |
| 3,6–7 | Mira cuánto te queda hoy | El anillo baja y el número cuenta de S/ 43 a S/ 31; entra «Menú − S/ 12»; cara de León: «Vas bien» | «Te quedan hoy» |
| 7–10,2 | Ahorra lo que sobra | Caen monedas al frasco del colchón, el nivel sube y el monto cuenta de S/ 60 a S/ 96 | «Tu colchón» |
| 10,2–14,2 | Revisa antes de pagar | Llega un mensaje sospechoso, una luz lo escanea y aparece «Riesgo alto» con 3 señales | «Protégete» · «No pagues todavía» |

## 6. Entregables
Por cada app (`student` y `vida`):
1. `public/motion/<app>.mp4`: H.264, **1080 × 2340** (9:19,5), 30 fps, sin audio, bucle perfecto (el primer cuadro igual al último), **menos de 1,5 MB**.
2. `public/motion/<app>.webm`: VP9, mismas medidas (opcional, más liviano).
3. `public/motion/<app>-poster.webp`: primer cuadro.

Importante: **solo la pantalla, sin el marco del celular**. La landing ya dibuja el celular, la sombra y el reflejo.

**Cómo se conecta:** la landing busca `public/motion/<app>.mp4` sola. Si existe, lo reproduce en lugar de la versión en código. No hay que tocar código.

### Versión para redes (opcional)
- `originales/motion/<app>-redes.mp4`, en 1080 × 1920.
- Con el celular completo, textos grandes arriba y abajo, voz y música suave.
- 15 a 20 s, para Instagram y TikTok (@soydanielchong).

## 7. Guion de voz para redes (opcional, ElevenLabs u otra)
Voz cercana, peruana, tranquila. Unas 40 palabras por app.
- **Student:** «¿Te dejaron un PDF enorme? Súbelo a Auxi Student. Con tu propia IA se vuelve un minijuego: eliges la correcta, verdadero o falso, unes parejas… Ganas monedas y Auxi te recuerda repasar lo que fallaste. Gratis.»
- **Vida:** «Anota tu gasto en dos segundos y Auxi Vida te dice cuánto te queda para hoy. Lo que sobra va a tu colchón. ¿Te llegó un mensaje raro pidiendo plata? León lo revisa antes de que pagues. Gratis.»

## 8. Lista de aceptación
- [ ] Se entiende el camino completo sin sonido y sin leer nada fuera del celular.
- [ ] Bucle sin salto visible.
- [ ] León solo con sus imágenes oficiales, sin animarlo por partes.
- [ ] Textos en español peruano, sin errores, legibles a 250 px de ancho.
- [ ] Nada inventado (cifras, testimonios, promesas de notas).
- [ ] Peso menor a 1,5 MB (mp4) y sin parpadeos rápidos.

## 9. Prompt listo para pegar a tu agente
> Eres un motion designer senior. Trabaja en el repositorio `auxi-starter`. Lee `docs/motion/brief-agentes.md`, `CLAUDE.md` y `.claude/skills/auxi-design/SKILL.md`. Corre `npm run dev` y abre `http://localhost:5173/propuesta`, pestaña «Motion»: esa es la referencia en código (`src/propuesta/motion/Motion.tsx`). Crea dos videos de la pantalla de un celular (sin marco), 1080×2340, 30 fps, ~15 s en bucle perfecto y sin audio, que muestren el camino de Auxi Student (sube tu PDF → minijuego → distintas formas de jugar → ganas y vuelves mañana) y de Auxi Vida (anotas → cuánto te queda hoy → colchón → revisa antes de pagar), según el guion de la sección 5. Usa solo los recursos de `public/leon/`, `public/marca/` y `public/plataforma/`; nunca animes a León por partes. Guarda `public/motion/student.mp4` y `public/motion/vida.mp4` (menos de 1,5 MB), sus `.webm` y sus pósters `-poster.webp`. Verifica la lista de aceptación de la sección 8 y abre la pestaña «Landing» para confirmar que el video aparece dentro del celular.
