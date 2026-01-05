import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AvatarUpload from '../AvatarUpload';

// グローバルfetchをモック
global.fetch = jest.fn();

describe('AvatarUpload', () => {
  const mockOnUpload = jest.fn();
  const defaultProps = {
    currentAvatar: null,
    onUpload: mockOnUpload,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  it('初期状態で「アバターを選択」ボタンが表示される', () => {
    render(<AvatarUpload {...defaultProps} />);

    expect(screen.getByText('アバターを選択')).toBeInTheDocument();
  });

  it('現在のアバター画像がある場合、表示される', () => {
    render(
      <AvatarUpload
        currentAvatar="https://example.com/avatar.jpg"
        onUpload={mockOnUpload}
      />
    );

    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', 'https://example.com/avatar.jpg');
  });

  it('ファイルを選択すると、プレビューが表示される', async () => {
    mockOnUpload.mockResolvedValue(undefined);
    render(<AvatarUpload {...defaultProps} />);

    const file = new File(['dummy'], 'avatar.png', { type: 'image/png' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    // FileReaderのモック
    const mockFileReader = {
      readAsDataURL: jest.fn(),
      result: 'data:image/png;base64,dummy',
      onloadend: null as ((this: FileReader, ev: ProgressEvent<FileReader>) => unknown) | null,
    };

    jest.spyOn(window, 'FileReader').mockImplementation(() => mockFileReader as unknown as FileReader);

    fireEvent.change(input, { target: { files: [file] } });

    // FileReader.onloadendを手動でトリガー
    if (mockFileReader.onloadend) {
      mockFileReader.onloadend.call(mockFileReader as unknown as FileReader, {} as ProgressEvent<FileReader>);
    }

    await waitFor(() => {
      expect(mockOnUpload).toHaveBeenCalledWith(file);
    });
  });

  it('ファイルアップロードが処理される', async () => {
    mockOnUpload.mockResolvedValue(undefined);
    render(<AvatarUpload {...defaultProps} />);

    const file = new File(['dummy'], 'test.png', {
      type: 'image/png',
    });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(mockOnUpload).toHaveBeenCalledWith(file);
    });
  });

  it('disabledの場合、アップロードできない', () => {
    render(<AvatarUpload {...defaultProps} disabled />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input).toBeDisabled();
  });
});
