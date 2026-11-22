import { randomBytes, scrypt } from 'node:crypto'

// OWASP Password Storage Cheat Sheet の推奨値。
// N=2^17 は約128MBのメモリを使い、Node の既定上限(32MB)を超えるため maxmem を広げている。
const SCRYPT_PARAMS = { N: 2 ** 17, r: 8, p: 1, maxmem: 256 * 1024 * 1024 }
const KEY_LENGTH = 64
const SALT_LENGTH = 16

function deriveKey(password: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, KEY_LENGTH, SCRYPT_PARAMS, (err, key) => {
      if (err) reject(err)
      else resolve(key)
    })
  })
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_LENGTH)
  const key = await deriveKey(password, salt)
  return `${salt.toString('hex')}:${key.toString('hex')}`
}
