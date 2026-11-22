import type { MiCurso } from "./estado";
import { DIAS_LARGOS, type Clase } from "./horario";

/**
 * Dibuja el horario como una imagen ordenada (vista de semana con bloques por curso)
 * para guardarla o compartirla. Todo pasa en el celular, sin internet.
 */

const ANCHO = 1080;
const MARGEN = 56;
const COL_HORAS = 96;

function css(variable: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(variable).trim() || "#2430d9";
}

function redondeado(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, Math.min(r, h / 2, w / 2));
}

function envolver(ctx: CanvasRenderingContext2D, texto: string, ancho: number, maxLineas: number) {
  const palabras = texto.split(/\s+/);
  const lineas: string[] = [];
  let actual = "";
  for (const p of palabras) {
    const prueba = actual ? `${actual} ${p}` : p;
    if (ctx.measureText(prueba).width <= ancho) actual = prueba;
    else {
      if (actual) lineas.push(actual);
      actual = p;
    }
  }
  if (actual) lineas.push(actual);
  if (lineas.length > maxLineas) {
    lineas.length = maxLineas;
    lineas[maxLineas - 1] = lineas[maxLineas - 1].replace(/.{0,2}$/, "…");
  }
  return lineas;
}

const aMin = (h: string) => Number(h.slice(0, 2)) * 60 + Number(h.slice(3));

export async function dibujarHorario(clases: Clase[], cursos: MiCurso[], colores: string[]): Promise<Blob> {
  await document.fonts.load("900 40px Nunito");
  await document.fonts.load("800 24px Nunito");

  const usados = [...new Set(clases.map((c) => c.dia))];
  // Siempre lunes a viernes; sábado y domingo solo si hay clases.
  const dias = [0, 1, 2, 3, 4, ...[5, 6].filter((d) => usados.includes(d))];
  const desde = Math.floor(Math.min(...clases.map((c) => aMin(c.inicio))) / 60) * 60;
  const hasta = Math.ceil(Math.max(...clases.map((c) => aMin(c.fin))) / 60) * 60;
  const horas = Math.max(1, (hasta - desde) / 60);
  const altoHora = Math.max(70, Math.min(120, 1100 / horas));

  const arriba = 200;
  const alto = arriba + 64 + horas * altoHora + 110;
  const lienzo = document.createElement("canvas");
  lienzo.width = ANCHO;
  lienzo.height = alto;
  const ctx = lienzo.getContext("2d")!;
  const c = {
    bg: css("--bg"),
    card: css("--card"),
    surface: css("--surface"),
    text: css("--text"),
    soft: css("--text-soft"),
    brand: css("--brand"),
  };

  ctx.fillStyle = c.bg;
  ctx.fillRect(0, 0, ANCHO, alto);

  // Título
  ctx.fillStyle = c.text;
  ctx.font = "900 56px Nunito";
  ctx.fillText("Mi horario", MARGEN, 110);
  ctx.fillStyle = c.soft;
  ctx.font = "700 26px Nunito";
  const total = clases.length;
  const nCursos = new Set(clases.map((x) => x.curso.toLowerCase())).size;
  ctx.fillText(`${nCursos} cursos · ${total} clases a la semana`, MARGEN, 156);

  // Cuadrícula
  const x0 = MARGEN + COL_HORAS;
  const anchoCol = (ANCHO - MARGEN - x0) / dias.length;
  const y0 = arriba + 64;

  ctx.fillStyle = c.card;
  redondeado(ctx, MARGEN, arriba, ANCHO - 2 * MARGEN, 64 + horas * altoHora + 16, 28);
  ctx.fill();

  dias.forEach((d, i) => {
    ctx.fillStyle = c.text;
    ctx.font = "800 26px Nunito";
    ctx.textAlign = "center";
    ctx.fillText(DIAS_LARGOS[d].slice(0, 3), x0 + anchoCol * i + anchoCol / 2, arriba + 44);
  });
  ctx.textAlign = "left";

  for (let h = 0; h <= horas; h++) {
    const y = y0 + h * altoHora;
    ctx.strokeStyle = c.surface;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x0, y);
    ctx.lineTo(ANCHO - MARGEN - 12, y);
    ctx.stroke();
    if (h < horas) {
      const hora = (desde / 60 + h) % 24;
      ctx.fillStyle = c.soft;
      ctx.font = "700 22px Nunito";
      ctx.fillText(`${String(hora).padStart(2, "0")}:00`, MARGEN + 18, y + 26);
    }
  }

  // Bloques de clase
  const colorDe = (nombre: string) => {
    const curso = cursos.find((x) => x.nombre.toLowerCase() === nombre.toLowerCase());
    const v = colores[curso?.color ?? 0];
    return v.startsWith("var(") ? css(v.slice(4, -1)) : v;
  };
  for (const cl of clases) {
    const i = dias.indexOf(cl.dia);
    if (i < 0) continue;
    const x = x0 + anchoCol * i + 5;
    const y = y0 + ((aMin(cl.inicio) - desde) / 60) * altoHora + 4;
    const h = ((aMin(cl.fin) - aMin(cl.inicio)) / 60) * altoHora - 8;
    const w = anchoCol - 10;
    const color = colorDe(cl.curso);
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.16;
    redondeado(ctx, x, y, w, h, 14);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.fillStyle = color;
    redondeado(ctx, x, y, 7, h, 4);
    ctx.fill();

    ctx.fillStyle = c.text;
    ctx.font = "800 21px Nunito";
    const maxLineas = Math.max(1, Math.floor((h - 34) / 25));
    const lineas = envolver(ctx, cl.curso, w - 24, maxLineas);
    lineas.forEach((l, k) => ctx.fillText(l, x + 16, y + 28 + k * 25));
    if (h > 34 + lineas.length * 25) {
      ctx.fillStyle = c.soft;
      ctx.font = "700 18px Nunito";
      ctx.fillText(`${cl.inicio}–${cl.fin}`, x + 16, y + 28 + lineas.length * 25);
      if (cl.aula && h > 58 + lineas.length * 25) ctx.fillText(cl.aula, x + 16, y + 50 + lineas.length * 25);
    }
  }

  // Pie
  ctx.fillStyle = c.soft;
  ctx.font = "700 22px Nunito";
  ctx.fillText("Hecho con Auxi Studio", MARGEN, alto - 44);
  ctx.fillStyle = c.brand;
  ctx.beginPath();
  ctx.arc(ANCHO - MARGEN - 10, alto - 52, 10, 0, Math.PI * 2);
  ctx.fill();

  return new Promise((ok, mal) => lienzo.toBlob((b) => (b ? ok(b) : mal(new Error("sin imagen"))), "image/png"));
}

/** Comparte la imagen (WhatsApp, galería…) o la descarga si el navegador no puede compartir. */
export async function compartirOGuardar(imagen: Blob) {
  const archivo = new File([imagen], "mi-horario.png", { type: "image/png" });
  try {
    if (navigator.canShare?.({ files: [archivo] })) {
      await navigator.share({ files: [archivo], title: "Mi horario" });
      return "compartido";
    }
  } catch (e) {
    if ((e as Error).name === "AbortError") return "cancelado";
  }
  const url = URL.createObjectURL(imagen);
  const a = document.createElement("a");
  a.href = url;
  a.download = "mi-horario.png";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
  return "descargado";
}
