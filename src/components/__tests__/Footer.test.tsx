import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import Footer from '../Footer';

describe('Footer', () => {
  it('コピーライトが表示される', () => {
    render(<Footer />);
    
    // 実際のFooterコンポーネントは"BOLD軽音"と表示している
    expect(screen.getByText(/© \d{4} BOLD軽音\. All rights reserved\./)).toBeInTheDocument();
  });

  it('プライバシーポリシーリンクが表示される', () => {
    render(<Footer />);
    
    const privacyLink = screen.getByText('プライバシーポリシー');
    expect(privacyLink).toBeInTheDocument();
    expect(privacyLink).toHaveAttribute('href', '/privacy');
  });

  it('利用規約リンクが表示される', () => {
    render(<Footer />);
    
    const termsLink = screen.getByText('利用規約');
    expect(termsLink).toBeInTheDocument();
    expect(termsLink).toHaveAttribute('href', '/terms');
  });
});
