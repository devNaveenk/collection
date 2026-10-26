import { describe, expect, it } from 'vitest'
import { credentialHash, verifyCredentials } from './auth'

describe('verifyCredentials', () => {
  it('accepts only listed accounts with the right password', async () => {
    const list = [{ email: 'a@sonline.us', passwordHash: await credentialHash('a@sonline.us', 'pw-1') }]
    expect(await verifyCredentials('A@Sonline.us ', 'pw-1', list)).toBe(true)
    expect(await verifyCredentials('a@sonline.us', 'wrong', list)).toBe(false)
    expect(await verifyCredentials('b@sonline.us', 'pw-1', list)).toBe(false)
    expect(await verifyCredentials('a@sonline.us', 'pw-1', [])).toBe(false)
  })
})
