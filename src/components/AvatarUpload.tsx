'use client';

import { useState, useRef, useCallback } from 'react';
import { User, Upload, X } from 'lucide-react';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface AvatarUploadProps {
  currentAvatar?: string | null;
  onUploadComplete: (avatarUrl: string) => void;
}

export default function AvatarUpload({ currentAvatar, onUploadComplete }: AvatarUploadProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 50,
    height: 50,
    x: 25,
    y: 25,
  });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const [uploading, setUploading] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('ファイルサイズは10MB以下にしてください');
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const getCroppedImg = useCallback(async (): Promise<Blob | null> => {
    if (!imgRef.current || !completedCrop) return null;

    const image = imgRef.current;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Canvas context not available');
    }

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    // Set canvas size to desired output size (e.g., 400x400)
    const outputSize = 400;
    canvas.width = outputSize;
    canvas.height = outputSize;

    // Fill with white background (prevents transparency issues)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, outputSize, outputSize);

    // Draw the cropped image scaled to output size
    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      outputSize,
      outputSize
    );

    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Canvas to Blob conversion failed'));
            return;
          }
          resolve(blob);
        },
        'image/jpeg',
        0.92
      );
    });
  }, [completedCrop]);

  const handleUpload = async () => {
    try {
      setUploading(true);
      const croppedBlob = await getCroppedImg();
      
      if (!croppedBlob) {
        alert('画像の処理に失敗しました');
        return;
      }

      const formData = new FormData();
      formData.append('avatar', croppedBlob, 'avatar.jpg');

      const res = await fetch('/api/profile/avatar', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        onUploadComplete(data.avatarUrl);
        setSelectedImage(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        alert('アップロードに失敗しました');
      }
    } catch (error) {
      console.error('アップロードエラー:', error);
      alert('アップロードに失敗しました');
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        プロフィール画像
      </label>

      {!selectedImage ? (
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
            {currentAvatar ? (
              <img
                src={currentAvatar}
                alt="プロフィール"
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-10 h-10 text-gray-400" />
            )}
          </div>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Upload className="w-4 h-4" />
              画像を選択
            </button>
            <p className="text-sm text-gray-500 mt-1">
              JPG, PNG形式（最大10MB）
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="border rounded-lg p-4 bg-gray-50">
            <p className="text-sm text-gray-600 mb-2">
              画像をドラッグして表示範囲を調整してください
            </p>
            <ReactCrop
              crop={crop}
              onChange={(c) => setCrop(c)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={1}
              circularCrop
            >
              <img
                ref={imgRef}
                src={selectedImage}
                alt="プレビュー"
                className="max-w-full max-h-96"
              />
            </ReactCrop>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleUpload}
              disabled={uploading || !completedCrop}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            >
              {uploading ? 'アップロード中...' : 'アップロード'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
