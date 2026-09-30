'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useState } from 'react';
import { Search } from 'lucide-react';

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

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    router.push(pathname + '?' + createQueryString('status', e.target.value));
  };

  const handleWaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    router.push(pathname + '?' + createQueryString('notification_count', e.target.value));
  };

  return (
    <div className="flex gap-4 mb-6">
      <div className="relative flex-1 max-w-xs bg-white rounded-md border border-gray-300">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 sm:text-sm"
          placeholder="Buscar por cliente..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleSearch}
          onBlur={() => router.push(pathname + '?' + createQueryString('search', search))}
        />
      </div>

      <select
        className="block w-48 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md border bg-white"
        onChange={handleStatusChange}
        defaultValue={searchParams.get('status') || ''}
      >
        <option value="">Estado</option>
        <option value="Emitida">Emitida</option>
        <option value="Pagada">Pagada</option>
        <option value="Vencida">Vencida</option>
      </select>

      <select
        className="block w-48 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md border bg-white"
        onChange={handleWaChange}
        defaultValue={searchParams.get('notification_count') || ''}
      >
        <option value="">Notificaciones WA</option>
        <option value="0">0 notificaciones</option>
        <option value="1">1 notificación</option>
        <option value="2">2+ notificaciones</option>
      </select>
    </div>
  );
}
