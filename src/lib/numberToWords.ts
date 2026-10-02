export function numberToWordsSpanish(amount: number): string {
  if (isNaN(amount) || amount === 0) return 'CERO PESOS M/CTE';

  const unidades = ['', 'UN', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE'];
  const decenas = ['', 'DIEZ', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'];
  const diezA19 = ['DIEZ', 'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE', 'DIECISEIS', 'DIECISIETE', 'DIECIOCHO', 'DIECINUEVE'];
  const veinteA29 = ['VEINTE', 'VEINTIUNO', 'VEINTIDOS', 'VEINTITRES', 'VEINTICUATRO', 'VEINTICINCO', 'VEINTISEIS', 'VEINTISIETE', 'VEINTIOCHO', 'VEINTINUEVE'];
  const centenas = ['', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS', 'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS'];

  function convertGroup(n: number): string {
    if (n === 0) return '';
    if (n === 100) return 'CIEN';

    let output = '';
    const c = Math.floor(n / 100);
    const d = Math.floor((n % 100) / 10);
    const u = n % 10;

    if (c > 0) output += centenas[c] + ' ';

    const du = n % 100;
    if (du >= 10 && du <= 19) {
      output += diezA19[du - 10] + ' ';
    } else if (du >= 20 && du <= 29) {
      output += veinteA29[du - 20] + ' ';
    } else {
      if (d > 0) {
        output += decenas[d] + (u > 0 ? ' Y ' : ' ');
      }
      if (u > 0) {
        output += unidades[u] + ' ';
      }
    }

    return output.trim();
  }

  const num = Math.floor(Math.abs(amount));
  const millones = Math.floor(num / 1000000);
  const miles = Math.floor((num % 1000000) / 1000);
  const cientos = num % 1000;

  let result = '';

  if (millones > 0) {
    result += millones === 1 ? 'UN MILLON ' : `${convertGroup(millones)} MILLONES `;
  }

  if (miles > 0) {
    result += miles === 1 ? 'MIL ' : `${convertGroup(miles)} MIL `;
  }

  if (cientos > 0) {
    result += convertGroup(cientos);
  }

  const text = result.trim() || 'CERO';
  return `${text} PESOS M/CTE`;
}
