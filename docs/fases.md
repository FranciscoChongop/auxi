# Fases de Auxi Studio y prompts para Claude Code

Pega cada prompt en Claude Code cuando la fase anterior esté aprobada.

## Fase 1: proyecto y sistema de diseño

```text
Lee CLAUDE.md, la skill auxi-design y docs/pantallas.md. Fase 1:
1. Crea el proyecto con React + TypeScript + Vite, configurado como PWA (vite-plugin-pwa), con Tailwind CSS usando las variables de color de auxi-design, la fuente Nunito, Motion y canvas-confetti.
2. Organiza carpetas: src/components, src/screens, src/lib, public/leon, public/sounds. Deja placeholders de León hasta que lleguen las imágenes.
3. Construye los componentes base: botón que se hunde (4 variantes), tarjeta, barra de progreso con resorte, chip de combo, vidas, contador animado de números, aviso (toast), ventana con X, confeti y los sonidos cortos con interruptor.
4. Crea una página /catalogo que muestre todos los componentes funcionando, para revisarlos en mi celular.
Antes de empezar, dime tu plan en 5 líneas. Al terminar, pruébalo con webapp-testing a 390x844 y muéstrame la vista previa.
```

## Fase 2: prototipo navegable

```text
Fase 2: construye todas las pantallas de docs/pantallas.md con datos de ejemplo, sin backend todavía. Usa el código de /legacy (Estudia jugando) como base del camino de niveles y la lección. Todo debe poder recorrerse de principio a fin en el celular: bienvenida, elegir material, lección, celebración, inicio, cofre, métodos, entregas y perfil. Aplica todas las animaciones y sonidos de auxi-design. Al terminar, pruébalo con webapp-testing y muéstrame la vista previa.
```

## Fase 3: cuentas, datos y publicación de prueba

```text
Fase 3: conecta Supabase para cuentas (Google y correo) y para guardar materiales, lecciones, progreso, racha, monedas, cofres y misiones. La primera lección sigue funcionando sin cuenta y su avance se guarda al registrarse. Publica una versión de prueba en Vercel y dame el enlace.
```

## Fase 4: la IA

```text
Fase 4: usa la skill claude-api. Crea funciones del servidor (nunca la clave en el navegador) para: convertir PDF, foto o texto en una lección con preguntas variadas; dar una pista antes de la respuesta; leer un sílabo y extraer entregas con fecha; y evaluar la explicación de "Explícaselo a León" con 1 a 3 estrellas y una pregunta de seguimiento. Pon límites de uso diario por persona y mensajes claros cuando el material no se puede leer.
```

## Fase 5: repaso, avisos y métricas

```text
Fase 5: agrega el repaso espaciado (lo fallado vuelve en 1, 3 y 7 días), las notificaciones push (Android, y iPhone solo si la app está en la pantalla de inicio), los avisos de entregas 7, 3 y 1 día antes, y PostHog con los eventos de CLAUDE.md (activación, retención, invitaciones, clics a Vendoe), cada uno con la mini app de origen.
```

## Fase 6: calidad y lanzamiento

```text
Fase 6: revisa todo como si fueras un usuario con un Android barato y datos móviles. Mide la velocidad de carga y optimízala, revisa contraste y tamaños de toque, prueba en Safari de iPhone, corrige errores y textos. Luego prepara el dominio propio y la guía de "Agregar a inicio".
```
