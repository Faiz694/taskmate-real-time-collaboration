import { format } from 'date-fns'

export default function MessageBubble({ message }) {
  return (
    <div className="flex items-start gap-3">
      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold shrink-0">
        {message.sender?.name?.[0]?.toUpperCase() ?? '?'}
      </div>

      <div className="min-w-0">
        <div className="flex items-baseline gap-2 mb-0.5">
          <span className="text-sm font-medium text-gray-800">
            {message.sender?.name ?? 'Unknown'}
          </span>
          <span className="text-xs text-gray-400">
            {message.created_at
              ? format(new Date(message.created_at), 'h:mm a')
              : ''}
          </span>
        </div>
        <p className="text-sm text-gray-700 leading-relaxed break-words">
          {message.content}
        </p>
      </div>
    </div>
  )
}
