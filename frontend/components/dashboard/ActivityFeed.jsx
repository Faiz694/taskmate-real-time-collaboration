import { formatDistanceToNow } from 'date-fns'

const TYPE_ICON = {
  task_created:   '✚',
  task_completed: '✓',
  file_uploaded:  '⬆',
  member_joined:  '◉',
}

export default function ActivityFeed({ events }) {
  return (
    <div className="card p-6">
      <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Recent Activity</h2>
      {events.length === 0 ? (
        <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-4">No activity yet.</p>
      ) : (
        <ul className="space-y-3">
          {events.slice(0, 8).map((ev) => (
            <li key={ev.id} className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 flex items-center justify-center text-xs shrink-0 mt-0.5">
                {TYPE_ICON[ev.type] ?? '·'}
              </span>
              <div className="min-w-0">
                <p className="text-xs text-gray-700 dark:text-gray-300 leading-snug">{ev.description}</p>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                  {formatDistanceToNow(new Date(ev.created_at), { addSuffix: true })}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
