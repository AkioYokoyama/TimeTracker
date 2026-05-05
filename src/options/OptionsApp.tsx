import { useState, useRef, KeyboardEvent } from 'react';
import { useExcludeList } from '../hooks/useExcludeList';

const COMMON_SUGGESTIONS = [
  'google.com',
  'youtube.com',
  'github.com',
  'twitter.com',
  'x.com',
  'facebook.com',
  'instagram.com',
  'reddit.com',
  'linkedin.com',
  'amazon.co.jp',
];

export function OptionsApp() {
  const { list, loading, add, remove, clear } = useExcludeList();
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleAdd() {
    if (!input.trim()) return;
    setError(null);
    const result = await add(input);
    if (result.ok) {
      setInput('');
      flashSaved();
    } else {
      setError(result.error);
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') handleAdd();
    if (e.key === 'Escape') setInput('');
  }

  async function handleRemove(hostname: string) {
    setRemoving(hostname);
    await remove(hostname);
    setRemoving(null);
    flashSaved();
  }

  async function handleClear() {
    if (!confirm('除外リストをすべて削除しますか？')) return;
    await clear();
    flashSaved();
  }

  async function handleSuggestion(hostname: string) {
    setError(null);
    const result = await add(hostname);
    if (result.ok) flashSaved();
    else setError(result.error);
  }

  function flashSaved() {
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  }

  const suggestions = COMMON_SUGGESTIONS.filter((s) => !list.includes(s));

  return (
    <div className="opt-root">
      {/* Sidebar */}
      <aside className="opt-sidebar">
        <div className="opt-logo">
          <div className="opt-logo-icon">⏱</div>
          <div>
            <div className="opt-logo-name">タイムトラッカー</div>
            <div className="opt-logo-sub">設定</div>
          </div>
        </div>

        <nav className="opt-nav">
          <div className="opt-nav-item active">
            <span className="opt-nav-icon">🚫</span>
            除外サイト
          </div>
        </nav>

        <div className="opt-sidebar-footer">
          <div className="opt-version">v1.0.0</div>
        </div>
      </aside>

      {/* Main content */}
      <main className="opt-main">
        <header className="opt-header">
          <div>
            <h1 className="opt-title">除外サイトの管理</h1>
            <p className="opt-desc">
              ここに追加したサイトは、滞在時間の記録・集計から除外されます。
            </p>
          </div>
          <div className={`opt-saved ${saved ? 'visible' : ''}`}>
            ✓ 保存しました
          </div>
        </header>

        {/* Input section */}
        <section className="opt-section">
          <div className="opt-section-label">サイトを追加</div>
          <div className="opt-input-row">
            <div className="opt-input-wrap">
              <span className="opt-input-prefix">🌐</span>
              <input
                ref={inputRef}
                className="opt-input"
                type="text"
                placeholder="例: example.com または https://example.com"
                value={input}
                onChange={(e) => { setInput(e.target.value); setError(null); }}
                onKeyDown={handleKeyDown}
                spellCheck={false}
                autoComplete="off"
              />
              {input && (
                <button className="opt-input-clear" onClick={() => setInput('')} title="クリア">×</button>
              )}
            </div>
            <button
              className="opt-add-btn"
              onClick={handleAdd}
              disabled={!input.trim()}
            >
              追加
            </button>
          </div>
          {error && <div className="opt-error">{error}</div>}
          <div className="opt-hint">URLからドメインを自動で抽出します。Enterキーでも追加できます。</div>
        </section>

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <section className="opt-section">
            <div className="opt-section-label">よく除外されるサイト</div>
            <div className="opt-chips">
              {suggestions.map((s) => (
                <button
                  key={s}
                  className="opt-chip"
                  onClick={() => handleSuggestion(s)}
                >
                  + {s}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Exclude list */}
        <section className="opt-section opt-section-list">
          <div className="opt-section-header">
            <div className="opt-section-label">
              除外中のサイト
              <span className="opt-count">{list.length}</span>
            </div>
            {list.length > 0 && (
              <button className="opt-clear-btn" onClick={handleClear}>
                すべて削除
              </button>
            )}
          </div>

          {loading ? (
            <div className="opt-loading">
              <div className="opt-spinner" />
              読み込み中...
            </div>
          ) : list.length === 0 ? (
            <div className="opt-empty">
              <div className="opt-empty-icon">✅</div>
              <div className="opt-empty-text">除外サイトはありません。<br />すべてのサイトが記録されます。</div>
            </div>
          ) : (
            <ul className="opt-list">
              {list.map((hostname) => (
                <li
                  key={hostname}
                  className={`opt-list-item ${removing === hostname ? 'removing' : ''}`}
                >
                  <img
                    className="opt-favicon"
                    src={`https://www.google.com/s2/favicons?domain=${hostname}&sz=32`}
                    alt=""
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                  <span className="opt-hostname">{hostname}</span>
                  <button
                    className="opt-remove-btn"
                    onClick={() => handleRemove(hostname)}
                    title={`${hostname} を除外リストから削除`}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
