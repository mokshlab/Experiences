import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}))
    const paths = Array.isArray(body?.paths) ? body.paths : []

    if (paths.length === 0) {
      return NextResponse.json({ ok: false, error: 'paths required' }, { status: 400 })
    }

    for (const p of paths) {
      try {
        revalidatePath(p)
      } catch (err) {
        // Continue attempting other paths but log server-side
        console.error('revalidatePath failed for', p, err)
      }
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('revalidate route error', err)
    return NextResponse.json({ ok: false, error: err?.message || 'unknown' }, { status: 500 })
  }
}
