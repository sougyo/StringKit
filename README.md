# StringKit

ブラウザ完結型のテキスト変換ツール。Base64・URL・HTML エンティティ・Unicode・ハッシュ・ケース変換を、外部通信なしでローカルに実行します。

## 特徴

- **単一ファイル** — `index.html` 1 枚で完結、インストール不要
- **外部通信ゼロ** — CDN・API・フォントなど一切の外部リソースなし
- **ブラウザ標準 API のみ** — `btoa/atob`、`encodeURIComponent`、Web Crypto API 等を使用
- **`file://` でそのまま開ける** — サーバー不要

## 使い方

```
index.html をブラウザで開くだけ
```

1. 上部のタブで変換カテゴリを選択する
2. 入力欄にテキストを貼り付ける
3. 変換ボタンを押す
4. 出力欄の **Copy** ボタンで結果をコピーする

**Swap ボタン** で入出力を入れ替えられるため、エンコード→デコードの検証がワンクリックで行えます。

## 機能一覧

### Base64

| ボタン | 説明 |
|--------|------|
| Encode | テキスト → Base64 |
| Decode | Base64 → テキスト |

`TextEncoder` / `TextDecoder` を経由するため、日本語など非 ASCII 文字を含む文字列も正しく変換できます。

### URL

| ボタン | 説明 |
|--------|------|
| Encode | テキスト → URL エンコード（`encodeURIComponent`） |
| Decode | URL エンコード → テキスト（`decodeURIComponent`） |

### HTML Entity

| ボタン | 説明 |
|--------|------|
| Encode | テキスト → HTML エンティティ（`&amp;` `&lt;` `&gt;` 等） |
| Decode | HTML エンティティ → テキスト |

デコード時は DOM の `textContent` を介して取得するため、スクリプト実行は発生しません。

### Unicode

| ボタン | 説明 |
|--------|------|
| Escape   | テキスト → `\uXXXX` / `\u{XXXXX}` 形式 |
| Unescape | `\uXXXX` / `\u{XXXXX}` 形式 → テキスト |

サロゲートペア（U+10000 以上）は `\u{XXXXX}` 形式で出力します。

### Hash

| ボタン | アルゴリズム |
|--------|-------------|
| SHA-1   | SHA-1（160 bit） |
| SHA-256 | SHA-256（256 bit） |
| SHA-384 | SHA-384（384 bit） |
| SHA-512 | SHA-512（512 bit） |

ブラウザ組み込みの **Web Crypto API**（`crypto.subtle.digest`）を使用します。ハッシュは一方向変換のため Decode はありません。

### Case

| ボタン | 例 |
|--------|----|
| UPPER CASE    | `HELLO WORLD` |
| lower case    | `hello world` |
| Title Case    | `Hello World` |
| Sentence case | `Hello world` |
| camelCase     | `helloWorld` |
| PascalCase    | `HelloWorld` |
| snake_case    | `hello_world` |
| kebab-case    | `hello-world` |
| CONSTANT_CASE | `HELLO_WORLD` |

入力は空白区切り・`camelCase`・`PascalCase`・`snake_case`・`kebab-case` のいずれにも対応しています。

## セキュリティ

本ツールはセキュリティを最優先に設計されています。

- 外部への通信は一切発生しない（ネットワークリクエストなし）
- 使用する API はすべてブラウザ標準（サードパーティライブラリなし）
- HTML Entity のデコードは `element.textContent` で取得するため XSS の実行は起きない
- 入力データはブラウザのメモリ内にのみ存在し、永続化・送信はされない

センシティブな文字列（APIキー・パスワード・個人情報など）の変換にも安全に使用できます。

## ブラウザ対応

Web Crypto API および `TextEncoder` をサポートする現行のモダンブラウザで動作します。

| ブラウザ | 対応バージョン |
|----------|---------------|
| Chrome / Edge | 37+ |
| Firefox       | 34+ |
| Safari        | 11+ |

## ライセンス

[MIT](./LICENSE) © 2026 Shogo Matsumoto
