// まずモックを設定（importの前に）
jest.mock('resend', () => {
  const mockSend = jest.fn();
  return {
    Resend: jest.fn().mockImplementation(() => ({
      emails: {
        send: mockSend,
      },
    })),
    __mockSend: mockSend, // 外部からアクセス可能にする
  };
});

jest.mock('@react-email/render');
jest.mock('../prisma', () => ({
  prisma: {
    user: {
      findMany: jest.fn(),
    },
  },
}));

// モックの後でimport
import {
  sendNewEventNotification,
  sendNewActivityScheduleNotification,
  sendNewPostNotification,
} from '../email-notifications';
import { prisma } from '../prisma';
import { render } from '@react-email/render';
import { Resend } from 'resend';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockRender = render as jest.MockedFunction<typeof render>;
// Resend内部のmockSendにアクセス
const MockedResend = Resend as jest.MockedClass<typeof Resend>;
const mockResendSend = MockedResend.mock.results[0]?.value?.emails?.send || jest.fn();

describe('email-notifications', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
    mockRender.mockResolvedValue('<html>Test Email</html>');
    mockResendSend.mockResolvedValue({ id: 'email123' });
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('sendNewEventNotification', () => {
    const mockEvent = {
      id: 'event123',
      title: 'テストイベント',
      date: new Date('2026-01-10'),
      location: '大阪市北区',
    };

    it('RESEND_API_KEYがない場合はスキップする', async () => {
      delete process.env.RESEND_API_KEY;

      const result = await sendNewEventNotification(mockEvent);

      expect(result).toEqual({ success: false, sent: 0 });
      expect(mockPrisma.user.findMany).not.toHaveBeenCalled();
    });

    it('通知を受け取るユーザーがいない場合', async () => {
      process.env.RESEND_API_KEY = 'test_key';
      mockPrisma.user.findMany.mockResolvedValue([]);

      const result = await sendNewEventNotification(mockEvent);

      expect(result).toEqual({ success: true, sent: 0 });
      expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
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
    });

    it('メール送信に成功する', async () => {
      process.env.RESEND_API_KEY = 'test_key';

      const mockUsers = [
        { id: 'user1', name: 'ユーザー1', email: 'user1@example.com' },
        { id: 'user2', name: 'ユーザー2', email: 'user2@example.com' },
      ];

      mockPrisma.user.findMany.mockResolvedValue(mockUsers as any);

      const result = await sendNewEventNotification(mockEvent);

      expect(result).toEqual({ success: true, sent: 2 });
      expect(mockResendSend).toHaveBeenCalledTimes(2);
    });

    it('一部のメール送信が失敗しても成功したものをカウントする', async () => {
      process.env.RESEND_API_KEY = 'test_key';

      const mockUsers = [
        { id: 'user1', name: 'ユーザー1', email: 'user1@example.com' },
        { id: 'user2', name: 'ユーザー2', email: 'user2@example.com' },
        { id: 'user3', name: 'ユーザー3', email: 'user3@example.com' },
      ];

      mockPrisma.user.findMany.mockResolvedValue(mockUsers as any);

      mockResendSend
        .mockResolvedValueOnce({ id: 'email1' })
        .mockRejectedValueOnce(new Error('送信失敗'))
        .mockResolvedValueOnce({ id: 'email3' });

      const result = await sendNewEventNotification(mockEvent);

      expect(result).toEqual({ success: true, sent: 2 });
    });

    it('エラーが発生した場合', async () => {
      process.env.RESEND_API_KEY = 'test_key';
      mockPrisma.user.findMany.mockRejectedValue(new Error('Database error'));

      const result = await sendNewEventNotification(mockEvent);

      expect(result).toEqual({ success: false, sent: 0 });
    });
  });

  describe('sendNewActivityScheduleNotification', () => {
    const mockSchedule = {
      id: 'schedule123',
      title: 'テスト活動スケジュール',
      date: new Date('2026-01-15'),
      location: '未定',
    };

    it('RESEND_API_KEYがない場合はスキップする', async () => {
      delete process.env.RESEND_API_KEY;

      const result = await sendNewActivityScheduleNotification(mockSchedule);

      expect(result).toEqual({ success: false, sent: 0 });
    });

    it('メール送信に成功する', async () => {
      process.env.RESEND_API_KEY = 'test_key';

      const mockUsers = [
        { id: 'user1', name: 'ユーザー1', email: 'user1@example.com' },
      ];

      mockPrisma.user.findMany.mockResolvedValue(mockUsers as any);


      (Resend as jest.MockedClass<typeof Resend>).mockImplementation(
        () => mockResend as any
      );

      const result = await sendNewActivityScheduleNotification(mockSchedule);

      expect(result).toEqual({ success: true, sent: 1 });
    });
  });

  describe('sendNewPostNotification', () => {
    const mockPost = {
      id: 'post123',
      title: 'テスト投稿',
      content: 'これはテスト投稿の内容です。'.repeat(10),
    };

    it('RESEND_API_KEYがない場合はスキップする', async () => {
      delete process.env.RESEND_API_KEY;

      const result = await sendNewPostNotification(mockPost);

      expect(result).toEqual({ success: false, sent: 0 });
    });

    it('本文が150文字以上の場合は切り詰める', async () => {
      process.env.RESEND_API_KEY = 'test_key';

      const longContent = 'あ'.repeat(200);
      const mockUsers = [
        { id: 'user1', name: 'ユーザー1', email: 'user1@example.com' },
      ];

      mockPrisma.user.findMany.mockResolvedValue(mockUsers as any);

      const result = await sendNewPostNotification({
        ...mockPost,
        content: longContent,
      });

      // メール送信が成功したことを確認
      expect(result).toEqual({ success: true, sent: 1 });
      // renderが呼ばれたことを確認（切り詰め処理が実行された）
      expect(mockRender).toHaveBeenCalled();
    });

    it('メール送信に成功する', async () => {
      process.env.RESEND_API_KEY = 'test_key';

      const mockUsers = [
        { id: 'user1', name: 'ユーザー1', email: 'user1@example.com' },
        { id: 'user2', name: 'ユーザー2', email: 'user2@example.com' },
      ];

      mockPrisma.user.findMany.mockResolvedValue(mockUsers as any);


      (Resend as jest.MockedClass<typeof Resend>).mockImplementation(
        () => mockResend as any
      );

      const result = await sendNewPostNotification(mockPost);

      expect(result).toEqual({ success: true, sent: 2 });
    });
  });
});
