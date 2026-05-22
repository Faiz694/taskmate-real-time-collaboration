'use client'

import { useState, useRef, useEffect } from 'react'
import { useChat } from '@/hooks/useChat'
import MessageBubble from './MessageBubble'

export default function ChatWindow({ teamId }) {
  const { messages, connected, sendMessage } = useChat(teamId)
  const [text, setText] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = (e) => {
    e.preventDefault()
    if (!text.trim() || !connected) return
    sendMessage(text.trim())
    setText('')
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Connection indicator */}
      <div className="flex items-center gap-2 px-8 py-2 bg-gray-50 border-b border-gray-100">
        <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400' : 'bg-gray-300'}`} />
        <span className="text-xs text-gray-500">{connected ? 'Connected' : 'Connecting…'}</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-3">
        {messages.length === 0 && (
          <p className="text-sm text-gray-400 text-center mt-12">
            No messages yet. Say hello!
          </p>
        )}
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="px-8 py-4 border-t border-gray-100 bg-white flex gap-3"
      >
        <input
          className="input flex-1"
          placeholder={connected ? 'Type a message…' : 'Connecting…'}
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={!connected}
        />
        <button
          type="submit"
          className="btn-primary"
          disabled={!connected || !text.trim()}
        >
          Send
        </button>
      </form>
    </div>
  )
}
