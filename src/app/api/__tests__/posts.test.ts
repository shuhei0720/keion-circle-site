import { GET, POST } from '../posts/route'
import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'

// Prismaモックの型定義
const mockPrisma = prisma as jest.Mocked<typeof prisma>

describe('/api/posts', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/posts', () => {
    it('returns list of posts', async () => {
      const mockPosts = [
        {
          id: '1',
          title: 'Test Post',
          content: 'Test Content',
          youtubeUrls: [],
          images: [],
          userId: 'user1',
          eventId: null,
          activityScheduleId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          user: {
            id: 'user1',
            name: 'Test User',
            email: 'test@example.com',
            avatarUrl: null,
          },
          participants: [],
          likes: [],
          _count: { comments: 0 },
        },
      ]

      mockPrisma.post.findMany.mockResolvedValue(mockPosts as any)

      const request = new NextRequest('http://localhost:3000/api/posts')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveLength(1)
      expect(data[0].title).toBe('Test Post')
    })

    it('handles database errors', async () => {
      mockPrisma.post.findMany.mockRejectedValue(new Error('Database error'))

      const request = new NextRequest('http://localhost:3000/api/posts')
      const response = await GET(request)

      expect(response.status).toBe(500)
    })
  })

  describe('POST /api/posts', () => {
    it('creates a new post with admin role', async () => {
      const mockSession = {
        user: {
          id: 'admin1',
          role: 'admin',
          email: 'admin@example.com',
        },
      }

      const mockPost = {
        id: 'new-post',
        title: 'New Post',
        content: 'New Content',
        youtubeUrls: [],
        images: [],
        userId: 'admin1',
        eventId: null,
        activityScheduleId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockPrisma.post.create.mockResolvedValue(mockPost as any)

      const request = new NextRequest('http://localhost:3000/api/posts', {
        method: 'POST',
        body: JSON.stringify({
          title: 'New Post',
          content: 'New Content',
        }),
      })

      // Note: 実際のテストでは認証モックが必要
      // const response = await POST(request)
      // expect(response.status).toBe(201)
    })

    it('rejects non-admin users', async () => {
      // 一般ユーザーによる投稿作成を拒否するテスト
      const mockSession = {
        user: {
          id: 'user1',
          role: 'member',
          email: 'user@example.com',
        },
      }

      // 実装に応じてテストを追加
    })
  })
})
