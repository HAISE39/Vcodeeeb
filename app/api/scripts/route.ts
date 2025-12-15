import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { encryptScript } from '@/lib/encryption'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    
    const scripts = await prisma.script.findMany({
      where: {
        ...(status && { status: status as any }),
      },
      orderBy: {
        updatedAt: 'desc',
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        _count: {
          select: {
            versions: true,
          },
        },
      },
    })
    
    return NextResponse.json(scripts)
  } catch (error) {
    console.error('Get scripts error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch scripts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const { name, description, content } = await request.json()
    
    if (!name || !content) {
      return NextResponse.json(
        { error: 'Name and content are required' },
        { status: 400 }
      )
    }
    
    const encrypted = encryptScript(content)
    
    const script = await prisma.script.create({
      data: {
        name,
        description,
        content,
        encrypted,
        userId: session.user.id,
      },
    })
    
    await prisma.scriptVersion.create({
      data: {
        scriptId: script.id,
        content,
        encrypted,
        version: 1,
      },
    })
    
    return NextResponse.json(script)
  } catch (error) {
    console.error('Create script error:', error)
    return NextResponse.json(
      { error: 'Failed to create script' },
      { status: 500 }
    )
  }
}
