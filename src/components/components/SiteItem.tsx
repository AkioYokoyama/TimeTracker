import { useState, useEffect, useRef } from 'react';
import type { SiteEntry } from '../../types';
import { formatTime } from '../../hooks/useTracker';

const BAR_COLORS = [
  'linear-gradient(90deg, #6c63ff, #a78bfa)',
  'linear-gradient(90deg, #ff6584, #f97316)',
  'linear-gradient(90deg, #43e97b, #38f9d7)',
  'linear-gradient(90deg, #f093fb, #f5576c)',
  'linear-gradient(90deg, #4facfe, #00f2fe)',
  'linear-gradient(90deg, #ffecd2, #fcb69f)',
  'linear-gradient(90deg, #a1c4fd, #c2e9fb)',
  'linear-gradient(90deg, #fbc2eb, #a6c1ee)',
];

interface Props {
  entry: SiteEntry;
  rank: number;
  index: number;
}

export function SiteItem({ entry, rank, index }: Props) {
  const [barWidth, setBarWidth] = useState(0);
  const [imgError, setImgError] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      setBarWidth(entry.percentage);
    }, 60 + index * 40);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [entry.percentage, index]);

  const faviconUrl = `https://www.google.com/s2/favicons?domain=${entry.hostname}&sz=32`;
  const color = BAR_COLORS[index % BAR_COLORS.length];

  return (
    <div
      className="site-item"
      style={{ animationDelay: `${index * 0.04}s` }}
    >
      <div className="site-row">
        <span className="site-rank">{rank}</span>

        {!imgError ? (
          <img
            className="site-favicon"
            src={faviconUrl}
            alt=""
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="favicon-placeholder">🌐</div>
        )}

        <span className="site-name" title={entry.hostname}>
          {entry.hostname}
        </span>
        <span className="site-time">{formatTime(entry.seconds)}</span>
      </div>

      <div className="progress-track">
        <div
          className="progress-fill"
          style={{
            width: `${barWidth}%`,
            background: color,
            transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />
      </div>
      <div className="site-pct">{entry.percentage.toFixed(1)}%</div>
    </div>
  );
}
