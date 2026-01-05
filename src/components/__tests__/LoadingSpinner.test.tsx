import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import LoadingSpinner from '../LoadingSpinner';

describe('LoadingSpinner', () => {
  it('スピナーが表示される（default variant）', () => {
    const { container } = render(<LoadingSpinner />);
    
    // アニメーションするスピナーが存在する
    const spinner = container.querySelector('.animate-pulse');
    expect(spinner).toBeTruthy();
  });

  it('Music iconが表示される', () => {
    render(<LoadingSpinner />);
    
    // SVGアイコンが存在する（lucide-reactのMusicアイコン）
    const svg = document.querySelector('svg');
    expect(svg).toBeTruthy();
  });

  it('profile variantが正しく表示される', () => {
    const { container } = render(<LoadingSpinner variant="profile" />);
    
    // profile variantは円形スピナー（animate-spin）を使用
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeTruthy();
  });
});
