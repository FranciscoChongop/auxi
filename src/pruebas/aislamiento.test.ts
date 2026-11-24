/**
 * Pruebas de lo crítico (P0): aislamiento de datos entre cuentas, migración explícita,
 * cálculo del disponible del día y duplicados al importar. Solo datos ficticios.
 * Ejecutar: npm test
 */
import { test } from "node:test";
import assert from "node:assert/strict";

// localStorage y sessionStorage en memoria (Node no los trae).
class Memoria {
  private m = new Map<string, string>();
  getItem(k: string) {
    return this.m.has(k) ? this.m.get(k)! : null;
  }
  setItem(k: string, v: string) {
    this.m.set(k, String(v));
  }
  removeItem(k: string) {
    this.m.delete(k);
  }
  clear() {
    this.m.clear();
  }
  get length() {
    return this.m.size;
  }
  key(i: number) {
    return [...this.m.keys()][i] ?? null;
  }
}
Object.assign(globalThis, { localStorage: new Memoria(), sessionStorage: new Memoria() });

const { decidir } = await import("../lib/propietario.ts");
const prop = await import("../lib/propietario.ts");
const vida = await import("../vida/estado.ts");
const { marcarDuplicados } = await import("../vida/importar/importar.ts");

test("Student: los datos de otra cuenta se apartan, los propios o sin dueño se unen", () => {
  assert.equal(decidir(null, "A"), "unir");
  assert.equal(decidir("A", "A"), "unir");
  assert.equal(decidir("A", "B"), "apartar");
});

test("Student: el avance apartado solo lo recupera su misma cuenta, una vez", () => {
  prop.apartarRespaldo("A", { monedas: 10 });
  assert.equal(prop.tomarRespaldo("B"), null);
  assert.deepEqual(prop.tomarRespaldo("A"), { monedas: 10 });
  assert.equal(prop.tomarRespaldo("A"), null);
});

test("Vida: cada cuenta ve solo su espacio y lo de sin cuenta pasa solo si se confirma", () => {
  // Sin cuenta: alguien registra un gasto.
  prop.avisarCambioDeCuenta(null);
  vida.actualizarVida(() => ({ iniciado: true }));
  vida.anotar({ tipo: "gasto", monto: 12, categoria: "Comida", nota: "Menú", fecha: "2026-11-20", origen: "manual" });
  assert.equal(vida.obtenerVida().movimientos.length, 1);

  // Entra la cuenta A: no ve lo de sin cuenta hasta decidir.
  prop.avisarCambioDeCuenta("A");
  assert.equal(vida.obtenerVida().movimientos.length, 0);
  assert.equal(vida.hayDatosSinCuenta(), true);

  // A confirma: ahora es suyo y ya no queda nada sin cuenta.
  vida.pasarDatosSinCuenta();
  assert.equal(vida.obtenerVida().movimientos.length, 1);
  assert.equal(vida.hayDatosSinCuenta(), false);

  // Entra la cuenta B en el mismo navegador: no ve nada de A.
  prop.avisarCambioDeCuenta("B");
  assert.equal(vida.obtenerVida().movimientos.length, 0);
  assert.equal(vida.hayDatosSinCuenta(), false);

  // Sale B y vuelve A: sus datos siguen ahí.
  prop.avisarCambioDeCuenta(null);
  assert.equal(vida.obtenerVida().movimientos.length, 0);
  prop.avisarCambioDeCuenta("A");
  assert.equal(vida.obtenerVida().movimientos.length, 1);
});

test("Vida: «Dejarlos aparte» no mezcla nada y no vuelve a preguntar", () => {
  prop.avisarCambioDeCuenta(null);
  vida.anotar({ tipo: "gasto", monto: 5, categoria: "Transporte", nota: "Pasaje", fecha: "2026-11-21", origen: "manual" });
  prop.avisarCambioDeCuenta("C");
  assert.equal(vida.hayDatosSinCuenta(), true);
  vida.dejarDatosSinCuentaAparte();
  assert.equal(vida.hayDatosSinCuenta(), false);
  assert.equal(vida.obtenerVida().movimientos.length, 0);
});

test("Vida: el disponible del día descuenta gastos y no cuenta fijos, propias ni otra moneda", () => {
  prop.avisarCambioDeCuenta("D");
  const f = "2026-11-10"; // noviembre: 30 días
  vida.actualizarVida(() => ({
    plan: { ingreso: 1600, periodo: "mes", diasSemana: 6, fijos: 700, fijosEn: [], ahorro: 90, desde: "2026-11-01" },
    movimientos: [
      { id: "1", tipo: "gasto", monto: 12, categoria: "Comida", nota: "Menú", fecha: f, origen: "manual" },
      { id: "2", tipo: "gasto", monto: 450, categoria: "Servicios", nota: "Alquiler", fecha: f, origen: "pago", fijo: true },
      { id: "3", tipo: "gasto", monto: 300, categoria: "Entre mis cuentas", nota: "Ahorro", fecha: f, origen: "texto", clase: "propia" },
      { id: "4", tipo: "gasto", monto: 20, categoria: "Otros", nota: "Compra", fecha: f, origen: "texto", moneda: "USD" },
    ],
  }));
  const d = vida.desglose(vida.obtenerVida(), f);
  assert.equal(d.base, 27); // (1600 − 700 − 90) ÷ 30
  assert.equal(d.gastado, 12);
  assert.equal(d.quedan, 15);
});

test("Importar: mismo número de operación es duplicado; mismo monto solo, no", () => {
  prop.avisarCambioDeCuenta("E");
  vida.actualizarVida(() => ({
    movimientos: [{ id: "x", tipo: "gasto", monto: 25, categoria: "Comida", nota: "Bodega", contraparte: "Bodega", operacion: "12345678", fecha: "2026-11-22", origen: "texto" }],
  }));
  const base = { tipo: "gasto" as const, clase: "normal" as const, moneda: "PEN", categoria: "Comida", dudas: [], incluir: true, descripcion: "x" };
  const [mismaOp, mismoMonto] = marcarDuplicados([
    { ...base, clave: "a", monto: 25, fecha: "2026-11-22", contraparte: "Otra", operacion: "12345678" },
    { ...base, clave: "b", monto: 25, fecha: "2026-11-22", contraparte: "Panadería", operacion: null },
  ]);
  assert.equal(mismaOp.duplicado?.nivel, "probable");
  assert.equal(mismaOp.incluir, false);
  assert.equal(mismoMonto.duplicado, undefined);
  assert.equal(mismoMonto.incluir, true);
});

test("Vida en la cuenta: el primer enlace une sin repetir; después manda la copia más nueva", () => {
  const base = vida.obtenerVidaReal();
  const mov = (id: string) => ({ id, tipo: "gasto" as const, monto: 5, categoria: "Comida", nota: id, fecha: "2026-11-20", origen: "manual" as const });
  const local = { ...base, movimientos: [mov("a"), mov("b")], editado: "2026-11-20T10:00:00.000Z" };
  const nube = { ...base, movimientos: [mov("b"), mov("c")], editado: "2026-11-21T10:00:00.000Z" };
  // Primer enlace de este equipo: se suman a, b y c una sola vez.
  const unida = vida.elegirCopia(local, nube, false)!;
  assert.deepEqual(unida.movimientos.map((m) => m.id).sort(), ["a", "b", "c"]);
  // Ya enlazado: si la cuenta es más nueva, gana la cuenta; si lo local es más nuevo, se queda lo local.
  assert.equal(vida.elegirCopia(local, nube, true), nube);
  assert.equal(vida.elegirCopia({ ...local, editado: "2026-11-22T10:00:00.000Z" }, nube, true), null);
  // Sin copia en la cuenta: se queda lo local (y luego se sube).
  assert.equal(vida.elegirCopia(local, null, true), null);
});

test("Vida en la cuenta: borrar deja una copia vacía con fecha (no vuelve desde la cuenta)", () => {
  prop.avisarCambioDeCuenta("F");
  vida.actualizarVida(() => ({ movimientos: [{ id: "z", tipo: "gasto", monto: 1, categoria: "Otros", nota: "z", fecha: "2026-11-20", origen: "manual" }] }));
  const antes = vida.obtenerVidaReal().editado!;
  vida.borrarVida();
  const despues = vida.obtenerVidaReal();
  assert.equal(despues.movimientos.length, 0);
  assert.ok(despues.editado! >= antes);
  assert.equal(vida.elegirCopia(despues, { ...despues, movimientos: [], editado: antes }, true), null);
});
