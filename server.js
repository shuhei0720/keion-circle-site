import { createServer } from 'http'
import { parse } from 'url'
import next from 'next'
import { Server as SocketIOServer } from 'socket.io'
import { PrismaClient } from '@prisma/client'

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = 3000

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()
const prisma = new PrismaClient()

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })

  const io = new SocketIOServer(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  })

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id)

    socket.on('send-message', async (data) => {
      try {
        const { content, userId, userName, fileUrl, fileName, fileType } = data
        
        // メッセージをデータベースに保存
        const message = await prisma.message.create({
          data: {
            content,
            userId,
            fileUrl: fileUrl || null,
            fileName: fileName || null,
            fileType: fileType || null
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

        // 全クライアントにメッセージを配信
        io.emit('new-message', message)
      } catch (error) {
        console.error('Error saving message:', error)
      }
    })

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id)
    })
  })

  server
    .once('error', (err) => {
      console.error(err)
      process.exit(1)
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`)
    })
})
