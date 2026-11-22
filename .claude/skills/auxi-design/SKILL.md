---
name: auxi-design
description: Sistema de diseño de Auxi (colores de León, tipografía, botones, animaciones, sonidos y tono). Úsala SIEMPRE que crees o cambies cualquier pantalla, componente, animación o texto de la app Auxi.
---

# Auxi design system

Principio: **colores tranquilos, todo lo demás se mueve.** Pantallas limpias y casi blancas; la emoción la ponen el movimiento, el sonido, los números que suben y las imágenes de León. Nada decorativo sin motivo: cada animación responde a algo que hizo la persona.

## Colores (variables CSS)

```css
:root {
  --bg: #F7F8FC;          /* fondo de todas las pantallas */
  --surface: #E6E8FA;     /* tarjetas, camino de niveles, opciones */
  --card: #FFFFFF;        /* tarjetas elevadas */
  --text: #141A4D;        /* todo el texto (15,4:1 sobre --bg) */
  --text-soft: #5B6084;   /* ayudas (5,7:1) */
  --brand: #2430D9;       /* cobalto de León: botón principal, texto blanco encima (8,4:1) */
  --brand-dark: #1A23A6;  /* borde inferior del botón principal */
  --success: #5FE3DC;     /* turquesa: aciertos, progreso; texto --text encima */
  --success-dark: #2FB7B0;
  --reward: #F2B341;      /* oro: monedas, racha, cofre; texto --text encima */
  --reward-dark: #C98A1C;
  --error: #C2412D;       /* terracota: errores, vidas (4,8:1 sobre --bg) */
  --error-dark: #96301F;
  --studio: #2430D9;      /* acento de Studio */
  --vida: #5FE3DC;        /* acento de Vida */
  --negocio: #4A4EDB;     /* acento de Negocio (logo Vendoe) */
}
```

Reglas: nunca negro puro ni blanco puro de fondo. Nunca degradados llamativos, neón ni brillos. El oro se reserva para premios; si todo es oro, nada es premio.

## Tipografía

Nunito (Google Fonts), pesos 600, 700, 800, 900. Números con `font-variant-numeric: tabular-nums` cuando cuentan.

| Uso | Tamaño | Peso |
| --- | --- | --- |
| Título de pantalla | 28/32 | 900 |
| Título de tarjeta | 20/26 | 800 |
| Texto | 17/24 | 600 |
| Botón | 17 | 800, mayúsculas no |
| Ayuda | 14/20 | 600 |

## Forma

- Radios: 16 px tarjetas, 14 px botones, 999 px chips y barras.
- Espaciado en múltiplos de 4; márgenes laterales de pantalla 20 px.
- Sombras casi nulas; la profundidad viene del borde inferior de los botones.

## Botón principal "que se hunde"

Fondo `--brand`, texto blanco, alto 56 px, ancho completo, `border-bottom: 4px solid var(--brand-dark)`. Al presionar: `translateY(3px)` y el borde baja a 1 px en 60 ms; al soltar vuelve con un rebote suave. Variantes: éxito (`--success` + texto oscuro), premio (`--reward`), secundario (fondo `--card`, borde `--surface`). Deshabilitado: `--surface` con texto `--text-soft`, sin hundirse.

## Movimiento (Motion)

| Evento | Animación | Duración |
| --- | --- | --- |
| Toque en botón u opción | hundirse y volver | 60 ms abajo, 180 ms resorte |
| Cambio de pantalla | deslizar 24 px + fundido | 220 ms, ease-out |
| Tarjeta que aparece | sube 16 px + fundido, en cascada 40 ms | 240 ms |
| Respuesta correcta | opción en turquesa + escala 1,05 → 1; puntos vuelan a la barra; barra se llena con resorte | 400 ms |
| Combo (2, 3, 4 aciertos) | chip "x2" que salta; tono sube | 300 ms |
| Respuesta incorrecta | sacudida horizontal suave (±6 px, 3 veces); vida se agrieta y cae | 350 ms |
| Lección completa | confeti (canvas-confetti, colores de la paleta), contador de monedas de 0 al total, racha +1 con llama, imagen de León celebrando entra con rebote | 1,5 a 2 s en total |
| Cofre | 1,5 s de anticipación (tiembla y brilla), se abre, el premio sube | 2 s |
| Nivel desbloqueado en el camino | destello + el nodo pasa de gris a color con escala | 500 ms |
| Números | siempre cuentan hacia arriba, nunca saltan | 600 ms |

Resorte por defecto: `{ type: "spring", stiffness: 500, damping: 30 }`. Respetar `prefers-reduced-motion`: reemplazar movimientos por fundidos.

## Sonido y vibración

Sonidos de menos de 0,5 s, volumen moderado, con un interruptor en ajustes: toque (pop suave), acierto (dos notas que suben), combo (la misma nota un tono más arriba por cada acierto), error (nota grave corta), lección completa (fanfarria de 1 s), cofre (redoble y destello). Vibración solo en Android: 10 ms en toques, 30 ms en acierto, [20, 40, 20] en error.

## León

- Solo imágenes fijas de `public/leon/` (WebP sin fondo). Nunca deformarlas, recolorearlas ni recortarle partes.
- Una imagen de León por pantalla como máximo. En mensajes, su cara pequeña (hoja A8) en un círculo de 40 px.
- Qué imagen usar: bienvenida A1, lección completa y racha A2, Pomodoro y concentración A3, "Explícaselo" A4, error o pantalla vacía A5, cofre A6, racha en pausa A7.

## León en Vida

En Auxi Vida, León lleva canguro turquesa y su moneda de oro sin letras. Imágenes en `public/leon/vida/` (WebP sin fondo; caras chicas en `public/leon/vida/caras/`). Mismas reglas que arriba: imagen fija, una por pantalla, sin animar por partes.

| Momento | Imagen |
|---|---|
| Bienvenida | B1-saluda |
| Meta cumplida o día dentro del presupuesto | B2-celebra |
| Colchón y antojo ahorrado | B3-alcancia |
| "¿Esto es estafa?" y leyendo una captura | B4-detective |
| Estafa probable (nivel alto) | B5-alerta |
| Te pasaste del presupuesto, pantalla vacía o error | B6-anima |
| Revisando en Protégete (León observa con su lupa) | B4-detective; B5-alerta si hay señales de riesgo |
| Anotar por voz | B7-celular |
| Avatar del chat (cara chica en círculo de 40 px) | B8-caras (`caras/feliz`, `risa`, `sorpresa`, `serio`, `tierno`, `curioso`) |
| Ícono de Vida | B9-icono |

**Identidad propia de Vida (sutil, misma familia):** con la clase `vida` en `<html>` (la pone `/vida`), los tokens cambian: `--brand` #0B6F6A turquesa profundo (blanco encima 6:1), `--brand-dark` #07504C, `--bg` #F3FAF8 menta, `--surface` #DCF1EE, `--text-soft` #4E6470 y `--vida-hondo` #0E5B57 para la tarjeta del saldo. Misma letra (Nunito) y mismo León. Marca: moneda de oro + "Auxi **Vida**". Distribución propia: tarjeta grande del saldo arriba, 3 accesos en cuadrícula, esquinas de 20 a 28 px y navegación Hoy · Movimientos · ＋ Registrar · Metas · Protégete (barra flotante abajo en el celular, menú lateral en computadora) y perfil arriba a la derecha (Studio usa 5 pestañas planas). El oro, para el colchón y los premios. Montos siempre con "S/ ", dos decimales solo si hacen falta, y contador animado al cambiar. Nunca rojo alarmante en pantalla completa por gastar. Sin confeti por gastar: el confeti es solo para metas cumplidas. Disponible siempre como "estimado", nunca como saldo del banco. Avisos y promociones solo en su momento, descartables y sin volver a salir; nunca en medio de un registro ni en Protégete. Al compartir, montos ocultos por defecto.

## Tono de los textos

Voz de León: cercano, curioso, breve. Tutea. Frases de menos de 12 palabras en botones y avisos.

- Bien: "¡Eso! Vas en racha." · "Casi. Mira esta pista." · "Tu tomate está listo, toma 5 minutos."
- Mal: "¡Fallaste!" · "Tu racha morirá" · "¡Increíble, eres un genio!" (exagerado) · cualquier promesa de notas.

## Antes de dar por terminada una pantalla

- [ ] Usa solo variables de color de esta skill.
- [ ] Botón principal abajo, 56 px, se hunde al tocar.
- [ ] Cada toque tiene respuesta visual en menos de 100 ms.
- [ ] Texto legible a 390 px de ancho, contraste 4,5 o más.
- [ ] Funciona con `prefers-reduced-motion`.
- [ ] Probada en tamaño de celular con la skill webapp-testing.
