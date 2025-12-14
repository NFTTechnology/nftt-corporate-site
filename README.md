# NFTテクノロジー株式会社 コーポレートサイト

## 概要

| 項目 | 値 |
|------|---|
| URL | https://nftt.co.jp |
| 代替URL | https://www.nftt.co.jp |
| ホスティング | AWS S3 + CloudFront |
| 料金プラン | CloudFront フラットレート Free ($0/月) |

## プロジェクト構成

```
nftt-corporate-site/
├── index.html              # トップページ
├── assets/
│   ├── css/
│   │   └── main.css        # メインスタイルシート
│   └── images/             # 画像ファイル
├── company/
│   └── index.html          # 会社概要ページ
├── news/
│   ├── index.html          # お知らせ一覧
│   ├── 566/                # 個別記事
│   ├── 514/
│   └── ...
├── works/
│   └── index.html          # 実績ページ
├── career/
│   └── index.html          # 採用情報
├── privacy-policy/
│   └── index.html          # プライバシーポリシー
└── lambda/
    └── contact-form/       # お問い合わせフォーム Lambda
```

## 開発方法

### ローカル確認

```bash
# Python HTTPサーバー（推奨）
python3 -m http.server 8080

# または Node.js
npx serve .
```

ブラウザで http://localhost:8080 を開いて確認

### デプロイ

**自動デプロイ**: `main` ブランチにプッシュすると、CodePipelineが自動でS3にデプロイ

```bash
git add .
git commit -m "Update content"
git push origin main
# → 約1-2分でデプロイ完了
```

**即時反映**: CloudFrontキャッシュ無効化が必要な場合

```bash
aws cloudfront create-invalidation \
  --distribution-id E2L8KS8UGWDQ2 \
  --paths "/*" \
  --profile nftt-admin
```

※ キャッシュ無効化しなくても、通常24時間以内に自動で反映されます

## AWSインフラ構成

### アーキテクチャ

```
GitHub (main ブランチ)
    │
    ▼ (push)
CodePipeline
    │
    ▼ (deploy)
S3 (nftt-corporate-site)
    │
    ▼ (origin)
CloudFront (E2L8KS8UGWDQ2)
    │
    ├── WAF (3ルール)
    ├── DDoS Protection
    └── SSL/TLS証明書 (ACM)
    │
    ▼
Route 53 (nftt.co.jp)
    │
    ▼
ユーザー (https://nftt.co.jp)
```

### お問い合わせフォーム

```
フォーム送信
    │
    ▼ (POST)
Lambda Function (nftt-contact-form)
    │
    ▼ (SendEmail)
Amazon SES
    │
    ▼
info@nftt.co.jp
```

### 主要リソース

| サービス | リソース名/ID |
|---------|-------------|
| CloudFront | `E2L8KS8UGWDQ2` |
| S3 | `nftt-corporate-site` |
| CodePipeline | `nftt-corporate-site-pipeline` |
| Lambda | `nftt-contact-form` |
| Route 53 | `Z03746593LY9RIHOQPKRH` |
| WAF | `CreatedByCloudFront-e09a192d` |

### 料金

**CloudFront フラットレート Free プラン** により $0/月

| サービス | 含まれる内容 |
|---------|-------------|
| CloudFront CDN | 1Mリクエスト / 100GB転送 |
| AWS WAF | 5ルールまで |
| DDoS Protection | 含む |
| Route 53 DNS | ホストゾーン + クエリ |
| S3 ストレージ | 5GB クレジット |
| SES | Free Tier 62,000通/月 |
| Lambda | Free Tier 1Mリクエスト/月 |

## 開発特記事項

### プロンプトオンリー開発

本プロジェクト（サイトデザイン・インフラ構築すべて）は **Claude Code (AI)** のプロンプトのみで実施:

- WordPress → 静的サイト移行
- S3 + CloudFront 構成
- Route 53 DNS設定
- SES ドメイン認証（DKIM, SPF, DMARC）
- Lambda お問い合わせフォーム
- WAF セキュリティルール
- CodePipeline CI/CD
- CloudFront フラットレートプラン適用

**所要時間**: 約1日

### 技術スタック

- **フロントエンド**: 静的HTML + CSS（フレームワーク不使用）
- **フォント**: Noto Sans JP, Inter
- **バックエンド**: Lambda (Node.js 20.x)
- **メール**: Amazon SES
- **CDN**: CloudFront
- **DNS**: Route 53
- **CI/CD**: CodePipeline

## ドキュメント

詳細なインフラドキュメントは NFTT-AWS リポジトリを参照:

- [NFTT-AWS/docs/nftt-corporate-site/README.md](https://github.com/NFTTechnology/NFTT-AWS/blob/main/docs/nftt-corporate-site/README.md)

## 更新履歴

| 日付 | 内容 |
|------|------|
| 2025-12-14 | WordPress → S3 + CloudFront 移行 |
| 2025-12-14 | CloudFront Free プラン適用 |
| 2025-12-14 | SES + Lambda お問い合わせフォーム実装 |
| 2025-12-14 | WAF セキュリティルール追加 |
| 2025-12-14 | サイトデザインリニューアル |
