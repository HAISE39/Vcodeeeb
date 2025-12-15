import CryptoJS from 'crypto-js'

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-encryption-key-change-in-production'

export function encryptScript(content: string): string {
  const encrypted = CryptoJS.AES.encrypt(content, ENCRYPTION_KEY).toString()
  return encrypted
}

export function decryptScript(encrypted: string): string {
  const bytes = CryptoJS.AES.decrypt(encrypted, ENCRYPTION_KEY)
  return bytes.toString(CryptoJS.enc.Utf8)
}

export function generateSecureKey(): string {
  return CryptoJS.lib.WordArray.random(32).toString()
}
