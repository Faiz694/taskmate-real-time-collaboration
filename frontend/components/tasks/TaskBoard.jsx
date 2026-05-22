import TaskCard from './TaskCard'

const COLUMNS = [
  { key: 'todo',        label: 'To Do',       color: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400' },
  { key: 'in_progress', label: 'In Progress',  color: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400' },
  { key: 'completed',   label: 'Completed',    color: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' },
]

export default function TaskBoard({ board, onStatusChange, onDelete }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {COLUMNS.map(({ key, label, color }) => {
        const tasks = board?.[key] ?? []
        return (
          <div key={key}>
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg mb-3 ${color}`}>
              <span className="text-xs font-semibold uppercase tracking-wide">{label}</span>
              <span className="ml-auto text-xs font-bold">{tasks.length}</span>
            </div>
            <div className="space-y-3">
              {tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onStatusChange={onStatusChange}
                  onDelete={onDelete}
                />
              ))}
              {tasks.length === 0 && (
                <div className="card p-4 text-center text-xs text-gray-400 dark:text-gray-500 border-dashed border-2 border-gray-200 dark:border-gray-700 bg-transparent shadow-none">
                  No tasks
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
