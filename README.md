# StringKit

ブラウザ完結型のテキスト変換ツール。Base64・URL・HTML エンティティ・Unicode・ハッシュ・ケース変換・Diff・時刻オフセット・進数変換を、外部通信なしでローカルに実行します。

## 特徴

- **単一ファイル** — `index.html` 1 枚で完結、インストール不要
- **外部通信ゼロ** — CDN・API・フォントなど一切の外部リソースなし
- **ブラウザ標準 API のみ** — `btoa/atob`、`encodeURIComponent`、Web Crypto API 等を使用
- **`file://` でそのまま開ける** — サーバー不要

## 使い方

```
index.html をブラウザで開くだけ
```
https://sougyo.github.io/StringKit/

1. 上部のタブで変換カテゴリを選択する
2. 入力欄にテキストを貼り付ける（**入力と同時に自動変換**）
3. セレクトボックスで変換の種類を切り替える
4. 出力欄の **Copy** ボタンで結果をコピーする

**Swap ボタン**（対応タブのみ）は出力を入力に移しつつモードを自動反転します（例: Encode → Decode）。

## 機能一覧

### Base64

セレクトで **Encode / Decode** を切り替え。  
`TextEncoder` / `TextDecoder` を経由するため、日本語など非 ASCII 文字を含む文字列も正しく変換できます。

| モード | 説明 |
|--------|------|
| Encode → | テキスト → Base64 |
| ← Decode | Base64 → テキスト |

### URL

セレクトで **Encode / Decode** を切り替え。

| モード | 説明 |
|--------|------|
| Encode → | テキスト → URL エンコード |
| ← Decode | URL エンコード → テキスト（`decodeURIComponent`） |

**スマート URL エンコード**: 入力が `scheme://` で始まる URL の場合、構造を保ちながら必要な箇所のみエンコードします。

| URL の部位 | 処理 |
|-----------|------|
| `scheme://host:port` | 変換しない |
| パスセグメント（`/` 区切り） | 各セグメントを `encodeURIComponent` |
| クエリのキー・値（`?` `&` `=` は保持） | それぞれ `encodeURIComponent` |
| フラグメント（`#` 以降） | `encodeURIComponent` |
| URL 以外の文字列 | 全体を `encodeURIComponent` |

### HTML Entity

セレクトで **Encode / Decode** を切り替え。デコード時は DOM の `textContent` を経由するため、スクリプト実行は発生しません。

| モード | 説明 |
|--------|------|
| Encode → | テキスト → HTML エンティティ（`&amp;` `&lt;` `&gt;` 等） |
| ← Decode | HTML エンティティ → テキスト |

### Unicode

セレクトで **Escape / Unescape** を切り替え。サロゲートペア（U+10000 以上）は `\u{XXXXX}` 形式で出力します。

| モード | 説明 |
|--------|------|
| Escape → | テキスト → `\uXXXX` / `\u{XXXXX}` 形式 |
| ← Unescape | `\uXXXX` / `\u{XXXXX}` 形式 → テキスト |

### Hash

セレクトでアルゴリズムを選択。ブラウザ組み込みの **Web Crypto API**（`crypto.subtle.digest`）を使用します。ハッシュは一方向変換のため Decode はありません。

| アルゴリズム | ビット長 |
|-------------|---------|
| SHA-1   | 160 bit |
| SHA-256（デフォルト） | 256 bit |
| SHA-384 | 384 bit |
| SHA-512 | 512 bit |

### Case

セレクトで変換形式を選択。入力は空白区切り・`camelCase`・`PascalCase`・`snake_case`・`kebab-case` のいずれにも対応しています。

| 形式 | 例 |
|------|----|
| UPPER CASE（デフォルト） | `HELLO WORLD` |
| lower case    | `hello world` |
| Title Case    | `Hello World` |
| Sentence case | `Hello world` |
| camelCase     | `helloWorld` |
| PascalCase    | `HelloWorld` |
| snake_case    | `hello_world` |
| kebab-case    | `hello-world` |
| CONSTANT_CASE | `HELLO_WORLD` |

### Diff

2 つのテキストの差分をリアルタイムで表示します。LCS アルゴリズムによる行単位 diff と、変更行内の文字単位ハイライトに対応しています。

- **統合ビュー / 分割ビュー**を切り替え可能
- 追加・削除・変更なし行数をサマリ表示
- 大量の変更がない場合は前後 3 行のみ表示してそれ以外を省略

### Time

テキスト中の時刻（`HH:MM:SS` 形式）を検出し、オフセットを加算して出力します。

| 設定 | 説明 |
|------|------|
| オフセット | 秒数（例: `3600`、`-1800`）または `HH:MM:SS` 形式（例: `01:30:00`）。負値も可 |
| 日付またぎを考慮 | ON にすると 0〜11 時の時刻を +24 時間して読み替え（放送業務の「深夜時間帯」表記に対応） |

テキスト中の時刻以外の部分はそのまま維持され、入力・設定変更のたびに自動で再変換されます。

### Radix

2進数・8進数・10進数・16進数の相互変換を行います。複数行入力に対応し、各行を独立して変換します。

| 設定 | 説明 |
|------|------|
| 入力 | 2 / 8 / 10（デフォルト）/ 16 進数 |
| 出力 | 2 / 8 / 10 / 16（デフォルト）進数 |
| 出力桁数 | 指定した桁数に満たない場合は左ゼロ埋め。空欄なら埋めなし |

16 進数の出力は大文字。負の値は先頭に `-` を付けて入力・出力できます。

## セキュリティ

本ツールはセキュリティを最優先に設計されています。

- 外部への通信は一切発生しない（ネットワークリクエストなし）
- 使用する API はすべてブラウザ標準（サードパーティライブラリなし）
- HTML Entity のデコードは `element.textContent` で取得するため XSS の実行は起きない
- 入力データはブラウザのメモリ内にのみ存在し、永続化・送信はされない

センシティブな文字列（API キー・パスワード・個人情報など）の変換にも安全に使用できます。

## ブラウザ対応

Web Crypto API および `TextEncoder` をサポートする現行のモダンブラウザで動作します。

| ブラウザ | 対応バージョン |
|----------|---------------|
| Chrome / Edge | 37+ |
| Firefox       | 34+ |
| Safari        | 11+ |

## ライセンス

[MIT](./LICENSE) © 2026 Shogo Matsumoto
