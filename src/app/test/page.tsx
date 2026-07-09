'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function TestPage() {
  const [status, setStatus] = useState<string>('Loading...')
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (msg: string) => {
    console.log(msg)
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`])
  }

  const testSupabase = async () => {
    try {
      addLog('1. Creating Supabase client...')
      const supabase = createClient()
      addLog('2. Client created successfully')

      addLog('3. Testing getSession...')
      const { data: { session } } = await supabase.auth.getSession()
      addLog(`4. Session result: ${session ? 'Logged in' : 'Not logged in'}`)

      addLog('5. Environment check:')
      addLog(`   URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set'}`)
      addLog(`   Key: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set'}`)

      setStatus('✅ Supabase is working!')
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      addLog(`❌ Error: ${msg}`)
      setStatus(`Error: ${msg}`)
    }
  }

  const testSignUp = async () => {
    try {
      addLog('Starting test signup...')
      const supabase = createClient()

      const testEmail = `test-${Date.now()}@example.com`
      const testPassword = 'TestPassword123'

      addLog(`Email: ${testEmail}`)
      addLog(`Attempting signUp...`)

      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
      })

      if (error) {
        addLog(`❌ SignUp error: ${error.message}`)
        setStatus(`SignUp failed: ${error.message}`)
        return
      }

      addLog(`✅ SignUp succeeded! User ID: ${data.user?.id}`)
      setStatus('✅ SignUp test passed!')
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      addLog(`❌ Exception: ${msg}`)
      setStatus(`Error: ${msg}`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 to-white p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">🧪 Supabase Test Page</h1>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <p className="text-lg font-semibold mb-2">Status: {status}</p>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={testSupabase}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-semibold"
          >
            Test Supabase Connection
          </button>
          <button
            onClick={testSignUp}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-semibold"
          >
            Test SignUp
          </button>
          <button
            onClick={() => {
              setLogs([])
              setStatus('Loading...')
            }}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 font-semibold"
          >
            Clear Logs
          </button>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h2 className="font-bold text-lg mb-2">Debug Logs:</h2>
          <div className="space-y-1 font-mono text-sm max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-500">Click a button to see logs...</p>
            ) : (
              logs.map((log, i) => (
                <div key={i} className="text-gray-700 break-all">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
          <p>This test page helps diagnose Supabase connectivity issues.</p>
          <p>Visit <code className="bg-yellow-100 px-1 rounded">magicfishbowl.com/test</code> on your phone to run these tests.</p>
        </div>
      </div>
    </div>
  )
}
