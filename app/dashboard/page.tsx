'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'

interface Script {
  id: string
  name: string
  description: string | null
  status: string
  createdAt: string
  updatedAt: string
  _count: {
    versions: number
  }
}

export default function DashboardPage() {
  const [scripts, setScripts] = useState<Script[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchScripts()
  }, [])

  const fetchScripts = async () => {
    try {
      const response = await fetch('/api/scripts')
      if (response.ok) {
        const data = await response.json()
        setScripts(data)
      }
    } catch (error) {
      console.error('Failed to fetch scripts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/login' })
  }

  const deleteScript = async (id: string) => {
    if (!confirm('Are you sure you want to delete this script?')) return

    try {
      const response = await fetch(`/api/scripts/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchScripts()
      }
    } catch (error) {
      console.error('Failed to delete script:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-white">
                🔐 Script Management Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard/scripts/new')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                + New Script
              </button>
              <button
                onClick={handleLogout}
                className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center text-gray-400 py-12">Loading...</div>
        ) : scripts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">No scripts yet</div>
            <button
              onClick={() => router.push('/dashboard/scripts/new')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Your First Script
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {scripts.map((script) => (
              <div
                key={script.id}
                className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-gray-600 transition-colors"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-white">
                    {script.name}
                  </h3>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      script.status === 'ACTIVE'
                        ? 'bg-green-500 bg-opacity-10 text-green-500'
                        : 'bg-red-500 bg-opacity-10 text-red-500'
                    }`}
                  >
                    {script.status}
                  </span>
                </div>

                {script.description && (
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                    {script.description}
                  </p>
                )}

                <div className="text-xs text-gray-500 mb-4">
                  <div>Versions: {script._count.versions}</div>
                  <div>
                    Updated: {new Date(script.updatedAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => router.push(`/dashboard/scripts/${script.id}`)}
                    className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteScript(script.id)}
                    className="flex-1 bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
