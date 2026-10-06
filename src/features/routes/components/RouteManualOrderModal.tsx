import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, X } from 'lucide-react';

export interface RouteManualOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (csvString: string) => void;
}

export function RouteManualOrderModal({ isOpen, onClose, onApply }: RouteManualOrderModalProps) {
  const [textInput, setTextInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Handle escape key to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleApply = () => {
    setError(null);
    
    // Split by commas, spaces, or newlines
    const rawIds = textInput.split(/[\s,]+/).map(id => id.trim()).filter(id => id.length > 0);
    
    if (rawIds.length === 0) {
      setError('Debes ingresar al menos un ID de cliente.');
      return;
    }

    // Build the CSV string in memory
    const csvLines = ['id_cliente,orden'];
    rawIds.forEach((id, index) => {
      csvLines.push(`${id},${index + 1}`);
    });

    onApply(csvLines.join('\n'));
    setTextInput('');
  };

  const handleClose = () => {
    setTextInput('');
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-background border rounded-lg shadow-xl w-full max-w-md flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Ingresar orden manual</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Ingresa los ID de cliente en el orden en que deseas procesar/imprimir las facturas.
            </p>
          </div>
          <button 
            type="button" 
            onClick={handleClose}
            className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* Body */}
        <div className="p-6 space-y-4">
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            className="w-full min-h-[150px] p-3 text-sm font-mono border rounded-md focus:outline-hidden focus:ring-2 focus:ring-primary/50 resize-y bg-background text-foreground"
            placeholder="Ejemplo:&#10;63437830&#10;106341416&#10;63438591"
            autoFocus
          />
          <p className="text-xs text-muted-foreground">
            Puedes separar los ID por comas, espacios o saltos de línea.
          </p>
          
          {error && (
            <div className="flex items-start gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-md border border-destructive/20">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-6 border-t bg-muted/20">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleApply}>
            Aplicar orden
          </Button>
        </div>
      </div>
    </div>
  );
}
