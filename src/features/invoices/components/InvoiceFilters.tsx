'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Combobox, ComboboxInput, ComboboxContent, ComboboxList, ComboboxItem } from '@/components/ui/combobox';

export function InvoiceFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('search') || '');

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      params.set('page', '1'); // Reset to page 1 on filter change
      return params.toString();
    },
    [searchParams]
  );

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      router.push(pathname + '?' + createQueryString('search', search));
    }
  };

  const handleStatusChange = (value: string | string[] | null) => {
    const val = Array.isArray(value) ? value[0] : value;
    router.push(pathname + '?' + createQueryString('status', val || ''));
  };

  const handleWaChange = (value: string | string[] | null) => {
    const val = Array.isArray(value) ? value[0] : value;
    router.push(pathname + '?' + createQueryString('notification_count', val || ''));
  };

  return (
    <div className="flex gap-4 mb-6">
      <div className="relative flex-1 max-w-xs">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-muted-foreground" />
        </div>
        <Input
          type="text"
          className="pl-10 bg-white"
          placeholder="Buscar por cliente..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleSearch}
          onBlur={() => router.push(pathname + '?' + createQueryString('search', search))}
        />
      </div>

      <div className="w-48">
        <Combobox
          value={searchParams.get('status') || ''}
          onValueChange={handleStatusChange}
          itemToStringLabel={(itemValue) => {
            const labels: Record<string, string> = {
              '': 'Todos los estados',
              'DRAFT': 'Borrador',
              'ISSUED': 'Emitida',
              'PARTIALLY_PAID': 'Pagada Parcialmente',
              'PAID': 'Pagada',
              'CANCELED': 'Cancelada'
            };
            return labels[itemValue as string] || itemValue as string;
          }}
        >
          <ComboboxInput placeholder="Estado" />
          <ComboboxContent>
            <ComboboxList>
              <ComboboxItem value="" label="Todos los estados">Todos los estados</ComboboxItem>
              <ComboboxItem value="DRAFT" label="Borrador">Borrador</ComboboxItem>
              <ComboboxItem value="ISSUED" label="Emitida">Emitida</ComboboxItem>
              <ComboboxItem value="PARTIALLY_PAID" label="Pagada Parcialmente">Pagada Parcialmente</ComboboxItem>
              <ComboboxItem value="PAID" label="Pagada">Pagada</ComboboxItem>
              <ComboboxItem value="CANCELED" label="Cancelada">Cancelada</ComboboxItem>
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </div>

      <div className="w-48">
        <Combobox
          value={searchParams.get('notification_count') || ''}
          onValueChange={handleWaChange}
          itemToStringLabel={(itemValue) => {
            const labels: Record<string, string> = {
              '': 'Notificaciones WA',
              '0': '0 notificaciones',
              '1': '1 notificación',
              '2': '2+ notificaciones'
            };
            return labels[itemValue as string] || itemValue as string;
          }}
        >
          <ComboboxInput placeholder="Notificaciones WA" />
          <ComboboxContent>
            <ComboboxList>
              <ComboboxItem value="" label="Notificaciones WA">Notificaciones WA</ComboboxItem>
              <ComboboxItem value="0" label="0 notificaciones">0 notificaciones</ComboboxItem>
              <ComboboxItem value="1" label="1 notificación">1 notificación</ComboboxItem>
              <ComboboxItem value="2" label="2+ notificaciones">2+ notificaciones</ComboboxItem>
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </div>
    </div>
  );
}
