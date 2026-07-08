'use client'

import { useState } from 'react'
import { Mail, Loader2, Send } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ContactsEmailPanel({ optedInCount }: { optedInCount: number }) {
  const [open, setOpen] = useState(false)
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/emails/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, body }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to send')
      toast.success(`Sent to ${data.sent} contact${data.sent !== 1 ? 's' : ''}!`)
      setSubject('')
      setBody('')
      setOpen(false)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to send')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mb-6">
      <button
        onClick={() => setOpen(!open)}
        className="btn-secondary"
        disabled={optedInCount === 0}
      >
        <Mail className="h-4 w-4" />
        Email Contacts
        {optedInCount > 0 && (
          <span className="ml-1 badge badge-blue">{optedInCount} opted in</span>
        )}
      </button>

      {open && (
        <div className="card mt-4">
          <h3 className="font-semibold text-gray-900 mb-4">Send Email Broadcast</h3>
          <form onSubmit={handleSend} className="space-y-4">
            <div>
              <label className="label">Subject</label>
              <input
                type="text"
                required
                className="input"
                placeholder="Special offer just for you..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
            <div>
              <label className="label">Message</label>
              <textarea
                required
                className="input min-h-[120px] resize-y"
                placeholder="Write your message here..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3">
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {loading ? 'Sending...' : `Send to ${optedInCount} contacts`}
              </button>
              <button type="button" onClick={() => setOpen(false)} className="btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
