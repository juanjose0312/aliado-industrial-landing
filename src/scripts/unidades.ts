/** Selector de unidades de la ficha técnica: litros, galones o barriles. */
type Rango = Record<string, [string, string]>;

export function iniciarUnidades(): void {
  document.querySelectorAll<HTMLElement>('[data-selector-unidades]').forEach((grupo) => {
    const ficha = grupo.closest<HTMLElement>('[data-ficha]');
    if (!ficha) return;
    const rango = JSON.parse(ficha.dataset.rango ?? '{}') as Rango;
    const nombres = JSON.parse(ficha.dataset.nombres ?? '{}') as Record<string, string>;
    const min = ficha.querySelector('[data-capacidad-min]');
    const max = ficha.querySelector('[data-capacidad-max]');
    const unidad = ficha.querySelector('[data-capacidad-unidad]');
    const botones = grupo.querySelectorAll<HTMLButtonElement>('button[data-unidad]');

    botones.forEach((boton) => {
      boton.addEventListener('click', () => {
        const u = boton.dataset.unidad ?? 'L';
        if (!rango[u]) return;
        botones.forEach((b) => b.setAttribute('aria-pressed', String(b === boton)));
        if (min) min.textContent = rango[u][0];
        if (max) max.textContent = rango[u][1];
        if (unidad) unidad.textContent = nombres[u] ?? u;
      });
    });
  });
}
