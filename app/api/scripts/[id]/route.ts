import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { encryptScript } from '@/lib/encryption'

export async function GET(
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
    
    const script = await prisma.script.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        versions: {
          orderBy: {
            version: 'desc',
          },
        },
      },
    })
    
    if (!script) {
      return NextResponse.json(
        { error: 'Script not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(script)
  } catch (error) {
    console.error('Get script error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch script' },
      { status: 500 }
    )
  }
}

export async function PUT(
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
    const { name, description, content, status } = await request.json()
    
    const existingScript = await prisma.script.findUnique({
      where: { id },
      include: {
        versions: {
          orderBy: {
            version: 'desc',
          },
          take: 1,
        },
      },
    })
    
    if (!existingScript) {
      return NextResponse.json(
        { error: 'Script not found' },
        { status: 404 }
      )
    }
    
    const updateData: any = {}
    
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (status !== undefined) updateData.status = status
    
    if (content !== undefined && content !== existingScript.content) {
      updateData.content = content
      updateData.encrypted = encryptScript(content)
      
      const latestVersion = existingScript.versions[0]
      const nextVersion = latestVersion ? latestVersion.version + 1 : 1
      
      await prisma.scriptVersion.create({
        data: {
          scriptId: id,
          content,
          encrypted: updateData.encrypted,
          version: nextVersion,
        },
      })
    }
    
    const script = await prisma.script.update({
      where: { id },
      data: updateData,
    })
    
    return NextResponse.json(script)
  } catch (error) {
    console.error('Update script error:', error)
    return NextResponse.json(
      { error: 'Failed to update script' },
      { status: 500 }
    )
  }
}

export async function DELETE(
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
    
    await prisma.script.delete({
      where: { id },
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete script error:', error)
    return NextResponse.json(
      { error: 'Failed to delete script' },
      { status: 500 }
    )
  }
}
