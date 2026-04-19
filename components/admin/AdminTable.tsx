import type { ReactNode } from 'react';

export type Column<T extends object> = {
  key: string;
  label: string;
  render?: (row: T) => ReactNode;
};

export function AdminTable<T extends object>({
  columns,
  rows,
  emptyMessage = 'No records found.',
}: {
  columns: Column<T>[];
  rows: T[];
  emptyMessage?: string;
}) {
  return (
    <div className="border border-border rounded-md overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-bg-elev">
            {columns.map((col) => (
              <th
                key={col.key}
                className="text-left px-4 py-3 text-xs font-mono text-fg-muted uppercase tracking-wider whitespace-nowrap"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="text-center py-10 text-fg-muted"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row, i) => (
              <tr
                key={i}
                className="border-b border-border last:border-0 hover:bg-fg/[0.02] transition-colors"
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-fg align-middle">
                    {col.render
                      ? col.render(row)
                      : String(
                          (row as Record<string, unknown>)[col.key] ?? '',
                        )}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
