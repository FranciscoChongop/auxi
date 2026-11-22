# Fases de Auxi Vida: prompts para Claude Code

Pega uno a la vez y aprueba antes de seguir.

## Fase V0: preparar

```text
Lee CLAUDE.md, la skill auxi-design y los archivos de docs/vida. Vamos a construir la mini app 2, Auxi Vida, dentro de este mismo proyecto, con entrada en /vida y reutilizando todo lo que ya existe de Studio (componentes, cuenta, racha, cofre, misiones, sonidos).
1. En public/leon/vida dejé las imágenes de León para Vida sin nombre. Míralas y renómbralas B1-saluda, B2-celebra, B3-alcancia, B4-detective, B5-alerta, B6-anima, B7-celular, B8-caras, B9-icono. Las de publicidad muévelas a marketing/vida con los nombres N1 a N6. Si alguna no la reconoces, dímelo.
2. Agrega a CLAUDE.md una línea que diga que para Vida se lee docs/vida/vida.md.
3. Agrega a la skill auxi-design la sección "León en Vida" con qué imagen va en cada momento, según docs/vida/vida.md.
4. Dime en 5 líneas qué vas a reutilizar de Studio y qué es nuevo.
```

## Fase V1: prototipo navegable

```text
Construye todas las pantallas de docs/vida/pantallas.md con datos de ejemplo, sin IA todavía: bienvenida, las 3 preguntas, inicio con "hoy puedes gastar", anotar (chat con respuestas simuladas), subir captura (resultado simulado), colchón con frasco y antojo ahorrado, aprender, alertas, perfil. El cálculo del presupuesto por día sí debe funcionar de verdad. Aplica las animaciones de auxi-design (el saldo cuenta al cambiar, las monedas caen al frasco). Pruébalo con webapp-testing a 390x844 y muéstrame la vista previa.
```

## Fase V2: datos y cuenta

```text
Conecta Vida a Supabase con la misma cuenta de Studio: ingresos, gastos, presupuesto, colchón, antojos, lecciones, pendientes y vencimientos. Lo que la persona hizo antes de registrarse se guarda al crear la cuenta. Agrega en Perfil "Mis datos" para exportar y borrar todo. Publica la versión de prueba y dame el enlace.
```

## Fase V3: la IA

```text
Usa la skill claude-api, siempre desde el servidor. Crea:
1. Entender gastos e ingresos escritos o dictados en español peruano ("almuerzo 12", "me yapearon 50") y devolver monto, tipo, categoría y fecha.
2. Leer capturas de Yape y Plin y extraer monto, fecha y destinatario; descartar la imagen después.
3. "¿Esto es estafa?": analizar texto o captura y devolver nivel (bajo, medio, alto), señales encontradas y qué hacer, sin afirmar certeza absoluta y sin pedir datos sensibles.
4. Nota de voz → lista de pendientes con fechas.
Pon límites de uso diario por persona y mensajes claros si algo no se puede leer.
```

## Fase V4: lecciones, avisos y métricas

```text
Escribe el contenido del camino de plata: 5 temas (colchón, presupuesto diario, intereses y deudas, estafas comunes en Perú, Yape seguro), 4 lecciones de 1 minuto por tema con quiz. Contenido general y educativo, sin recomendar productos. Agrega avisos: resumen de la mañana con "hoy puedes gastar", vencimientos y pendientes. Instrumenta PostHog con app: "vida" y los eventos de docs/vida/vida.md.
```

## Fase V5: calidad y lanzamiento

```text
Revisa Vida como un usuario con un Android barato y datos móviles, y en Safari de iPhone: velocidad, contraste, tamaños de toque, textos y errores. Revisa que ninguna pantalla avergüence por gastar y que la privacidad de las capturas se cumpla. Luego deja /vida lista para lanzar con su vista previa de enlace (imagen N5).
```
