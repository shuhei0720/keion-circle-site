// jest.mockをimportの前に設定
jest.mock('../auth', () => ({
  auth: jest.fn(),
}));

jest.mock('../prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));

import { auth } from '../auth';
import { prisma } from '../prisma';
import { isAdmin, isSiteAdmin, requireAdmin, requireSiteAdmin } from '../permissions';

// モックのエイリアスを作成
const mockedAuth = auth as jest.MockedFunction<typeof auth>;
const mockedFindUnique = prisma.user.findUnique as jest.MockedFunction<typeof prisma.user.findUnique>;

describe('permissions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isAdmin', () => {
    it('セッションがない場合はfalseを返す', async () => {
      mockedAuth.mockResolvedValue(null);

      const result = await isAdmin();

      expect(result).toBe(false);
    });

    it('ユーザーIDがない場合はfalseを返す', async () => {
      mockedAuth.mockResolvedValue({
        user: { id: undefined, name: 'Test', email: 'test@example.com' },
        expires: '2026-12-31',
      } as any);

      const result = await isAdmin();

      expect(result).toBe(false);
    });

    it('roleがadminの場合はtrueを返す', async () => {
      mockedAuth.mockResolvedValue({
        user: { id: 'user123', name: 'Admin', email: 'admin@example.com' },
        expires: '2026-12-31',
      } as any);

      mockedFindUnique.mockResolvedValue({
        role: 'admin',
      } as any);

      const result = await isAdmin();

      expect(result).toBe(true);
      expect(mockedFindUnique).toHaveBeenCalledWith({
        where: { id: 'user123' },
        select: { role: true },
      });
    });

    it('roleがsite_adminの場合はtrueを返す', async () => {
      mockedAuth.mockResolvedValue({
        user: { id: 'user123', name: 'Admin', email: 'admin@example.com' },
        expires: '2026-12-31',
      } as any);

      mockedFindUnique.mockResolvedValue({
        role: 'site_admin',
      } as any);

      const result = await isAdmin();

      expect(result).toBe(true);
    });

    it('roleがmemberの場合はfalseを返す', async () => {
      mockedAuth.mockResolvedValue({
        user: { id: 'user123', name: 'Member', email: 'member@example.com' },
        expires: '2026-12-31',
      } as any);

      mockedFindUnique.mockResolvedValue({
        role: 'member',
      } as any);

      const result = await isAdmin();

      expect(result).toBe(false);
    });

    it('ユーザーが見つからない場合はfalseを返す', async () => {
      mockedAuth.mockResolvedValue({
        user: { id: 'user123', name: 'User', email: 'user@example.com' },
        expires: '2026-12-31',
      } as any);

      mockedFindUnique.mockResolvedValue(null);

      const result = await isAdmin();

      expect(result).toBe(false);
    });
  });

  describe('isSiteAdmin', () => {
    it('セッションがない場合はfalseを返す', async () => {
      mockedAuth.mockResolvedValue(null);

      const result = await isSiteAdmin();

      expect(result).toBe(false);
    });

    it('roleがsite_adminの場合はtrueを返す', async () => {
      mockedAuth.mockResolvedValue({
        user: { id: 'user123', name: 'Site Admin', email: 'siteadmin@example.com' },
        expires: '2026-12-31',
      } as any);

      mockedFindUnique.mockResolvedValue({
        role: 'site_admin',
      } as any);

      const result = await isSiteAdmin();

      expect(result).toBe(true);
    });

    it('roleがadminの場合はfalseを返す（site_adminのみ）', async () => {
      mockedAuth.mockResolvedValue({
        user: { id: 'user123', name: 'Admin', email: 'admin@example.com' },
        expires: '2026-12-31',
      } as any);

      mockedFindUnique.mockResolvedValue({
        role: 'admin',
      } as any);

      const result = await isSiteAdmin();

      expect(result).toBe(false);
    });

    it('roleがmemberの場合はfalseを返す', async () => {
      mockedAuth.mockResolvedValue({
        user: { id: 'user123', name: 'Member', email: 'member@example.com' },
        expires: '2026-12-31',
      } as any);

      mockedFindUnique.mockResolvedValue({
        role: 'member',
      } as any);

      const result = await isSiteAdmin();

      expect(result).toBe(false);
    });
  });

  describe('requireAdmin', () => {
    it('管理者の場合はエラーを投げない', async () => {
      mockedAuth.mockResolvedValue({
        user: { id: 'user123', name: 'Admin', email: 'admin@example.com' },
        expires: '2026-12-31',
      } as any);

      mockedFindUnique.mockResolvedValue({
        role: 'admin',
      } as any);

      await expect(requireAdmin()).resolves.not.toThrow();
    });

    it('非管理者の場合はエラーを投げる', async () => {
      mockedAuth.mockResolvedValue({
        user: { id: 'user123', name: 'Member', email: 'member@example.com' },
        expires: '2026-12-31',
      } as any);

      mockedFindUnique.mockResolvedValue({
        role: 'member',
      } as any);

      await expect(requireAdmin()).rejects.toThrow('管理者権限が必要です');
    });

    it('セッションがない場合はエラーを投げる', async () => {
      mockedAuth.mockResolvedValue(null);

      await expect(requireAdmin()).rejects.toThrow('管理者権限が必要です');
    });
  });

  describe('requireSiteAdmin', () => {
    it('サイト管理者の場合はエラーを投げない', async () => {
      mockedAuth.mockResolvedValue({
        user: { id: 'user123', name: 'Site Admin', email: 'siteadmin@example.com' },
        expires: '2026-12-31',
      } as any);

      mockedFindUnique.mockResolvedValue({
        role: 'site_admin',
      } as any);

      await expect(requireSiteAdmin()).resolves.not.toThrow();
    });

    it('通常の管理者の場合はエラーを投げる', async () => {
      mockedAuth.mockResolvedValue({
        user: { id: 'user123', name: 'Admin', email: 'admin@example.com' },
        expires: '2026-12-31',
      } as any);

      mockedFindUnique.mockResolvedValue({
        role: 'admin',
      } as any);

      await expect(requireSiteAdmin()).rejects.toThrow('サイト管理者権限が必要です');
    });

    it('非管理者の場合はエラーを投げる', async () => {
      mockedAuth.mockResolvedValue({
        user: { id: 'user123', name: 'Member', email: 'member@example.com' },
        expires: '2026-12-31',
      } as any);

      mockedFindUnique.mockResolvedValue({
        role: 'member',
      } as any);

      await expect(requireSiteAdmin()).rejects.toThrow('サイト管理者権限が必要です');
    });
  });
});
