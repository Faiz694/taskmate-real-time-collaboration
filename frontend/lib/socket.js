import { io } from 'socket.io-client'

let socket = null

export function getSocket() {
  if (!socket) {
    const token = typeof window !== 'undefined'
      ? localStorage.getItem('access_token')
      : null

    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'https://taskmate-real-time-collaboration.onrender.com', {
      auth: { token },
      transports: ['websocket'],
      autoConnect: false,
    })
  }
  return socket
}

export function connectToRoom(teamId) {
  const s = getSocket()
  if (!s.connected) s.connect()
  s.emit('join_room', { team_id: teamId })
  return s
}

export function disconnectSocket() {
  if (socket?.connected) {
    socket.disconnect()
    socket = null
  }
}
