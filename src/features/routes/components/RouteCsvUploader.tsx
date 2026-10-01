'use client';

import { useState, useRef, ChangeEvent, DragEvent } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet, Upload, Lock, X, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export interface RouteCsvUploaderProps {
  isLocked: boolean;
  onFileSelected: (fileContent: string, fileName: string) => void;
  onReset?: () => void;
  currentFileName?: string | null;
}

export function RouteCsvUploader({
  isLocked,
  onFileSelected,
  onReset,
  currentFileName,
}: RouteCsvUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast.error('Tipo de archivo no válido', {
        description: 'Por favor selecciona un archivo con extensión .csv',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content !== undefined) {
        onFileSelected(content, file.name);
        toast.success('Archivo CSV cargado correctamente');
      }
    };
    reader.onerror = () => {
      toast.error('Error de lectura', {
        description: 'No se pudo leer el contenido del archivo CSV.',
      });
    };
    reader.readAsText(file);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!isLocked) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (isLocked) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleClear = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onReset) {
      onReset();
    }
  };

  return (
    <Card className={`transition-colors ${isLocked ? 'opacity-80 border-dashed' : ''}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Ordenamiento por Archivo CSV</CardTitle>
          </div>
          {isLocked ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
              <Lock className="h-3.5 w-3.5" />
              Bloqueado (Procesamiento en curso)
            </span>
          ) : currentFileName ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Archivo Cargado
            </span>
          ) : null}
        </div>
        <CardDescription>
          Sube un archivo CSV con las columnas <code className="font-mono text-xs font-bold">id_cliente</code> y{' '}
          <code className="font-mono text-xs font-bold">orden</code> para reordenar las facturas procesadas de la ruta.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <input
          type="file"
          ref={fileInputRef}
          accept=".csv"
          onChange={handleInputChange}
          disabled={isLocked}
          className="hidden"
          id="csv-file-input"
        />

        {isLocked ? (
          <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg bg-muted/30 text-center space-y-2">
            <Lock className="h-8 w-8 text-muted-foreground/60" />
            <p className="text-sm font-medium text-muted-foreground">
              La carga de CSV está deshabilitada durante el procesamiento progresivo.
            </p>
            <p className="text-xs text-muted-foreground/80">
              Inicia o espera a que finalice el procesamiento de la ruta para subir la secuencia personalizada.
            </p>
          </div>
        ) : currentFileName ? (
          <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/40">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              <div>
                <p className="text-sm font-semibold text-foreground">{currentFileName}</p>
                <p className="text-xs text-muted-foreground">CSV listo para validación y reconciliación</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4 mr-1.5" />
                Cambiar CSV
              </Button>
              <Button type="button" variant="ghost" size="icon" onClick={handleClear} title="Remover archivo">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors text-center ${
              isDragging
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/30'
            }`}
          >
            <Upload className="h-8 w-8 text-muted-foreground mb-3" />
            <p className="text-sm font-semibold text-foreground">
              Haz clic para seleccionar o arrastra un archivo CSV
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Formatos soportados: archivos .csv delimitados por coma (,) o punto y coma (;)
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
