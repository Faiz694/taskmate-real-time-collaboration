export default function StatsGrid({ stats }) {
  const items = [
    { label: 'Total Tasks',  value: stats?.total       ?? 0, color: 'text-gray-700 dark:text-gray-300' },
    { label: 'To Do',        value: stats?.todo        ?? 0, color: 'text-blue-600 dark:text-blue-400' },
    { label: 'In Progress',  value: stats?.in_progress ?? 0, color: 'text-amber-600 dark:text-amber-400' },
    { label: 'Completed',    value: stats?.completed   ?? 0, color: 'text-green-600 dark:text-green-400' },
    { label: 'Overdue',      value: stats?.overdue     ?? 0, color: 'text-red-500 dark:text-red-400' },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {items.map(({ label, value, color }) => (
        <div key={label} className="card p-4 text-center">
          <p className={`text-3xl font-bold ${color}`}>{value}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{label}</p>
        </div>
      ))}
    </div>
  )
}
