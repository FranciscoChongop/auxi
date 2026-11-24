import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Boton } from "../../components/Boton";
import { Ventana } from "../../components/Ventana";
import { bonita, hoy } from "../../lib/fechas";
import { entradaEnCascada } from "../../lib/movimiento";
import { metricas } from "../../lib/metricas";
import { navegar, parametro, reemplazar } from "../../lib/rutas";
import { sonidos } from "../../lib/sonidos";
import { vibrar } from "../../lib/vibrar";
import { actualizarVida, nuevoId, obtenerVida, useVida, type Caso } from "../estado";
import { analizar, INCIDENTES, ocultarSensibles, preguntasDe, textoParaCompartir, TIPOS, type Analisis, type TipoCaso } from "../protege";
import { avisoDeshacer, Cabecera, Chip, campoTexto, Encabezado, GrupoUnico, LeonVida, Pagina, PieFijo } from "../ui";

export default function Protegete() {
  const tipo = parametro("tipo") as TipoCaso | null;
  const caso = parametro("caso");
  if (parametro("urgente") === "1") return <Urgente />;
  if (caso) return <Asistente casoId={caso} />;
  if (tipo && TIPOS.some((t) => t.id === tipo)) return <Asistente tipoInicial={tipo} />;
  return <Centro />;
}

/* ---------- Centro: ¿Qué quieres revisar? ---------- */

function Centro() {
  const e = useVida();
  const [borrarTodo, setBorrarTodo] = useState(false);
  return (
    <Pagina conBarra>
      <Cabecera>
        <h1 className="text-titulo font-black">Protégete</h1>
      </Cabecera>
      <div className="flex flex-col gap-4 px-5 pt-4">
        <div className="flex items-center gap-3">
          <LeonVida pose="detective" alto={96} />
          <div>
            <h2 className="text-tarjeta font-black">¿Qué quieres revisar?</h2>
            <p className="text-ayuda text-text-soft">Antes de pagar, comprar o compartir tus datos.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {TIPOS.map((t, i) => (
            <motion.button
              key={t.id}
              {...entradaEnCascada(i)}
              type="button"
              whileTap={{ y: 3, boxShadow: "0 1px 0 var(--surface)" }}
              style={{ boxShadow: "0 4px 0 var(--surface)" }}
              onPointerDown={() => sonidos.toque()}
              onClick={() => navegar(`/vida/protegete?tipo=${t.id}`)}
              className="flex min-h-32 cursor-pointer flex-col items-start gap-2 rounded-[20px] border-2 border-surface bg-card p-3 text-left"
            >
              <span className="grid size-10 place-items-center rounded-full bg-surface text-brand">
                <svg viewBox="0 0 24 24" className="size-6" aria-hidden="true">
                  <path d={t.icono} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="text-[15px] leading-[19px] font-extrabold">{t.titulo}</span>
              <span className="text-[13px] leading-[17px] text-text-soft">{t.detalle}</span>
            </motion.button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => navegar("/vida/protegete?urgente=1")}
          className="flex min-h-16 cursor-pointer items-center justify-between gap-3 rounded-[20px] border-2 border-error bg-card px-4 py-3 text-left"
        >
          <span>
            <span className="block font-extrabold text-error">Ya pagué o compartí mis datos</span>
            <span className="text-ayuda text-text-soft">Te digo qué hacer primero, paso a paso.</span>
          </span>
          <svg viewBox="0 0 24 24" className="size-6 shrink-0 text-error" aria-hidden="true">
            <path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <section>
          <div className="flex items-center justify-between">
            <h2 className="text-tarjeta font-extrabold">Tus revisiones</h2>
            {e.casos.length > 0 && (
              <button type="button" onClick={() => setBorrarTodo(true)} className="min-h-11 cursor-pointer text-ayuda font-extrabold text-error">
                Borrar todo
              </button>
            )}
          </div>
          <p className="text-ayuda text-text-soft">Guardo lo que escribiste con las claves y números ocultos, junto con tus datos de Vida.</p>
          {e.casos.length === 0 ? (
            <p className="mt-2 rounded-[20px] border-2 border-dashed border-surface p-4 text-text-soft">Aún no revisas nada. Cuando lo hagas, puedes volver al caso y añadir más información.</p>
          ) : (
            <ul className="mt-2 flex flex-col gap-2">
              {[...e.casos].reverse().map((c) => (
                <li key={c.id} className="flex min-h-14 items-center gap-2 rounded-[16px] bg-card pr-1 pl-4">
                  <button type="button" onClick={() => navegar(`/vida/protegete?caso=${c.id}`)} className="flex-1 cursor-pointer py-2 text-left">
                    <span className="block font-extrabold">{TIPOS.find((t) => t.id === c.tipo)?.titulo ?? "Revisión"}</span>
                    <span className="text-ayuda text-text-soft">
                      {bonita(c.fecha)} · {c.nivel === "alto" ? "Hay señales de riesgo" : c.nivel === "medio" ? "Cosas por revisar" : c.nivel ? "Sin señales comunes" : "Sin terminar"}
                    </span>
                  </button>
                  <button
                    type="button"
                    aria-label="Borrar esta revisión"
                    onClick={() => {
                      const antes = obtenerVida().casos;
                      actualizarVida((s) => ({ casos: s.casos.filter((x) => x.id !== c.id) }));
                      avisoDeshacer("Revisión borrada.", () => actualizarVida(() => ({ casos: antes })));
                    }}
                    className="grid size-11 cursor-pointer place-items-center text-text-soft"
                  >
                    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
                      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <p className="rounded-[20px] border-2 border-brand p-4 font-extrabold">Nadie de verdad te pedirá tu clave ni tu código por mensaje.</p>
      </div>

      <Ventana abierta={borrarTodo} alCerrar={() => setBorrarTodo(false)} titulo="¿Borrar todas tus revisiones?">
        <p className="text-text-soft">Se borran de este celular y de tu cuenta, y no se pueden recuperar.</p>
        <div className="mt-5 flex flex-col gap-3">
          <Boton
            variante="secundario"
            onClick={() => {
              actualizarVida(() => ({ casos: [] }));
              setBorrarTodo(false);
            }}
          >
            Sí, borrar todo
          </Boton>
          <Boton onClick={() => setBorrarTodo(false)}>No, mejor no</Boton>
        </div>
      </Ventana>
    </Pagina>
  );
}

/* ---------- Asistente: cuéntame → preguntas → resultado → seguir ---------- */

function Asistente({ tipoInicial, casoId }: { tipoInicial?: TipoCaso; casoId?: string }) {
  const previo = casoId ? obtenerVida().casos.find((c) => c.id === casoId) : undefined;
  const tipo = (previo?.tipo as TipoCaso) ?? tipoInicial ?? "otro";
  const info = TIPOS.find((t) => t.id === tipo)!;
  const [id] = useState(() => previo?.id ?? nuevoId("c"));
  const [evidencias, setEvidencias] = useState<Caso["evidencias"]>(previo?.evidencias ?? []);
  const [respuestas, setRespuestas] = useState<Caso["respuestas"]>(previo?.respuestas ?? {});
  const [paso, setPaso] = useState<0 | 1 | 2 | 3>(previo?.nivel ? 3 : 0);
  const [texto, setTexto] = useState("");
  const [enlace, setEnlace] = useState("");
  const [imagen, setImagen] = useState<string | null>(null);
  const [resultado, setResultado] = useState<Analisis | null>(null);
  const archivo = useRef<HTMLInputElement>(null);
  const preguntas = preguntasDe(tipo);

  useEffect(() => () => {
    if (imagen) URL.revokeObjectURL(imagen);
  }, [imagen]);

  // Un caso guardado se muestra con su resultado al abrirlo.
  useEffect(() => {
    if (previo?.nivel) setResultado(analizar(tipo, previo.evidencias.map((x) => `${x.texto} ${x.enlace ?? ""}`), previo.respuestas, previo.evidencias.some((x) => x.conImagen)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const guardarCaso = (cambios: Partial<Caso>) => {
    const base: Caso = { id, tipo, fecha: previo?.fecha ?? hoy(), evidencias, respuestas, ...cambios };
    actualizarVida((s) => ({ casos: s.casos.some((c) => c.id === id) ? s.casos.map((c) => (c.id === id ? base : c)) : [...s.casos, base] }));
  };

  const agregarEvidencia = () => {
    const limpio = ocultarSensibles(texto.trim());
    const nueva = limpio || enlace.trim() || imagen ? [{ texto: limpio, enlace: enlace.trim() || undefined, fecha: hoy(), conImagen: !!imagen || undefined }] : [];
    const todas = [...evidencias, ...nueva];
    setEvidencias(todas);
    setTexto("");
    setEnlace("");
    if (imagen) URL.revokeObjectURL(imagen);
    setImagen(null);
    sonidos.toque();
    setPaso(1);
    return todas;
  };

  const ver = () => {
    sonidos.toque();
    setPaso(2);
    setTimeout(() => {
      const r = analizar(
        tipo,
        evidencias.map((x) => `${x.texto} ${x.enlace ?? ""}`),
        respuestas,
        evidencias.some((x) => x.conImagen),
      );
      setResultado(r);
      setPaso(3);
      guardarCaso({ nivel: r.nivel, evidencias, respuestas });
      actualizarVida((s) => ({ revisiones: s.revisiones + 1 }));
      metricas.vidaRevisionEstafa(r.nivel);
      if (r.nivel === "alto") vibrar("error");
      sonidos.toque();
    }, 900);
  };

  const responder = (pid: string, valor: string, multiple?: boolean) => {
    setRespuestas((r) => {
      if (!multiple) return { ...r, [pid]: r[pid] === valor ? "" : valor };
      const actual = Array.isArray(r[pid]) ? (r[pid] as string[]) : [];
      if (valor === "Nada todavía") return { ...r, [pid]: actual.includes(valor) ? [] : [valor] };
      const sin = actual.filter((x) => x !== "Nada todavía");
      return { ...r, [pid]: sin.includes(valor) ? sin.filter((x) => x !== valor) : [...sin, valor] };
    });
  };

  const compartir = async () => {
    if (!resultado) return;
    const t = textoParaCompartir(tipo, resultado);
    try {
      if (navigator.share) await navigator.share({ text: t });
      else {
        await navigator.clipboard.writeText(t);
        avisoDeshacer("Resumen copiado, sin tus datos personales.");
      }
    } catch {
      // Cerró el menú de compartir.
    }
  };

  return (
    <Pagina className="flex flex-col">
      <Encabezado titulo={info.titulo} alVolver={() => (paso === 1 ? setPaso(0) : navegar("/vida/protegete"))} />

      <AnimatePresence mode="wait">
        <motion.div key={paso} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.2 }} className="flex flex-1 flex-col gap-4 px-5 pt-2">
          {paso === 0 && (
            <>
              <h2 className="text-titulo font-black">{evidencias.length ? "¿Qué más pasó?" : "Cuéntame qué pasó"}</h2>
              <p className="flex items-start gap-2 rounded-[16px] bg-reward/25 p-3 text-ayuda">
                <svg viewBox="0 0 24 24" className="mt-0.5 size-5 shrink-0" aria-hidden="true">
                  <path d="M7 11V8a5 5 0 0 1 10 0v3M5.5 11h13v9.5h-13z" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" />
                </svg>
                Antes de pegar o adjuntar, tapa tus contraseñas, códigos y números de tarjeta. Igual los oculto al guardar.
              </p>
              <label className="block">
                <span className="text-ayuda font-extrabold text-text-soft">{tipo === "compra" ? "La publicación o lo que te escribió el vendedor" : tipo === "mensaje" ? "El mensaje, o lo que te dijeron por teléfono" : "Cuéntalo con tus palabras o pega el texto"}</span>
                <textarea value={texto} onChange={(ev) => setTexto(ev.target.value)} rows={5} className="mt-1 w-full resize-none rounded-[20px] border-2 border-surface bg-card p-4 text-[17px] outline-none placeholder:text-text-soft focus:border-brand" placeholder="Pega aquí el texto…" />
              </label>
              {(tipo === "enlace" || tipo === "compra" || tipo === "otro") && (
                <label className="block">
                  <span className="text-ayuda font-extrabold text-text-soft">Enlace (opcional)</span>
                  <input value={enlace} onChange={(ev) => setEnlace(ev.target.value)} inputMode="url" placeholder="https://…" className={campoTexto} />
                </label>
              )}
              <div>
                {imagen ? (
                  <div className="flex items-start gap-3">
                    <img src={imagen} alt="Tu captura (solo en este celular)" className="h-28 w-auto rounded-[12px] border-2 border-surface object-contain" />
                    <p className="text-ayuda text-text-soft">León todavía no lee imágenes. Escribe arriba lo que dice la captura y la uso para revisar. La imagen no se guarda.</p>
                  </div>
                ) : (
                  <button type="button" onClick={() => archivo.current?.click()} className="min-h-11 cursor-pointer font-extrabold text-brand">
                    + Adjuntar una captura
                  </button>
                )}
                <input ref={archivo} type="file" accept="image/*" className="hidden" onChange={(ev) => ev.target.files?.[0] && setImagen(URL.createObjectURL(ev.target.files[0]))} />
              </div>
            </>
          )}

          {paso === 1 && (
            <>
              <h2 className="text-titulo font-black">Unas preguntas</h2>
              <p className="text-text-soft">Salta las que no sepas.</p>
              {preguntas.map((p) => (
                <div key={p.id}>
                  <p className="mb-2 font-extrabold">{p.texto}</p>
                  {p.libre ? (
                    <input value={String(respuestas[p.id] ?? "")} onChange={(ev) => setRespuestas((r) => ({ ...r, [p.id]: ev.target.value }))} className={campoTexto} maxLength={60} aria-label={p.texto} />
                  ) : p.multiple ? (
                    <div className="flex flex-wrap gap-2" role="group" aria-label={p.texto}>
                      {p.opciones.map((o) => (
                        <Chip key={o} activo={Array.isArray(respuestas[p.id]) && (respuestas[p.id] as string[]).includes(o)} onClick={() => responder(p.id, o, true)}>
                          {o}
                        </Chip>
                      ))}
                    </div>
                  ) : (
                    <GrupoUnico etiqueta={p.texto}>
                      {p.opciones.map((o) => (
                        <Chip key={o} radio activo={respuestas[p.id] === o} onClick={() => responder(p.id, o)}>
                          {o}
                        </Chip>
                      ))}
                    </GrupoUnico>
                  )}
                </div>
              ))}
            </>
          )}

          {paso === 2 && (
            <div className="flex flex-1 flex-col items-center justify-center pb-20 text-center">
              <motion.div animate={{ x: [0, -8, 8, 0] }} transition={{ duration: 1.2, repeat: Infinity }}>
                <LeonVida pose="detective" alto={190} />
              </motion.div>
              <p className="mt-3 font-extrabold">Revisando con mi lupa…</p>
            </div>
          )}

          {paso === 3 && resultado && (
            <>
              {resultado.urgente && (
                <button type="button" onClick={() => navegar("/vida/protegete?urgente=1")} className="rounded-[20px] border-2 border-error bg-card p-4 text-left">
                  <p className="font-extrabold text-error">Dijiste que ya pagaste o diste datos</p>
                  <p className="text-ayuda">Ve primero a los pasos para ese caso →</p>
                </button>
              )}
              <section className={`flex items-center gap-3 rounded-[20px] p-4 ${resultado.nivel === "alto" ? "bg-error/10" : resultado.nivel === "medio" ? "bg-reward/25" : "bg-surface"}`}>
                <LeonVida pose={resultado.nivel === "alto" ? "alerta" : "detective"} alto={88} />
                <div>
                  <p className="text-tarjeta font-black">{resultado.titulo}</p>
                  <p className="text-[15px] leading-[21px]">{resultado.resumen}</p>
                </div>
              </section>

              {resultado.senales.length > 0 && (
                <Bloque titulo="Lo que encontré">
                  {resultado.senales.map((s) => (
                    <li key={s.id}>
                      <p className="font-extrabold">{s.titulo}</p>
                      <p className="text-ayuda text-text-soft">{s.detalle}</p>
                    </li>
                  ))}
                </Bloque>
              )}
              <Bloque titulo={resultado.nivel === "bajo" ? "Igual, ten en cuenta" : "Antes de actuar"}>
                {resultado.pasos.map((p) => (
                  <li key={p} className="flex gap-2">
                    <span className="mt-2 size-2 shrink-0 rounded-full bg-brand" aria-hidden="true" />
                    {p}
                  </li>
                ))}
              </Bloque>
              {resultado.noComprobado.length > 0 && (
                <Bloque titulo="No pude comprobar">
                  {resultado.noComprobado.map((p) => (
                    <li key={p} className="text-ayuda">
                      {p}
                    </li>
                  ))}
                </Bloque>
              )}
              <p className="text-center text-ayuda text-text-soft">León busca señales comunes. No puede darte certeza de que algo es o no es estafa.</p>
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {paso !== 2 && (
        <PieFijo>
          {paso === 0 && (
            <Boton deshabilitado={!texto.trim() && !enlace.trim() && !imagen && !evidencias.length} onClick={() => agregarEvidencia()}>
              Siguiente
            </Boton>
          )}
          {paso === 1 && <Boton onClick={ver}>Ver el resultado</Boton>}
          {paso === 3 && (
            <div className="flex flex-col gap-2">
              <Boton onClick={() => setPaso(0)}>Añadir más información</Boton>
              <div className="grid grid-cols-2 gap-2">
                <Boton variante="secundario" onClick={compartir}>
                  Compartir resumen
                </Boton>
                <Boton variante="secundario" onClick={() => reemplazar("/vida/protegete")}>
                  Terminar
                </Boton>
              </div>
            </div>
          )}
        </PieFijo>
      )}
    </Pagina>
  );
}

function Bloque({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="rounded-[20px] bg-card p-4">
      <h3 className="font-extrabold">{titulo}</h3>
      <ul className="mt-2 flex flex-col gap-3">{children}</ul>
    </section>
  );
}

/* ---------- Ya pagué o compartí mis datos ---------- */

function Urgente() {
  const [elegidos, setElegidos] = useState<string[]>([]);
  const [verPasos, setVerPasos] = useState(false);
  return (
    <Pagina className="flex flex-col">
      <Encabezado titulo="Ya pagué o compartí mis datos" alVolver={() => (verPasos ? setVerPasos(false) : navegar("/vida/protegete"))} />
      <div className="flex flex-1 flex-col gap-4 px-5 pt-2">
        {!verPasos ? (
          <>
            <h2 className="text-titulo font-black">¿Qué pasó?</h2>
            <p className="text-text-soft">Marca todo lo que aplique. Vamos paso a paso, con calma.</p>
            <div className="flex flex-col gap-2" role="group" aria-label="Qué pasó">
              {INCIDENTES.map((i) => {
                const activo = elegidos.includes(i.id);
                return (
                  <button
                    key={i.id}
                    type="button"
                    aria-pressed={activo}
                    onClick={() => {
                      sonidos.toque();
                      setElegidos((a) => (a.includes(i.id) ? a.filter((x) => x !== i.id) : [...a, i.id]));
                    }}
                    className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-[16px] border-2 px-4 text-left font-extrabold ${activo ? "border-brand bg-surface" : "border-surface bg-card"}`}
                  >
                    <span className={`grid size-6 shrink-0 place-items-center rounded-[6px] border-2 ${activo ? "border-brand bg-brand text-white" : "border-text-soft"}`}>
                      {activo && (
                        <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
                          <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </span>
                    {i.titulo}
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <>
            <h2 className="text-titulo font-black">Haz esto primero</h2>
            {INCIDENTES.filter((i) => elegidos.includes(i.id)).map((i) => (
              <section key={i.id} className="rounded-[20px] bg-card p-4">
                <h3 className="font-extrabold">{i.titulo}</h3>
                <ol className="mt-2 flex list-decimal flex-col gap-2 pl-5">
                  {i.pasos.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ol>
              </section>
            ))}
            <p className="rounded-[16px] bg-surface p-3 text-ayuda">
              Usa siempre los números de la web oficial o de tu tarjeta, nunca los que vienen en el mensaje. Pronto agregaremos los canales de denuncia verificados para Perú.
            </p>
            <p className="pb-2 text-center text-ayuda text-text-soft">No es tu culpa: estas estafas están hechas para engañar a cualquiera.</p>
          </>
        )}
      </div>
      <PieFijo>
        {!verPasos ? (
          <Boton deshabilitado={!elegidos.length} onClick={() => setVerPasos(true)}>
            Ver qué hacer
          </Boton>
        ) : (
          <Boton variante="secundario" onClick={() => navegar("/vida/protegete")}>
            Volver a Protégete
          </Boton>
        )}
      </PieFijo>
    </Pagina>
  );
}
