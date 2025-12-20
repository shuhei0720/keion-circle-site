'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import AvatarUpload from '@/components/AvatarUpload';

const instruments = [
  'ボーカル',
  'エレキギター',
  'アコースティックギター',
  'ベース',
  'ドラム',
  'キーボード',
  'その他',
];

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    avatarUrl: '',
    bio: '',
    instrument: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/profile');
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      }
    } catch (error) {
      console.error('プロフィール取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profile),
      });

      if (res.ok) {
        alert('プロフィールを更新しました');
      } else {
        alert('プロフィールの更新に失敗しました');
      }
    } catch (error) {
      console.error('プロフィール更新エラー:', error);
      alert('プロフィールの更新に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-600">読み込み中...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">プロフィール設定</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* プロフィール画像アップロード */}
          <AvatarUpload
            currentAvatar={profile.avatarUrl}
            onUploadComplete={(avatarUrl) => {
              setProfile({ ...profile, avatarUrl });
              alert('プロフィール画像をアップロードしました');
            }}
          />

          {/* 名前 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              名前
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
              value={profile.name || ''}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            />
          </div>

          {/* メールアドレス（読み取り専用） */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              メールアドレス
            </label>
            <input
              type="email"
              className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100"
              value={profile.email || ''}
              disabled
            />
          </div>

          {/* 担当楽器 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              担当楽器
            </label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
              value={profile.instrument || ''}
              onChange={(e) =>
                setProfile({ ...profile, instrument: e.target.value })
              }
            >
              <option value="">選択してください</option>
              {instruments.map((inst) => (
                <option key={inst} value={inst}>
                  {inst}
                </option>
              ))}
            </select>
          </div>

          {/* 自己紹介 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              自己紹介
            </label>
            <textarea
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
              rows={5}
              value={profile.bio || ''}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              placeholder="自己紹介を入力してください"
            />
          </div>

          {/* 保存ボタン */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            >
              {saving ? '保存中...' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
