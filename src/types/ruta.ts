export interface RouteRow {
  id: string;
  nombre: string;
  created_at: string;
  updated_at: string;
}

export interface RouteClientRow {
  id: number;
  route_id: string;
  client_id: string;
  created_at: string;
}

export interface RouteWithClients extends RouteRow {
  id_clientes: string[];
}
