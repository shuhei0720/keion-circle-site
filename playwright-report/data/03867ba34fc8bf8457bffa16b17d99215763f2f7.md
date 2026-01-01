# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e3]:
    - heading "BOLD 軽音" [level=1] [ref=e4]
    - generic [ref=e5]:
      - generic [ref=e6]:
        - generic [ref=e7]: メールアドレス
        - textbox "メールアドレス" [ref=e8]
      - generic [ref=e9]:
        - generic [ref=e10]: パスワード
        - textbox "パスワード" [ref=e11]
      - button "ログイン" [ref=e12]
    - link "パスワードをお忘れですか？" [ref=e14] [cursor=pointer]:
      - /url: /auth/forgot-password
    - generic [ref=e20]: または
    - button "Googleでログイン" [ref=e21]:
      - img [ref=e22]
      - text: Googleでログイン
    - link "アカウントをお持ちでない方はこちら" [ref=e28] [cursor=pointer]:
      - /url: /auth/signup
  - button "Open Next.js Dev Tools" [ref=e34] [cursor=pointer]:
    - img [ref=e35]
  - alert [ref=e38]
```