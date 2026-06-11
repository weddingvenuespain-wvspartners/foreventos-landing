import { readFileSync } from 'fs'
import { join } from 'path'
import { NextResponse } from 'next/server'

export const dynamic = 'force-static'

const EN_TITLE = 'FOREVENTOS — Less admin. More events closed.'
const EN_DESCRIPTION =
  'The sales platform for venues and caterers: centralize inquiries from web, bodas.net, email and WhatsApp, send dossiers that convert and close quotes with online signature.'

export async function GET() {
  // El contenido del body lo traduce el script i18n del cliente (detecta /en);
  // aquí solo ajustamos el head para SEO: lang, title, description, canonical y og:locale.
  const html = readFileSync(join(process.cwd(), 'app/page.html'), 'utf-8')
    .replace('<html lang="es" data-lang="es">', '<html lang="en" data-lang="en">')
    .replace(
      /<title>[^<]*<\/title>/,
      `<title>${EN_TITLE}</title>`
    )
    .replace(
      /(<meta name="description" content=")[^"]*(" \/>)/,
      `$1${EN_DESCRIPTION}$2`
    )
    .replace(
      '<link rel="canonical" href="https://foreventos.com/" />',
      '<link rel="canonical" href="https://foreventos.com/en" />'
    )
    .replace(
      /(<meta property="og:title" content=")[^"]*(" \/>)/,
      `$1${EN_TITLE}$2`
    )
    .replace(
      '<meta property="og:url" content="https://foreventos.com/" />',
      '<meta property="og:url" content="https://foreventos.com/en" />'
    )
    .replace(
      '<meta property="og:locale" content="es_ES" />',
      '<meta property="og:locale" content="en_US" />'
    )
  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
