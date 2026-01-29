import React from 'react';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  striped?: boolean;
  hoverable?: boolean;
}

export function Table<T extends Record<string, any>>({ 
  columns, 
  data, 
  striped = false,
  hoverable = true 
}: TableProps<T>) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b-2 border-[var(--color-border)]">
            {columns.map((column) => (
              <th
                key={column.key}
                className="px-6 py-4 text-left font-semibold text-[var(--color-text-primary)] bg-[var(--color-surface)]"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, rowIndex) => (
            <tr
              key={rowIndex}
              className={`border-b border-[var(--color-border)] transition-all duration-200 ${
                striped && rowIndex % 2 === 1 ? 'bg-[var(--color-surface)]' : ''
              } ${hoverable ? 'hover:bg-[var(--color-surface)] hover:shadow-sm' : ''}`}
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className="px-6 py-4 text-[var(--color-text-primary)]"
                >
                  {column.render ? column.render(item) : item[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      
      {data.length === 0 && (
        <div className="text-center py-12 text-[var(--color-text-muted)] animate-in fade-in duration-300">
          No data available
        </div>
      )}
    </div>
  );
}
