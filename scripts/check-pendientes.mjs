/**
 * Lista los datos de la empresa que faltan (lee src/config/site.ts).
 * Solo avisa: siempre sale con código 0 y no bloquea el build.
 *
 * Uso:  npm run check:pendientes      (Node 22.18+ / 24, que ejecuta .ts sin compilar)
 */
const { pendientes } = await import('../src/config/site.ts');

const faltan = Object.entries(pendientes).filter(([, p]) => p.falta);
const obligatorios = faltan.filter(([, p]) => p.obligatorio);
const opcionales = faltan.filter(([, p]) => !p.obligatorio);

const imprimir = (titulo, lista) => {
  if (lista.length === 0) return;
  console.log(`\n${titulo}`);
  for (const [clave, p] of lista) {
    console.log(`  • ${p.descripcion}  (${clave})`);
    console.log(`      Dónde se usa:     ${p.dondeSeUsa}`);
    console.log(`      Mientras tanto:   ${p.mientrasTanto}`);
  }
};

if (faltan.length === 0) {
  console.log('check:pendientes — no hay datos pendientes en site.ts.');
} else {
  console.log(`check:pendientes — ${obligatorios.length} obligatorio(s) y ${opcionales.length} por confirmar.`);
  imprimir('OBLIGATORIOS (antes de apelar / publicar la política completa):', obligatorios);
  imprimir('POR CONFIRMAR:', opcionales);
  console.log('\nLa lista completa, con fotos y textos por revisar, está en PENDIENTES.md.');
}
process.exit(0);
