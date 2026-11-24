/**
 * PROPUESTA VISUAL v4 (solo en desarrollo: /propuesta). Bocetos navegables para aprobar la dirección
 * antes del cambio grande: landing (src/propuesta/Landing.tsx), Mi espacio y el inicio de cada app,
 * con modo claro y oscuro. No es la app real: datos de ejemplo.
 */
import "@fontsource/figtree/latin-500.css";
import "@fontsource/figtree/latin-600.css";
import "@fontsource/figtree/latin-700.css";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Banner, type Tono } from "../components/Banner";
import { IconoApp, type AppConIcono } from "../components/IconoApp";
import { Leon } from "../components/Leon";
import { Llama, Moneda } from "../components/Navegacion";
import { sonidos } from "../lib/sonidos";
import { Barra, BotonTema, Candado, Check, Contador, ESTILOS, Marca, NUNITO, TemaContexto, type Tema } from "../propuesta/comun";
import { Landing } from "../propuesta/Landing";
import { PanelMotion } from "../propuesta/motion/Motion";
import { CaraLeonVida, LeonVida } from "../vida/ui";

type Vista = "landing" | "motion" | "espacio" | "student" | "vida" | "sistema";
type Ancho = "celular" | "computadora";

/* ---------- AppShell compartido (Mi espacio, Student, Vida) ---------- */
type Item = { nombre: string; activo?: boolean; app?: AppConIcono };
/** Ícono del producto actual: el de la app o el símbolo de Auxi Studio (Mi espacio). */
function IconoProducto({ app, tamano = 26 }: { app?: AppConIcono; tamano?: number }) {
  return app ? <IconoApp app={app} tamano={tamano} decorativo /> : <img src="/marca/simbolo.webp" alt="" width={tamano} height={tamano} draggable={false} />;
}

function AppShell({ celular, producto, app, color, colorTexto, items, children, inferior, fondo = "var(--bg)", flotante = false }: { celular: boolean; producto: string; app?: AppConIcono; color: string; colorTexto?: string; items: Item[]; children: ReactNode; inferior?: string[]; fondo?: string; flotante?: boolean }) {
  const tinta = colorTexto ?? color;
  if (celular)
    return (
      <div className="flex min-h-[844px] flex-col" style={{ background: fondo }}>
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-[color:var(--linea)] px-4" style={{ background: fondo }}>
          <button type="button" className="flex min-h-11 items-center gap-2 rounded-[10px] px-1 font-black" style={{ fontFamily: NUNITO }} aria-label={`Cambiar de app. Ahora: ${producto}`}>
            <IconoProducto app={app} />
            {producto}
            <svg viewBox="0 0 20 20" className="size-4" aria-hidden="true">
              <path d="M5 8l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          <span className="flex items-center gap-1">
            <BotonTema />
            <span className="grid size-10 place-items-center rounded-full bg-[color:var(--lila)] text-[14px] font-bold" aria-label="Tu cuenta">
              DC
            </span>
          </span>
        </header>
        <div className="flex-1 px-4 pt-5 pb-8">{children}</div>
        {inferior && !flotante && (
          <nav aria-label={`Secciones de ${producto}`} className="sticky bottom-0 grid grid-cols-5 border-t border-[color:var(--linea)] bg-white px-1 pt-1 pb-3">
            {inferior.map((x, i) => (
              <span key={x} className={`flex min-h-12 flex-col items-center justify-center gap-1 text-[11px] font-bold ${i === 0 ? "" : "text-[color:var(--gris)]"}`} style={i === 0 ? { color } : undefined}>
                <span className="size-6 rounded-[8px]" style={{ background: i === 0 ? color : "#DDE0EE" }} aria-hidden="true" />
                {x}
              </span>
            ))}
          </nav>
        )}
        {inferior && flotante && (
          <nav aria-label={`Secciones de ${producto}`} className="sticky bottom-3 mx-3 grid grid-cols-5 items-end rounded-[26px] bg-white px-1 pt-1 pb-2 shadow-[0_8px_24px_rgba(14,91,87,.18)]">
            {inferior.map((x, i) =>
              i === 2 ? (
                <span key={x} className="flex flex-col items-center gap-1 text-[11px] font-bold" style={{ color }}>
                  <span className="-mt-6 grid size-14 place-items-center rounded-full text-[30px] leading-none font-black text-white shadow-[0_4px_0_#07403D]" style={{ background: color }} aria-hidden="true">
                    +
                  </span>
                  {x}
                </span>
              ) : (
                <span key={x} className={`flex min-h-12 flex-col items-center justify-center gap-1 text-[11px] font-bold ${i === 0 ? "" : "text-[color:var(--gris)]"}`} style={i === 0 ? { color } : undefined}>
                  <span className="size-6 rounded-full" style={{ background: i === 0 ? color : "#D5E4E1" }} aria-hidden="true" />
                  {x}
                </span>
              ),
            )}
          </nav>
        )}
      </div>
    );
  return (
    <div className="grid min-h-[820px] grid-cols-[248px_1fr]" style={{ background: fondo }}>
      <aside className="flex flex-col gap-1 border-r border-[color:var(--linea)] bg-white p-4">
        <div className="px-2 pt-1 pb-4">
          <Marca chica />
        </div>
        <button type="button" className="mb-3 flex min-h-11 items-center justify-between rounded-[12px] border border-[color:var(--linea)] px-3 font-black" style={{ fontFamily: NUNITO }}>
          <span className="flex items-center gap-2">
            <IconoProducto app={app} />
            {producto}
          </span>
          <svg viewBox="0 0 20 20" className="size-4" aria-hidden="true">
            <path d="M5 8l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
        {items.map((it) => (
          <span key={it.nombre} className={`flex min-h-11 items-center gap-2.5 rounded-[12px] px-3 font-bold ${it.activo ? "bg-[color:var(--lila)]" : "text-[color:var(--gris)]"}`} style={it.activo ? { color: tinta } : undefined}>
            {it.app && <IconoApp app={it.app} tamano={22} decorativo />}
            {it.nombre}
          </span>
        ))}
        <div className="mt-auto flex flex-col gap-1 border-t border-[color:var(--linea)] pt-3 text-[color:var(--gris)]">
          <span className="flex items-center justify-between pr-1">
            <span className="flex min-h-10 items-center px-3 font-semibold">Ajustes</span>
            <BotonTema />
          </span>
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

function Stat({ children, etiqueta }: { children: ReactNode; etiqueta: string }) {
  return (
    <span className="flex min-h-10 items-center gap-1.5 rounded-full border border-[color:var(--linea)] bg-white px-3 text-[16px] font-black" style={{ fontFamily: NUNITO }} aria-label={etiqueta}>
      {children}
    </span>
  );
}

/* ---------- 2. Mi espacio ---------- */
function MiEspacio({ celular }: { celular: boolean }) {
  return (
    <AppShell celular={celular} producto="Mi espacio" color="#141A4D" colorTexto="var(--tinta)" items={[{ nombre: "Mi espacio", activo: true }, { nombre: "Auxi Student", app: "student" }, { nombre: "Auxi Vida", app: "vida" }, { nombre: "Vendoe (sitio aparte)", app: "vendoe" }]}>
      <Banner key={celular ? "m" : "c"} nombre={celular ? "espacio-movil" : "espacio"} tono="hero" modo="contenido" velo={celular ? "izquierda" : "ninguno"} parallax={false}>
        <div className="flex items-center gap-2 p-5 text-white @4xl:py-7 @4xl:pr-10 @4xl:pl-[33%]">
          <div className="flex-1">
            <p className="text-[15px] text-white/85">Domingo 23 de noviembre</p>
            <h1 className="h2 mt-1">Hola, Daniel</h1>
            <p className="mt-1 text-white/90">¿Qué hacemos hoy?</p>
            <div className="mt-4 flex flex-wrap gap-2 text-[color:var(--tinta)]">
              <Stat etiqueta="Racha de 4 días">
                <Llama activa className="size-5" />4 días
              </Stat>
              <Stat etiqueta="120 monedas">
                <Moneda className="size-5" />
                <Contador valor={120} />
              </Stat>
            </div>
          </div>
          <Leon pose="saluda" alto={celular ? 130 : 170} rebote />
        </div>
      </Banner>

      <section className="mt-8" aria-labelledby="continua">
        <h2 id="continua" className="h3">
          Continúa donde te quedaste
        </h2>
        <div className="mt-4 grid gap-4 @4xl:grid-cols-2">
          <div className="caja flex gap-4 p-3">
            <Banner nombre="app-student" tono="student" velo="ninguno" parallax={false} className="w-24 shrink-0 self-stretch @4xl:w-32" />
            <div className="flex-1 py-1 pr-1">
              <p className="flex items-center gap-2 text-[14px] font-bold text-[color:var(--cobalto)]">
                <IconoApp app="student" tamano={20} decorativo />
                Auxi Student
              </p>
              <p className="mt-0.5 text-[18px] leading-[24px] font-black" style={{ fontFamily: NUNITO }}>
                Fracciones equivalentes
              </p>
              <p className="chico">Lección 3 de 6 · 5 preguntas por repasar</p>
              <div className="mt-2">
                <Barra pct={50} />
              </div>
              <a className="btn btn-p mt-3 min-h-11 px-4 text-[15px]" href="#c">
                Continuar
              </a>
            </div>
          </div>
          <div className="caja flex gap-4 p-3">
            <Banner nombre="app-vida" tono="vida" velo="ninguno" parallax={false} className="w-24 shrink-0 self-stretch @4xl:w-32" />
            <div className="flex-1 py-1 pr-1">
              <p className="flex items-center gap-2 text-[14px] font-bold text-[color:var(--teal-texto)]">
                <IconoApp app="vida" tamano={20} decorativo />
                Auxi Vida
              </p>
              <p className="mt-0.5 text-[18px] leading-[24px] font-black" style={{ fontFamily: NUNITO }}>
                Tu día en Vida
              </p>
              <p className="chico">Por privacidad, los montos no se muestran aquí.</p>
              <a className="btn btn-t mt-3 min-h-11 px-4 text-[15px]" href="#v">
                Abrir Hoy
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-10" aria-labelledby="apps">
        <h2 id="apps" className="h3">
          Todas las apps de Auxi Studio
        </h2>
        <ul className="mt-4 grid grid-cols-2 gap-4 @4xl:grid-cols-4">
          {(
            [
              ["app-student", "student", "student", "Auxi Student", "Estudia jugando"],
              ["app-vida", "vida", "vida", "Auxi Vida", "Tu plata del día"],
              ["app-vendoe", "vendoe", "vendoe", "Vendoe", "Para negocios · sitio aparte"],
            ] as [string, Tono, AppConIcono, string, string][]
          ).map(([img, tono, app, n, d]) => (
            <motion.li key={n} whileHover={{ y: -5 }} whileTap={{ scale: 0.97 }} className="cursor-pointer">
              <Banner nombre={img} tono={tono} velo="fuerte" parallax={false} className="aspect-square">
                <div className="flex h-full flex-col justify-between p-4 text-white">
                  <IconoApp app={app} tamano={34} decorativo />
                  <span>
                  <span className="text-[19px] leading-[22px] font-black" style={{ fontFamily: NUNITO }}>
                    {n}
                  </span>
                  <span className="block text-[13px] text-white/85">{d}</span>
                  </span>
                </div>
              </Banner>
            </motion.li>
          ))}
          <li>
            <Banner nombre="proximamente" tono="vendoe" velo="fuerte" parallax={false} className="aspect-square">
              <div className="flex h-full flex-col justify-end p-4 text-white">
                <span className="flex items-center gap-1.5 text-[19px] leading-[22px] font-black" style={{ fontFamily: NUNITO }}>
                  <Candado className="size-4" />
                  Próximamente
                </span>
                <span className="text-[13px] text-white/85">En el estudio</span>
              </div>
            </Banner>
          </li>
        </ul>
      </section>
    </AppShell>
  );
}

/* ---------- 3. Auxi Student: inicio ---------- */
function Camino() {
  const quieto = !!useReducedMotion();
  return (
    <div className="mt-5 flex items-center" aria-label="Camino del tema: lección 3 de 6">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <span key={i} className="flex flex-1 items-center last:flex-none">
          <motion.span
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 22, delay: 0.1 + i * 0.06 }}
            className={`relative grid size-9 shrink-0 place-items-center rounded-full text-[15px] font-black ${i < 2 ? "bg-[color:var(--oro)] text-[color:var(--tinta)] shadow-[0_3px_0_#C98A1C]" : i === 2 ? "bg-white text-[color:var(--cobalto)] shadow-[0_3px_0_#B9BEDD]" : "bg-white/20 text-white/70"}`}
            style={{ fontFamily: NUNITO }}
          >
            {i < 2 ? <Check color="#141A4D" className="size-5" /> : i + 1}
            {i === 2 && !quieto && <motion.span className="absolute inset-0 rounded-full ring-4 ring-white/70" animate={{ scale: [1, 1.45], opacity: [0.8, 0] }} transition={{ duration: 1.6, repeat: Infinity }} aria-hidden="true" />}
          </motion.span>
          {i < 5 && <span className={`mx-1 h-1 flex-1 rounded-full ${i < 2 ? "bg-[color:var(--oro)]" : "bg-white/20"}`} aria-hidden="true" />}
        </span>
      ))}
    </div>
  );
}

function StudentInicio({ celular, nuevo }: { celular: boolean; nuevo: boolean }) {
  const items = ["Inicio", "Cursos", "Camino", "Métodos", "Entregas"].map((n, i) => ({ nombre: n, activo: i === 0 }));
  const principal = nuevo ? (
    <div className="caja relative overflow-hidden p-6">
      <div className="flex items-start gap-4">
        <Leon pose="saluda" alto={celular ? 110 : 140} rebote className="shrink-0" />
        <div className="relative mt-2 rounded-[18px] bg-[color:var(--lila)] p-4">
          <p className="disp text-[19px] leading-[25px] font-black">¡Hola! Soy León.</p>
          <p className="mt-1 text-[15px] leading-[21px]">Empecemos con tu primer tema. Toma unos 5 minutos.</p>
        </div>
      </div>
      <ol className="mt-5 grid gap-3 @2xl:grid-cols-3">
        {["Copia el pedido de Auxi", "Pégalo en tu IA con tu PDF o apuntes", "Pega aquí la respuesta y revísala"].map((p, i) => (
          <li key={p} className="flex gap-3 rounded-[14px] bg-[color:var(--bg)] p-3 text-[15px] leading-[21px]">
            <span className="num grid size-7 shrink-0 place-items-center rounded-full bg-[color:var(--boton)] text-[14px] font-black text-white" style={{ fontFamily: NUNITO }}>
              {i + 1}
            </span>
            {p}
          </li>
        ))}
      </ol>
      <a className="btn btn-p mt-5 w-full @2xl:w-auto" href="#crear">
        Crear mi primer tema
      </a>
    </div>
  ) : (
    <div className="relative overflow-hidden rounded-[24px] bg-[color:var(--boton)] p-6 text-white shadow-[0_6px_0_#1A23A6]">
      <div className={celular ? "pr-[92px]" : "pr-[200px]"}>
        <p className="text-[14px] font-semibold text-white/80">Matemática · Fracciones</p>
        <h2 className="h3 mt-1 text-[24px] leading-[30px]">Fracciones equivalentes</h2>
        <p className="text-[15px] text-white/80">Lección 3 de 6 · unos 4 minutos</p>
      </div>
      <Leon pose="concentrado" alto={celular ? 104 : 190} rebote className={`absolute ${celular ? "top-3 right-2" : "right-6 bottom-0"}`} />
      <div className={celular ? "" : "pr-[200px]"}>
        <Camino />
        <div className="mt-6 flex flex-wrap gap-3">
          <a className="btn btn-b" href="#c">
            Continuar
          </a>
          <a className="btn btn-f" href="#r">
            Repasar 5 preguntas
          </a>
        </div>
      </div>
    </div>
  );
  return (
    <AppShell celular={celular} producto="Auxi Student" app="student" color="#2430D9" colorTexto="var(--cobalto)" items={items} inferior={["Inicio", "Cursos", "Camino", "Métodos", "Entregas"]}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="h2">¿Qué estudiamos hoy?</h1>
          <p className="chico mt-1 text-[15px]">{nuevo ? "Empieza con un tema. Lo demás aparece cuando lo necesites." : "Meta de hoy: 1 de 2 lecciones"}</p>
        </div>
        {!nuevo && (
          <div className="flex gap-2">
            <Stat etiqueta="Racha de 4 días">
              <Llama activa className="size-5" />4
            </Stat>
            <Stat etiqueta="120 monedas">
              <Moneda className="size-5" />
              <Contador valor={120} />
            </Stat>
          </div>
        )}
      </div>
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
                {(
                  [
                    ["Matemática", "Fracciones", 33],
                    ["Comunicación", "Textos argumentativos", 60],
                    ["Historia", "Independencia", 10],
                  ] as [string, string, number][]
                ).map(([c, t, p]) => (
                  <li key={c} className="grid min-h-16 grid-cols-[1fr_110px] items-center gap-4 @2xl:grid-cols-[1fr_200px]">
                    <span>
                      <span className="block font-bold">{c}</span>
                      <span className="chico">
                        {t} · <span className="num">{p} %</span>
                      </span>
                    </span>
                    <Barra pct={p} />
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
        <aside className="flex flex-col gap-4 @4xl:col-span-4" aria-label="Tu semana">
          {!nuevo && (
            <div className="rounded-[20px] bg-[#FFF6E2] p-5 ring-1 ring-[#F2D9A2]">
              <p className="disp flex items-center gap-2 text-[18px] font-black">
                <Moneda className="size-6" />
                Cofre del día
              </p>
              <p className="mt-1 text-[15px] leading-[21px]">Termina 1 lección y ábrelo.</p>
              <a href="#prob" className="mt-1 inline-flex min-h-11 items-center font-semibold text-[#8A5A08] underline">
                Ver probabilidades
              </a>
            </div>
          )}
          <div className="caja p-5">
            <p className="chico">Próximo examen</p>
            <p className="mt-1 font-bold">{nuevo ? "Aún no tienes exámenes" : "Matemática · viernes 28 nov"}</p>
            <a href="#examen" className="mt-1 inline-flex min-h-11 items-center font-semibold text-[color:var(--cobalto)]">
              {nuevo ? "Agregar examen" : "Ver plan de repaso"}
            </a>
          </div>
          <div className="caja p-5">
            <p className="chico">Esta semana</p>
            <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[12px] font-bold">
              {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => (
                <span key={i} className="flex flex-col items-center gap-1">
                  <motion.span
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 20, delay: 0.2 + i * 0.05 }}
                    className={`grid size-8 place-items-center rounded-full ${!nuevo && i < 4 ? "bg-[color:var(--oro)]" : "bg-[color:var(--lila)]"}`}
                    aria-hidden="true"
                  >
                    {!nuevo && i < 4 && <Llama activa className="size-4" />}
                  </motion.span>
                  {d}
                </span>
              ))}
            </div>
          </div>
          <div className="caja p-5">
            <p className="chico">Métodos</p>
            <ul className="mt-2">
              {[
                ["El tomate", "25 min de foco", "#C2412D"],
                ["Las 5 cajas", "Repaso espaciado", "#F2B341"],
                ["Explícaselo a León", "Con tus palabras", "#2430D9"],
              ].map(([n, d, c]) => (
                <li key={n} className="flex min-h-12 items-center gap-3">
                  <span className="size-3 rounded-full" style={{ background: c }} aria-hidden="true" />
                  <span className="flex-1 font-bold">{n}</span>
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
    <AppShell
      celular={celular}
      producto="Auxi Vida"
      app="vida"
      colorTexto="var(--teal-texto)"
      color="#0E5B57"
      fondo="var(--menta)"
      flotante
      items={["Hoy", "Movimientos", "Registrar", "Metas", "Protégete"].map((n, i) => ({ nombre: n, activo: i === 0 }))}
      inferior={["Hoy", "Movim.", "Registrar", "Metas", "Protégete"]}
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="h2">Hoy</h1>
          <p className="chico mt-1 text-[15px]">Domingo 23 de noviembre</p>
        </div>
        <button type="button" aria-pressed={oculto} onClick={() => setOculto(!oculto)} className="btn btn-s min-h-11 border-[color:var(--menta-2)] px-4 text-[15px] text-[color:var(--teal)]">
          {oculto ? "Mostrar montos" : "Ocultar montos"}
        </button>
      </div>
      <div className="mt-6 grid gap-6 @4xl:grid-cols-12">
        <section className="relative overflow-hidden rounded-[28px] bg-[color:var(--teal)] p-6 text-white shadow-[0_6px_0_#07403D] @4xl:col-span-7" aria-labelledby="disp">
          <LeonVida pose="saluda" alto={celular ? 110 : 170} rebote className={`absolute ${celular ? "top-2 right-1" : "right-4 bottom-0"}`} />
          <div className={celular ? "pr-[96px]" : "pr-[170px]"}>
            <h2 id="disp" className="font-semibold text-white/90" style={{ fontFamily: "Figtree, sans-serif", letterSpacing: 0 }}>
              Disponible estimado para hoy
            </h2>
            <p className="mt-1 text-[52px] leading-[56px] font-black" style={{ fontFamily: NUNITO }}>
              {oculto ? "S/ •••" : <Contador valor={31} prefijo="S/ " />}
            </p>
            <p className="text-[14px] text-white/80">Es un estimado con lo que registras, no el saldo de tu banco.</p>
          </div>
          <dl className={`num mt-5 grid grid-cols-3 gap-3 border-t border-white/20 pt-4 text-[14px] ${celular ? "" : "mr-[170px]"}`}>
            {[
              ["Día normal", m("S/ 27")],
              ["Sobró ayer", m("+ S/ 4")],
              ["Gastaste hoy", m("S/ 0")],
            ].map(([a, b]) => (
              <div key={a}>
                <dt className="text-white/75">{a}</dt>
                <dd className="font-bold">{b}</dd>
              </div>
            ))}
          </dl>
          {!celular && (
            <a href="#r" className="btn btn-bt mt-5">
              Registrar
            </a>
          )}
        </section>
        <aside className="flex flex-col gap-4 @4xl:col-span-5">
          <div className="flex items-start gap-3 rounded-[20px] bg-white p-4 ring-1 ring-[color:var(--menta-2)]">
            <CaraLeonVida cara="feliz" tamano={44} />
            <p className="text-[15px] leading-[21px]">
              <span className="font-bold">Vas bien.</span> Ayer te sobraron {m("S/ 4")} y se suman a hoy.
            </p>
          </div>
          <div className="rounded-[20px] bg-white p-5 ring-1 ring-[color:var(--menta-2)]">
            <p className="chico">Próximo pago</p>
            <p className="mt-1 font-bold">Internet vence mañana</p>
            <p className="num chico">{m("S/ 60")}</p>
          </div>
          <div className="rounded-[20px] bg-white p-5 ring-1 ring-[color:var(--menta-2)]">
            <p className="chico">Meta activa</p>
            <p className="mt-1 font-bold">Colchón</p>
            <div className="mt-3">
              <Barra pct={20} color="var(--oro)" fondo="var(--menta-2)" />
            </div>
            <p className="num chico mt-2">{m("S/ 60 de S/ 300")} · 20 %</p>
          </div>
        </aside>
        <section className="rounded-[20px] bg-white p-5 ring-1 ring-[color:var(--menta-2)] @4xl:col-span-12" aria-labelledby="ult">
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
            <tbody className="divide-y divide-[color:var(--menta-2)]">
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
    ["Espacio", "#0A0E2A", "Escenario de marca: héroe, ecosistema y cierre (igual en ambos temas)"],
    ["Fondo claro / oscuro", "#F5F6FB · #080B22", "Lienzo de las secciones de contenido"],
    ["Tinta", "#141A4D · #EEF0FF", "Texto principal ≥ 14:1 en ambos temas"],
    ["Gris", "#555B82 · #A6ACD8", "Texto secundario ≥ 6:1 en ambos temas"],
    ["Cobalto", "#2430D9", "Acciones y Auxi Student · blanco 8,4:1"],
    ["Teal", "#0E5B57", "Auxi Vida · blanco 7,9:1"],
    ["Turquesa", "#5FE3DC", "Aciertos y progreso, con texto oscuro"],
    ["Oro", "#F2B341", "Solo premios: monedas, racha, cofre, metas"],
    ["Índigo", "#4A4EDB", "Vendoe y lo que viene"],
  ];
  return (
    <div className="mx-auto max-w-[1000px] px-4 py-10 @4xl:px-8">
      <h1 className="h2">Sistema v4: un ecosistema en órbita</h1>
      <p className="cuerpo-l mt-3 max-w-[60ch]">Escenarios de «espacio» para la marca, una sección con color propio para cada app, el símbolo de la A con su órbita, íconos de cada app y León presente. Modo claro y oscuro.</p>
      <h2 className="h3 mt-8">Íconos de las apps</h2>
      <div className="mt-3 flex flex-wrap gap-6">
        {(
          [
            ["student", "Auxi Student", "Birrete con borla dorada y la órbita de Auxi: aprender"],
            ["vida", "Auxi Vida", "Moneda «S/» con brote: tu plata que crece"],
            ["vendoe", "Vendoe", "Bolsa de compras: vender"],
          ] as [AppConIcono, string, string][]
        ).map(([a, n, d]) => (
          <div key={a} className="flex max-w-[260px] items-center gap-3">
            <IconoApp app={a} tamano={112} />
            <span>
              <span className="block font-bold">{n}</span>
              <span className="chico">{d}</span>
            </span>
          </div>
        ))}
      </div>
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
        <p className="h1">Títulos en Nunito 900</p>
        <p className="h3">Bloques en Nunito 800</p>
        <p>Texto, tablas y datos en Figtree 500: se lee mejor en párrafos y montos.</p>
        <p className="chico">Ayuda 14/20 · Figtree 500</p>
        <p className="num text-[32px] font-black" style={{ fontFamily: NUNITO }}>
          S/ 1 234,50 · números tabulares
        </p>
      </div>
      <h2 className="h3 mt-10">Botones que se hunden (tócalos)</h2>
      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" className="btn btn-p" onClick={() => sonidos.toque()}>
          Principal
        </button>
        <button type="button" className="btn btn-s" onClick={() => sonidos.toque()}>
          Secundario
        </button>
        <button type="button" className="btn btn-t" onClick={() => sonidos.toque()}>
          Auxi Vida
        </button>
        <button type="button" className="btn btn-oro" onClick={() => sonidos.cofre()}>
          Premio
        </button>
      </div>
      <h2 className="h3 mt-10">Movimiento</h2>
      <ul className="chico mt-3 flex list-disc flex-col gap-1 pl-5 text-[15px]">
        <li>Un momento orquestado al cargar la landing: León entra con rebote, la órbita aparece y los premios saltan uno tras otro.</li>
        <li>Movimiento continuo y lento solo en tres lugares: la órbita, la cinta y León flotando en el héroe.</li>
        <li>Todo lo demás responde a la persona: botones que se hunden, tarjetas que suben al pasar el mouse, aciertos con confeti y sonido.</li>
        <li>Números que cuentan y barras que se llenan con resorte. Con movimiento reducido, todo queda quieto.</li>
      </ul>
      <h2 className="h3 mt-10">León: dónde aparece</h2>
      <div className="mt-3 grid gap-3 @2xl:grid-cols-2">
        {[
          ["Landing", "A1 saluda en el héroe y A5 anima en el cierre; caras chicas en la prueba."],
          ["Mi espacio", "A1 saluda junto a tu nombre, tu racha y tus monedas."],
          ["Auxi Student", "A3 concentrado en «Continuar»; A1 saluda en la cuenta nueva."],
          ["Auxi Vida", "B1 saluda en el disponible y su cara (B8) para los consejos."],
        ].map(([t, d]) => (
          <div key={t} className="caja p-4">
            <p className="font-bold">{t}</p>
            <p className="chico mt-1">{d}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Marco de la propuesta ---------- */
export default function Propuesta() {
  const [vista, setVista] = useState<Vista>("landing");
  const [ancho, setAncho] = useState<Ancho>("computadora");
  const [nuevo, setNuevo] = useState(false);
  const [preferencia, setPreferencia] = useState<"sistema" | Tema>("sistema");
  const [sistemaOscuro, setSistemaOscuro] = useState(() => typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  const zona = useRef<HTMLDivElement>(null);
  const barra = useRef<HTMLDivElement>(null);
  const [escala, setEscala] = useState(1);
  const [altoBarra, setAltoBarra] = useState(56);
  const px = ancho === "celular" ? 390 : 1280;
  const tema: Tema = preferencia === "sistema" ? (sistemaOscuro ? "oscuro" : "claro") : preferencia;

  useEffect(() => {
    document.title = "Propuesta visual v5 · Auxi Studio";
    const medir = () => {
      setEscala(Math.min(1, ((zona.current?.clientWidth ?? px) - 32) / px));
      setAltoBarra(barra.current?.offsetHeight ?? 56);
    };
    medir();
    window.addEventListener("resize", medir);
    return () => window.removeEventListener("resize", medir);
  }, [px]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const cambio = () => setSistemaOscuro(mq.matches);
    mq.addEventListener("change", cambio);
    return () => mq.removeEventListener("change", cambio);
  }, []);

  const contexto = useMemo(() => ({ tema, alternar: () => setPreferencia(tema === "oscuro" ? "claro" : "oscuro") }), [tema]);

  const pestanas: [Vista, string][] = [
    ["landing", "Landing"],
    ["motion", "Motion"],
    ["espacio", "Mi espacio"],
    ["student", "Auxi Student"],
    ["vida", "Auxi Vida"],
    ["sistema", "Sistema"],
  ];
  const celular = ancho === "celular";
  const boton = (activo: boolean) => `min-h-10 rounded-[8px] px-3 ${activo ? "bg-[#141A4D] text-white" : "hover:bg-[#ECEEFB]"}`;

  return (
    <TemaContexto.Provider value={contexto}>
      <div className={`min-h-dvh ${tema === "oscuro" ? "bg-[#03051A]" : "bg-[#E4E6EF]"}`} style={{ fontFamily: "Figtree, system-ui, sans-serif" }}>
        <style>{ESTILOS}</style>
        <div ref={barra} className="sticky top-0 z-50 flex flex-wrap items-center gap-2 border-b border-[#C9CDE0] bg-white px-4 py-2 text-[14px] font-semibold text-[#141A4D]">
          <span className="mr-2">Propuesta v5 · boceto</span>
          <div role="tablist" className="flex flex-wrap gap-1">
            {pestanas.map(([id, n]) => (
              <button key={id} role="tab" aria-selected={vista === id} onClick={() => setVista(id)} className={boton(vista === id)}>
                {n}
              </button>
            ))}
          </div>
          <div className="ml-auto flex flex-wrap gap-1">
            <div className="flex gap-1" role="radiogroup" aria-label="Tema">
              {(["sistema", "claro", "oscuro"] as const).map((t) => (
                <button key={t} role="radio" aria-checked={preferencia === t} onClick={() => setPreferencia(t)} className={boton(preferencia === t)}>
                  {t === "sistema" ? "Sistema" : t === "claro" ? "Claro" : "Oscuro"}
                </button>
              ))}
            </div>
            <div className="flex gap-1" role="radiogroup" aria-label="Tamaño">
              {(["celular", "computadora"] as Ancho[]).map((a) => (
                <button key={a} role="radio" aria-checked={ancho === a} onClick={() => setAncho(a)} className={`min-h-10 rounded-[8px] px-3 ${ancho === a ? "bg-[#2430D9] text-white" : "hover:bg-[#ECEEFB]"}`}>
                  {a === "celular" ? "Celular 390" : "Computadora 1280"}
                </button>
              ))}
            </div>
          </div>
          {vista === "student" && (
            <label className="flex min-h-10 items-center gap-2 px-2">
              <input type="checkbox" checked={nuevo} onChange={(e) => setNuevo(e.target.checked)} />
              Cuenta nueva
            </label>
          )}
        </div>
        <div ref={zona} className="overflow-x-clip p-4">
          <div className="mx-auto" style={{ width: px * escala }}>
            {/* --tope: el encabezado fijo de la landing queda debajo de la barra de la propuesta (en la app real es 0). */}
            <div key={`${vista}-${ancho}-${nuevo}`} data-tema={tema} className="pp @container overflow-clip rounded-[12px] shadow-[0_10px_30px_rgba(20,26,77,.15)]" style={{ width: px, zoom: escala, ["--tope" as string]: `${altoBarra / escala}px` }}>
              {vista === "landing" && <Landing celular={celular} />}
              {vista === "motion" && <PanelMotion celular={celular} />}
              {vista === "espacio" && <MiEspacio celular={celular} />}
              {vista === "student" && <StudentInicio celular={celular} nuevo={nuevo} />}
              {vista === "vida" && <VidaHoy celular={celular} />}
              {vista === "sistema" && <Sistema />}
            </div>
          </div>
        </div>
      </div>
    </TemaContexto.Provider>
  );
}
