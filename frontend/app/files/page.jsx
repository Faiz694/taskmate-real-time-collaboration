'use client'

import { useState, useEffect, useRef } from 'react'
import useSWR from 'swr'
import api from '@/lib/api'
import Sidebar from '@/components/layout/Sidebar'
import { useAuth } from '@/hooks/useAuth'

const fetcher = (url) => api.get(url).then((r) => r.data)

function formatBytes(bytes) {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

function FileIcon({ filename }) {
  const ext = filename?.split('.').pop()?.toLowerCase()
  const icons = {
    pdf: '📄', png: '🖼️', jpg: '🖼️', jpeg: '🖼️', gif: '🖼️', webp: '🖼️',
    doc: '📝', docx: '📝', xls: '📊', xlsx: '📊', ppt: '📋', pptx: '📋',
    zip: '🗜️', mp4: '🎬', mp3: '🎵', txt: '📃',
  }
  return <span className="text-2xl">{icons[ext] ?? '📄'}</span>
}

export default function FilesPage() {
  const [teamId, setTeamId] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [downloading, setDownloading] = useState(null)
  const [error, setError] = useState('')
  const fileRef = useRef()
  const { user } = useAuth()

  const { data: teams } = useSWR('/api/teams/', fetcher)
  useEffect(() => {
    if (teams?.length && !teamId) setTeamId(teams[0].id)
  }, [teams, teamId])

  const currentTeam = teams?.find((t) => t.id === teamId)
  const isMember = currentTeam?.members?.some((m) => m.id === user?.id) ?? false

  const { data: files, mutate } = useSWR(
    teamId ? `/api/files/?team_id=${teamId}` : null,
    fetcher
  )

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !teamId) return
    setUploading(true)
    setError('')
    try {
      const form = new FormData()
      form.append('file', file)
      await api.post(`/api/files/upload?team_id=${teamId}`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      mutate()
    } catch (err) {
      setError(err.response?.data?.detail ?? 'Upload failed.')
    } finally {
      setUploading(false)
      fileRef.current.value = ''
    }
  }

  const handleDelete = async (fileId) => {
    try {
      await api.delete(`/api/files/${fileId}`)
      mutate()
    } catch (err) {
      setError(err.response?.data?.detail ?? 'Delete failed.')
    }
  }

  // Download file — only available to team members
  const handleDownload = async (file) => {
    if (!isMember) return
    setDownloading(file.id)
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const token = localStorage.getItem('access_token')
      // file.url is already "/uploads/filename.ext" — just prepend apiBase
      const response = await fetch(`${apiBase}${file.url}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      if (!response.ok) throw new Error('Download failed')
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = file.filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      setError('Download failed. Please try again.')
    } finally {
      setDownloading(null)
    }
  }

  // const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Files</h1>
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
              <label className={`btn-primary cursor-pointer ${uploading ? 'opacity-50' : ''}`}>
                {uploading ? 'Uploading…' : '+ Upload File'}
                <input
                  type="file"
                  className="hidden"
                  ref={fileRef}
                  onChange={handleUpload}
                  disabled={!teamId || uploading}
                />
              </label>
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2 mb-4">{error}</p>
          )}

          {!isMember && teamId && (
            <div className="card p-3 mb-4 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              🔒 You must be a team member to download files.
            </div>
          )}

          {!teams?.length ? (
            <div className="card p-8 text-center text-gray-500 dark:text-gray-400 text-sm">
              Create or join a team to share files.
            </div>
          ) : (
            <div className="space-y-2">
              {files?.length === 0 && (
                <div className="card p-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                  No files uploaded yet. Upload one above.
                </div>
              )}
              {files?.map((file) => (
                <div key={file.id} className="card p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <FileIcon filename={file.filename} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                        {file.filename}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {formatBytes(file.size_bytes)}
                        {file.uploader?.name && (
                          <span className="ml-2 text-gray-300 dark:text-gray-600">· by {file.uploader.name}</span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4 shrink-0">
                    {/* Download button — only for team members */}
                    {isMember && (
                      <button
                        onClick={() => handleDownload(file)}
                        disabled={downloading === file.id}
                        className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1"
                        title="Download decrypted file"
                      >
                        {downloading === file.id ? (
                          <span className="animate-pulse">…</span>
                        ) : (
                          <>⬇ Download</>
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(file.id)}
                      className="text-xs text-red-400 hover:text-red-600 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}