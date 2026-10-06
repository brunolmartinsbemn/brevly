export function buildPublicUrl(baseUrl: string, key: string) {
  return `${baseUrl.replace(/\/+$/, '')}/${key.replace(/^\/+/, '')}`
}
