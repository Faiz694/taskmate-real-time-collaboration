'use client'

import { useState, useEffect } from 'react'
import useSWR from 'swr'
import api from '@/lib/api'
import Sidebar from '@/components/layout/Sidebar'
import ChatWindow from '@/components/chat/ChatWindow'

const fetcher = (url) => api.get(url).then((r) => r.data)

export default function ChatPage() {
  const [teamId, setTeamId] = useState(null)
  const { data: teams } = useSWR('/api/teams/', fetcher)

  useEffect(() => {
    if (teams?.length && !teamId) setTeamId(teams[0].id)
  }, [teams, teamId])

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="px-8 py-5 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Team Chat</h1>
          {teams?.length > 1 && (
            <select
              className="input w-40"
              value={teamId ?? ''}
              onChange={(e) => setTeamId(Number(e.target.value))}
            >
              {teams.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          )}
        </div>
        {teamId ? (
          <ChatWindow teamId={teamId} />
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm">
            {teams?.length === 0 ? 'Create or join a team to start chatting.' : 'Loading…'}
          </div>
        )}
      </main>
    </div>
  )
}
