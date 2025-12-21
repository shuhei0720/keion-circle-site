import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const email = process.argv[2]
const password = process.argv[3]
const name = process.argv[4]

const hashedPassword = await bcrypt.hash(password, 10)
const userId = `admin-${crypto.randomUUID()}`

await prisma.user.create({
  data: {
    id: userId,
    email: email,
    name: name,
    password: hashedPassword,
    role: 'admin',
  }
})

console.log('管理者ユーザーを作成しました:', email)
prisma.$disconnect()
