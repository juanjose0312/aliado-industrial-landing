/**
 * Lightbox accesible con <dialog>:
 * - showModal() atrapa el foco y Escape lo cierra (nativo).
 * - Flechas izquierda/derecha navegan; al cerrar, el foco vuelve a la miniatura que lo abrió.
 */
export function iniciarGaleria(): void {
  document.querySelectorAll<HTMLElement>('[data-galeria]').forEach((galeria) => {
    const dialogo = galeria.querySelector<HTMLDialogElement>('dialog');
    const miniaturas = Array.from(galeria.querySelectorAll<HTMLButtonElement>('button[data-indice]'));
    if (!dialogo || miniaturas.length === 0) return;

    const img = dialogo.querySelector<HTMLImageElement>('[data-lightbox-img]');
    const pie = dialogo.querySelector<HTMLElement>('[data-lightbox-pie]');
    const contador = dialogo.querySelector<HTMLElement>('[data-lightbox-contador]');
    let actual = 0;
    let origen: HTMLButtonElement | null = null;

    const mostrar = (indice: number) => {
      actual = (indice + miniaturas.length) % miniaturas.length;
      const m = miniaturas[actual];
      if (img) {
        img.src = m.dataset.src ?? '';
        img.srcset = m.dataset.srcset ?? '';
        img.alt = m.dataset.alt ?? '';
        img.width = Number(m.dataset.ancho) || 1600;
        img.height = Number(m.dataset.alto) || 1000;
      }
      if (pie) pie.textContent = m.dataset.pie ?? '';
      if (contador) contador.textContent = `${actual + 1} / ${miniaturas.length}`;
    };

    miniaturas.forEach((m, i) =>
      m.addEventListener('click', () => {
        origen = m;
        mostrar(i);
        dialogo.showModal();
      }),
    );

    dialogo.querySelector('[data-lightbox-anterior]')?.addEventListener('click', () => mostrar(actual - 1));
    dialogo.querySelector('[data-lightbox-siguiente]')?.addEventListener('click', () => mostrar(actual + 1));
    dialogo.querySelector('[data-lightbox-cerrar]')?.addEventListener('click', () => dialogo.close());

    dialogo.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        mostrar(actual - 1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        mostrar(actual + 1);
      }
    });

    // Clic en el fondo oscuro (fuera del contenido) cierra.
    dialogo.addEventListener('click', (e) => {
      if (e.target === dialogo) dialogo.close();
    });

    dialogo.addEventListener('close', () => {
      origen?.focus();
      origen = null;
    });
  });
}
