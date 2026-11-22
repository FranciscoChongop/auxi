# Auxi Vida: contexto de la mini app 2

Lee también CLAUDE.md y la skill auxi-design: todo lo de ahí aplica igual. Este archivo solo agrega lo propio de Vida.

## Qué es

La segunda mini app de la plataforma Auxi, para personas comunes en Perú. Vive en la misma cuenta y el mismo proyecto que Studio, con su propia entrada `/vida`. Nombre provisional: "Auxi Vida" (guárdalo en una sola constante para poder cambiarlo fácil).

Promesa: **"Sabes cuánto puedes gastar hoy, te armas un colchón y no te estafan."**

Para quién: gente con ingresos que cambian día a día (independientes, informales, jóvenes con su primer sueldo). Por eso el presupuesto es POR DÍA, no por mes.

## Funciones de la versión 1

1. **Presupuesto por día.** La persona dice cuánto suele ganar y sus gastos fijos; la app calcula "hoy puedes gastar S/ X" y lo recalcula cada vez que anota un ingreso o un gasto. Si un día gasta menos, lo que sobra pasa al día siguiente o al colchón (la persona elige).
2. **Anotar por chat o por voz con León.** Escribe o dicta "almuerzo 12" o "me pagaron 80" y León lo entiende, lo clasifica y responde corto. Formulario manual como respaldo.
3. **Captura de Yape o Plin → gasto.** Sube la captura del comprobante y la app extrae monto, fecha y destinatario para anotarlo. Funciona en iPhone y Android.
4. **Camino de plata.** Lecciones de 1 minuto con quiz, en camino de niveles como Studio: colchón, presupuesto, deudas, intereses, estafas comunes en Perú.
5. **Colchón.** Meta de ahorro que se ve crecer (un frasco que se llena). "Antojo ahorrado": la persona marca un antojo que no compró y ese monto suma al colchón.
6. **"¿Esto es estafa?"** Pega un mensaje o sube una captura (SMS, WhatsApp, "comprobante" de Yape) y la IA explica qué señales de estafa ve, con nivel bajo/medio/alto y qué hacer. Nunca afirma con certeza absoluta.
7. **Nota de voz del día → tareas y vencimientos.** Dicta pendientes; la app arma la lista y avisa fechas de DNI, SOAT, brevete, recibos y cumpleaños.
8. **Enganche** igual que Studio: racha de días anotando (con protector), tarjeta diaria al entrar, cofre, misiones de apoyo y enlace a Vendoe en el perfil.

Versión 2 (NO construir ahora): pandero digital, plan para salir de deudas, multa voluntaria, letra chica de contratos, meta compartida.

## Reglas propias de Vida (no negociables)

- **Auxi Vida no mueve plata, no presta y no recomienda productos financieros.** Anota, calcula, enseña y avisa. Todo consejo es general y educativo.
- **Privacidad:** las capturas de Yape/Plin y los mensajes sospechosos se procesan y se descartan; solo se guarda lo extraído (monto, fecha, categoría). Los datos financieros son de la persona: puede exportarlos y borrarlos. Respeta la Ley de Protección de Datos Personales del Perú.
- Nunca pedir claves, códigos de verificación ni datos de tarjetas. La app lo dice explícitamente en la pantalla de estafas.
- No avergonzar por gastar. Si se pasa del presupuesto: "Hoy te pasaste S/ 8. Mañana ajustamos juntos." Nada de rojo alarmante en pantalla completa.
- No inventar cifras de ahorro ni prometer resultados.

## León en Vida

Lleva una canguro turquesa y su moneda de oro sin letras. Imágenes en `public/leon/vida/`:
B1 saluda, B2 celebra, B3 alcancía, B4 detective con lupa, B5 alerta amable, B6 anima, B7 habla al celular, B8 hoja de caras, B9 ícono.

Qué imagen usar: bienvenida B1; meta cumplida o día dentro del presupuesto B2; colchón y antojo ahorrado B3; "¿Esto es estafa?" B4; estafa probable B5; te pasaste del presupuesto o pantalla vacía B6; anotar por voz B7; avatar del chat B8.

Tono: amigo que sabe de plata, tranquilo, con humor peruano suave. "Hoy te alcanza para S/ 35." · "Ese mensaje huele raro, mira esto." · "Un antojo menos, S/ 6 más al colchón."

## Diseño

Misma skill auxi-design. Acento de Vida: turquesa (`--vida`). El oro se usa para el colchón y los premios. Números de plata siempre con "S/ ", dos decimales solo si hacen falta, y contador animado al cambiar.

## Métricas

Las mismas de Studio, con `app: "vida"`: activación (primer gasto anotado el primer día), retención día 7 y día 30, invitaciones, clics a Vendoe. Extra: días con presupuesto respetado y usos de "¿Esto es estafa?".
