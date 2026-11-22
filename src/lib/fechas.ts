/** Fechas en formato AAAA-MM-DD con la hora local del celular. */
export function clave(d = new Date()) {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${dia}`;
}

export function hoy() {
  return clave();
}

export function sumarDias(fecha: string, n: number) {
  const [a, m, d] = fecha.split("-").map(Number);
  return clave(new Date(a, m - 1, d + n));
}

export function diasEntre(desde: string, hasta: string) {
  const [a1, m1, d1] = desde.split("-").map(Number);
  const [a2, m2, d2] = hasta.split("-").map(Number);
  return Math.round((Date.UTC(a2, m2 - 1, d2) - Date.UTC(a1, m1 - 1, d1)) / 86_400_000);
}

const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "set", "oct", "nov", "dic"];

export function bonita(fecha: string) {
  const [a, m, d] = fecha.split("-").map(Number);
  const f = new Date(a, m - 1, d);
  return `${DIAS[f.getDay()]} ${d} ${MESES[m - 1]}`;
}
