import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { NavigationLink } from '../NavigationLink';

// モック設定
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockPush = jest.fn();

describe('NavigationLink', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({
      push: mockPush,
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    });
  });

  it('基本的なリンクが表示される', () => {
    render(
      <NavigationLink href="/home">
        ホーム
      </NavigationLink>
    );

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/home');
    expect(screen.getByText('ホーム')).toBeInTheDocument();
  });

  it('リンクをクリックすると、router.pushが呼ばれる', () => {
    render(
      <NavigationLink href="/posts">
        投稿
      </NavigationLink>
    );

    const link = screen.getByRole('link');
    fireEvent.click(link);

    expect(mockPush).toHaveBeenCalledWith('/posts');
  });

  it('カスタムonClickハンドラが呼ばれる', () => {
    const mockOnClick = jest.fn();

    render(
      <NavigationLink href="/home" onClick={mockOnClick}>
        ホーム
      </NavigationLink>
    );

    const link = screen.getByRole('link');
    fireEvent.click(link);

    expect(mockOnClick).toHaveBeenCalled();
  });

  it('カスタムclassNameが適用される', () => {
    const { container } = render(
      <NavigationLink href="/home" className="custom-class">
        ホーム
      </NavigationLink>
    );

    const link = container.querySelector('a');
    expect(link).toHaveClass('custom-class');
  });
});
