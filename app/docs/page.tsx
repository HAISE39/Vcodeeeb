import Link from 'next/link'

export default function DocsPage() {
  const ggKey = process.env.GG_SECRET_KEY || 'YOUR_GG_SECRET_KEY'

  return (
    <div className="min-h-screen bg-gray-900">
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-white hover:text-gray-300 transition-colors">
              ← Back to Home
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">📚 Documentation</h1>

        <div className="space-y-8">
          <section className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-white mb-4">🎮 Game Guardian Loader</h2>
            <p className="text-gray-400 mb-4">
              Use this loader in your Game Guardian scripts to securely load scripts from this platform:
            </p>
            <pre className="bg-gray-900 border border-gray-700 rounded p-4 overflow-x-auto">
              <code className="text-green-400 text-sm">{`-- Secure Script Loader for Game Guardian
local function decryptScript(encrypted)
    local CryptoJS = require("crypto-js")
    local key = "${ggKey}"
    local bytes = CryptoJS.AES.decrypt(encrypted, key)
    return bytes:toString(CryptoJS.enc.Utf8)
end

local function loadScript(scriptId)
    local response = gg.makeRequest({
        url = "https://yourdomain.com/api/raw/" .. scriptId,
        headers = {
            ["X-GG-KEY"] = "${ggKey}",
            ["X-CLIENT-TYPE"] = "GG"
        }
    })
    
    if response.code == 200 then
        local decrypted = decryptScript(response.content)
        local func, err = load(decrypted)
        if func then
            func()
        else
            gg.alert("Error loading script: " .. err)
        end
    else
        gg.alert("Failed to load script: " .. response.code)
    end
end

-- Load your script
loadScript("YOUR_SCRIPT_ID")`}</code>
            </pre>
          </section>

          <section className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-white mb-4">🔐 Security Features</h2>
            <ul className="space-y-3 text-gray-400">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <div>
                  <strong className="text-white">Header Validation:</strong> Requests must include
                  X-GG-KEY and X-CLIENT-TYPE headers
                </div>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <div>
                  <strong className="text-white">AES Encryption:</strong> All scripts are encrypted
                  with AES-256-CBC
                </div>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <div>
                  <strong className="text-white">Browser Protection:</strong> Direct browser access
                  is redirected to homepage
                </div>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <div>
                  <strong className="text-white">Version Control:</strong> Automatic version history
                  with restore capability
                </div>
              </li>
            </ul>
          </section>

          <section className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-white mb-4">🚀 Quick Start</h2>
            <ol className="space-y-3 text-gray-400 list-decimal list-inside">
              <li>
                <strong className="text-white">Register an account</strong> on the login page
              </li>
              <li>
                <strong className="text-white">Create a new script</strong> from the dashboard
              </li>
              <li>
                <strong className="text-white">Copy the script ID</strong> from the script editor
              </li>
              <li>
                <strong className="text-white">Use the loader code</strong> in Game Guardian with
                your script ID
              </li>
              <li>
                <strong className="text-white">Update scripts anytime</strong> without changing the
                loader
              </li>
            </ol>
          </section>

          <section className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-white mb-4">⚙️ Environment Variables</h2>
            <p className="text-gray-400 mb-4">
              Configure these in your Vercel project settings:
            </p>
            <div className="space-y-2 text-sm">
              <div className="bg-gray-900 border border-gray-700 rounded p-3">
                <code className="text-blue-400">DATABASE_URL</code>
                <p className="text-gray-500 mt-1">PostgreSQL connection string</p>
              </div>
              <div className="bg-gray-900 border border-gray-700 rounded p-3">
                <code className="text-blue-400">AUTH_SECRET</code>
                <p className="text-gray-500 mt-1">NextAuth.js secret key</p>
              </div>
              <div className="bg-gray-900 border border-gray-700 rounded p-3">
                <code className="text-blue-400">GG_SECRET_KEY</code>
                <p className="text-gray-500 mt-1">Game Guardian validation key</p>
              </div>
              <div className="bg-gray-900 border border-gray-700 rounded p-3">
                <code className="text-blue-400">ENCRYPTION_KEY</code>
                <p className="text-gray-500 mt-1">AES encryption key</p>
              </div>
            </div>
          </section>

          <section className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-white mb-4">❓ FAQ</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-white font-medium mb-2">
                  Can I access raw scripts in my browser?
                </h3>
                <p className="text-gray-400">
                  No. Browser requests are automatically redirected. Only Game Guardian with valid
                  headers can access scripts.
                </p>
              </div>
              <div>
                <h3 className="text-white font-medium mb-2">
                  How do I update a script?
                </h3>
                <p className="text-gray-400">
                  Edit the script in the dashboard. Version history is automatically saved. The
                  loader URL remains the same.
                </p>
              </div>
              <div>
                <h3 className="text-white font-medium mb-2">
                  Is the encryption secure?
                </h3>
                <p className="text-gray-400">
                  Yes. We use AES-256-CBC encryption with custom keys. Scripts are encrypted both
                  at rest and in transit.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
