import { useState, useEffect, useCallback } from 'react'
import { connectToRoom, disconnectSocket } from '@/lib/socket'

export function useChat(teamId) {
  const [messages, setMessages] = useState([])
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    if (!teamId) return

    const socket = connectToRoom(teamId)

    socket.on('connect', () => setConnected(true))
    socket.on('disconnect', () => setConnected(false))

    socket.on('message_history', (history) => setMessages(history))
    socket.on('new_message', (msg) =>
      setMessages((prev) => [...prev, msg])
    )

    return () => {
      socket.off('connect')
      socket.off('disconnect')
      socket.off('message_history')
      socket.off('new_message')
      disconnectSocket()
    }
  }, [teamId])

  const sendMessage = useCallback(
    (text) => {
      const socket = connectToRoom(teamId)
      socket.emit('send_message', { team_id: teamId, content: text })
    },
    [teamId]
  )

  return { messages, connected, sendMessage }
}
