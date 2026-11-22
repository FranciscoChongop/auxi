# Fase 3: cómo activar las cuentas y publicar

## 1. Supabase (cuentas y datos)

1. Entra a **supabase.com** → **Start your project** → inicia sesión con GitHub.
2. **New project**: nombre `auxi`, una contraseña de base de datos (guárdala, no me la pases), región **South America (São Paulo)**. Espera 1–2 minutos.
3. **SQL Editor** → **New query** → pega todo `supabase/esquema.sql` → **Run**. Debe decir "Success".
4. **Authentication → URL Configuration**: en **Site URL** pon `http://localhost:5173` y en **Redirect URLs** agrega `http://localhost:5173/**`. (Cuando publiquemos en Vercel se agrega también ese enlace.) Así el botón «Sign in» del correo te devuelve a la app.
   - Supabase ya no deja editar la plantilla del correo sin un servidor de correo propio (SMTP), así que llega el correo por defecto con el enlace «Sign in». La app funciona con ese enlace.
   - El correo de Supabase tiene un límite de pocos envíos por hora: sirve para probar. Antes del lanzamiento conviene conectar un SMTP propio (por ejemplo, Resend, que es gratis al inicio).
5. Botón **Connect** (arriba) → pestaña **App Frameworks**: copia el **Project URL** y la clave pública (**Publishable key** `sb_publishable_…` o **anon public**). Esos dos datos son los que me pasas. La anon key es pública por diseño; la que nunca se comparte es la **service_role**.

## 2. Vercel (publicar)

1. Entra a **vercel.com** → **Sign up** → con GitHub.
2. **Add New → Project** → elige el repositorio `auxi` → **Import**.
3. En **Environment Variables** agrega `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` con los mismos datos.
4. **Deploy**. Al terminar te da un enlace tipo `auxi-xxxx.vercel.app`.
5. Vuelve a Supabase → **Authentication → URL Configuration**: en **Site URL** pon ese enlace y en **Redirect URLs** agrega `https://TU-ENLACE.vercel.app/**` y `http://localhost:5173/**`.

## 3. Google (opcional, se puede hacer después)

Entrar con Google necesita crear un "cliente OAuth" en Google Cloud y pegarlo en Supabase → Authentication → Providers → Google. Mientras no esté, el botón de Google muestra un aviso y se entra con el código por correo.
