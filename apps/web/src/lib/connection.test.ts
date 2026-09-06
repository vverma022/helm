import { describe, expect, test } from 'bun:test'
import { normalizeDaemonAddress, validateConnectionConfig } from './connection'

describe('normalizeDaemonAddress', () => {
  test('normalizes host, HTTP, and daemon paths', () => {
    expect(normalizeDaemonAddress('host.example:34123')).toBe(
      'ws://host.example:34123',
    )
    expect(normalizeDaemonAddress('https://helm.example/v1?token=nope')).toBe(
      'wss://helm.example',
    )
    expect(normalizeDaemonAddress('HTTP://HELM.EXAMPLE/v1')).toBe(
      'ws://helm.example',
    )
  })

  test('rejects unsupported schemes and credentials', () => {
    expect(() => normalizeDaemonAddress('ftp://helm.example')).toThrow()
    expect(() => normalizeDaemonAddress('ws://token@helm.example')).toThrow()
  })

  test('requires a token without putting it in the address', () => {
    expect(() =>
      validateConnectionConfig({ address: 'helm.example', token: '  ' }),
    ).toThrow('token')
    expect(
      validateConnectionConfig({ address: 'helm.example', token: 'secret' }),
    ).toEqual({
      address: 'ws://helm.example',
      token: 'secret',
      remember: false,
    })
  })
})
