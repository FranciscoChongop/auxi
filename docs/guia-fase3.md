# Fase 3: cómo activar las cuentas y publicar

## 1. Supabase (cuentas y datos)

1. Entra a **supabase.com** → **Start your project** → inicia sesión con GitHub.
2. **New project**: nombre `auxi`, una contraseña de base de datos (guárdala, no me la pases), región **South America (São Paulo)**. Espera 1–2 minutos.
3. **SQL Editor** → **New query** → pega todo `supabase/esquema.sql` → **Run**. Debe decir "Success".
4. **Authentication → Emails → Templates → Magic Link**: reemplaza el contenido por:

   ```html
   <h2>Tu código de Auxi</h2>
   <p>Escribe este código en la app para entrar:</p>
   <p style="font-size:28px;font-weight:800;letter-spacing:6px">{{ .Token }}</p>
   <p>Si no lo pediste, ignora este correo.</p>
   ```

   Guarda. (Así llega un código de 6 números en vez de un enlace.)
5. **Project Settings → API**: copia **Project URL** y **anon public** (la clave larga). Esos dos datos son los que me pasas. La anon key es pública por diseño; la que nunca se comparte es la **service_role**.

## 2. Vercel (publicar)

1. Entra a **vercel.com** → **Sign up** → con GitHub.
2. **Add New → Project** → elige el repositorio `auxi` → **Import**.
3. En **Environment Variables** agrega `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` con los mismos datos.
4. **Deploy**. Al terminar te da un enlace tipo `auxi-xxxx.vercel.app`.
5. Vuelve a Supabase → **Authentication → URL Configuration**: en **Site URL** pon ese enlace y en **Redirect URLs** agrega `https://TU-ENLACE.vercel.app/**` y `http://localhost:5173/**`.

## 3. Google (opcional, se puede hacer después)

Entrar con Google necesita crear un "cliente OAuth" en Google Cloud y pegarlo en Supabase → Authentication → Providers → Google. Mientras no esté, el botón de Google muestra un aviso y se entra con el código por correo.
