// Vercel serves everything under dist/client as static files first; whatever is
// left routes here.
//
// The built entry is a Web-standard { fetch(Request) => Response } handler, but
// Vercel's Node runtime invokes this function with Node's (IncomingMessage,
// ServerResponse). This translates between the two in both directions.
import server from '../dist/server/server.js'

const BODYLESS = new Set(['GET', 'HEAD'])

export default async function handler(req, res) {
  try {
    // Behind Vercel's proxy the original scheme only survives in the header.
    const proto = req.headers['x-forwarded-proto'] ?? 'https'
    const host = req.headers['x-forwarded-host'] ?? req.headers.host
    const url = new URL(req.url ?? '/', `${proto}://${host}`)

    const headers = new Headers()
    for (const [key, value] of Object.entries(req.headers)) {
      if (value === undefined) continue
      if (Array.isArray(value)) {
        for (const item of value) headers.append(key, item)
      } else {
        headers.set(key, value)
      }
    }

    const method = req.method ?? 'GET'
    const request = new Request(url, {
      method,
      headers,
      // Streaming the request needs half duplex; bodyless methods must not
      // carry one at all or Request throws.
      ...(BODYLESS.has(method) ? {} : { body: req, duplex: 'half' }),
    })

    const response = await server.fetch(request)

    res.statusCode = response.status
    for (const [key, value] of response.headers) {
      // set-cookie is the one header that legitimately repeats, and iterating
      // headers collapses it into a single comma-joined value.
      if (key.toLowerCase() === 'set-cookie') continue
      res.setHeader(key, value)
    }
    const cookies = response.headers.getSetCookie?.() ?? []
    if (cookies.length > 0) res.setHeader('set-cookie', cookies)

    if (!response.body) {
      res.end()
      return
    }
    for await (const chunk of response.body) {
      res.write(Buffer.from(chunk))
    }
    res.end()
  } catch (error) {
    // A crash here renders as Vercel's generic FUNCTION_INVOCATION_FAILED page,
    // which says nothing useful, so log the cause before giving up.
    console.error('helm ssr handler failed:', error)
    if (!res.headersSent) {
      res.statusCode = 500
      res.setHeader('content-type', 'text/plain; charset=utf-8')
    }
    res.end('Internal Server Error')
  }
}
