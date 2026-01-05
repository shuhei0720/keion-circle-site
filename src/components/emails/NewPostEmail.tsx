import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface NewPostEmailProps {
  postTitle: string;
  postExcerpt: string;
  postUrl: string;
  recipientName: string;
}

export default function NewPostEmail({
  postTitle,
  postExcerpt,
  postUrl,
  recipientName,
}: NewPostEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>新しい活動報告「{postTitle}」が投稿されました</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>📝 新しい活動報告</Heading>
          
          <Text style={greeting}>
            {recipientName} さん、こんにちは
          </Text>
          
          <Text style={text}>
            BOLD 軽音で新しい活動報告が投稿されました。
          </Text>

          <Section style={postBox}>
            <Heading style={postTitleStyle}>{postTitle}</Heading>
            <Text style={postExcerpt}>
              {postExcerpt}
            </Text>
          </Section>

          <Section style={buttonContainer}>
            <Button style={button} href={postUrl}>
              活動報告を読む
            </Button>
          </Section>

          <Hr style={hr} />
          
          <Text style={footer}>
            このメールは BOLD 軽音メンバーサイトから送信されています。
            <br />
            通知設定は、プロフィール画面から変更できます。
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '40px 20px',
  marginBottom: '64px',
  borderRadius: '8px',
  maxWidth: '600px',
};

const h1 = {
  color: '#1a1a1a',
  fontSize: '28px',
  fontWeight: '700',
  margin: '0 0 20px',
  textAlign: 'center' as const,
};

const greeting = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 10px',
};

const text = {
  color: '#6b7280',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 24px',
};

const postBox = {
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
  border: '1px solid #e5e7eb',
};

const postTitleStyle = {
  color: '#1a1a1a',
  fontSize: '22px',
  fontWeight: '600',
  margin: '0 0 16px',
};

const postExcerpt = {
  color: '#4b5563',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '0',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#8b5cf6',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 32px',
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '32px 0',
};

const footer = {
  color: '#9ca3af',
  fontSize: '13px',
  lineHeight: '20px',
  textAlign: 'center' as const,
};
