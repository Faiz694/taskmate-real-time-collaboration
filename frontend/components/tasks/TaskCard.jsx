import { format, isPast } from 'date-fns'

const STATUS_NEXT = {
  todo:        'in_progress',
  in_progress: 'completed',
  completed:   null,
}

const STATUS_LABEL = {
  todo:        'Start',
  in_progress: 'Complete',
  completed:   null,
}

export default function TaskCard({ task, onStatusChange, onDelete }) {
  const deadline = task.deadline ? new Date(task.deadline) : null
  const isOverdue = deadline && isPast(deadline) && task.status !== 'completed'

  return (
    <div className="card p-4 group">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200 leading-snug">{task.title}</h3>
        <button
          onClick={() => onDelete(task.id)}
          className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all text-xs shrink-0"
          aria-label="Delete task"
        >
          ✕
        </button>
      </div>

      {task.description && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{task.description}</p>
      )}

      <div className="mt-3 flex items-center justify-between">
        {/* Assignee */}
        {task.assignee ? (
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-400 flex items-center justify-center text-[10px] font-bold">
              {task.assignee.name?.[0]?.toUpperCase()}
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">{task.assignee.name}</span>
          </div>
        ) : (
          <span className="text-xs text-gray-400 dark:text-gray-500 italic">Unassigned</span>
        )}

        {/* Deadline */}
        {deadline && (
          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
            isOverdue
              ? 'bg-red-50 dark:bg-red-900/30 text-red-500'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
          }`}>
            {isOverdue ? '⚠ ' : ''}{format(deadline, 'MMM d')}
          </span>
        )}
      </div>

      {/* Advance status */}
      {STATUS_NEXT[task.status] && (
        <button
          onClick={() => onStatusChange(task.id, STATUS_NEXT[task.status])}
          className="mt-3 w-full text-xs text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-medium
                     border border-brand-200 dark:border-brand-800 hover:border-brand-400 dark:hover:border-brand-600 rounded-lg py-1.5
                     transition-colors"
        >
          {STATUS_LABEL[task.status]} →
        </button>
      )}
    </div>
  )
}
