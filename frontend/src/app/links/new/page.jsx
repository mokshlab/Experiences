import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/server-api'
import { LinkForm } from '@/components/features/links'

export const dynamic = 'force-dynamic'

export default async function NewLinkPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/auth/signin?callbackUrl=/links/new')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 pt-20 lg:pt-0">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400 flex items-center justify-center">
            <span className="text-white text-lg">🧠</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Create Memory Link
          </h1>
        </div>
        <LinkForm />
      </div>
    </div>
  )
}
