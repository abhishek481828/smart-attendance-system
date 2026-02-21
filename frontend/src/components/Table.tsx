'use client';

interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function Table<T extends Record<string, any>>({
  columns,
  data,
  emptyMessage = 'No data available.',
}: TableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-white/10">
      <table className="w-full text-sm text-left">
        <thead className="bg-white/5 text-slate-400 uppercase text-xs tracking-wider">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="px-4 py-3 font-medium">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-white/[0.02] transition-colors">
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3 text-slate-300">
                  {col.render ? col.render(row) : String(row[col.key] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
