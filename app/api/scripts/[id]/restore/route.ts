import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const { id } = await params
    const { versionId } = await request.json()
    
    const version = await prisma.scriptVersion.findUnique({
      where: { id: versionId },
    })
    
    if (!version || version.scriptId !== id) {
      return NextResponse.json(
        { error: 'Version not found' },
        { status: 404 }
      )
    }
    
    const script = await prisma.script.update({
      where: { id },
      data: {
        content: version.content,
        encrypted: version.encrypted,
      },
    })
    
    const versions = await prisma.scriptVersion.findMany({
      where: { scriptId: id },
      orderBy: { version: 'desc' },
      take: 1,
    })
    
    const nextVersion = versions[0] ? versions[0].version + 1 : 1
    
    await prisma.scriptVersion.create({
      data: {
        scriptId: id,
        content: version.content,
        encrypted: version.encrypted,
        version: nextVersion,
      },
    })
    
    return NextResponse.json(script)
  } catch (error) {
    console.error('Restore script error:', error)
    return NextResponse.json(
      { error: 'Failed to restore script' },
      { status: 500 }
    )
  }
}
