import React from 'react';

export default function Table({
  columns = [],
  data = [],
  keyExtractor = (item, idx) => item._id || item.id || idx,
  emptyMessage = 'No records found.',
  loading = false,
  className = '',
}) {
  return (
    <div className={`w-full overflow-hidden rounded-xl border border-slate-200 bg-white ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50/90 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            <tr>
              {columns.map((col, idx) => (
                <th key={col.key || idx} className={`px-4 py-3.5 ${col.className || ''}`}>
                  {col.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              Array.from({ length: 5 }).map((_, rIdx) => (
                <tr key={rIdx} className="animate-pulse">
                  {columns.map((_, cIdx) => (
                    <td key={cIdx} className="px-4 py-3.5">
                      <div className="h-4 bg-slate-200/80 rounded w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-slate-400 text-sm">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rIdx) => (
                <tr key={keyExtractor(row, rIdx)} className="hover:bg-slate-50/70 transition-colors">
                  {columns.map((col, cIdx) => (
                    <td key={col.key || cIdx} className={`px-4 py-3.5 align-middle ${col.className || ''}`}>
                      {col.render ? col.render(row, rIdx) : row[col.dataIndex || col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
