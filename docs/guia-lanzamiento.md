# Guía de lanzamiento: que cualquier persona pueda entrar y guardar sus datos

El código ya está listo: entrar con código por correo, con correo y contraseña o con Google, y guardar el avance en la cuenta (Student y Vida). Lo que falta es configurar las cuentas del dueño, **en este orden** (cada paso depende del anterior).

> La app **no usa la API de Claude ni ninguna IA de pago**: las lecciones se arman con la IA de cada persona. No hay claves de IA que configurar ni costos por uso.

Marca cada paso con ✅ al terminarlo.

## Paso 1 · Conectar el dominio auxistudio.com (≈15 min + espera)

- [ ] **Vercel** → proyecto → **Settings → Domains** → agregar `auxistudio.com` y `www.auxistudio.com`. Vercel muestra los registros DNS a crear (normalmente un **A** y un **CNAME**).
- [ ] **Latinoamérica Hosting** → zona DNS de auxistudio.com → crear **exactamente** esos registros.
- [ ] Esperar a que Vercel marque «Valid Configuration» (de minutos a unas horas).
- [ ] Cuando funcione: en Vercel, redirigir `auxi-three.vercel.app` al dominio nuevo.

## Paso 2 · Correos para cualquier persona (Resend)

Hoy el código para entrar **solo llega al correo del dueño**, porque Resend no tiene un dominio verificado. **Mientras no se haga este paso, nadie más puede crear su cuenta con correo.**

- [ ] **Resend** → **Domains → Add Domain** → `auxistudio.com`.
- [ ] Copiar los registros que da Resend (TXT y MX para SPF y DKIM) en **Latinoamérica Hosting** → **Verify** en Resend.
- [ ] **Supabase → Authentication → Emails → SMTP Settings**:
  - Remitente: `hola@auxistudio.com` (o `no-responder@auxistudio.com`), nombre «Auxi Studio».
  - Host `smtp.resend.com`, puerto `465`, usuario `resend`, contraseña: la **API key de Resend**.
- [ ] **Supabase → Authentication → Rate Limits**: subir **«emails sent per hour»** de 30 (el de fábrica con correo propio) a **unos 60**.

**¿Cuántos correos?** Cada persona gasta **1 correo** al crear su cuenta o al entrar con código (también al recuperar su contraseña). Quien entra **con Google no gasta ninguno**, y la sesión queda abierta, así que no se pide código cada vez.

| Límite | Cuánto | Qué significa |
|---|---|---|
| Supabase (con correo propio) | 30 por hora de fábrica, ajustable | Se sube a ~60 para no cortar a nadie en un pico. |
| Resend gratis | **100 por día · 3 000 al mes** | Alcanza para ~100 cuentas nuevas al día. |

Si se esperan más de ~100 cuentas nuevas en un día (por ejemplo, al lanzar una campaña), conviene pasar Resend a un plan de pago antes. Revisar el precio vigente en resend.com/pricing.

## Paso 3 · Supabase: direcciones y datos (≈10 min)

- [ ] **Authentication → URL Configuration**:
  - **Site URL**: `https://auxistudio.com`
  - **Redirect URLs**: agregar `https://auxistudio.com/**` y `https://www.auxistudio.com/**` (dejar también la de Vercel y `http://localhost:5173/**`).
- [ ] **SQL Editor** → correr, uno por uno (se pueden correr más de una vez; cada uno tiene su archivo `-revertir.sql` para deshacer):
  - [ ] `supabase/migraciones/2026-11-23-seguridad.sql` → monedas protegidas en el servidor y lista de administradores.
  - [ ] `supabase/migraciones/2026-11-24-vida-en-la-cuenta.sql` → Auxi Vida guardada en la cuenta.
- [ ] **Authentication → Sign In / Providers**: confirmar que **Allow new users to sign up** esté activado.

## Paso 4 · Entrar con Google (≈20 min)

- [ ] **Google Cloud Console** → crear un proyecto → **OAuth consent screen** (Externo):
  - Nombre «Auxi Studio», correo de soporte del dueño.
  - Dominio autorizado: `auxistudio.com`.
  - Privacidad: `https://auxistudio.com/privacidad` · Términos: `https://auxistudio.com/terminos`.
  - Permisos: solo `email`, `profile` y `openid`.
  - Al final, **Publicar** (pasar a producción).
- [ ] **Credentials → Create OAuth client ID → Web**:
  - Origen autorizado: `https://auxistudio.com`.
  - Redirect URI: la que muestra **Supabase → Authentication → Providers → Google** (`https://TU-PROYECTO.supabase.co/auth/v1/callback`).
- [ ] Pegar **Client ID** y **Client Secret** en **Supabase → Providers → Google** → activar.
- [ ] En Vercel, la variable `VITE_GOOGLE_ACTIVO` no debe valer `no` (si vale `no`, el botón de Google se oculta).

## Paso 5 · Métricas con PostHog (≈5 min, recomendado)

- [ ] **posthog.com** → crear un proyecto → copiar la **Project API key**.
- [ ] **Vercel → Settings → Environment Variables**: agregar `VITE_POSTHOG_KEY` (y `VITE_POSTHOG_HOST` si se eligió la región EU).
- [ ] **Deployments → Redeploy**: los cambios de variables solo valen después de volver a publicar.

## Paso 6 · Comprobar que todo funciona

- [ ] Abrir `auxistudio.com` en una **ventana de incógnito** y crear una cuenta con **otro correo** (no el del dueño). El código debe llegar.
- [ ] Responder las 5 preguntas, crear un tema y jugar una lección.
- [ ] Entrar con esa misma cuenta desde **otro celular**: el avance debe estar ahí. Lo mismo con un gasto en Auxi Vida.
- [ ] Probar «Entrar con Google».
- [ ] Probar «Agregar a inicio» de Auxi Student y de Auxi Vida en un Android y en un iPhone (cada una con su nombre y su León).

## Bueno saber

- El plan gratis de Supabase alcanza de sobra para empezar (hasta 50 000 usuarios activos al mes). Al inicio lo que más limita son los **correos** (paso 2): activar Google (paso 4) los reduce mucho.
- Vercel publica solo cada vez que se sube algo a `main` (1–2 minutos).
- El pase libre se aprueba en `/student/revision` con la cuenta del dueño (después del paso 3, por la lista de administradores).
- Todavía no existen los **avisos al celular** (entregas 7, 3 y 1 día antes): necesitan un servidor de avisos, que es trabajo de programación aparte.
