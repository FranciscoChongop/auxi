# Fase 0: auditoría técnica y de seguridad (Auxi Studio, Student y Vida)

**23 de noviembre de 2026.** Revisión de código y pruebas defensivas sobre nuestro propio proyecto. No es una prueba de intrusión ni una certificación. Vendoe queda fuera (solo su enlace externo).

## Síntesis
- La base es sana: RLS por usuario en Supabase (verificado en producción para visitantes anónimos), sin `innerHTML`, sin mapas de código público, 0 vulnerabilidades conocidas en dependencias de producción, PDF/OCR bajo demanda.
- El riesgo principal era **mezclar datos entre cuentas en un equipo compartido**: Student unía lo guardado en el navegador con cualquier cuenta que entrara, y Vida guardaba todo en una clave sin dueño. **Corregido** (ver P0-1 y P0-2), con pruebas automáticas.
- Quedan decisiones del dueño: administración por rol en vez de correo, derechos con valor (monedas, cupos, pase) validados en el servidor, borrado de cuenta y configuración de los paneles externos.

## 1. Inventario

### Rutas
| Ruta | Pública | Qué es |
|---|---|---|
| `/` | Sí | Portada de la plataforma; con sesión, elección de mini app |
| `/entrar` | Sí | Inicio de sesión único |
| `/privacidad`, `/terminos` | Sí | Legales (también bajo `/student/...`) |
| `/negocio` | Sí | Cuenta el clic y redirige a Vendoe |
| `/student/...` | Portada sí; el resto pide cuenta | Auxi Student (`/studio/...` redirige aquí, también en `vercel.json`) |
| `/vida/...` | Sí (sin cuenta) | Auxi Vida; datos solo en el dispositivo |
| `/catalogo` | **Solo en desarrollo** (antes era público) | Catálogo técnico de componentes |
| cualquier otra | — | **Página 404** con retorno (antes caía en Student) |

### Modos de cuenta (`src/lib/nube.ts`)
| Modo | Cuándo | Efecto |
|---|---|---|
| `cargando` | Mientras se lee la sesión | Pantallas en espera (Vida ya no muestra datos hasta saber la cuenta) |
| `invitado` | Sin sesión | Student pide cuenta; Vida funciona local |
| `conectado` | Con sesión | Student sincroniza `perfiles.estado`; Vida usa el espacio local de esa cuenta |
| `sin-nube` | **Solo en desarrollo** sin Supabase o con `VITE_SIN_LOGIN=si` | Entra sin cuenta para probar |
| `sin-configuracion` | **Producción** sin Supabase | Falla de forma segura: nadie entra sin cuenta y se muestra un aviso |

### Dónde viven los datos
| Dato | Dónde | Dueño |
|---|---|---|
| Avance de Student | `localStorage` `auxi.studio.v1` + `perfiles.estado` (jsonb) | Marcado con `auxi.propietario` (nuevo) |
| PDF de Student | IndexedDB + bucket privado `archivos/<uid>/` | Por usuario (RLS) |
| Vida | `localStorage` `auxi.vida.v1` (sin cuenta) y `auxi.vida.v1.u.<uid>` (por cuenta, nuevo) | Solo este dispositivo; **no se sincroniza** |
| Modo ejemplo de Vida | Memoria | Nunca se guarda |
| Permiso de Gmail | `sessionStorage` (pestaña) | Se borra al cerrar sesión (nuevo) |
| Métricas | PostHog, solo si hay clave (hoy no hay) | Identificador aleatorio del dispositivo |

PWA: el service worker precarga solo archivos estáticos (no respuestas de Supabase); los lectores pesados (PDF, OCR) no se precargan. No guarda datos privados en caché.

## 2. Registro de riesgos

Estado: **Corregido** · **Pendiente de aprobación** · **Pendiente externo** (requiere un panel o cuenta del dueño) · **Planificado** (fase posterior).

| ID | Prioridad | Hallazgo | Estado y evidencia |
|---|---|---|---|
| P0-1 | P0 | Student unía lo guardado en el navegador con cualquier cuenta al entrar (equipo compartido). Además, al cambiar de cuenta sin cerrar sesión, el guardado automático anterior seguía activo y podía subir un estado vacío a la cuenta nueva. | **Corregido.** `src/lib/propietario.ts`, `nube.ts`: los datos de otra cuenta se apartan (no se borran ni se suben); se apaga el guardado automático antes de conectar; un error de lectura nunca se trata como cuenta vacía y se reintenta. Prueba: `src/pruebas/aislamiento.test.ts`. |
| P0-2 | P0 | Vida guardaba todo sin dueño: tras cerrar sesión, la siguiente persona veía los datos. | **Corregido.** Espacio local por cuenta; lo guardado sin cuenta solo pasa a una cuenta si la persona lo confirma en Hoy («Pasarlos a mi cuenta» / «Dejarlos aparte»). Prueba automática. |
| P0-3 | P0 | Sin configuración de Supabase en producción, la app dejaba entrar sin cuenta. | **Corregido.** Modo `sin-configuracion`: Student y la plataforma piden cuenta y avisan. `VITE_SIN_LOGIN` solo funciona en desarrollo (`import.meta.env.DEV`). |
| P0-4 | P0 | El panel del pase libre reconoce al dueño por el **correo** en la sesión; la política de edición permite cambiar cualquier columna. | **Pendiente de aprobación:** `supabase/propuestas/01-administracion-por-rol.sql` (lista de administradores solo editable desde Supabase, función en el servidor, edición limitada a estado/nota/fecha). |
| P0-5 | P0 | Monedas, cupos y pase libre viven en `perfiles.estado`, que escribe el propio navegador: una persona técnica podría darse beneficios. | **Planificado (decisión del dueño):** registro de recompensas en el servidor, idempotente, que conserve lo ya ganado. Requiere diseño y migración aprobada. |
| P0-6 | P0 | No se pudo verificar el inicio de sesión real: las cuentas de prueba no existen en el proyecto. | **Pendiente externo:** crear una cuenta de prueba confirmada (script en `crear-cuenta-prueba.local.sql`, fuera de git) y repetir las pruebas de aislamiento entre dos cuentas en la app real. |
| P1-1 | P1 | Ruta desconocida caía en Student; `/catalogo` público. | **Corregido.** 404 y catálogo solo en desarrollo. |
| P1-2 | P1 | Sin cabeceras de seguridad en `vercel.json`. | **Corregido parcialmente:** `nosniff`, `Referrer-Policy`, `X-Frame-Options: DENY`, `Permissions-Policy` (micrófono solo propio), HSTS. CSP en **modo solo informe** para no romper OCR/PDF/Gmail; pasarla a obligatoria tras revisar la consola en la versión publicada. |
| P1-3 | P1 | Al cerrar sesión, el permiso temporal de Gmail podía quedar en la pestaña. | **Corregido.** Se borra al cerrar sesión o cambiar de cuenta. |
| P1-4 | P1 | No existe borrado de cuenta en el servidor (solo se borra el dispositivo). | **Planificado:** función de borrado con confirmación y reautenticación. |
| P1-5 | P1 | Sincronización de Student: unión por máximos, sin versiones ni marcas de borrado. | **Planificado:** versionado y marcas de borrado (fase de datos). |
| P1-6 | P1 | Métricas del perfil académico incluyen universidad y carrera (texto). | **Decisión del dueño** (las 5 preguntas son para métricas). Hoy no se envía nada: no hay clave de PostHog. Recomendación: rangos o categorías, nunca texto libre. |
| P1-7 | P1 | La política de privacidad dice que la contraseña se guarda «cifrada». | **Planificado:** Supabase guarda un *hash*; corregir el texto junto con voz, IA externa y datos locales. Revisión legal antes del lanzamiento. |
| P1-8 | P1 | Límites de importación de Vida: peso sí (10 MB); faltan límites de filas, páginas y tiempo. | **Planificado** (fase de Vida). |
| P2-1 | P2 | Landing envía a `/entrar` antes de ver el producto. | **Planificado** (Fase P1B: landing y páginas de producto). |

## 3. Checklist defensivo (adaptado de OWASP ASVS)
| Área | Estado |
|---|---|
| Acceso a datos por usuario (RLS) | Definido en `esquema.sql`; **verificado** en producción que el visitante anónimo no lee ni escribe `perfiles`/`solicitudes_apoyo` (código 42501) ni lista archivos |
| Aislamiento local entre cuentas | **Corregido** y probado (unitario); falta prueba con dos cuentas reales (P0-6) |
| Fallo seguro sin configuración | **Corregido** |
| Secretos fuera del navegador y de git | Solo claves públicas `VITE_*`; `.env.local` y `*.local.*` ignorados; sin mapas de código en el build |
| Dependencias | `npm audit --omit=dev`: 0 vulnerabilidades |
| HTML no confiable | No se usa `innerHTML`; correos HTML se leen como texto |
| Cabeceras | Básicas activas; CSP en solo informe |
| Administración | Por correo (P0-4, pendiente de aprobación) |
| Derechos con valor | En el cliente (P0-5, planificado) |
| Borrado y exportación | Exportar y borrar local sí; borrado de cuenta no (P1-4) |

## 4. Lo que necesita al dueño (configuración externa)
1. **Supabase:** confirmar «Confirm email» y «Secure email change» activos; longitud mínima de contraseña 8; límites de envío de OTP; URL de retorno (`/`, `/student`, `/vida/**`, dominio nuevo); MFA en tu cuenta del panel; copias de seguridad.
2. **Aprobar y correr** `supabase/propuestas/01-administracion-por-rol.sql`; luego cambio el código del panel.
3. **Cuentas de prueba:** crear dos usuarios de prueba confirmados para validar el aislamiento con cuentas reales.
4. **MFA** en GitHub, Vercel, Resend, Google Cloud y el registrador del dominio.
5. Revisión de privacidad/condiciones por alguien competente antes del lanzamiento.

## 5. Cambio visible para personas que ya usaban Vida con cuenta
Sus datos de Vida estaban en el espacio «sin cuenta». Al entrar verán Vida vacía y, en Hoy, el aviso para **pasar esos datos a su cuenta** (o dejarlos aparte). No se pierde nada y nada se mezcla sin su decisión.

## 6. Cómo verificar
- `npm test`: 6 pruebas (aislamiento Student/Vida, migración explícita, disponible del día, duplicados de importación).
- `npm run build`: compila sin errores.
- Navegador: 404 en `/esta-ruta-no-existe`; Vida y Student en modo de prueba local.
