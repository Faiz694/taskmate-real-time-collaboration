'use client'

import { useState } from 'react'
import useSWR from 'swr'
import api from '@/lib/api'

const fetcher = (url) => api.get(url).then((r) => r.data)

export default function TaskModal({ onClose, onSubmit, teamId }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    deadline: '',
    assignee_id: '',
  })
  const [saving, setSaving] = useState(false)

  // Fetch team details to get members for assignee dropdown
  const { data: team } = useSWR(teamId ? `/api/teams/${teamId}` : null, fetcher)
  const members = team?.members ?? []

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    setSaving(true)
    try {
      await onSubmit({
        ...form,
        assignee_id: form.assignee_id ? Number(form.assignee_id) : null,
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="card w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">New Task</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-lg">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Title *</label>
            <input
              className="input"
              placeholder="What needs to be done?"
              value={form.title}
              onChange={set('title')}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Description</label>
            <textarea
              className="input resize-none"
              rows={3}
              placeholder="Optional details…"
              value={form.description}
              onChange={set('description')}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Assign To</label>
            <select className="input" value={form.assignee_id} onChange={set('assignee_id')}>
              <option value="">Unassigned</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Deadline</label>
            <input
              type="date"
              className="input"
              value={form.deadline}
              onChange={set('deadline')}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1" disabled={saving}>
              {saving ? 'Creating…' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
