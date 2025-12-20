import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

// スケジュール回答の投稿・更新
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: scheduleDateId } = await params
    const body = await request.json()
    const { status, comment } = body

    const response = await prisma.scheduleResponse.upsert({
      where: {
        scheduleDateId_userId: {
          scheduleDateId,
          userId: session.user.id
        }
      },
      update: {
        status,
        comment
      },
      create: {
        scheduleDateId,
        userId: session.user.id,
        status,
        comment
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(response)
  } catch (error) {
    console.error('Response error:', error)
    return NextResponse.json({ error: 'Failed to update response' }, { status: 500 })
  }
}
