import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateGameGuardianRequest } from '@/lib/validation'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const isValidGGRequest = await validateGameGuardianRequest()
    
    if (!isValidGGRequest) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    
    const script = await prisma.script.findUnique({
      where: { id },
    })
    
    if (!script) {
      return NextResponse.json(
        { error: 'Script not found' },
        { status: 404 }
      )
    }
    
    if (script.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Script is disabled' },
        { status: 403 }
      )
    }
    
    return new NextResponse(script.encrypted, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch (error) {
    console.error('Raw endpoint error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
