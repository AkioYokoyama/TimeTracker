import { useState } from 'react';
import { useSiteData, formatTimeFull, formatDateLabel } from './hooks/useTracker';
import { SiteItem } from './components/SiteItem';
import { DateNav } from './components/DateNav';

export default function App() {
  const [offset, setOffset] = useState(0);
  const { entries, totalSeconds, loading, clearData } = useSiteData(offset);

  const today = new Date();
  const todayBadge = `${today.getMonth() + 1}/${today.getDate()}`;

  const handleReset = async () => {
    const label = formatDateLabel(offset);
    if (confirm(`${label}のデータを削除しますか？`)) {
      await clearData();
    }
  };

  return (
    <div className="container">
      {/* Header */}
      <header>
        <div className="header-top">
          <div className="logo">
            <div className="logo-icon">⏱</div>
            <div className="logo-text">タイムトラッカー</div>
          </div>
          <div className="date-badge">{todayBadge}</div>
        </div>
        <DateNav
          offset={offset}
          onPrev={() => setOffset((o) => Math.max(o - 1, -30))}
          onNext={() => setOffset((o) => Math.min(o + 1, 0))}
        />
      </header>

      {/* Total */}
      <div className="total-section">
        <div className="total-label">合計滞在時間</div>
        <div className="total-time">{formatTimeFull(totalSeconds)}</div>
      </div>

      {/* List header */}
      <div className="list-header">
        <span className="list-label">サイト別</span>
        <span className="site-count">{entries.length} サイト</span>
      </div>

      {/* Sites */}
      <div className="sites-list">
        {loading ? (
          <div className="loading">
            <div className="spinner" />
            読み込み中...
          </div>
        ) : entries.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🌐</div>
            <div className="empty-text">
              この日の記録はありません。
              <br />
              ブラウジングを開始すると自動で記録されます。
            </div>
          </div>
        ) : (
          entries.map((entry, i) => (
            <SiteItem key={entry.hostname} entry={entry} rank={i + 1} index={i} />
          ))
        )}
      </div>

      {/* Footer */}
      <footer>
        <button className="reset-btn" onClick={handleReset}>
          このデータを削除
        </button>
        <div className="tracking-status">
          <div className="status-dot" />
          記録中
        </div>
      </footer>
    </div>
  );
}
