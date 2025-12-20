import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import DashboardLayout from '@/components/DashboardLayout';
import { User } from 'lucide-react';
import Link from 'next/link';

interface UserProfilePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function UserProfilePage({ params }: UserProfilePageProps) {
  const session = await auth();
  const { id } = await params;

  if (!session?.user?.email) {
    redirect('/auth/signin');
  }

  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!currentUser) {
    redirect('/auth/signin');
  }

  const user = await prisma.user.findUnique({
    where: { id },
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
    },
  });

  if (!user) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto p-6">
          <h1 className="text-2xl font-bold mb-4">ユーザーが見つかりません</h1>
          <Link href="/" className="text-blue-600 hover:underline">
            ホームに戻る
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const isOwnProfile = currentUser.id === user.id;

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-start gap-6">
            <div className="flex-shrink-0">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name || ''}
                  className="w-32 h-32 rounded-full object-cover border-2 border-gray-200"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
                  <User size={48} className="text-gray-400" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{user.name}</h1>
              <p className="text-gray-600 mb-4">{user.email}</p>
              {user.instrument && (
                <div className="mb-4">
                  <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    {user.instrument}
                  </span>
                </div>
              )}
              {user.bio && (
                <p className="text-gray-700 whitespace-pre-wrap">{user.bio}</p>
              )}
              {isOwnProfile && (
                <Link
                  href="/profile"
                  className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  プロフィールを編集
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">作成した投稿</h2>
            {user.posts.length > 0 ? (
              <ul className="space-y-3">
                {user.posts.map((post) => (
                  <li key={post.id}>
                    <Link
                      href={`/posts`}
                      className="block p-3 border rounded hover:bg-gray-50 transition"
                    >
                      <h3 className="font-semibold">{post.title}</h3>
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
            <h2 className="text-xl font-bold mb-4">参加している投稿</h2>
            {user.postParticipants.length > 0 ? (
              <ul className="space-y-3">
                {user.postParticipants.map((participant) => (
                  <li key={participant.id}>
                    <Link
                      href={`/posts`}
                      className="block p-3 border rounded hover:bg-gray-50 transition"
                    >
                      <h3 className="font-semibold">{participant.post.title}</h3>
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
