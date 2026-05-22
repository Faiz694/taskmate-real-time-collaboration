'use client'

import { useState, useEffect } from 'react'
import useSWR from 'swr'
import api from '@/lib/api'
import Sidebar from '@/components/layout/Sidebar'
import StatsGrid from '@/components/dashboard/StatsGrid'
import ActivityFeed from '@/components/dashboard/ActivityFeed'
import ProgressCard from '@/components/dashboard/ProgressCard'
import { format } from 'date-fns'

const fetcher = (url) => api.get(url).then((r) => r.data)

export default function DashboardPage() {
  const [teamId, setTeamId] = useState(null)
  const today = format(new Date(), 'EEEE, MMMM d, yyyy')

  const { data: teams } = useSWR('/api/teams/', fetcher)

  // Auto-select first team
  useEffect(() => {
    if (teams?.length && !teamId) setTeamId(teams[0].id)
  }, [teams, teamId])

  const selectedTeam = teams?.find((t) => t.id === teamId)

  const { data: stats } = useSWR(
    teamId ? `/api/tasks/stats?team_id=${teamId}` : null,
    fetcher
  )
  const { data: activity } = useSWR(
    teamId ? `/api/activity/?team_id=${teamId}` : null,
    fetcher
  )

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-5xl mx-auto">

          {/* Header bar: date + team name */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Dashboard</h1>
                {selectedTeam && (
                  <span className="px-2.5 py-1 bg-brand-50 dark:bg-brand-600/20 text-brand-700 dark:text-brand-400 rounded-full text-xs font-semibold">
                    {selectedTeam.name}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-400 dark:text-gray-500">{today}</p>
            </div>

            {teams?.length > 1 && (
              <select
                className="input w-48"
                value={teamId ?? ''}
                onChange={(e) => setTeamId(Number(e.target.value))}
              >
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            )}
          </div>

          {!teams?.length ? (
            <div className="card p-8 text-center text-gray-500 dark:text-gray-400">
              <p className="text-lg font-medium mb-2">No teams yet</p>
              <p className="text-sm">Create or join a team to see your dashboard.</p>
            </div>
          ) : (
            <>
              <StatsGrid stats={stats} />
              <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ProgressCard
                  completed={stats?.completed ?? 0}
                  total={stats?.total ?? 0}
                />
                <ActivityFeed events={activity ?? []} />
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
