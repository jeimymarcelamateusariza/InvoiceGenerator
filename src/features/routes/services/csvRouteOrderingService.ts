import type { InvoiceFromApi } from '@/features/invoices/types';
import type { RouteClientProcessingState } from '@/app/rutas/[id]/procesar/page';

export interface CsvRowRaw {
  lineNumber: number;
  clientId: string;
  rawOrden: string;
  orden?: number;
}

export type CsvBlockingErrorCode =
  | 'EMPTY_FILE'
  | 'INVALID_DELIMITER'
  | 'MISSING_HEADERS'
  | 'DUPLICATE_CLIENT_ID'
  | 'INVALID_POSITION';

export interface CsvValidationError {
  code: CsvBlockingErrorCode;
  message: string;
  lineNumbers?: number[];
  details?: string;
}

export type CsvWarningCode =
  | 'CLIENT_WITHOUT_INVOICE'
  | 'ROUTE_INVOICE_NOT_IN_CSV';

export interface CsvWarning {
  code: CsvWarningCode;
  message: string;
  clientId?: string;
}

export interface CsvDiscrepancies {
  clientsWithoutInvoices: string[];
  routeClientsNotInCsv: string[];
}

export interface OrderedClientInvoices {
  clientId: string;
  orden: number;
  invoices: InvoiceFromApi[];
  totalAmount: number;
}

export interface CsvValidationReport {
  isValid: boolean;
  blockingErrors: CsvValidationError[];
  warnings: CsvWarning[];
  discrepancies: CsvDiscrepancies;
  orderedClients: OrderedClientInvoices[];
  totalOrderedInvoices: number;
  totalMatchedClients: number;
  grandTotalAmount: number;
}

/**
 * Detects whether comma (',') or semicolon (';') is used as delimiter in header line.
 */
export function detectDelimiter(headerLine: string): string {
  const semicolonCount = (headerLine.match(/;/g) || []).length;
  const commaCount = (headerLine.match(/,/g) || []).length;
  return semicolonCount > commaCount ? ';' : ',';
}

/**
 * Validates header columns to ensure mandatory 'id_cliente' and 'orden' are present.
 */
export function validateHeaders(headers: string[]): CsvValidationError | null {
  const normalizedHeaders = headers.map((h) => h.replace(/^\uFEFF/, '').trim().toLowerCase());
  const hasIdCliente = normalizedHeaders.includes('id_cliente');
  const hasOrden = normalizedHeaders.includes('orden');

  if (!hasIdCliente || !hasOrden) {
    const missing: string[] = [];
    if (!hasIdCliente) missing.push('id_cliente');
    if (!hasOrden) missing.push('orden');
    return {
      code: 'MISSING_HEADERS',
      message: `Encabezados obligatorios faltantes: ${missing.join(', ')}. El archivo CSV debe contener los encabezados 'id_cliente' y 'orden'.`,
      details: `Encabezados encontrados: [${headers.join(', ')}]`,
    };
  }

  return null;
}

/**
 * Parses and validates CSV string text against route execution state.
 */
export function parseAndValidateCsv(
  fileContent: string,
  activeRouteClients: RouteClientProcessingState[]
): CsvValidationReport {
  const emptyReport: CsvValidationReport = {
    isValid: false,
    blockingErrors: [],
    warnings: [],
    discrepancies: {
      clientsWithoutInvoices: [],
      routeClientsNotInCsv: [],
    },
    orderedClients: [],
    totalOrderedInvoices: 0,
    totalMatchedClients: 0,
    grandTotalAmount: 0,
  };

  if (!fileContent || !fileContent.trim()) {
    return {
      ...emptyReport,
      blockingErrors: [
        {
          code: 'EMPTY_FILE',
          message: 'El archivo CSV está vacío.',
        },
      ],
    };
  }

  // Split lines while tracking 1-based original line numbers
  const rawLines = fileContent.split(/\r?\n/);
  const numberedLines: { lineNumber: number; text: string }[] = [];
  for (let i = 0; i < rawLines.length; i++) {
    const text = rawLines[i].trim();
    if (text.length > 0) {
      numberedLines.push({ lineNumber: i + 1, text: rawLines[i] });
    }
  }

  if (numberedLines.length === 0) {
    return {
      ...emptyReport,
      blockingErrors: [
        {
          code: 'EMPTY_FILE',
          message: 'El archivo CSV no contiene líneas válidas.',
        },
      ],
    };
  }

  const headerItem = numberedLines[0];
  const delimiter = detectDelimiter(headerItem.text);
  const rawHeaders = headerItem.text.split(delimiter);

  const headerError = validateHeaders(rawHeaders);
  if (headerError) {
    return {
      ...emptyReport,
      blockingErrors: [headerError],
    };
  }

  const normalizedHeaders = rawHeaders.map((h) => h.replace(/^\uFEFF/, '').trim().toLowerCase());
  const idClienteIdx = normalizedHeaders.indexOf('id_cliente');
  const ordenIdx = normalizedHeaders.indexOf('orden');

  const blockingErrors: CsvValidationError[] = [];
  const parsedRows: CsvRowRaw[] = [];
  const clientSeenMap = new Map<string, number[]>(); // clientId -> lineNumbers

  // Parse data rows
  for (let i = 1; i < numberedLines.length; i++) {
    const { lineNumber, text } = numberedLines[i];
    const columns = text.split(delimiter).map((c) => c.trim());

    const clientId = columns[idClienteIdx] !== undefined ? columns[idClienteIdx].trim() : '';
    const rawOrden = columns[ordenIdx] !== undefined ? columns[ordenIdx].trim() : '';

    if (!clientId) {
      blockingErrors.push({
        code: 'INVALID_POSITION',
        message: `Línea ${lineNumber}: El campo 'id_cliente' está vacío.`,
        lineNumbers: [lineNumber],
      });
      continue;
    }

    // Validate orden: must be positive integer > 0
    const isPositiveInteger = /^\d+$/.test(rawOrden) && parseInt(rawOrden, 10) > 0;
    if (!isPositiveInteger) {
      blockingErrors.push({
        code: 'INVALID_POSITION',
        message: `Línea ${lineNumber}: Valor de 'orden' inválido ("${rawOrden}"). Debe ser un número entero positivo mayor a 0.`,
        lineNumbers: [lineNumber],
        details: `Cliente ID: ${clientId}`,
      });
    }

    // Duplicate client ID tracking
    if (!clientSeenMap.has(clientId)) {
      clientSeenMap.set(clientId, [lineNumber]);
    } else {
      clientSeenMap.get(clientId)!.push(lineNumber);
    }

    if (isPositiveInteger) {
      parsedRows.push({
        lineNumber,
        clientId,
        rawOrden,
        orden: parseInt(rawOrden, 10),
      });
    }
  }

  // Check duplicate client IDs
  for (const [clientId, lines] of clientSeenMap.entries()) {
    if (lines.length > 1) {
      blockingErrors.push({
        code: 'DUPLICATE_CLIENT_ID',
        message: `Cliente duplicado '${clientId}' encontrado en las líneas: ${lines.join(', ')}. Cada cliente debe aparecer solo una vez en el CSV.`,
        lineNumbers: lines,
        details: `ID Cliente: ${clientId}`,
      });
    }
  }

  // If there are blocking errors, return report with isValid: false
  if (blockingErrors.length > 0) {
    return {
      ...emptyReport,
      isValid: false,
      blockingErrors,
    };
  }

  // RECONCILIATION & WARNINGS (isValid = true)
  const activeRouteClientsMap = new Map<string, RouteClientProcessingState>();
  const activeRouteClientIds = new Set<string>();

  for (const client of activeRouteClients) {
    if (client.status === 'success' && client.invoices && client.invoices.length > 0) {
      const normalizedId = client.clientId.trim();
      activeRouteClientsMap.set(normalizedId, client);
      activeRouteClientIds.add(normalizedId);
    }
  }

  const warnings: CsvWarning[] = [];
  const clientsWithoutInvoices: string[] = [];
  const routeClientsNotInCsv: string[] = [];
  const orderedClients: OrderedClientInvoices[] = [];
  const matchedCsvClientIds = new Set<string>();

  for (const row of parsedRows) {
    const clientId = row.clientId;
    const orden = row.orden!;

    matchedCsvClientIds.add(clientId);

    if (activeRouteClientsMap.has(clientId)) {
      const routeClient = activeRouteClientsMap.get(clientId)!;
      const totalAmount = routeClient.invoices.reduce(
        (acc, inv) => acc + (Number(inv.total_amount) || 0),
        0
      );

      orderedClients.push({
        clientId,
        orden,
        invoices: routeClient.invoices,
        totalAmount,
      });
    } else {
      warnings.push({
        code: 'CLIENT_WITHOUT_INVOICE',
        message: `El cliente CSV '${clientId}' no tiene facturas activas en la ejecución de la ruta.`,
        clientId,
      });
      clientsWithoutInvoices.push(clientId);
    }
  }

  // Check route clients with active invoices missing from CSV
  for (const routeClientId of activeRouteClientIds) {
    if (!matchedCsvClientIds.has(routeClientId)) {
      warnings.push({
        code: 'ROUTE_INVOICE_NOT_IN_CSV',
        message: `El cliente de la ruta '${routeClientId}' tiene facturas activas pero no fue incluido en el CSV cargado.`,
        clientId: routeClientId,
      });
      routeClientsNotInCsv.push(routeClientId);
    }
  }

  // Sort matched clients strictly ascending by 'orden'
  orderedClients.sort((a, b) => a.orden - b.orden);

  const totalOrderedInvoices = orderedClients.reduce(
    (acc, client) => acc + client.invoices.length,
    0
  );
  const totalMatchedClients = orderedClients.length;
  const grandTotalAmount = orderedClients.reduce(
    (acc, client) => acc + client.totalAmount,
    0
  );

  return {
    isValid: true,
    blockingErrors: [],
    warnings,
    discrepancies: {
      clientsWithoutInvoices,
      routeClientsNotInCsv,
    },
    orderedClients,
    totalOrderedInvoices,
    totalMatchedClients,
    grandTotalAmount,
  };
}
