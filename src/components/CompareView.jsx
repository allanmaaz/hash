import { useState } from 'react';
import { COMPARE_SPECS } from '../data/modes';

const PRIORITIES = [
  { id: 'open', label: 'Public Audit', winner: 'permissionless' },
  { id: 'privacy', label: 'Data Privacy', winner: 'permissioned' },
  { id: 'speed', label: 'High TPS', winner: 'permissioned' },
];

export default function CompareView() {
  const [priority, setPriority] = useState('open');
  const winner = PRIORITIES.find((p) => p.id === priority)?.winner;

  return (
    <section className="view" aria-label="Architecture comparison">
      <div className="hero-strip">
        <div>
          <h1>Architecture Matrix</h1>
          <p className="tag-row">
            <span className="pill">Public vs Private</span>
            <span className="pill">Trust Models</span>
          </p>
        </div>

        <div className="selector-group" aria-label="Priority selector">
          {PRIORITIES.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`filter-chip ${priority === item.id ? 'is-active' : ''}`}
              onClick={() => setPriority(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="compare-grid">
        {(['permissionless', 'permissioned']).map((type) => (
          <article
            key={type}
            className={`compare-card ${winner === type ? 'is-recommended' : ''}`}
          >
            <div className="compare-head">
              <h2>{type === 'permissionless' ? 'Permissionless' : 'Permissioned'}</h2>
              <span className="rec-badge">Recommended</span>
            </div>
            <dl className="spec-list">
              {COMPARE_SPECS[type].map(([key, val]) => (
                <div key={key} className="spec-row">
                  <dt>{key}</dt>
                  <dd>{val}</dd>
                </div>
              ))}
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
}
