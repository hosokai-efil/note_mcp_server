# note.com MCP Server

Claude Desktop から [note.com](https://note.com) の記事を検索・閲覧・下書き作成できる MCP (Model Context Protocol) リモートサーバーです。

Cloudflare Workers にデプロイされており、URL を登録するだけで誰でも利用できます。

> **Note:** note.com の非公式 API を使用しています。仕様は予告なく変更される可能性があります。

## 提供ツール

| ツール名 | 説明 | 認証 |
|---------|------|------|
| `get_user_profile` | ユーザーのプロフィール情報を取得 | 不要 |
| `get_user_articles` | ユーザーの記事一覧を取得 | 不要 |
| `get_article` | 記事の全文を取得 | 不要 |
| `get_comments` | 記事のコメントを取得 | 不要 |
| `create_draft` | 下書き記事を作成 | **必要** |

## セットアップ

### 方法 1: Claude Desktop カスタムコネクタ（推奨）

1. Claude Desktop を開く
2. 設定 > コネクタ > カスタムコネクタを追加
3. 以下を入力:
   - **名前**: `note`（任意）
   - **URL**: `https://note-mcp-server.noisy-brook-6917.workers.dev/mcp`

### 方法 2: mcp-remote 経由

`claude_desktop_config.json` に以下を追加:

```json
{
  "mcpServers": {
    "note": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "https://note-mcp-server.noisy-brook-6917.workers.dev/mcp"
      ]
    }
  }
}
```

## 使い方

### 記事の閲覧（認証不要）

Claude Desktop で以下のように話しかけるだけで使えます:

```
efil_devさんのnoteの記事一覧を見せて
```

```
この記事の全文を読みたい: n5829f47dd4da
```

```
この記事のコメントを見せて
```

### 下書き記事の作成（認証が必要）

下書き作成には note.com のセッション Cookie が必要です。

#### セッション Cookie の取得手順

1. ブラウザで [note.com](https://note.com) にログイン
2. DevTools を開く（`F12` キー）
3. **Application** > **Cookies** > `https://note.com` を選択
4. `_note_session_v5` の **Value** をコピー

#### 下書きの作成

Claude Desktop に以下のように依頼します:

```
以下の内容でnoteに下書きを作成して。

session_cookie: （ここにコピーした値を貼り付け）

タイトル: Claude Code で開発効率を上げる方法

本文:
## はじめに

この記事では、Claude Code を使った開発の効率化について解説します。

## ポイント

- **コード生成**: 自然言語で指示するだけでコードを生成
- **デバッグ支援**: エラーメッセージを貼るだけで原因を特定
- **リファクタリング**: 既存コードの改善提案

## まとめ

Claude Code を活用することで、開発スピードが大幅に向上します。
```

#### 重要: 本文は Markdown 形式で書く

`create_draft` ツールは Markdown を自動的に note.com の HTML 形式に変換します。プレーンテキストでも投稿できますが、Markdown を使うことで見出しや太字などの書式が反映されます。

**対応している Markdown 記法:**

| 記法 | 表示 |
|------|------|
| `## 見出し` | 見出し（大） |
| `### 小見出し` | 見出し（小） |
| `**太字**` | **太字** |
| `*斜体*` | *斜体* |
| `` `コード` `` | インラインコード |
| `[テキスト](URL)` | リンク |
| `> 引用文` | 引用ブロック |
| `- 箇条書き` | 箇条書きリスト |
| `1. 番号付き` | 番号付きリスト |
| ` ```コードブロック``` ` | コードブロック |
| `---` | 水平線 |

#### セッション Cookie に関する注意事項

- Cookie には有効期限があります。期限切れの場合は再取得してください
- 認証エラーが出た場合: ブラウザで note.com に再ログインし、新しい Cookie を取得してください
- Cookie はあなたのアカウント情報に紐づいています。他人と共有しないでください
- 作成された記事は**下書き**として保存されます。公開はされません

## 使用している API

| エンドポイント | 用途 |
|---------------|------|
| `GET /api/v2/creators/{username}` | プロフィール取得 |
| `GET /api/v2/creators/{username}/contents` | 記事一覧取得 |
| `GET /api/v3/notes/{key}` | 記事本文取得 |
| `GET /api/v3/notes/{key}/note_comments` | コメント取得 |
| `POST /api/v1/text_notes` | 記事作成 |
| `POST /api/v1/text_notes/draft_save` | 下書き本文保存 |

## 技術スタック

- **Runtime**: Cloudflare Workers
- **MCP SDK**: `@modelcontextprotocol/sdk` + `agents` (Durable Objects)
- **Language**: TypeScript

## ローカル開発

```bash
npm install
npm run dev      # ローカル開発サーバー起動
npm run deploy   # Cloudflare にデプロイ
```

## 制限事項

- 非公式 API のため、note.com の仕様変更により動作しなくなる可能性があります
- 有料記事・会員限定記事の全文は取得できません
- 画像のアップロードには対応していません
- 下書き作成のみ対応しており、記事の公開には対応していません

## ライセンス

MIT
