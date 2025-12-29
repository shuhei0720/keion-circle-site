import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import DashboardLayout from '@/components/DashboardLayout';
import { User, Music } from 'lucide-react';
import Link from 'next/link';

interface UserProfilePageProps {
  params: Promise<{
    id: string;
  }>;
}

// ISR: 300秒（5分）ごとにページを再生成
export const revalidate = 300

export default async function UserProfilePage({ params }: UserProfilePageProps) {
  const session = await auth();
  const { id } = await params;

  // ログインユーザーの情報を取得（ログインしていない場合はnull）
  const currentUser = session?.user?.email
    ? await prisma.user.findUnique({
        where: { email: session.user.email },
      })
    : null;

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
          <h1 className="text-2xl font-bold mb-4 text-white">ユーザーが見つかりません</h1>
          <Link href="/" className="text-blue-400 hover:text-blue-300 hover:underline">
            ホームに戻る
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const isOwnProfile = currentUser?.id === user.id;
  const totalParticipations = user.postParticipants.length;
  const totalPosts = user.posts.length;
  const instruments = user.instruments ? JSON.parse(user.instruments) : [];

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl border border-white/10 p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
            <div className="flex-shrink-0 mx-auto sm:mx-0">
              {user.avatarUrl ? (
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden bg-gray-200">
                  <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-400/30">
                  <User size={48} className="text-blue-300" />
                </div>
              )}
            </div>
            <div className="flex-1 w-full">
              <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-white text-center sm:text-left">{user.name}</h1>
              <p className="text-white/60 mb-4 text-center sm:text-left break-words">{user.email}</p>
              
              {user.bio && (
                <div className="mb-4 p-3 bg-white/5 rounded-lg border border-white/10">
                  <p className="text-white/80 whitespace-pre-wrap">{user.bio}</p>
                </div>
              )}

              {instruments.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Music size={16} className="text-white/60" />
                    <span className="text-sm text-white/60">演奏できる楽器</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {instruments.map((instrument: string) => (
                      <span
                        key={instrument}
                        className="px-3 py-1 bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-blue-300 rounded-full text-sm border border-blue-400/30"
                      >
                        {instrument}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* 統計情報 */}
              <div className="flex gap-4 mb-4">
                <div className="bg-blue-500/20 border border-blue-400/30 px-4 py-2 rounded-lg">
                  <p className="text-sm text-blue-300">投稿数</p>
                  <p className="text-2xl font-bold text-blue-200">{totalPosts}</p>
                </div>
                <div className="bg-green-500/20 border border-green-400/30 px-4 py-2 rounded-lg">
                  <p className="text-sm text-green-300">参加回数</p>
                  <p className="text-2xl font-bold text-green-200">{totalParticipations}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl border border-white/10 p-6">
            <h2 className="text-xl font-bold mb-4 text-white">作成した投稿</h2>
            {user.posts.length > 0 ? (
              <ul className="space-y-3">
                {user.posts.map((post) => (
                  <li key={post.id}>
                    <Link
                      href={`/posts`}
                      className="block p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition"
                    >
                      <h3 className="font-semibold text-white">{post.title}</h3>
                      <p className="text-sm text-white/60">
                        {new Date(post.createdAt).toLocaleDateString('ja-JP')}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-white/60">まだ投稿がありません</p>
            )}
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl border border-white/10 p-6">
            <h2 className="text-xl font-bold mb-4 text-white">参加している投稿</h2>
            {user.postParticipants.length > 0 ? (
              <ul className="space-y-3">
                {user.postParticipants.map((participant) => (
                  <li key={participant.id}>
                    <Link
                      href={`/posts`}
                      className="block p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition"
                    >
                      <h3 className="font-semibold text-white">{participant.post.title}</h3>
                      <p className="text-sm text-white/60">
                        {new Date(participant.createdAt).toLocaleDateString('ja-JP')}に参加
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-white/60">参加している投稿がありません</p>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
