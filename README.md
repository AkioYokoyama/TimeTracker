# サイト滞在時間トラッカー — Chrome Extension

Vite + React + TypeScript で構築された Chrome 拡張機能です。

## プロジェクト構成

```
time-tracker-vite/
├── public/
│   ├── manifest.json       # Chrome拡張機能マニフェスト
│   ├── background.js       # Service Worker（バンドル不要なので直接配置）
│   └── icons/              # アイコン画像（PNG: 16/48/128px）
├── src/
│   ├── types/
│   │   └── index.ts        # 共通型定義
│   ├── hooks/
│   │   └── useTracker.ts   # データ取得・フォーマット用カスタムフック
│   ├── components/
│   │   ├── SiteItem.tsx    # サイト1行コンポーネント
│   │   └── DateNav.tsx     # 日付ナビゲーションコンポーネント
│   ├── App.tsx             # メインコンポーネント
│   ├── main.tsx            # Reactエントリーポイント
│   └── styles.css          # グローバルスタイル
├── popup.html              # Viteのエントリーポイント
├── vite.config.ts
├── tsconfig.json
└── package.json
```

## セットアップ手順

### 1. 依存パッケージのインストール

```bash
npm install
```

### 2. アイコン画像を追加

`public/icons/` フォルダに以下を配置してください：
- `icon16.png` (16×16px)
- `icon48.png` (48×48px)
- `icon128.png` (128×128px)

### 3. ビルド

```bash
npm run build
```

`dist/` フォルダが生成されます。

### 4. Chromeへの読み込み

1. Chrome で `chrome://extensions/` を開く
2. 右上の **「デベロッパーモード」** をONにする
3. **「パッケージ化されていない拡張機能を読み込む」** をクリック
4. ビルドされた **`dist/`** フォルダを選択

### 5. 開発時（ウォッチモード）

```bash
npm run build -- --watch
```

変更のたびに `dist/` が自動更新されます。Chrome の拡張機能ページで🔄を押すと反映されます。

## 機能

| 機能 | 説明 |
|------|------|
| 自動記録 | タブ切替・ウィンドウフォーカスを検知して記録 |
| アイドル検知 | 60秒操作がないと記録を一時停止 |
| 日付ナビ | 過去30日分を ‹ › で遡れる |
| リアルタイム更新 | 今日のビューは5秒ごとに自動更新 |
| データ削除 | 日別にデータをリセット可能 |
| 自動クリーンアップ | 30日以上前のデータを自動削除 |

## 技術スタック

- **React 18** + **TypeScript 5**
- **Vite 5** (ビルドツール)
- **Chrome Extensions Manifest V3**
- `@types/chrome` で Chrome API の型補完
