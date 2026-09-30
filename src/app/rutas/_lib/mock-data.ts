export interface RutaVisual {
  id: string;
  nombre: string;
  clientes: number;
  facturas?: number;
  estado: 'Pendiente' | 'En Proceso' | 'Completado';
  icono?: string;
}

export const mockRutas: RutaVisual[] = [
  {
    id: "ruta-01",
    nombre: "Ruta Centro",
    clientes: 45,
    facturas: 120,
    estado: "En Proceso",
    icono: "map",
  },
  {
    id: "ruta-02",
    nombre: "Ruta Norte",
    clientes: 32,
    facturas: 85,
    estado: "Pendiente",
    icono: "map",
  },
  {
    id: "ruta-03",
    nombre: "Ruta Sur",
    clientes: 50,
    estado: "Completado",
    icono: "map",
  },
  {
    id: "ruta-04",
    nombre: "Ruta Este",
    clientes: 28,
    facturas: 40,
    estado: "Pendiente",
    icono: "map",
  }
];
