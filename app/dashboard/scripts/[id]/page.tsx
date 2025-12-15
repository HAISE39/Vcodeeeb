'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'

interface Script {
  id: string
  name: string
  description: string | null
  content: string
  status: string
  versions: Array<{
    id: string
    version: number
    createdAt: string
  }>
}

export default function EditScriptPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [script, setScript] = useState<Script | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [content, setContent] = useState('')
  const [status, setStatus] = useState('ACTIVE')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [showRawUrl, setShowRawUrl] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchScript()
  }, [resolvedParams.id])

  const fetchScript = async () => {
    try {
      const response = await fetch(`/api/scripts/${resolvedParams.id}`)
      if (response.ok) {
        const data = await response.json()
        setScript(data)
        setName(data.name)
        setDescription(data.description || '')
        setContent(data.content)
        setStatus(data.status)
      }
    } catch (err) {
      setError('Failed to load script')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      const response = await fetch(`/api/scripts/${resolvedParams.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, content, status }),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || 'Failed to update script')
        return
      }

      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const restoreVersion = async (versionId: string) => {
    if (!confirm('Restore this version? Current content will be saved as a new version.')) return

    try {
      const response = await fetch(`/api/scripts/${resolvedParams.id}/restore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ versionId }),
      })

      if (response.ok) {
        fetchScript()
      }
    } catch (err) {
      setError('Failed to restore version')
    }
  }

  const rawUrl = `${window.location.origin}/api/raw/${resolvedParams.id}`

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    )
  }

  if (!script) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-red-500">Script not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={() => router.push('/dashboard')}
              className="text-white hover:text-gray-300 transition-colors"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Edit Script</h1>
          <button
            onClick={() => setShowRawUrl(!showRawUrl)}
            className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
          >
            {showRawUrl ? 'Hide' : 'Show'} Raw URL
          </button>
        </div>

        {showRawUrl && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-6">
            <h3 className="text-white font-medium mb-2">🔗 Raw Endpoint (For Game Guardian)</h3>
            <code className="text-green-400 text-sm break-all">{rawUrl}</code>
            <div className="mt-4 bg-yellow-500 bg-opacity-10 border border-yellow-500 text-yellow-500 px-4 py-2 rounded text-sm">
              ⚠️ This URL only works with valid Game Guardian headers. Browser access will be blocked.
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Script Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ACTIVE">Active</option>
              <option value="DISABLED">Disabled</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Lua Script Content *
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={20}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && (
            <div className="bg-red-500 bg-opacity-10 border border-red-500 text-red-500 px-4 py-2 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="bg-gray-700 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>

        {script.versions.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-bold text-white mb-4">Version History</h2>
            <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
              {script.versions.map((version) => (
                <div
                  key={version.id}
                  className="flex justify-between items-center px-4 py-3 border-b border-gray-700 last:border-b-0"
                >
                  <div className="text-white">
                    <span className="font-medium">Version {version.version}</span>
                    <span className="text-gray-400 text-sm ml-4">
                      {new Date(version.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <button
                    onClick={() => restoreVersion(version.id)}
                    className="bg-gray-700 text-white px-3 py-1 rounded text-sm hover:bg-gray-600 transition-colors"
                  >
                    Restore
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
