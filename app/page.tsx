import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-white mb-4">
            🔐 Secure Script Delivery Platform
          </h1>
          <p className="text-xl text-gray-400 mb-2">
            For Game Guardian Lua Scripts
          </p>
          <p className="text-gray-500">
            Professional script management & secure delivery system
          </p>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <div className="bg-gray-700 bg-opacity-50 p-4 rounded-lg">
              <h3 className="text-white font-medium mb-2">✅ Secure Delivery</h3>
              <p className="text-gray-400 text-sm">
                Scripts protected with encryption and header validation
              </p>
            </div>
            <div className="bg-gray-700 bg-opacity-50 p-4 rounded-lg">
              <h3 className="text-white font-medium mb-2">📝 Script Management</h3>
              <p className="text-gray-400 text-sm">
                Full CRUD operations with version history
              </p>
            </div>
            <div className="bg-gray-700 bg-opacity-50 p-4 rounded-lg">
              <h3 className="text-white font-medium mb-2">🔄 Auto Backup</h3>
              <p className="text-gray-400 text-sm">
                Automatic version control and restore capability
              </p>
            </div>
            <div className="bg-gray-700 bg-opacity-50 p-4 rounded-lg">
              <h3 className="text-white font-medium mb-2">🚫 Browser Protection</h3>
              <p className="text-gray-400 text-sm">
                Raw scripts cannot be accessed via browser
              </p>
            </div>
          </div>
        </div>

        <div className="space-x-4">
          <Link
            href="/login"
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Get Started
          </Link>
          <Link
            href="/docs"
            className="inline-block bg-gray-700 text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-600 transition-colors"
          >
            Documentation
          </Link>
        </div>

        <div className="mt-12 text-gray-500 text-sm">
          <p>© 2024 Secure Script Delivery Platform</p>
        </div>
      </div>
    </div>
  )
}
