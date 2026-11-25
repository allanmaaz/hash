const MODES = [
  { id: 'permissionless', label: 'Permissionless' },
  { id: 'permissioned', label: 'Permissioned' },
  { id: 'compare', label: 'Compare' },
];

export default function TopBar({ mode, onModeChange, onToggleTheme, onReset }) {
  const activeIndex = MODES.findIndex((m) => m.id === mode);

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true" />
          <span className="brand-title">Consensus</span>
        </div>

        <nav className="segmented" role="tablist" aria-label="Architecture mode">
          <div
            className="segmented-thumb"
            aria-hidden="true"
            style={{ transform: `translateX(${activeIndex * 100}%)` }}
          />
          {MODES.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={mode === item.id}
              className={`segmented-btn ${mode === item.id ? 'is-active' : ''}`}
              onClick={() => onModeChange(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="topbar-actions">
          <button
            type="button"
            className="icon-btn"
            aria-label="Toggle color theme"
            title="Theme"
            onClick={onToggleTheme}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
            </svg>
          </button>
          <button type="button" className="ghost-btn" onClick={onReset}>
            Reset
          </button>
        </div>
      </div>
    </header>
  );
}
