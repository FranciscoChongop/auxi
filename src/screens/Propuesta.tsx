/**
 * PROPUESTA VISUAL P1A (solo en desarrollo: /propuesta). Bocetos navegables para aprobar la dirección
 * antes del cambio grande. No es la app real: datos de ejemplo y cajas donde irán capturas reales.
 */
import "@fontsource/figtree/latin-500.css";
import "@fontsource/figtree/latin-600.css";
import "@fontsource/figtree/latin-700.css";
import { useEffect, useRef, useState, type ReactNode } from "react";

type Vista = "landing" | "espacio" | "student" | "vida" | "sistema";
type Ancho = "celular" | "computadora";

const ESTILOS = `
.pp { --bg:#F5F6FA; --tinta:#141A4D; --gris:#5B6084; --linea:#DDE0EE; --blanco:#FFFFFF; --cobalto:#2430D9; --cobalto-hondo:#1A23A6; --lila:#ECEEFB; --teal:#0E5B57; --teal-claro:#E3F3F1; --oro:#F2B341;
  font-family: Figtree, system-ui, sans-serif; color: var(--tinta); background: var(--bg); font-weight: 500; font-size: 16px; line-height: 24px; }
.pp h1, .pp h2, .pp h3 { font-weight: 700; letter-spacing: -0.02em; }
.pp .h1 { font-size: 40px; line-height: 44px; }
.pp .h2 { font-size: 28px; line-height: 34px; }
.pp .h3 { font-size: 20px; line-height: 26px; font-weight: 600; letter-spacing: -0.01em; }
.pp .cuerpo-l { font-size: 18px; line-height: 28px; color: var(--gris); }
.pp .chico { font-size: 14px; line-height: 20px; color: var(--gris); }
.pp .num { font-variant-numeric: tabular-nums; }
@container (min-width: 56rem) { .pp .h1 { font-size: 56px; line-height: 60px; } .pp .h2 { font-size: 36px; line-height: 42px; } }
.pp .btn { display:inline-flex; align-items:center; justify-content:center; min-height:48px; padding:0 20px; border-radius:12px; font-weight:600; transition: background-color .15s, transform .12s; }
.pp .btn:active { transform: translateY(1px); }
.pp .btn:focus-visible, .pp a:focus-visible, .pp button:focus-visible { outline: 3px solid var(--cobalto); outline-offset: 2px; }
.pp .btn-p { background: var(--cobalto); color: #fff; } .pp .btn-p:hover { background: var(--cobalto-hondo); }
.pp .btn-s { background: var(--blanco); color: var(--cobalto); box-shadow: inset 0 0 0 1.5px var(--linea); } .pp .btn-s:hover { box-shadow: inset 0 0 0 1.5px var(--cobalto); }
.pp .btn-t { background: var(--teal); color: #fff; }
.pp .caja { background: var(--blanco); border: 1px solid var(--linea); border-radius: 16px; }
.pp .captura { background: repeating-linear-gradient(135deg, #EEF0F8 0 10px, #E7EAF6 10px 20px); border: 1.5px dashed #B9BEDD; border-radius: 12px; color: var(--gris); font-size: 13px; line-height: 18px; display:grid; place-items:center; text-align:center; padding: 12px; }
.pp .rail { height: 6px; border-radius: 999px; background: var(--lila); overflow: hidden; } .pp .rail > span { display:block; height:100%; border-radius:999px; background: var(--cobalto); }
`;

/* ---------- Marca: órbita estática, no depende de cuántos productos haya ---------- */
function Marca({ chica = false }: { chica?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <svg viewBox="0 0 32 32" width={chica ? 26 : 30} height={chica ? 26 : 30} aria-hidden="true">
        <circle cx="16" cy="16" r="11" fill="none" stroke="#2430D9" strokeWidth="2.6" strokeDasharray="52 17" strokeLinecap="round" transform="rotate(-40 16 16)" />
        <circle cx="24.5" cy="7.5" r="3.6" fill="#F2B341" />
      </svg>
      <span className="leading-none">
        <span className="block text-[18px] font-bold tracking-[-0.01em]">Auxi Studio</span>
        {!chica && <span className="mt-1 block text-[12px] font-medium text-[color:var(--gris)]">por Daniel Chong</span>}
      </span>
    </span>
  );
}

/* ---------- Mini interfaces (boceto de las pantallas reales, datos de ejemplo) ---------- */
function MiniStudent() {
  return (
    <div className="flex h-full flex-col gap-2 bg-[color:var(--blanco)] p-3 text-[11px] leading-[14px]">
      <p className="font-semibold text-[color:var(--gris)]">Matemática · Fracciones</p>
      <p className="text-[14px] font-bold">¿Qué estudiamos hoy?</p>
      <div className="rounded-[8px] bg-[color:var(--cobalto)] p-2 text-white">
        <p className="font-semibold">Continuar: Fracciones equivalentes</p>
        <p className="opacity-80">Lección 3 de 6</p>
      </div>
      <div className="flex gap-1.5">
        {["✓", "✓", "3", "4", "5"].map((n, i) => (
          <span key={i} className={`grid size-6 place-items-center rounded-full font-bold ${i < 2 ? "bg-[color:var(--oro)]" : i === 2 ? "bg-[color:var(--cobalto)] text-white" : "bg-[color:var(--lila)] text-[color:var(--gris)]"}`}>
            {n}
          </span>
        ))}
      </div>
      <p className="mt-auto text-[color:var(--gris)]">Examen: viernes 28 nov</p>
    </div>
  );
}

function MiniVida() {
  return (
    <div className="flex h-full flex-col gap-2 bg-[#F3FAF8] p-2.5 text-[10px] leading-[13px]">
      <div className="rounded-[10px] bg-[color:var(--teal)] p-2.5 text-white">
        <p className="opacity-85">Disponible estimado para hoy</p>
        <p className="num text-[22px] leading-[26px] font-bold">S/ 31</p>
        <p className="opacity-75">Estimado, no es tu saldo del banco</p>
      </div>
      {[
        ["Menú", "− S/ 12"],
        ["Pasaje", "− S/ 3"],
        ["Turno", "+ S/ 75"],
      ].map(([a, b]) => (
        <div key={a} className="flex justify-between rounded-[6px] bg-white px-2 py-1.5">
          <span>{a}</span>
          <span className="num font-semibold">{b}</span>
        </div>
      ))}
    </div>
  );
}

/** Composición del héroe: laptop con Student + celular con Vida, unidos por una sola línea de órbita. */
function ComposicionHeroe() {
  return (
    <figure className="relative mx-auto aspect-[4/3] w-full max-w-[560px]" aria-label="Boceto: Auxi Student en una laptop y Auxi Vida en un celular">
      <svg viewBox="0 0 400 300" className="absolute inset-0 size-full" aria-hidden="true">
        <ellipse cx="200" cy="158" rx="190" ry="96" fill="none" stroke="#2430D9" strokeOpacity=".28" strokeWidth="1.5" transform="rotate(-12 200 158)" />
        <circle cx="372" cy="104" r="5" fill="#F2B341" />
      </svg>
      <div className="absolute top-[14%] left-[2%] w-[74%] overflow-hidden rounded-[10px] border-[6px] border-[#1E2340] bg-[#1E2340] shadow-[0_18px_40px_rgba(20,26,77,.18)]">
        <div className="aspect-[16/10]">
          <MiniStudent />
        </div>
      </div>
      <div className="absolute right-[2%] bottom-[4%] w-[30%] overflow-hidden rounded-[18px] border-[5px] border-[#1E2340] bg-[#1E2340] shadow-[0_18px_40px_rgba(20,26,77,.22)]">
        <div className="aspect-[9/17]">
          <MiniVida />
        </div>
      </div>
      <figcaption className="absolute -bottom-7 left-0 text-[12px] text-[color:var(--gris)]">Boceto. En la versión final van capturas reales en español.</figcaption>
    </figure>
  );
}

/* ---------- 1. Landing ---------- */
function Landing({ celular }: { celular: boolean }) {
  const [menu, setMenu] = useState(false);
  return (
    <div>
      <header className="border-b border-[color:var(--linea)] bg-[color:var(--bg)]">
        <div className="mx-auto flex h-[72px] max-w-[1200px] items-center justify-between gap-4 px-4 @4xl:px-8">
          <Marca />
          <nav aria-label="Principal" className="hidden items-center gap-7 font-semibold @4xl:flex">
            <a href="#apps">Aplicaciones</a>
            <a href="#estudio">En el estudio</a>
            <a href="#sobre">Sobre Auxi</a>
          </nav>
          <div className="flex items-center gap-2">
            <a className="btn btn-s" href="#entrar">
              Entrar
            </a>
            {celular && (
              <button type="button" aria-expanded={menu} aria-label="Abrir menú" onClick={() => setMenu(!menu)} className="grid size-12 place-items-center rounded-[12px]">
                <svg viewBox="0 0 24 24" className="size-6" aria-hidden="true">
                  <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            )}
          </div>
        </div>
        {celular && menu && (
          <nav aria-label="Principal" className="flex flex-col border-t border-[color:var(--linea)] px-4 py-2 font-semibold">
            {["Aplicaciones", "En el estudio", "Sobre Auxi"].map((x) => (
              <a key={x} href="#apps" className="flex min-h-12 items-center">
                {x}
              </a>
            ))}
          </nav>
        )}
      </header>

      <section className="mx-auto grid max-w-[1200px] gap-12 px-4 pt-10 pb-16 @4xl:grid-cols-12 @4xl:items-center @4xl:px-8 @4xl:pt-20 @4xl:pb-24">
        <div className="@4xl:col-span-6">
          <h1 className="h1 max-w-[14ch] @4xl:max-w-[18ch]">Herramientas para aprender, organizarte y avanzar.</h1>
          <p className="cuerpo-l mt-5 max-w-[46ch]">Aplicaciones creadas por Daniel Chong para lo que haces todos los días: estudiar mejor y ordenar tu dinero, desde un mismo lugar.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a className="btn btn-p" href="#apps">
              Explorar aplicaciones
            </a>
            <a className="btn btn-s" href="#crear">
              Crear mi cuenta
            </a>
          </div>
          <p className="chico mt-4">Auxi Student y Auxi Vida tienen funciones gratuitas.</p>
        </div>
        <div className="@4xl:col-span-6">
          <ComposicionHeroe />
        </div>
      </section>

      <section id="apps" className="border-t border-[color:var(--linea)] bg-[color:var(--blanco)]">
        <div className="mx-auto max-w-[1200px] px-4 py-16 @4xl:px-8 @4xl:py-24">
          <h2 className="h2">Descubre las aplicaciones</h2>
          <p className="cuerpo-l mt-3 max-w-[52ch]">Cada una resuelve una cosa y la resuelve bien. Puedes ver cómo funciona antes de crear tu cuenta.</p>
          <div className="mt-10 grid gap-6 @4xl:grid-cols-2">
            <TarjetaProducto
              color="var(--cobalto)"
              nombre="Auxi Student"
              beneficio="Convierte tus apuntes en lecciones y organiza tus estudios."
              capacidades={["Lecciones con preguntas a partir de tu material, usando tu propia IA", "Camino de niveles con repaso de lo que fallaste", "Exámenes, entregas y calendario en un solo lugar"]}
              mini={<MiniStudent />}
              principal="Abrir Auxi Student"
            />
            <TarjetaProducto
              color="var(--teal)"
              nombre="Auxi Vida"
              beneficio="Conoce tu presupuesto estimado, registra movimientos y revisa señales de riesgo."
              capacidades={["Un disponible estimado para cada día, con el cálculo a la vista", "Importa movimientos de reportes, capturas o texto y revísalos antes de guardar", "Protégete: revisa un mensaje o un vendedor antes de pagar"]}
              mini={<MiniVida />}
              principal="Probar sin dar mis datos"
              teal
            />
          </div>
          <p className="chico mt-8">
            ¿Tienes un negocio? <a className="font-semibold text-[color:var(--cobalto)] underline" href="#vendoe">Vendoe</a> es otra app de Daniel Chong, con su propia página y su propia cuenta.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-4 py-16 @4xl:px-8 @4xl:py-24">
        <h2 className="h2">Así funciona Auxi</h2>
        <ol className="mt-10 grid gap-8 @4xl:grid-cols-4">
          {[
            ["Descubre", "Mira qué hace cada aplicación y pruébala si tiene ejemplo."],
            ["Elige", "Entra a la que necesitas hoy. No tienes que usarlas todas."],
            ["Empieza", "Con una sola cuenta Auxi entras a Student y a Vida."],
            ["Vuelve cuando quieras", "Mi espacio te deja donde te quedaste."],
          ].map(([t, d], i) => (
            <li key={t} className="border-t-2 border-[color:var(--tinta)] pt-4">
              <span className="num text-[14px] font-semibold text-[color:var(--gris)]">Paso {i + 1}</span>
              <p className="h3 mt-1">{t}</p>
              <p className="chico mt-2 text-[15px]">{d}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-y border-[color:var(--linea)] bg-[color:var(--blanco)]">
        <div className="mx-auto grid max-w-[1200px] gap-10 px-4 py-16 @4xl:grid-cols-12 @4xl:px-8">
          <div className="@4xl:col-span-4">
            <h2 className="h2">Tu información, bajo tu control</h2>
            <a href="#privacidad" className="mt-4 inline-flex min-h-11 items-center font-semibold text-[color:var(--cobalto)] underline">
              Leer la política de privacidad
            </a>
          </div>
          <dl className="grid gap-8 @2xl:grid-cols-3 @4xl:col-span-8">
            {[
              ["Auxi Student", "Tu avance se guarda en tu cuenta para seguir en otro dispositivo."],
              ["Auxi Vida", "Tus datos se quedan en este dispositivo. Puedes descargarlos o borrarlos."],
              ["Sin mover dinero", "Vida no se conecta a tu banco ni conoce tu saldo: el disponible es un estimado."],
            ].map(([t, d]) => (
              <div key={t}>
                <dt className="font-bold">{t}</dt>
                <dd className="chico mt-2 text-[15px]">{d}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section id="estudio" className="mx-auto max-w-[1200px] px-4 py-16 @4xl:px-8">
        <div className="grid items-center gap-6 rounded-[20px] bg-[color:var(--lila)] p-8 @4xl:grid-cols-12 @4xl:p-12">
          <div className="@4xl:col-span-7">
            <h2 className="h2">En el estudio</h2>
            <p className="cuerpo-l mt-3">Nuevas formas de aprender, crear y avanzar. Muy pronto podrás descubrirlas aquí.</p>
          </div>
          <div className="captura h-32 @4xl:col-span-5">Imagen abstracta sobria (P05): módulos conectados, sin nombres ni fechas</div>
        </div>
      </section>

      <section id="sobre" className="mx-auto grid max-w-[1200px] gap-8 px-4 pb-16 @4xl:grid-cols-12 @4xl:px-8 @4xl:pb-24">
        <div className="captura aspect-square max-w-[280px] @4xl:col-span-4">Retrato real de Daniel (P06), solo si lo entregas. Si no, esta caja no aparece.</div>
        <div className="@4xl:col-span-7 @4xl:col-start-6">
          <h2 className="h2">Creado por Daniel Chong</h2>
          <p className="cuerpo-l mt-4 max-w-[56ch]">[Texto breve de Daniel: por qué crea Auxi y para quién. Lo escribe Daniel; no se inventa biografía ni cifras.]</p>
          <a href="#instagram" className="mt-5 inline-flex min-h-11 items-center font-semibold text-[color:var(--cobalto)] underline">
            Sígueme en Instagram
          </a>
        </div>
      </section>

      <section className="bg-[color:var(--tinta)] text-white">
        <div className="mx-auto flex max-w-[1200px] flex-col items-start gap-6 px-4 py-14 @4xl:flex-row @4xl:items-center @4xl:justify-between @4xl:px-8">
          <h2 className="h2 max-w-[22ch]">Empieza con la aplicación que necesitas hoy.</h2>
          <a className="btn bg-white text-[color:var(--cobalto)]" href="#apps">
            Explorar aplicaciones
          </a>
        </div>
      </section>
      <footer className="mx-auto grid max-w-[1200px] gap-8 px-4 py-10 text-[15px] @4xl:grid-cols-4 @4xl:px-8">
        <Marca />
        {[
          ["Aplicaciones", ["Auxi Student", "Auxi Vida", "Vendoe (sitio externo)"]],
          ["Ayuda", ["Preguntas frecuentes", "Escríbenos por WhatsApp"]],
          ["Legal", ["Privacidad", "Condiciones"]],
        ].map(([t, items]) => (
          <div key={t as string}>
            <p className="font-bold">{t as string}</p>
            <ul className="mt-2">
              {(items as string[]).map((x) => (
                <li key={x}>
                  <a href="#f" className="flex min-h-10 items-center text-[color:var(--gris)] hover:text-[color:var(--tinta)]">
                    {x}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </footer>
    </div>
  );
}

function TarjetaProducto({ color, nombre, beneficio, capacidades, mini, principal, teal = false }: { color: string; nombre: string; beneficio: string; capacidades: string[]; mini: ReactNode; principal: string; teal?: boolean }) {
  return (
    <article className="caja flex flex-col overflow-hidden">
      <div className="grid gap-6 p-6 @2xl:grid-cols-[1fr_180px] @4xl:p-8">
        <div>
          <p className="flex items-center gap-2 font-bold">
            <span className="size-3 rounded-full" style={{ background: color }} aria-hidden="true" />
            {nombre}
          </p>
          <h3 className="h3 mt-3">{beneficio}</h3>
          <ul className="mt-4 flex flex-col gap-2.5">
            {capacidades.map((c) => (
              <li key={c} className="flex gap-2.5 text-[15px] leading-[22px]">
                <svg viewBox="0 0 20 20" className="mt-0.5 size-5 shrink-0" aria-hidden="true">
                  <path d="M5 10.5l3 3 7-7" fill="none" stroke={teal ? "#0E5B57" : "#2430D9"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {c}
              </li>
            ))}
          </ul>
        </div>
        <div className="mx-auto h-[220px] w-[180px] overflow-hidden rounded-[14px] border border-[color:var(--linea)]" aria-label={`Boceto de ${nombre}`}>
          {mini}
        </div>
      </div>
      <div className="mt-auto flex flex-wrap gap-3 border-t border-[color:var(--linea)] p-6 @4xl:px-8">
        <a className={`btn ${teal ? "btn-t" : "btn-p"}`} href="#abrir">
          {principal}
        </a>
        <a className="btn btn-s" href="#detalle">
          Ver cómo funciona
        </a>
      </div>
    </article>
  );
}

/* ---------- AppShell compartido (Mi espacio, Student, Vida) ---------- */
type Item = { nombre: string; activo?: boolean };
function AppShell({ celular, producto, color, items, children, inferior }: { celular: boolean; producto: string; color: string; items: Item[]; children: ReactNode; inferior?: string[] }) {
  if (celular)
    return (
      <div className="flex min-h-[844px] flex-col">
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-[color:var(--linea)] bg-[color:var(--bg)] px-4">
          <button type="button" className="flex min-h-11 items-center gap-2 rounded-[10px] px-1 font-bold" aria-label={`Cambiar de aplicación. Ahora: ${producto}`}>
            <span className="size-2.5 rounded-full" style={{ background: color }} aria-hidden="true" />
            {producto}
            <svg viewBox="0 0 20 20" className="size-4" aria-hidden="true">
              <path d="M5 8l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          <span className="grid size-10 place-items-center rounded-full bg-[color:var(--lila)] text-[14px] font-bold" aria-label="Tu cuenta">
            DC
          </span>
        </header>
        <div className="flex-1 px-4 pt-5 pb-8">{children}</div>
        {inferior && (
          <nav aria-label={`Secciones de ${producto}`} className="sticky bottom-0 grid grid-cols-5 border-t border-[color:var(--linea)] bg-white px-1 pt-1 pb-3">
            {inferior.map((x, i) => (
              <span key={x} className={`flex min-h-12 flex-col items-center justify-center gap-1 text-[11px] font-semibold ${i === 0 ? "" : "text-[color:var(--gris)]"}`} style={i === 0 ? { color } : undefined}>
                <span className="size-5 rounded-[6px]" style={{ background: i === 0 ? color : "#DDE0EE" }} aria-hidden="true" />
                {x}
              </span>
            ))}
          </nav>
        )}
      </div>
    );
  return (
    <div className="grid min-h-[820px] grid-cols-[248px_1fr]">
      <aside className="flex flex-col gap-1 border-r border-[color:var(--linea)] bg-white p-4">
        <div className="px-2 pt-1 pb-4">
          <Marca chica />
        </div>
        <button type="button" className="mb-3 flex min-h-11 items-center justify-between rounded-[10px] border border-[color:var(--linea)] px-3 font-bold">
          <span className="flex items-center gap-2">
            <span className="size-2.5 rounded-full" style={{ background: color }} aria-hidden="true" />
            {producto}
          </span>
          <svg viewBox="0 0 20 20" className="size-4" aria-hidden="true">
            <path d="M5 8l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
        {items.map((it) => (
          <span key={it.nombre} className={`flex min-h-11 items-center rounded-[10px] px-3 font-semibold ${it.activo ? "bg-[color:var(--lila)]" : "text-[color:var(--gris)]"}`} style={it.activo ? { color } : undefined}>
            {it.nombre}
          </span>
        ))}
        <div className="mt-auto flex flex-col gap-1 border-t border-[color:var(--linea)] pt-3 text-[color:var(--gris)]">
          <span className="flex min-h-10 items-center px-3 font-semibold">Ajustes</span>
          <span className="flex min-h-10 items-center px-3 font-semibold">Ayuda</span>
          <span className="flex min-h-12 items-center gap-2 px-3 font-semibold text-[color:var(--tinta)]">
            <span className="grid size-8 place-items-center rounded-full bg-[color:var(--lila)] text-[12px] font-bold">DC</span>
            Daniel
          </span>
        </div>
      </aside>
      <main className="px-10 py-8">{children}</main>
    </div>
  );
}

function Encabezado({ titulo, detalle, accion }: { titulo: string; detalle?: string; accion?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="h2">{titulo}</h1>
        {detalle && <p className="chico mt-1 text-[15px]">{detalle}</p>}
      </div>
      {accion}
    </div>
  );
}

/* ---------- 2. Mi espacio ---------- */
function MiEspacio({ celular }: { celular: boolean }) {
  return (
    <AppShell celular={celular} producto="Mi espacio" color="#141A4D" items={[{ nombre: "Mi espacio", activo: true }, { nombre: "Auxi Student" }, { nombre: "Auxi Vida" }]}>
      <Encabezado titulo="Hola, Daniel" detalle="Domingo 23 de noviembre" />
      <section className="mt-8" aria-labelledby="continua">
        <h2 id="continua" className="h3">
          Continúa donde te quedaste
        </h2>
        <div className="mt-4 grid gap-4 @4xl:grid-cols-2">
          <div className="caja p-5">
            <p className="flex items-center gap-2 text-[14px] font-semibold text-[color:var(--cobalto)]">
              <span className="size-2.5 rounded-full bg-[color:var(--cobalto)]" aria-hidden="true" />
              Auxi Student
            </p>
            <p className="mt-2 text-[18px] font-bold">Fracciones equivalentes</p>
            <p className="chico">Matemática · lección 3 de 6 · 5 preguntas por repasar</p>
            <a className="btn btn-p mt-4" href="#c">
              Continuar
            </a>
          </div>
          <div className="caja p-5">
            <p className="flex items-center gap-2 text-[14px] font-semibold text-[color:var(--teal)]">
              <span className="size-2.5 rounded-full bg-[color:var(--teal)]" aria-hidden="true" />
              Auxi Vida
            </p>
            <p className="mt-2 text-[18px] font-bold">Tu día en Vida</p>
            <p className="chico">Los montos no se muestran en Mi espacio.</p>
            <a className="btn btn-t mt-4" href="#v">
              Abrir Hoy
            </a>
          </div>
        </div>
      </section>
      <section className="mt-10" aria-labelledby="apps">
        <h2 id="apps" className="h3">
          Mis aplicaciones
        </h2>
        <ul className="caja mt-4 divide-y divide-[color:var(--linea)]">
          {[
            ["Auxi Student", "Usada hoy", "var(--cobalto)"],
            ["Auxi Vida", "Usada hace 3 días", "var(--teal)"],
          ].map(([n, u, c]) => (
            <li key={n} className="flex min-h-16 items-center justify-between gap-4 px-5">
              <span className="flex items-center gap-3 font-bold">
                <span className="size-3 rounded-full" style={{ background: c }} aria-hidden="true" />
                {n}
              </span>
              <span className="chico">{u}</span>
            </li>
          ))}
        </ul>
      </section>
      <section className="mt-10 grid gap-4 @4xl:grid-cols-2" aria-label="Descubre Auxi">
        <div className="rounded-[16px] bg-[color:var(--lila)] p-5">
          <p className="font-bold">En el estudio</p>
          <p className="chico mt-1">Nuevas formas de aprender, crear y avanzar. Muy pronto, aquí.</p>
        </div>
      </section>
    </AppShell>
  );
}

/* ---------- 3. Auxi Student: inicio ---------- */
function StudentInicio({ celular, nuevo }: { celular: boolean; nuevo: boolean }) {
  const items = ["Inicio", "Cursos", "Camino", "Métodos", "Entregas"].map((n, i) => ({ nombre: n, activo: i === 0 }));
  const principal = nuevo ? (
    <div className="caja p-6">
      <p className="text-[14px] font-semibold text-[color:var(--cobalto)]">Primer paso · unos 5 minutos</p>
      <h2 className="h3 mt-2">Crea tu primer tema con tu material</h2>
      <ol className="mt-4 grid gap-3 @2xl:grid-cols-3">
        {["Copia el pedido de Auxi", "Pégalo en tu IA con tu PDF o apuntes", "Pega aquí la respuesta y revísala"].map((p, i) => (
          <li key={p} className="rounded-[12px] bg-[color:var(--bg)] p-3 text-[15px] leading-[21px]">
            <span className="num block text-[13px] font-semibold text-[color:var(--gris)]">Paso {i + 1}</span>
            {p}
          </li>
        ))}
      </ol>
      <a className="btn btn-p mt-5" href="#crear">
        Crear mi primer tema
      </a>
    </div>
  ) : (
    <div className="caja p-6">
      <p className="text-[14px] font-semibold text-[color:var(--cobalto)]">Matemática · Fracciones</p>
      <h2 className="h3 mt-2">Fracciones equivalentes</h2>
      <p className="chico">Lección 3 de 6 · unos 4 minutos</p>
      <div className="rail mt-4" role="progressbar" aria-label="Avance del tema" aria-valuenow={33} aria-valuemin={0} aria-valuemax={100}>
        <span style={{ width: "33%" }} />
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        <a className="btn btn-p" href="#c">
          Continuar estudiando
        </a>
        <a className="btn btn-s" href="#r">
          Repasar 5 preguntas
        </a>
      </div>
    </div>
  );
  return (
    <AppShell celular={celular} producto="Auxi Student" color="#2430D9" items={items} inferior={["Inicio", "Cursos", "Camino", "Métodos", "Entregas"]}>
      <Encabezado titulo="¿Qué estudiamos hoy?" detalle={nuevo ? "Empieza con un tema. Lo demás aparece cuando lo necesites." : "Meta de hoy: 1 de 2 lecciones · racha de 4 días"} />
      <div className="mt-6 grid gap-6 @4xl:grid-cols-12">
        <div className="flex flex-col gap-6 @4xl:col-span-8">
          {principal}
          {!nuevo && (
            <section className="caja p-5" aria-labelledby="cursos">
              <div className="flex items-center justify-between">
                <h2 id="cursos" className="h3">
                  Mis cursos
                </h2>
                <a href="#todos" className="min-h-11 content-center font-semibold text-[color:var(--cobalto)]">
                  Ver todos
                </a>
              </div>
              <ul className="mt-3 divide-y divide-[color:var(--linea)]">
                {[
                  ["Matemática", "Fracciones · 33 %", 33],
                  ["Comunicación", "Textos argumentativos · 60 %", 60],
                  ["Historia", "Independencia · 10 %", 10],
                ].map(([c, t, p]) => (
                  <li key={c as string} className="grid min-h-16 grid-cols-[1fr_120px] items-center gap-4">
                    <span>
                      <span className="block font-semibold">{c}</span>
                      <span className="chico">{t}</span>
                    </span>
                    <span className="rail" aria-hidden="true">
                      <span style={{ width: `${p}%` }} />
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
        <aside className="flex flex-col gap-4 @4xl:col-span-4" aria-label="Tu semana">
          <div className="caja p-5">
            <p className="chico">Próximo examen</p>
            <p className="mt-1 font-bold">{nuevo ? "Aún no tienes exámenes" : "Matemática · viernes 28 nov"}</p>
            <a href="#examen" className="mt-2 inline-flex min-h-11 items-center font-semibold text-[color:var(--cobalto)]">
              {nuevo ? "Agregar examen" : "Ver plan de repaso"}
            </a>
          </div>
          <div className="caja p-5">
            <p className="chico">Esta semana</p>
            <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[12px] font-semibold">
              {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => (
                <span key={i} className="flex flex-col items-center gap-1">
                  <span className={`size-7 rounded-full ${!nuevo && i < 4 ? "bg-[color:var(--oro)]" : "bg-[color:var(--lila)]"}`} aria-hidden="true" />
                  {d}
                </span>
              ))}
            </div>
          </div>
          <div className="caja p-5">
            <p className="chico">Métodos</p>
            <ul className="mt-2">
              {[
                ["El tomate", "25 min de foco"],
                ["Las 5 cajas", "Repaso espaciado"],
                ["Explícaselo a León", "Con tus palabras"],
              ].map(([n, d]) => (
                <li key={n} className="flex min-h-12 items-center justify-between">
                  <span className="font-semibold">{n}</span>
                  <span className="chico">{d}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}

/* ---------- 4. Auxi Vida: Hoy ---------- */
function VidaHoy({ celular }: { celular: boolean }) {
  const [oculto, setOculto] = useState(false);
  const m = (v: string) => (oculto ? "S/ •••" : v);
  return (
    <AppShell celular={celular} producto="Auxi Vida" color="#0E5B57" items={["Hoy", "Movimientos", "Registrar", "Metas", "Protégete"].map((n, i) => ({ nombre: n, activo: i === 0 }))} inferior={["Hoy", "Movim.", "Registrar", "Metas", "Protégete"]}>
      <Encabezado
        titulo="Hoy"
        detalle="Domingo 23 de noviembre"
        accion={
          <button type="button" aria-pressed={oculto} onClick={() => setOculto(!oculto)} className="btn btn-s min-h-11 text-[color:var(--teal)]">
            {oculto ? "Mostrar montos" : "Ocultar montos"}
          </button>
        }
      />
      <div className="mt-6 grid gap-6 @4xl:grid-cols-12">
        <section className="rounded-[20px] bg-[color:var(--teal)] p-6 text-white @4xl:col-span-7" aria-labelledby="disp">
          <h2 id="disp" className="font-semibold opacity-90">
            Disponible estimado para hoy
          </h2>
          <p className="num mt-1 text-[48px] leading-[52px] font-bold">{m("S/ 31")}</p>
          <p className="text-[14px] opacity-80">Es un estimado con lo que registras, no el saldo de tu banco.</p>
          <dl className="num mt-5 grid grid-cols-3 gap-3 border-t border-white/20 pt-4 text-[14px]">
            {[
              ["Día normal", m("S/ 27")],
              ["Sobró ayer", m("+ S/ 4")],
              ["Gastaste hoy", m("S/ 0")],
            ].map(([a, b]) => (
              <div key={a}>
                <dt className="opacity-75">{a}</dt>
                <dd className="font-bold">{b}</dd>
              </div>
            ))}
          </dl>
          <a href="#r" className="btn mt-5 bg-white text-[color:var(--teal)]">
            Registrar
          </a>
        </section>
        <aside className="flex flex-col gap-4 @4xl:col-span-5">
          <div className="caja p-5">
            <p className="chico">Próximo pago</p>
            <p className="mt-1 font-bold">Internet vence mañana</p>
            <p className="num chico">{m("S/ 60")}</p>
          </div>
          <div className="caja p-5">
            <p className="chico">Meta activa</p>
            <p className="mt-1 font-bold">Colchón</p>
            <div className="rail mt-3" aria-hidden="true">
              <span style={{ width: "20%", background: "#C98A1C" }} />
            </div>
            <p className="num chico mt-2">{m("S/ 60 de S/ 300")} · 20 %</p>
          </div>
        </aside>
        <section className="caja p-5 @4xl:col-span-12" aria-labelledby="ult">
          <div className="flex items-center justify-between">
            <h2 id="ult" className="h3">
              Últimos movimientos
            </h2>
            <a href="#mov" className="min-h-11 content-center font-semibold text-[color:var(--teal)]">
              Ver todos
            </a>
          </div>
          <table className="num mt-3 w-full text-left text-[15px]">
            <thead className="chico">
              <tr>
                <th className="py-2 font-semibold">Movimiento</th>
                {!celular && <th className="py-2 font-semibold">Categoría</th>}
                <th className="py-2 text-right font-semibold">Monto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[color:var(--linea)]">
              {[
                ["Menú", "Comida", "− S/ 12"],
                ["Pasaje", "Transporte", "− S/ 3"],
                ["Turno", "Trabajo", "+ S/ 75"],
              ].map(([a, b, c]) => (
                <tr key={a} className="h-12">
                  <td className="font-semibold">{a}</td>
                  {!celular && <td className="text-[color:var(--gris)]">{b}</td>}
                  <td className="text-right font-semibold">{m(c)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        <div className="flex flex-wrap gap-x-6 gap-y-1 @4xl:col-span-12">
          <a href="#imp" className="inline-flex min-h-11 items-center font-semibold text-[color:var(--teal)] underline">
            Importar movimientos
          </a>
          <a href="#pro" className="inline-flex min-h-11 items-center font-semibold text-[color:var(--teal)] underline">
            ¿Vas a pagar? Revísalo antes
          </a>
        </div>
      </div>
    </AppShell>
  );
}

/* ---------- 5. Sistema ---------- */
function Sistema() {
  const colores = [
    ["Fondo", "#F5F6FA", "Neutro claro, nunca crema"],
    ["Tinta", "#141A4D", "Texto principal · 15:1"],
    ["Gris", "#5B6084", "Texto secundario · 5,5:1"],
    ["Línea", "#DDE0EE", "Bordes de 1 px"],
    ["Cobalto", "#2430D9", "Acciones y Auxi Student · blanco 8,4:1"],
    ["Teal", "#0E5B57", "Auxi Vida · blanco 7,9:1"],
    ["Oro", "#F2B341", "Solo premios y ahorro"],
  ];
  return (
    <div className="mx-auto max-w-[1000px] px-4 py-10 @4xl:px-8">
      <h1 className="h2">Sistema de diseño: dirección</h1>
      <h2 className="h3 mt-8">Color</h2>
      <div className="mt-3 grid gap-3 @2xl:grid-cols-4">
        {colores.map(([n, h, d]) => (
          <div key={n} className="caja overflow-hidden">
            <div className="h-14" style={{ background: h }} />
            <div className="p-3">
              <p className="font-bold">
                {n} <span className="num font-medium text-[color:var(--gris)]">{h}</span>
              </p>
              <p className="chico">{d}</p>
            </div>
          </div>
        ))}
      </div>
      <h2 className="h3 mt-10">Tipografía</h2>
      <div className="caja mt-3 flex flex-col gap-4 p-6">
        <p className="h1">Título 56/60 · 700</p>
        <p className="h2">Sección 36/42 · 700</p>
        <p className="h3">Bloque 20/26 · 600</p>
        <p>Texto 16/24 · 500 (Figtree, plataforma y paneles)</p>
        <p className="chico">Ayuda 14/20 · 500</p>
        <p className="num text-[32px] font-bold">S/ 1 234,50 · números tabulares</p>
        <p style={{ fontFamily: "Nunito", fontWeight: 900, fontSize: 22 }}>Nunito se queda en lecciones, León y celebraciones.</p>
      </div>
      <h2 className="h3 mt-10">Botones y estados</h2>
      <div className="mt-3 flex flex-wrap gap-3">
        <span className="btn btn-p">Principal</span>
        <span className="btn btn-s">Secundario</span>
        <span className="btn btn-t">Auxi Vida</span>
        <span className="btn bg-[color:var(--lila)] text-[color:var(--gris)]" aria-disabled="true">
          Deshabilitado
        </span>
      </div>
      <h2 className="h3 mt-10">Movimiento</h2>
      <ul className="chico mt-3 flex list-disc flex-col gap-1 pl-5 text-[15px]">
        <li>Plataforma y paneles: 120–220 ms, solo como respuesta a una acción. Sin cinta, parallax ni órbita girando.</li>
        <li>El contenido se ve desde el primer momento; nada aparece desde transparente al hacer scroll.</li>
        <li>Student conserva sus animaciones de aprendizaje y celebración; Vida, solo las que informan (el número que cambia).</li>
        <li>Movimiento reducido y silencio se respetan siempre.</li>
      </ul>
    </div>
  );
}

/* ---------- Marco de la propuesta ---------- */
export default function Propuesta() {
  const [vista, setVista] = useState<Vista>("landing");
  const [ancho, setAncho] = useState<Ancho>("computadora");
  const [nuevo, setNuevo] = useState(false);
  const zona = useRef<HTMLDivElement>(null);
  const [escala, setEscala] = useState(1);
  const px = ancho === "celular" ? 390 : 1280;

  useEffect(() => {
    document.title = "Propuesta visual P1A · Auxi Studio";
    const medir = () => setEscala(Math.min(1, ((zona.current?.clientWidth ?? px) - 32) / px));
    medir();
    window.addEventListener("resize", medir);
    return () => window.removeEventListener("resize", medir);
  }, [px]);

  const pestanas: [Vista, string][] = [
    ["landing", "Landing"],
    ["espacio", "Mi espacio"],
    ["student", "Auxi Student"],
    ["vida", "Auxi Vida"],
    ["sistema", "Sistema"],
  ];
  const celular = ancho === "celular";

  return (
    <div className="min-h-dvh bg-[#E4E6EF]" style={{ fontFamily: "Figtree, system-ui, sans-serif" }}>
      <style>{ESTILOS}</style>
      <div className="sticky top-0 z-30 flex flex-wrap items-center gap-2 border-b border-[#C9CDE0] bg-white px-4 py-2 text-[14px] font-semibold text-[#141A4D]">
        <span className="mr-2">Propuesta P1A · boceto</span>
        <div role="tablist" className="flex flex-wrap gap-1">
          {pestanas.map(([id, n]) => (
            <button key={id} role="tab" aria-selected={vista === id} onClick={() => setVista(id)} className={`min-h-10 rounded-[8px] px-3 ${vista === id ? "bg-[#141A4D] text-white" : "hover:bg-[#ECEEFB]"}`}>
              {n}
            </button>
          ))}
        </div>
        <div className="ml-auto flex gap-1" role="radiogroup" aria-label="Tamaño">
          {(["celular", "computadora"] as Ancho[]).map((a) => (
            <button key={a} role="radio" aria-checked={ancho === a} onClick={() => setAncho(a)} className={`min-h-10 rounded-[8px] px-3 ${ancho === a ? "bg-[#2430D9] text-white" : "hover:bg-[#ECEEFB]"}`}>
              {a === "celular" ? "Celular 390" : "Computadora 1280"}
            </button>
          ))}
        </div>
        {vista === "student" && (
          <label className="flex min-h-10 items-center gap-2 px-2">
            <input type="checkbox" checked={nuevo} onChange={(e) => setNuevo(e.target.checked)} />
            Cuenta nueva
          </label>
        )}
      </div>
      <div ref={zona} className="overflow-x-hidden p-4">
        <div className="mx-auto" style={{ width: px * escala }}>
          <div className="pp @container overflow-clip rounded-[12px] shadow-[0_10px_30px_rgba(20,26,77,.15)]" style={{ width: px, zoom: escala }}>
            {vista === "landing" && <Landing celular={celular} />}
            {vista === "espacio" && <MiEspacio celular={celular} />}
            {vista === "student" && <StudentInicio celular={celular} nuevo={nuevo} />}
            {vista === "vida" && <VidaHoy celular={celular} />}
            {vista === "sistema" && <Sistema />}
          </div>
        </div>
      </div>
    </div>
  );
}
