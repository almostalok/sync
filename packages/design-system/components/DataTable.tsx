import React from 'react';

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T, index: number) => string;
  onRowClick?: (row: T) => void;
  selectedKey?: string | null;
  emptyMessage?: string;
  dense?: boolean;
  className?: string;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  selectedKey,
  emptyMessage = 'No operational records to display.',
  dense = false,
  className = '',
}: DataTableProps<T>) {
  return (
    <div className={`overflow-x-auto rounded-none border-[1.5px] border-slate-900 bg-white shadow-[2px_2px_0px_#0f172a] ${className}`}>
      <table className="w-full text-left border-collapse font-mono text-xs">
        <thead className="bg-stone-100 border-b-[1.5px] border-slate-900">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                style={{ width: col.width }}
                className={`py-2 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-900 border-r border-slate-300 last:border-r-0 ${
                  col.align === 'right'
                    ? 'text-right'
                    : col.align === 'center'
                    ? 'text-center'
                    : 'text-left'
                } ${col.className || ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="py-8 text-center text-slate-500 font-mono text-xs"
              >
                // {emptyMessage.toUpperCase()}
              </td>
            </tr>
          ) : (
            data.map((row, idx) => {
              const rowKey = keyExtractor(row, idx);
              const isSelected = selectedKey === rowKey;
              const isClickable = !!onRowClick;

              return (
                <tr
                  key={rowKey}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={`transition-colors ${
                    isSelected
                      ? 'bg-slate-900 text-white font-medium'
                      : 'hover:bg-amber-50/60 text-slate-900'
                  } ${isClickable ? 'cursor-pointer' : ''}`}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`${dense ? 'py-1 px-3' : 'py-2 px-3'} border-r border-slate-200 last:border-r-0 ${
                        col.align === 'right'
                          ? 'text-right tabular-nums'
                          : col.align === 'center'
                          ? 'text-center'
                          : 'text-left'
                      } ${isSelected ? 'border-r-slate-700' : ''} ${col.className || ''}`}
                    >
                      {col.render
                        ? col.render(row)
                        : (row as any)[col.key] !== undefined
                        ? String((row as any)[col.key])
                        : '—'}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
