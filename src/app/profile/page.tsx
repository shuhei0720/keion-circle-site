import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import ProfilePageClient from './ProfilePageClient';

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      postParticipants: {
        include: {
          post: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 5,
      },
      _count: {
        select: {
          posts: true,
          postParticipants: true,
        },
      },
    },
  });

  if (!user) {
    redirect('/auth/signin');
  }

  return <ProfilePageClient user={user} />;
}
