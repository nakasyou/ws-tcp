let hostname = ''
let port = ''

const updateWscode = () => {
  $wscode.textContent = `new WebSocket('/${hostname}/${port}')`
}
$hostname.oninput = () => {
  hostname = $hostname.value
  updateWscode()
}
$port.oninput = () => {
  port = $port.value
  updateWscode()
}
globalThis.onload = () => {
  port = $port.value
  hostname = $hostname.value
  updateWscode()
}

/**
 * @type {WebSocket}
 */
let ws

$connect.onclick = () => {
  const url = new URL(location.href)
  url.protocol = url.protocol === 'http:' ? 'ws:' : 'wss:'

  url.pathname = `/${hostname}/${port}`

  ws = new WebSocket(url)
  ws.onmessage = async (evt) => {
    const text = await evt.data.text()
    $received.innerHTML += `${text.replaceAll('<', '&lt;').replaceAll('>', '&gt;')}\n`
  }
}

$send.onclick = () => {
  ws.send($data.value.replaceAll('\\n', '\n').replaceAll('\\r', '\r').replaceAll('\\\\', '\\'))
  $data.value = ''
}
