import { formatDateFull } from '../../hooks/useTracker';

interface Props {
  offset: number;
  onPrev: () => void;
  onNext: () => void;
}

const MIN_OFFSET = -30;

export function DateNav({ offset, onPrev, onNext }: Props) {
  return (
    <div className="date-nav">
      <button
        className="nav-btn"
        onClick={onPrev}
        disabled={offset <= MIN_OFFSET}
        title="前の日"
      >
        ‹
      </button>
      <div className="date-display">{formatDateFull(offset)}</div>
      <button
        className="nav-btn"
        onClick={onNext}
        disabled={offset >= 0}
        title="次の日"
      >
        ›
      </button>
    </div>
  );
}
