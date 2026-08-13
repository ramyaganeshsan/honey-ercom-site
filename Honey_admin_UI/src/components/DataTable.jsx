export default function DataTable({
  columns = [],
  rows = [],
  rowKey = 'id',
  loading = false,
  emptyMessage = 'No records found',
}) {
  if (loading) {
    return <div className="loading-block">Loading…</div>
  }

  if (!rows.length) {
    return <div className="empty-state">{emptyMessage}</div>
  }

  const getKey = (row, index) => {
    if (typeof rowKey === 'function') return rowKey(row, index)
    return row[rowKey] ?? row._id ?? row.user_id ?? row.deal_id ?? index
  }

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key || col.header} style={col.width ? { width: col.width } : undefined}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={getKey(row, index)}>
              {columns.map((col) => (
                <td key={col.key || col.header}>
                  {col.render
                    ? col.render(row, index)
                    : (row[col.key] ?? '—')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
