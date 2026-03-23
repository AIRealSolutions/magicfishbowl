import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Users, Download } from 'lucide-react'

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tag?: string }>
}) {
  const { q, tag } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/biz?login=1')

  const { data: merchant } = await supabase
    .from('merchants')
    .select('id')
    .eq('owner_user_id', user.id)
    .single()

  if (!merchant) redirect('/biz')

  let query = supabase
    .from('crm_contacts')
    .select('*', { count: 'exact' })
    .eq('merchant_id', merchant.id)
    .order('created_at', { ascending: false })
    .limit(50)

  if (q) {
    query = query.or(`full_name.ilike.%${q}%,email.ilike.%${q}%,phone.ilike.%${q}%`)
  }
  if (tag) {
    query = query.contains('tags', [tag])
  }

  const { data: contacts, count } = await query

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
          <p className="text-sm text-gray-500 mt-1">{count ?? 0} total contacts</p>
        </div>
        <a
          href={`/api/contacts/export?merchant_id=${merchant.id}`}
          className="btn-secondary"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </a>
      </div>

      {/* Search */}
      <form method="GET" className="mb-5">
        <input
          type="search"
          name="q"
          defaultValue={q}
          className="input max-w-sm"
          placeholder="Search by name, email, or phone..."
        />
      </form>

      {!contacts || contacts.length === 0 ? (
        <div className="card text-center py-16">
          <Users className="h-12 w-12 text-gray-200 mx-auto mb-4" />
          <h2 className="font-semibold text-gray-700 mb-2">
            {q ? 'No results found' : 'No contacts yet'}
          </h2>
          <p className="text-sm text-gray-400">
            Contacts are captured automatically when members redeem offers.
          </p>
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 hidden sm:table-cell">Phone</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Source</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Tags</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Added</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {contacts.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-brand-100 flex items-center justify-center text-xs font-bold text-brand-700 flex-shrink-0">
                          {c.full_name[0]?.toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-900">{c.full_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{c.email}</td>
                    <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">{c.phone ?? '—'}</td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="badge badge-blue">{c.source}</span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {c.tags?.map((tag: string) => (
                          <Link key={tag} href={`/biz/contacts?tag=${tag}`}
                            className="badge badge-gray hover:badge-blue">
                            {tag}
                          </Link>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-400">
                      {new Date(c.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {(count ?? 0) > 50 && (
            <div className="px-4 py-3 border-t border-gray-100 text-sm text-gray-400 text-center">
              Showing 50 of {count} contacts. Use CSV export to see all.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
