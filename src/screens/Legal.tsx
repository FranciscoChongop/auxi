import type { ReactNode } from "react";
import { Boton } from "../components/Boton";
import { reemplazar, useRuta, volver } from "../lib/rutas";

const CONTACTO_CORREO = "chongdaniel91@gmail.com";
const CONTACTO_WHATSAPP = "https://wa.me/51960650372";

function Seccion({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-tarjeta font-extrabold">{titulo}</h2>
      {children}
    </section>
  );
}

function Privacidad() {
  return (
    <>
      <p className="text-text-soft">Última actualización: 22 de noviembre de 2026.</p>
      <Seccion titulo="Quién la ofrece">
        <p>Auxi Studio es una plataforma gratuita creada por Daniel Chong (@soydanielchong). Reúne mini apps: Auxi Student (para estudiar) y Auxi Vida (para ordenar tu plata), y un enlace a Vendoe (para negocios), que es una app aparte con su propia página. Esta página explica qué datos guardamos y para qué.</p>
      </Seccion>
      <Seccion titulo="Qué datos guardamos">
        <ul className="list-disc space-y-1 pl-5">
          <li>Tu correo y tu contraseña (la contraseña se guarda cifrada; nosotros no podemos verla). Si entras con Google, recibimos tu correo y tu nombre de Google.</li>
          <li>Tus respuestas a «Cuéntanos de ti»: nombre, año de nacimiento, carrera, universidad y país.</li>
          <li>Tu avance: cursos y temas que agregas, lecciones, racha, monedas, entregas y exámenes.</li>
          <li>Datos de uso sin tu nombre ni tu correo (por ejemplo, que terminaste una lección), para saber qué mejorar.</li>
          <li>Si pides el pase libre: tu usuario de Instagram y de TikTok, y tu correo, para revisar tu solicitud.</li>
        </ul>
      </Seccion>
      <Seccion titulo="Para qué los usamos">
        <p>Para que puedas entrar, guardar tu avance en cualquier celular, mostrarte recordatorios dentro de la app, y entender qué público usa Auxi y cómo mejorarla. Tu nombre no se usa en estadísticas.</p>
      </Seccion>
      <Seccion titulo="Con quién se comparten">
        <p>No vendemos tus datos ni los publicamos. Se guardan con proveedores que hacen funcionar la app: Supabase (cuentas y datos), Vercel (publicación), Resend (envío de correos) y Google (si eliges entrar con Google).</p>
      </Seccion>
      <Seccion titulo="Auxi Vida: tu plata">
        <ul className="list-disc space-y-1 pl-5">
          <li>Lo que registras en Auxi Vida (gastos, ingresos, metas, pagos, fechas y revisiones de Protégete) se guarda en tu celular. Puedes descargarlo o borrarlo desde Perfil → Mis datos.</li>
          <li>Auxi Vida no mueve tu plata, no presta y no recomienda productos financieros. No te pedimos claves, códigos ni datos de tarjetas.</li>
          <li>Las capturas, los PDF y los archivos que importas se leen en tu celular y no se guardan ni se envían a nadie. Solo se guarda lo que confirmas: monto, moneda, fecha, nombre, tipo y número de operación. La primera vez que lees una imagen, la app descarga el lector desde un servidor público (jsDelivr); tu imagen no sale del celular.</li>
          <li>En Protégete, de lo que escribes solo se guarda una copia con claves y números ocultos, en tu celular, y puedes borrarla cuando quieras.</li>
        </ul>
      </Seccion>
      <Seccion titulo="Si conectas Gmail">
        <ul className="list-disc space-y-1 pl-5">
          <li>Solo si tú lo eliges. Usamos la autorización oficial de Google; nunca te pedimos la contraseña de tu correo.</li>
          <li>Pedimos el permiso «ver tus correos» (solo lectura, gmail.readonly). Técnicamente ese permiso permite leer todo tu correo; Auxi Vida solo busca correos que parecen comprobantes de pago, en las fechas que eliges, y los lee en tu celular.</li>
          <li>No guardamos el texto de tus correos ni los enviamos a nuestros servidores. Solo se guarda lo que confirmas de cada movimiento (monto, moneda, fecha, nombre, tipo y número de operación) y la fecha de tu última sincronización.</li>
          <li>El permiso de Google no se guarda: dura alrededor de una hora y solo mientras la app está abierta. No usamos tus correos para publicidad, no los vendemos, no los compartimos y nadie los lee.</li>
          <li>Puedes desconectar Gmail y borrar lo importado desde Importar movimientos, y quitar el permiso en myaccount.google.com/permissions.</li>
          <li>El uso y la transferencia que hace Auxi de la información recibida de las API de Google cumplen la Política de Datos de Usuario de los Servicios de API de Google, incluidos los requisitos de Uso Limitado.</li>
        </ul>
      </Seccion>
      <Seccion titulo="Tu material">
        <p>Lo que pegas para crear lecciones lo procesas con tu propia IA (ChatGPT, Claude o Gemini). Auxi solo guarda el resultado que pegas.</p>
      </Seccion>
      <Seccion titulo="Tus derechos">
        <p>
          Puedes pedir que corrijamos o borremos tu cuenta y tus datos cuando quieras, escribiendo a{" "}
          <a className="font-extrabold text-brand underline" href={`mailto:${CONTACTO_CORREO}`}>
            {CONTACTO_CORREO}
          </a>{" "}
          o por{" "}
          <a className="font-extrabold text-brand underline" href={CONTACTO_WHATSAPP}>
            WhatsApp
          </a>
          . Puedes cerrar sesión cuando quieras desde tu perfil.
        </p>
      </Seccion>
    </>
  );
}

function Terminos() {
  return (
    <>
      <p className="text-text-soft">Última actualización: 22 de noviembre de 2026.</p>
      <Seccion titulo="Qué es Auxi Studio">
        <p>Auxi Studio es gratuita e incluye Auxi Student (estudiar con juegos) y Auxi Vida (ordenar tu plata). Al usarla aceptas estas condiciones sencillas.</p>
      </Seccion>
      <Seccion titulo="Tu cuenta">
        <p>Eres responsable de tu contraseña y de lo que hagas con tu cuenta. Debes dar datos verdaderos en lo que sea necesario para usar la app.</p>
      </Seccion>
      <Seccion titulo="Uso correcto">
        <p>No uses Auxi para dañar a otras personas ni para intentar romper o abusar del servicio. Podemos cerrar cuentas que lo hagan.</p>
      </Seccion>
      <Seccion titulo="Monedas y pase libre">
        <p>Lo básico es gratis. Las monedas y el pase libre abren solo extras, y sus precios y reglas se muestran siempre en la app. El pase libre por apoyar en redes se revisa a mano con capturas, y puede rechazarse si no se cumplen los pasos.</p>
      </Seccion>
      <Seccion titulo="Auxi Vida">
        <p>Auxi Vida te ayuda a registrar y entender tu plata. No mueve dinero, no presta ni recomienda productos financieros, y lo que muestra es un estimado con lo que registras, no el saldo de tu banco. Las revisiones de Protégete buscan señales comunes y no pueden asegurar si algo es o no una estafa. Revisa siempre lo importado: un comprobante leído no prueba que la plata llegó.</p>
      </Seccion>
      <Seccion titulo="Sin garantías">
        <p>Auxi te ayuda a estudiar, pero no garantiza notas ni resultados. Las lecciones creadas con una IA pueden tener errores: revísalas con tu material.</p>
      </Seccion>
      <Seccion titulo="Cambios y contacto">
        <p>
          Podemos mejorar o cambiar la app y estas condiciones. Para dudas escribe a{" "}
          <a className="font-extrabold text-brand underline" href={`mailto:${CONTACTO_CORREO}`}>
            {CONTACTO_CORREO}
          </a>
          .
        </p>
      </Seccion>
    </>
  );
}

/** Páginas públicas: política de privacidad y condiciones del servicio. */
export default function Legal() {
  const ruta = useRuta();
  const esTerminos = ruta.includes("terminos");
  const inicio = ruta.startsWith("/student") ? "/student" : "/";
  return (
    <main
      className="mx-auto flex min-h-dvh max-w-md flex-col gap-4 px-5"
      style={{ paddingTop: "calc(env(safe-area-inset-top) + 20px)", paddingBottom: "calc(env(safe-area-inset-bottom) + 20px)" }}
    >
      <h1 className="text-titulo font-black">{esTerminos ? "Condiciones del servicio" : "Política de privacidad"}</h1>
      {esTerminos ? <Terminos /> : <Privacidad />}
      <div className="mt-auto pt-4">
        <Boton variante="secundario" onClick={() => (window.history.length > 1 ? volver(inicio) : reemplazar(inicio))}>
          Volver
        </Boton>
      </div>
    </main>
  );
}
