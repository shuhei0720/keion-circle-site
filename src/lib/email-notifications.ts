import { Resend } from 'resend';
import { render } from '@react-email/render';
import NewEventEmail from '@/components/emails/NewEventEmail';
import NewActivityScheduleEmail from '@/components/emails/NewActivityScheduleEmail';
import NewPostEmail from '@/components/emails/NewPostEmail';
import { prisma } from '@/lib/prisma';

const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@bold-osaka-keion.fyi';
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.AUTH_URL || 'http://localhost:3000';

console.log('[email-notifications] 初期化:', {
  hasResendKey: !!process.env.RESEND_API_KEY,
  fromEmail,
  baseUrl,
});

/**
 * 通知設定が有効なメンバーのメールアドレスを取得
 */
async function getNotificationRecipients() {
  console.log('[getNotificationRecipients] ユーザーを検索中...');
  const users = await prisma.user.findMany({
    where: {
      emailNotifications: true,
      email: {
        not: null,
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });
  
  console.log('[getNotificationRecipients] 検索結果:', {
    count: users.length,
    users: users.map(u => ({ name: u.name, email: u.email })),
  });
  
  return users.filter((user) => user.email) as Array<{
    id: string;
    name: string | null;
    email: string;
  }>;
}

/**
 * 新規イベント作成時の通知メールを送信
 */
export async function sendNewEventNotification(event: {
  id: string;
  title: string;
  date: Date;
  location: string;
}) {
  console.log('[sendNewEventNotification] 開始:', event);
  try {
    const recipients = await getNotificationRecipients();
    
    if (recipients.length === 0) {
      console.log('[sendNewEventNotification] 通知を受け取るメンバーがいません');
      return { success: true, sent: 0 };
    }

    console.log('[sendNewEventNotification] メール送信開始:', { recipientsCount: recipients.length });

    const eventUrl = `${baseUrl}/events/${event.id}`;
    const eventDate = new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(event.date);

    const results = await Promise.allSettled(
      recipients.map(async (recipient) => {
        console.log('[sendNewEventNotification] メール送信中:', recipient.email);
        const emailHtml = await render(
          NewEventEmail({
            eventTitle: event.title,
            eventDate,
            eventLocation: event.location,
            eventUrl,
            recipientName: recipient.name || 'メンバー',
          })
        );

        return resend.emails.send({
          from: fromEmail,
          to: recipient.email,
          subject: `🎵 新しいイベント「${event.title}」が作成されました`,
          html: emailHtml,
        });
      })
    );

    const successCount = results.filter((r) => r.status === 'fulfilled').length;
    const failedResults = results.filter((r) => r.status === 'rejected');
    
    console.log('[sendNewEventNotification] 送信完了:', {
      total: recipients.length,
      success: successCount,
      failed: failedResults.length,
      failures: failedResults.map((r: any) => r.reason?.message || r.reason),
    });

    return { success: true, sent: successCount };
  } catch (error) {
    console.error('[sendNewEventNotification] エラー:', error);
    return { success: false, sent: 0 };
  }
}

/**
 * 新規活動スケジュール作成時の通知メールを送信
 */
export async function sendNewActivityScheduleNotification(schedule: {
  id: string;
  title: string;
  date: Date;
  location: string;
}) {
  try {
    const recipients = await getNotificationRecipients();
    
    if (recipients.length === 0) {
      console.log('通知を受け取るメンバーがいません');
      return { success: true, sent: 0 };
    }

    const scheduleUrl = `${baseUrl}/activity-schedules/${schedule.id}`;
    const scheduleDate = new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(schedule.date);

    const results = await Promise.allSettled(
      recipients.map(async (recipient) => {
        const emailHtml = await render(
          NewActivityScheduleEmail({
            scheduleTitle: schedule.title,
            scheduleDate,
            scheduleLocation: schedule.location,
            scheduleUrl,
            recipientName: recipient.name || 'メンバー',
          })
        );

        return resend.emails.send({
          from: fromEmail,
          to: recipient.email,
          subject: `📅 新しい活動スケジュール「${schedule.title}」が作成されました`,
          html: emailHtml,
        });
      })
    );

    const successCount = results.filter((r) => r.status === 'fulfilled').length;
    console.log(`活動スケジュール通知メールを ${successCount}/${recipients.length} 件送信しました`);

    return { success: true, sent: successCount };
  } catch (error) {
    console.error('活動スケジュール通知メールの送信に失敗しました:', error);
    return { success: false, sent: 0 };
  }
}

/**
 * 新規活動報告投稿時の通知メールを送信
 */
export async function sendNewPostNotification(post: {
  id: string;
  title: string;
  content: string;
}) {
  try {
    const recipients = await getNotificationRecipients();
    
    if (recipients.length === 0) {
      console.log('通知を受け取るメンバーがいません');
      return { success: true, sent: 0 };
    }

    const postUrl = `${baseUrl}/posts/${post.id}`;
    // 本文から最初の150文字を抜粋
    const postExcerpt = post.content.slice(0, 150) + (post.content.length > 150 ? '...' : '');

    const results = await Promise.allSettled(
      recipients.map(async (recipient) => {
        const emailHtml = await render(
          NewPostEmail({
            postTitle: post.title,
            postExcerpt,
            postUrl,
            recipientName: recipient.name || 'メンバー',
          })
        );

        return resend.emails.send({
          from: fromEmail,
          to: recipient.email,
          subject: `📝 新しい活動報告「${post.title}」が投稿されました`,
          html: emailHtml,
        });
      })
    );

    const successCount = results.filter((r) => r.status === 'fulfilled').length;
    console.log(`活動報告通知メールを ${successCount}/${recipients.length} 件送信しました`);

    return { success: true, sent: successCount };
  } catch (error) {
    console.error('活動報告通知メールの送信に失敗しました:', error);
    return { success: false, sent: 0 };
  }
}
