'use client';

import { Printer } from 'lucide-react';

export function PrintButton() {
  return (
    <button 
      onClick={() => window.print()}
      className="hover:text-white transition-colors"
      title="Imprimir Factura"
    >
      <Printer className="w-4 h-4" />
    </button>
  );
}
