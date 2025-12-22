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
        <h1 className="text-3xl font-bold mb-6 text-white">マイプロフィール</h1>

        {/* プロフィール編集 */}
        <ProfileEditClient user={user} />

        {/* 統計情報 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl p-4 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-500/20 rounded-lg border border-blue-400/30">
                <FileText className="text-blue-300" size={24} />
              </div>
              <div>
                <p className="text-white/60 text-sm">投稿数</p>
                <p className="text-2xl font-bold text-white">{user._count.posts}</p>
              </div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl p-4 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-500/20 rounded-lg border border-green-400/30">
                <User className="text-green-300" size={24} />
              </div>
              <div>
                <p className="text-white/60 text-sm">参加回数</p>
                <p className="text-2xl font-bold text-white">{user._count.postParticipants}</p>
              </div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl p-4 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-500/20 rounded-lg border border-purple-400/30">
                <MessageSquare className="text-purple-300" size={24} />
              </div>
              <div>
                <p className="text-white/60 text-sm">メッセージ数</p>
                <p className="text-2xl font-bold text-white">{user._count.messages}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
