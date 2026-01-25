import { fetch as tauriFetch } from '@tauri-apps/plugin-http'

function normalizeUrl(raw: string) {
  const s = raw.trim()
  if (!s) return null
  const withProto = /^https?:\/\//i.test(s) ? s : `https://${s}`
  try {
    return new URL(withProto)
  } catch {
    return null
  }
}

async function fetchImage(url: string) {
  const res = await tauriFetch(url)
  if (!res.ok) return null

  const ct = (res.headers.get('content-type') || '').toLowerCase()
  if (!ct.includes('image')) return null
  const file = new File([await res.blob()], 'Icon')
  return file
}

export async function getImage(siteUrl: string | null): Promise<File | null> {
  if (!siteUrl) return null
  const u = normalizeUrl(siteUrl)
  if (!u) return null

  const origin = u.origin

  return (
    (await fetchImage(`${origin}/favicon.ico`)) || (await fetchImage(`${origin}/favicon.svg`)) || null
  )
}
