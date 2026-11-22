import type { Estado, Resultado } from "./estado";

/**
 * Une el avance del celular con el de la cuenta sin perder nada.
 * Se usa al registrarse (avance de invitado + cuenta nueva) y al entrar desde otro celular.
 */

function porId<T extends { id: string }>(a: T[], b: T[]) {
  const mapa = new Map<string, T>();
  [...b, ...a].forEach((x) => mapa.set(x.id, x));
  return [...mapa.values()];
}

function maximos(a: Record<string, number>, b: Record<string, number>) {
  const r = { ...b };
  for (const [k, v] of Object.entries(a)) r[k] = Math.max(v, r[k] ?? 0);
  return r;
}

function mejorResultado(a?: Resultado, b?: Resultado) {
  if (!a) return b;
  if (!b) return a;
  return a.precision >= b.precision ? a : b;
}

export function unir(local: Estado, nube: Estado): Estado {
  const progreso: Estado["progreso"] = {};
  for (const curso of new Set([...Object.keys(local.progreso), ...Object.keys(nube.progreso)])) {
    const l = local.progreso[curso] ?? {};
    const n = nube.progreso[curso] ?? {};
    progreso[curso] = {};
    for (const nodo of new Set([...Object.keys(l), ...Object.keys(n)])) progreso[curso][nodo] = mejorResultado(l[nodo], n[nodo])!;
  }

  const errores: Estado["errores"] = {};
  for (const curso of new Set([...Object.keys(local.errores), ...Object.keys(nube.errores)])) {
    errores[curso] = [...new Set([...(nube.errores[curso] ?? []), ...(local.errores[curso] ?? [])])].slice(-40);
  }

  // La racha que vale es la más reciente; si empatan, la más larga.
  const racha =
    local.racha.ultimoDia > nube.racha.ultimoDia || (local.racha.ultimoDia === nube.racha.ultimoDia && local.racha.dias >= nube.racha.dias)
      ? { ...local.racha }
      : { ...nube.racha };
  racha.protectores = Math.max(local.racha.protectores, nube.racha.protectores);

  // Cursos: si el mismo curso existe en ambos, se juntan sus temas y PDF.
  const cursos = new Map(nube.misCursos.map((c) => [c.id, c]));
  for (const c of local.misCursos) {
    const otro = cursos.get(c.id);
    if (!otro) cursos.set(c.id, c);
    else {
      const temas = new Map(otro.temas.map((t) => [t.id, t]));
      for (const t of c.temas) {
        const t2 = temas.get(t.id);
        temas.set(t.id, t2 ? { ...t, archivos: porId(t.archivos, t2.archivos) } : t);
      }
      cursos.set(c.id, { ...otro, ...c, temas: [...temas.values()] });
    }
  }

  return {
    ...nube,
    ...local,
    bienvenidaVista: local.bienvenidaVista || nube.bienvenidaVista,
    cursoId: local.cursoId ?? nube.cursoId,
    progreso,
    errores,
    monedas: Math.max(local.monedas, nube.monedas),
    racha,
    cofreDia: local.cofreDia > nube.cofreDia ? local.cofreDia : nube.cofreDia,
    totales: {
      lecciones: Math.max(local.totales.lecciones, nube.totales.lecciones),
      respuestas: Math.max(local.totales.respuestas, nube.totales.respuestas),
      aciertos: Math.max(local.totales.aciertos, nube.totales.aciertos),
      minutos: Math.max(local.totales.minutos, nube.totales.minutos),
    },
    cajas: maximos(local.cajas, nube.cajas),
    entregas: porId(local.entregas, nube.entregas),
    huecos: [...new Set([...nube.huecos, ...local.huecos])],
    animo: porId(
      local.animo.map((a) => ({ ...a, id: a.dia })),
      nube.animo.map((a) => ({ ...a, id: a.dia })),
    ).map(({ dia, valor }) => ({ dia, valor })),
    misiones: { ...nube.misiones, ...Object.fromEntries(Object.entries(local.misiones).filter(([, v]) => v)) },
    avisoCuentaVisto: true,
    importados: { ...nube.importados, ...local.importados },
    cupoExtra: Math.max(local.cupoExtra, nube.cupoExtra),
    pasePorVida: local.pasePorVida || nube.pasePorVida,
    tomates: maximos(local.tomates, nube.tomates),
    apoyoReclamado: local.apoyoReclamado ?? nube.apoyoReclamado,
    repaso: { ...nube.repaso, ...local.repaso },
    reportes: porId(local.reportes, nube.reportes).sort((a, b) => b.fecha.localeCompare(a.fecha)).slice(0, 20),
    misCursos: [...cursos.values()],
    estudiando: local.estudiando ?? nube.estudiando,
    diasEstudio: maximos(local.diasEstudio, nube.diasEstudio),
    metodoRecomendado: local.metodoRecomendado ?? nube.metodoRecomendado,
  };
}
