type NodeEnv = 'development' | 'test' | 'production'

export function getLogLevel(nodeEnv: NodeEnv) {
  return nodeEnv === 'test' ? 'silent' : 'info'
}
