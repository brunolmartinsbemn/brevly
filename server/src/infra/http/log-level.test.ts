import { describe, expect, it } from 'vitest'
import { getLogLevel } from './log-level'

describe('getLogLevel', () => {
  it.each([
    ['development', 'info'],
    ['production', 'info'],
    ['test', 'silent'],
  ] as const)('logs at %s level %s', (nodeEnv, expected) => {
    expect(getLogLevel(nodeEnv)).toBe(expected)
  })
})
