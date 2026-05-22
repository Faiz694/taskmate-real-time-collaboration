export default function ProgressCard({ completed, total }) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0

  return (
    <div className="card p-6">
      <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Overall Progress</h2>
      <div className="flex items-center gap-4">
        {/* Ring */}
        <svg className="w-20 h-20 shrink-0" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor"
            className="text-gray-100 dark:text-gray-800" strokeWidth="3" />
          <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor"
            className="text-brand-500" strokeWidth="3"
            strokeDasharray={`${pct} ${100 - pct}`}
            strokeDashoffset="25"
            strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 0.5s ease' }}
          />
          <text x="18" y="20.5" textAnchor="middle" fontSize="8"
            className="fill-gray-700 dark:fill-gray-300 font-bold">
            {pct}%
          </text>
        </svg>
        <div>
          <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{completed}<span className="text-sm font-normal text-gray-400 dark:text-gray-500">/{total}</span></p>
          <p className="text-xs text-gray-500 dark:text-gray-400">tasks completed</p>
        </div>
      </div>
    </div>
  )
}
