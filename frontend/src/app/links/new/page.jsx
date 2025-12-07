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
          <span className="text-4xl">🧠</span>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
            Create Memory Link
          </h1>
        </div>
        <LinkForm />
      </div>
    </div>
  )
}
