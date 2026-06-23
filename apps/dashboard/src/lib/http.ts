export const postJson = (url: string, body: unknown, headers?: HeadersInit) =>
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  })
