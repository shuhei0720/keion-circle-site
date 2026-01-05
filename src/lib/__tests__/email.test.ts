import {
  generateVerificationToken,
  verifyEmailToken,
  generatePasswordResetToken,
  verifyPasswordResetToken,
  sendVerificationEmail,
  sendPasswordResetEmail,
} from '../email';
import prisma from '../prisma';
import { Resend } from 'resend';

// モック
const mockResendSend = jest.fn();

jest.mock('resend', () => {
  return {
    Resend: jest.fn().mockImplementation(() => ({
      emails: {
        send: mockResendSend,
      },
    })),
  };
});

jest.mock('../prisma', () => ({
  __esModule: true,
  default: {
    verificationToken: {
      create: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
  },
  prisma: {
    verificationToken: {
      create: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
  },
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('email', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
    mockResendSend.mockResolvedValue({ id: 'email123' });
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('generateVerificationToken', () => {
    it('トークンを生成して保存する', async () => {
      const email = 'test@example.com';
      mockPrisma.verificationToken.deleteMany.mockResolvedValue({ count: 0 });
      mockPrisma.verificationToken.create.mockResolvedValue({
        identifier: email,
        token: 'generated-token',
        expires: new Date(),
      });

      const token = await generateVerificationToken(email);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBe(64); // 32バイトのhex = 64文字
      expect(mockPrisma.verificationToken.deleteMany).toHaveBeenCalledWith({
        where: { identifier: email },
      });
      expect(mockPrisma.verificationToken.create).toHaveBeenCalled();
    });

    it('既存のトークンを削除してから新しいトークンを作成する', async () => {
      const email = 'test@example.com';
      mockPrisma.verificationToken.deleteMany.mockResolvedValue({ count: 1 });
      mockPrisma.verificationToken.create.mockResolvedValue({
        identifier: email,
        token: 'new-token',
        expires: new Date(),
      } as any);

      await generateVerificationToken(email);

      // deleteMany と create の両方が呼ばれたことを確認
      expect(mockPrisma.verificationToken.deleteMany).toHaveBeenCalled();
      expect(mockPrisma.verificationToken.create).toHaveBeenCalled();
    });
  });

  describe('verifyEmailToken', () => {
    it('有効なトークンの場合はメールアドレスを返す', async () => {
      const token = 'valid-token';
      const email = 'test@example.com';
      const futureDate = new Date(Date.now() + 60 * 60 * 1000);

      mockPrisma.verificationToken.findUnique.mockResolvedValue({
        identifier: email,
        token,
        expires: futureDate,
      });

      const result = await verifyEmailToken(token);

      expect(result).toBe(email);
    });

    it('トークンが見つからない場合はnullを返す', async () => {
      mockPrisma.verificationToken.findUnique.mockResolvedValue(null);

      const result = await verifyEmailToken('invalid-token');

      expect(result).toBeNull();
    });

    it('期限切れのトークンを削除してnullを返す', async () => {
      const token = 'expired-token';
      const pastDate = new Date(Date.now() - 60 * 60 * 1000);

      mockPrisma.verificationToken.findUnique.mockResolvedValue({
        identifier: 'test@example.com',
        token,
        expires: pastDate,
      });
      mockPrisma.verificationToken.delete.mockResolvedValue({
        identifier: 'test@example.com',
        token,
        expires: pastDate,
      });

      const result = await verifyEmailToken(token);

      expect(result).toBeNull();
      expect(mockPrisma.verificationToken.delete).toHaveBeenCalledWith({
        where: { token },
      });
    });
  });

  describe('generatePasswordResetToken', () => {
    it('パスワードリセットトークンを生成する', async () => {
      const email = 'test@example.com';
      mockPrisma.verificationToken.deleteMany.mockResolvedValue({ count: 0 });
      mockPrisma.verificationToken.create.mockResolvedValue({
        identifier: `reset:${email}`,
        token: 'reset-token',
        expires: new Date(),
      });

      const token = await generatePasswordResetToken(email);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(mockPrisma.verificationToken.deleteMany).toHaveBeenCalledWith({
        where: { identifier: `reset:${email}` },
      });
      expect(mockPrisma.verificationToken.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            identifier: `reset:${email}`,
          }),
        })
      );
    });
  });

  describe('verifyPasswordResetToken', () => {
    it('有効なリセットトークンの場合はメールアドレスを返す', async () => {
      const token = 'valid-reset-token';
      const email = 'test@example.com';
      const futureDate = new Date(Date.now() + 60 * 60 * 1000);

      mockPrisma.verificationToken.findUnique.mockResolvedValue({
        identifier: `reset:${email}`,
        token,
        expires: futureDate,
      });

      const result = await verifyPasswordResetToken(token);

      expect(result).toBe(email);
    });

    it('期限切れのリセットトークンを削除してnullを返す', async () => {
      const token = 'expired-reset-token';
      const pastDate = new Date(Date.now() - 60 * 60 * 1000);

      mockPrisma.verificationToken.findUnique.mockResolvedValue({
        identifier: 'reset:test@example.com',
        token,
        expires: pastDate,
      });
      mockPrisma.verificationToken.delete.mockResolvedValue({
        identifier: 'reset:test@example.com',
        token,
        expires: pastDate,
      });

      const result = await verifyPasswordResetToken(token);

      expect(result).toBeNull();
      expect(mockPrisma.verificationToken.delete).toHaveBeenCalled();
    });
  });

  describe('sendVerificationEmail', () => {
    it('開発環境ではコンソールにログを出力する', async () => {
      process.env.NODE_ENV = 'development';
      const logSpy = jest.spyOn(console, 'log').mockImplementation();

      await sendVerificationEmail('test@example.com', 'test-token');

      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('メールアドレス検証リンク'));
      expect(mockResendSend).not.toHaveBeenCalled();

      logSpy.mockRestore();
    });

    it('本番環境ではResendでメールを送信する', async () => {
      process.env.NODE_ENV = 'production';
      process.env.RESEND_API_KEY = 'test-key';
      process.env.RESEND_FROM_EMAIL = 'noreply@test.com';

      await sendVerificationEmail('test@example.com', 'test-token');

      expect(mockResendSend).toHaveBeenCalledWith(
        expect.objectContaining({
          from: 'noreply@test.com',
          to: 'test@example.com',
          subject: expect.stringContaining('メールアドレスを確認'),
        })
      );
    });

    it('本番環境でメール送信に失敗した場合はログを出力する', async () => {
      process.env.NODE_ENV = 'production';
      process.env.RESEND_API_KEY = 'test-key';
      mockResendSend.mockRejectedValue(new Error('Send failed'));

      const errorSpy = jest.spyOn(console, 'error').mockImplementation();
      const logSpy = jest.spyOn(console, 'log').mockImplementation();

      await sendVerificationEmail('test@example.com', 'test-token');

      expect(errorSpy).toHaveBeenCalledWith(
        'Failed to send verification email:',
        expect.any(Error)
      );
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Resend送信失敗'));

      errorSpy.mockRestore();
      logSpy.mockRestore();
    });
  });

  describe('sendPasswordResetEmail', () => {
    it('開発環境ではコンソールにログを出力する', async () => {
      process.env.NODE_ENV = 'development';
      const logSpy = jest.spyOn(console, 'log').mockImplementation();

      await sendPasswordResetEmail('test@example.com', 'reset-token');

      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('パスワードリセットリンク'));
      expect(mockResendSend).not.toHaveBeenCalled();

      logSpy.mockRestore();
    });

    it('本番環境ではResendでメールを送信する', async () => {
      process.env.NODE_ENV = 'production';
      process.env.RESEND_API_KEY = 'test-key';
      process.env.RESEND_FROM_EMAIL = 'noreply@test.com';

      await sendPasswordResetEmail('test@example.com', 'reset-token');

      expect(mockResendSend).toHaveBeenCalledWith(
        expect.objectContaining({
          from: 'noreply@test.com',
          to: 'test@example.com',
          subject: expect.stringContaining('パスワードリセット'),
        })
      );
    });

    it('本番環境でメール送信に失敗した場合はログを出力する', async () => {
      process.env.NODE_ENV = 'production';
      process.env.RESEND_API_KEY = 'test-key';
      mockResendSend.mockRejectedValue(new Error('Send failed'));

      const errorSpy = jest.spyOn(console, 'error').mockImplementation();
      const logSpy = jest.spyOn(console, 'log').mockImplementation();

      await sendPasswordResetEmail('test@example.com', 'reset-token');

      expect(errorSpy).toHaveBeenCalledWith(
        'Failed to send password reset email:',
        expect.any(Error)
      );
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Resend送信失敗'));

      errorSpy.mockRestore();
      logSpy.mockRestore();
    });
  });
});
