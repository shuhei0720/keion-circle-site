import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import DashboardLayout from '@/components/DashboardLayout';
import ProfileEditClient from './ProfileEditClient';
import { User, Mail, Calendar, FileText, MessageSquare } from 'lucide-react';
import Link from 'next/link';

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      posts: {
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
      postParticipants: {
        include: {
          post: true,
        },
        orderBy: {
          post: {
            createdAt: 'desc',
          },
        },
        take: 5,
      },
      _count: {
        select: {
          posts: true,
          postParticipants: true,
          messages: true,
        },
      },
    },
  });

  if (!user) {
    redirect('/auth/signin');
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">マイプロフィール</h1>

        {/* プロフィール編集 */}
        <ProfileEditClient user={user} />

        {/* 統計情報 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileText className="text-blue-600" size={24} />
              </div>
              <div>
                <p className="text-gray-600 text-sm">投稿数</p>
                <p className="text-2xl font-bold">{user._count.posts}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <User className="text-green-600" size={24} />
              </div>
              <div>
                <p className="text-gray-600 text-sm">参加回数</p>
                <p className="text-2xl font-bold">{user._count.postParticipants}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <MessageSquare className="text-purple-600" size={24} />
              </div>
              <div>
                <p className="text-gray-600 text-sm">メッセージ数</p>
                <p className="text-2xl font-bold">{user._count.messages}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 最近の投稿 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold mb-4">最近の投稿</h3>
            {user.posts.length > 0 ? (
              <ul className="space-y-3">
                {user.posts.map((post) => (
                  <li key={post.id}>
                    <Link
                      href={`/posts`}
                      className="block p-3 border rounded hover:bg-gray-50 transition"
                    >
                      <h4 className="font-semibold">{post.title}</h4>
                      <p className="text-sm text-gray-500">
                        {new Date(post.createdAt).toLocaleDateString('ja-JP')}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">まだ投稿がありません</p>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold mb-4">参加している投稿</h3>
            {user.postParticipants.length > 0 ? (
              <ul className="space-y-3">
                {user.postParticipants.map((participant) => (
                  <li key={participant.id}>
                    <Link
                      href={`/posts`}
                      className="block p-3 border rounded hover:bg-gray-50 transition"
                    >
                      <h4 className="font-semibold">{participant.post.title}</h4>
                      <p className="text-sm text-gray-500">
                        {new Date(participant.createdAt).toLocaleDateString('ja-JP')}に参加
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">参加している投稿がありません</p>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
