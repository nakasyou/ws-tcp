import { Hono } from '@hono/hono'
import { upgradeWebSocket } from '@hono/hono/deno'

const app = new Hono()

app.get(
  '/:hostname/:port',
  upgradeWebSocket(async (c) => {
    const { hostname, port } = c.req.param()
    const conn = await Deno.connect({
      port: parseInt(port),
      hostname,
    })
    const encoder = new TextEncoder()
    return {
      async onOpen(_e, ctx) {
        for await (const data of conn.readable) {
          ctx.send(data)
        }
      },
      async onMessage(e) {
        const data = new Uint8Array(
          typeof e.data === 'string'
            ? encoder.encode(e.data)
            : e.data instanceof Blob
            ? await e.data.arrayBuffer()
            : e.data,
        )
        await conn.write(data)
      },
    }
  }),
)

app.get('/demo.js', async (c) => {
  c.header('Content-Type', 'text/javascript')
  return c.body(await Deno.readTextFile('demo.js'))
})

app.get('/', (c) =>
  c.html(`
  <!doctype HTML>
  <html>
    <head>
      <meta charset="UTF-8" />
    </head>
    <body>
      <h1>WS-TCP Demo</h1>
      <div>
        <label>
          Hostname:
          <input value="example.com" id="$hostname" />
        </label>
        <label>
          Port:
          <input type="number" value="80" id="$port" />
        </label>
        <button id="$connect">Connect</button>
      </div>
      <pre><code id="$wscode"></code></pre>
      <div>
        <label style="display: flex">
          Data:
          <input id="$data" value="GET / HTTP/1.1\\nHost: example.com\\r\\n\\r\\n" style="width: 100%"></textarea>
          <button id="$send">Send</button>
        </label>
      </div>
      <div>
        Received:
        <pre><code id="$received"></code></pre>
      </div>
      <script src="/demo.js"></script>
      <script src="//cdn.jsdelivr.net/npm/eruda"></script>
      <script>eruda.init();</script>
    </body>
  </html>
` as string))

Deno.serve(app.fetch)
