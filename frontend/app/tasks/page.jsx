'use client'

import { useState, useEffect } from 'react'
import useSWR from 'swr'
import api from '@/lib/api'
import Sidebar from '@/components/layout/Sidebar'
import TaskBoard from '@/components/tasks/TaskBoard'
import TaskModal from '@/components/tasks/TaskModal'
import { useTasks } from '@/hooks/useTasks'

const fetcher = (url) => api.get(url).then((r) => r.data)

export default function TasksPage() {
  const [teamId, setTeamId] = useState(null)
  const [showModal, setShowModal] = useState(false)

  const { data: teams } = useSWR('/api/teams/', fetcher)

  useEffect(() => {
    if (teams?.length && !teamId) setTeamId(teams[0].id)
  }, [teams, teamId])

  const { board, loading, createTask, updateTask, deleteTask } = useTasks(teamId)

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Tasks</h1>
            <div className="flex items-center gap-3">
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
              <button className="btn-primary" onClick={() => setShowModal(true)} disabled={!teamId}>
                + New Task
              </button>
            </div>
          </div>

          {!teams?.length ? (
            <div className="card p-8 text-center text-gray-500 dark:text-gray-400">
              <p className="text-sm">Create or join a team to manage tasks.</p>
            </div>
          ) : loading ? (
            <p className="text-gray-400 dark:text-gray-500 text-sm">Loading tasks…</p>
          ) : (
            <TaskBoard
              board={board}
              onStatusChange={(taskId, status) => updateTask(taskId, { status })}
              onDelete={deleteTask}
            />
          )}
        </div>
      </main>

      {showModal && (
        <TaskModal
          teamId={teamId}
          onClose={() => setShowModal(false)}
          onSubmit={async (data) => {
            await createTask({ ...data, team_id: teamId })
            setShowModal(false)
          }}
        />
      )}
    </div>
  )
}
