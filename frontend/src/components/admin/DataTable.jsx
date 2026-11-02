import './DataTable.css'

export default function DataTable({ columns, rows, emptyMessage = 'No records found.' }) {
  return <div className="table-scroll"><table className="data-table"><thead><tr>{columns.map((column) => <th key={column.key}>{column.label}</th>)}</tr></thead>
    <tbody>{rows.length ? rows.map((row) => <tr key={row.id}>{columns.map((column) => <td key={column.key}>{column.render ? column.render(row) : row[column.key]}</td>)}</tr>) : <tr><td className="table-empty" colSpan={columns.length}>{emptyMessage}</td></tr>}</tbody>
  </table></div>
}
