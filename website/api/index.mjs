// Vercel serves everything under dist/client as static files first; whatever is
// left routes here. The built entry is a Web-standard { fetch(Request) } handler,
// which Vercel's Node runtime accepts as-is, so this only unwraps it.
import server from '../dist/server/server.js'

export default function handler(request) {
  return server.fetch(request)
}
