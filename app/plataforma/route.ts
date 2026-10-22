import { readFileSync } from 'fs'
import { join } from 'path'
import { NextResponse } from 'next/server'

// foreventos.com/plataforma — la presentación detallada de la plataforma
// (app.foreventos.com): era la home hasta que FOREVENTOS pasó a presentarse como
// empresa de tecnología y marketing para eventos (webs, plataforma, desarrollo,
// SEO y Google Ads). Mismo HTML estático con su propio title y canonical.
export const dynamic = 'force-static'

export async function GET() {
  const html = readFileSync(join(process.cwd(), 'app/plataforma/page.html'), 'utf-8')
  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
