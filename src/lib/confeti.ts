/** Confeti con los colores de la paleta. Se carga solo cuando hace falta. */
const COLORES = ["#2430D9", "#5FE3DC", "#F2B341", "#E6E8FA", "#2FB7B0"];

export async function lanzarConfeti() {
  const { default: confetti } = await import("canvas-confetti");
  const base = {
    colors: COLORES,
    disableForReducedMotion: true,
    ticks: 220,
    scalar: 1.05,
    zIndex: 60,
  };
  confetti({ ...base, particleCount: 70, spread: 70, startVelocity: 48, origin: { x: 0.5, y: 0.62 } });
  setTimeout(() => {
    confetti({ ...base, particleCount: 40, angle: 60, spread: 55, origin: { x: 0, y: 0.7 } });
    confetti({ ...base, particleCount: 40, angle: 120, spread: 55, origin: { x: 1, y: 0.7 } });
  }, 180);
}
