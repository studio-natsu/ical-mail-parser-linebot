# ical-mail-parser-linebot

## 📌 概要
- プロジェクト名：予約確定通知LINE連携システム

## 🎯 目的
Airbnbからの予約確認メールの内容をical形式でGoogleカレンダーへ出力されている。<br>
カレンダーの通知Gmailを内容を自動で取得し、予約確定内容を取得し、LINEグループに通知する。
![image](https://github.com/user-attachments/assets/31ac412c-f549-431a-9788-5236884f21b1)
![image](https://github.com/user-attachments/assets/dafbf641-f22f-4dd8-b4a8-c88ae14ec27d)


---

## ⚙️ 使用技術

| 項目             | 内容                           |
|------------------|--------------------------------|
| 言語             | TypeScript                     |
| 実行環境         | Node.js (v22.16.0)           |
| 使用API          | Gmail API, LINE Messaging API  |
| 認証方式         | OAuth2（Googleアカウント）     |
| パッケージ管理   | npm                            |
| 開発ツール       | VSCode                   |

---

## 📂 ディレクトリ構成
```
project-root/
├── node_modules/
├── src/
│   ├── googleOAuth.ts       　← Gmail OAuth2 認証処理
│   ├── confirmedGmail.ts      ← Gmailから予約情報取得＆解析
│   ├── pushLINE.ts            ← LINE Push 実装
│   ├── main.ts                ← 実行エントリーポイント
│   ├── webhook.ts             ← LINEからの通知（イベント）を受ける
|   └─ lastMessageId.txt       ← 最後に通知したメールのメッセージIDを保存（実行ごとに参照）
├── credentials.json        ← Gmail API クレデンシャル
├── token.json              ← Gmail OAuth のアクセストークン（自動生成）
├── .env                    ← 環境変数（LINE_TOKEN／GROUP_ID 等）
├── run_armsLINE.but        ←タスクマネージャー設定
├── package.json
├── tsconfig.json
```

## 🔄 処理フロー
1. Gmail APIで該当するメール（icalカレンダーからの通知メール）を取得
2. 情報をパース
3. LINEグループに通知

## ✅ 前提条件と準備
- node- vで確認 Node.js＋ npmがあること
- Gmail API を有効化し、credentials.json を取得済み
- LINE Developers で Messaging APIチャネル を作成し、
 - Channel access token（v2.x）
 - Channel secret
などを取得済み

-プロジェクトセットアップ
 - パッケージJSON作成　
    npm init -y
 - tsconfig.json作成
    npx tsc --init

## 🚀 インストール
- googleAPI系<br>

        npm install express dotenv @line/bot-sdk googleapis google-auth-library axios qs

- typescript系<br>

        npm install -D typescript ts-node @types/node @types/express

- tsconfig.jsonの生成

        npx tsc --init

## 🔔 LINE設定～自動化について
詳細は別サイトで（笑）
1. LINE公式アカウントとMessaging APIチャネルの作成
2. チャネルアクセストークンの発行
3. LINE Developers コンソールでMessaging API チャネルの 「グループチャットへの参加許可」 を ON にする。
4. Webhookサーバー起動
5. 表示されたURLを、LINE Developer Console の「Webhook URL」に貼り付け<br>
   /webhookつけるの忘れずに！！！
6. 検証ボタンで確認する
7. Botを実際のLINEグループに招待（グループのメンバーとしてBotを追加）
8. グループ内でBot宛てにメッセージ送信すると、BotがそのメッセージのWebhookイベントを受信できるようになる。
9. グループIDを取得して、.envへ。
10. バッチファイルを作成し、Windows タスクスケジューラで定期通知

## 🧗‍♀️ 苦労したこと
- icalカレンダーの通知メールのため、メール内容のパターンを把握すること（規則性から、部屋分けをする）
- Googleカレンダーの仕様で、チェックアウト日（出ていく日）が含まれないこと
- Webhookの理解

## 🚧 今後の展望
✅メールが何通もきたときの抽出条件の検討をしないとです。
今回はicalカレンダーの通知のため個人的には大変でしたが、<br>
本来はメールボックスからの予約メールは簡単に（明確に）情報を抽出しやすいかと思います。<br>
たとえば小規模事業様が、重要なメールから情報抽出して、情報共有できるツールに通すればミスを防げます

## 🤍 さいごに
ここまで読んでくれてありがとうございます！
また、このプロジェクト作成の機会をくれた方に、感謝します。

ご意見・ご質問・アドバイスお願いします🌸

- GitHub: [studio-natsu](https://github.com/studio-natsu)  
- Mail: studio.natsu72@gmail.com
