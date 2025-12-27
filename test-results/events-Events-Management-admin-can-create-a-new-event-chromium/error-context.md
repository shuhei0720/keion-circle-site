# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e3]:
    - heading "BOLD 軽音" [level=1] [ref=e4]
    - generic [ref=e5]: メールアドレスまたはパスワードが正しくありません。メールアドレスが確認されていない可能性があります。
    - generic [ref=e6]:
      - generic [ref=e7]:
        - generic [ref=e8]: メールアドレス
        - textbox "メールアドレス" [ref=e9]: admin@example.com
      - generic [ref=e10]:
        - generic [ref=e11]: パスワード
        - textbox "パスワード" [ref=e12]: password123
      - button "ログイン" [active] [ref=e13]
    - button "確認メールを再送信" [ref=e14]
    - link "パスワードをお忘れですか？" [ref=e16] [cursor=pointer]:
      - /url: /auth/forgot-password
    - generic [ref=e22]: または
    - button "Googleでログイン" [ref=e23]:
      - img [ref=e24]
      - text: Googleでログイン
    - link "アカウントをお持ちでない方はこちら" [ref=e30] [cursor=pointer]:
      - /url: /auth/signup
  - button "Open Next.js Dev Tools" [ref=e36] [cursor=pointer]:
    - img [ref=e37]
  - alert [ref=e40]
```