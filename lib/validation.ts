import { headers } from 'next/headers'

export async function validateGameGuardianRequest(): Promise<boolean> {
  const headersList = await headers()
  
  const ggKey = headersList.get('x-gg-key')
  const clientType = headersList.get('x-client-type')
  const userAgent = headersList.get('user-agent')
  
  const expectedKey = process.env.GG_SECRET_KEY || 'default-gg-secret-key'
  
  if (!ggKey || ggKey !== expectedKey) {
    return false
  }
  
  if (clientType !== 'GG') {
    return false
  }
  
  const isBrowser = userAgent && (
    userAgent.includes('Mozilla') ||
    userAgent.includes('Chrome') ||
    userAgent.includes('Safari') ||
    userAgent.includes('Edge') ||
    userAgent.includes('Firefox')
  )
  
  if (isBrowser) {
    return false
  }
  
  return true
}

export function isBrowserRequest(userAgent: string | null): boolean {
  if (!userAgent) return false
  
  const browserPatterns = [
    'Mozilla',
    'Chrome',
    'Safari',
    'Edge',
    'Firefox',
    'Opera',
    'MSIE',
    'Trident'
  ]
  
  return browserPatterns.some(pattern => userAgent.includes(pattern))
}
