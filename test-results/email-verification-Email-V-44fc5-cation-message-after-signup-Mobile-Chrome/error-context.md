# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e3]:
    - heading "新規登録" [level=1] [ref=e4]
    - generic [ref=e5]:
      - generic [ref=e6]:
        - generic [ref=e7]: 名前
        - textbox [ref=e8]
      - generic [ref=e9]:
        - generic [ref=e10]: メールアドレス
        - textbox [ref=e11]
      - generic [ref=e12]:
        - generic [ref=e13]: パスワード
        - textbox [ref=e14]
      - generic [ref=e15]:
        - generic [ref=e16]: パスワード(確認)
        - textbox [ref=e17]
      - button "登録" [ref=e18]
    - generic [ref=e24]: または
    - button "Googleで登録" [ref=e25]:
      - img [ref=e26]
      - text: Googleで登録
    - link "既にアカウントをお持ちの方はこちら" [ref=e32] [cursor=pointer]:
      - /url: /auth/signin
  - button "Open Next.js Dev Tools" [ref=e38] [cursor=pointer]:
    - img [ref=e39]
  - alert [ref=e42]
```