export function formatOriginalUrl(url: string) {
  return url.replace(/^https?:\/\//, '')
}

export function formatAccessCount(count: number) {
  return `${count} ${count === 1 ? 'acesso' : 'acessos'}`
}
