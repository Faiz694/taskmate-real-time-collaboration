import useSWR from 'swr'
import api from '@/lib/api'

const fetcher = (url) => api.get(url).then((r) => r.data)

export function useTasks(teamId) {
  const { data, error, mutate } = useSWR(
    teamId ? `/api/tasks/?team_id=${teamId}` : null,
    fetcher
  )

  const createTask = async (payload) => {
    await api.post('/api/tasks/', { ...payload, team_id: teamId })
    mutate()
  }

  const updateTask = async (taskId, updates) => {
    await api.patch(`/api/tasks/${taskId}`, updates)
    mutate()
  }

  const deleteTask = async (taskId) => {
    await api.delete(`/api/tasks/${taskId}`)
    mutate()
  }

  // Group tasks by status for the Kanban board
  const board = {
    todo:        (data || []).filter((t) => t.status === 'todo'),
    in_progress: (data || []).filter((t) => t.status === 'in_progress'),
    completed:   (data || []).filter((t) => t.status === 'completed'),
  }

  return {
    tasks: data || [],
    board,
    loading: !error && !data,
    error,
    createTask,
    updateTask,
    deleteTask,
    refresh: mutate,
  }
}
