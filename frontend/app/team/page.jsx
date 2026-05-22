'use client'

import { useState } from 'react'
import useSWR from 'swr'
import api from '@/lib/api'
import Sidebar from '@/components/layout/Sidebar'
import { useAuth } from '@/hooks/useAuth'

const fetcher = (url) => api.get(url).then((r) => r.data)

function MemberAvatar({ name }) {
  return (
    <div
      className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-400 
                 flex items-center justify-center text-xs font-bold shrink-0"
      title={name}
    >
      {name?.[0]?.toUpperCase() ?? '?'}
    </div>
  )
}

export default function TeamPage() {
  const { data: teams, mutate } = useSWR('/api/teams/', fetcher)
  const { user } = useAuth()
  const [creating, setCreating] = useState(false)
  const [joining, setJoining] = useState(false)
  const [newName, setNewName] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [error, setError] = useState('')
  const [copiedId, setCopiedId] = useState(null)

  const handleCreate = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await api.post('/api/teams/', { name: newName })
      setNewName('')
      setCreating(false)
      mutate()
    } catch (err) {
      setError(err.response?.data?.detail ?? 'Failed to create team.')
    }
  }

  const handleJoin = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await api.post('/api/teams/join', { join_code: joinCode })
      setJoinCode('')
      setJoining(false)
      mutate()
    } catch (err) {
      setError(err.response?.data?.detail ?? 'Invalid join code.')
    }
  }

  const handleDelete = async (teamId) => {
    if (!confirm('Delete this team and all its data?')) return
    try {
      await api.delete(`/api/teams/${teamId}`)
      mutate()
    } catch (err) {
      setError(err.response?.data?.detail ?? 'Failed to delete team.')
    }
  }

  const copyCode = (code, teamId) => {
    navigator.clipboard.writeText(code)
    setCopiedId(teamId)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Teams</h1>
            <div className="flex gap-2">
              <button className="btn-secondary" onClick={() => { setJoining(true); setCreating(false) }}>
                Join Team
              </button>
              <button className="btn-primary" onClick={() => { setCreating(true); setJoining(false) }}>
                + New Team
              </button>
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2 mb-4">{error}</p>
          )}

          {creating && (
            <form onSubmit={handleCreate} className="card p-4 mb-4 flex gap-3">
              <input
                className="input flex-1"
                placeholder="Team name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
                autoFocus
              />
              <button type="submit" className="btn-primary">Create</button>
              <button type="button" className="btn-secondary" onClick={() => setCreating(false)}>Cancel</button>
            </form>
          )}

          {joining && (
            <form onSubmit={handleJoin} className="card p-4 mb-4 flex gap-3">
              <input
                className="input flex-1"
                placeholder="Enter join code"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                required
                autoFocus
              />
              <button type="submit" className="btn-primary">Join</button>
              <button type="button" className="btn-secondary" onClick={() => setJoining(false)}>Cancel</button>
            </form>
          )}

          <div className="space-y-4">
            {teams?.length === 0 && (
              <div className="card p-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                You're not in any teams yet. Create or join one above.
              </div>
            )}
            {teams?.map((team) => {
              const isOwner = team.owner_id === user?.id
              const memberList = team.members ?? []

              return (
                <div key={team.id} className="card p-5">
                  {/* Team header */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-gray-100 text-base">{team.name}</p>
                      {isOwner && (
                        <span className="text-[10px] font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wide">
                          Owner
                        </span>
                      )}
                    </div>
                    {isOwner && (
                      <button
                        onClick={() => handleDelete(team.id)}
                        className="text-xs text-red-400 hover:text-red-600 transition-colors"
                      >
                        Delete
                      </button>
                    )}
                  </div>

                  {/* Members */}
                  <div className="mb-3">
                    <p className="text-xs font-medium text-gray-400 dark:text-gray-500 mb-2">
                      Members ({memberList.length})
                    </p>
                    {memberList.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {memberList.map((member) => (
                          <div key={member.id} className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800 rounded-full px-2.5 py-1">
                            <MemberAvatar name={member.name} />
                            <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">
                              {member.name}
                              {member.id === team.owner_id && (
                                <span className="ml-1 text-[10px] text-brand-500">★</span>
                              )}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 dark:text-gray-500">No members yet.</p>
                    )}
                  </div>

                  {/* Join code — only visible to team creator */}
                  {isOwner && (
                    <div className="border-t border-gray-100 dark:border-gray-800 pt-3 mt-1">
                      <p className="text-xs text-gray-400 dark:text-gray-500 mb-1.5">
                        🔒 Join Code <span className="italic">(only you can see this)</span>
                      </p>
                      <div className="flex items-center gap-2">
                        <code className="font-mono text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-lg tracking-widest">
                          {team.join_code}
                        </code>
                        <button
                          onClick={() => copyCode(team.join_code, team.id)}
                          className="text-xs btn-secondary py-1.5 px-3"
                        >
                          {copiedId === team.id ? '✓ Copied!' : 'Copy'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </main>
    </div>
  )
}
