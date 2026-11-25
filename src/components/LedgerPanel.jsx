export default function LedgerPanel({
  chain,
  allValid,
  txInput,
  onTxInputChange,
  onTamperBlock,
  onResealBlock,
}) {
  return (
    <section className="panel ledger-panel" aria-label="Ledger blocks">
      <div className="panel-head">
        <span className="panel-title">Ledger</span>
        <span className={`status-badge ${allValid ? 'valid' : 'invalid'}`}>
          {allValid ? 'Valid' : 'Tampered'}
        </span>
      </div>

      <div className="tx-composer">
        <input
          type="text"
          className="input"
          value={txInput}
          maxLength={42}
          aria-label="Transaction payload"
          onChange={(e) => onTxInputChange(e.target.value)}
        />
        <span className="hint-chip">Edit block to tamper</span>
      </div>

      <div className="chain-list" aria-live="polite">
        {[...chain].reverse().map((block) => (
          <article
            key={block.index}
            className={`block-card ${block.valid ? '' : 'is-invalid'}`}
          >
            <div className="block-top">
              <span className="block-index mono">#{block.index}</span>
              <span className="block-meta mono">
                {block.timestamp} · {block.nonce}
              </span>
            </div>

            <input
              type="text"
              className="block-data mono"
              value={block.data}
              aria-label={`Block ${block.index} payload`}
              onChange={(e) => onTamperBlock(block.index, e.target.value)}
            />

            <div className="block-hashes mono">
              <div className="hash-line" title={block.prevHash}>
                prev {block.prevHash.slice(0, 12)}…
              </div>
              <div className="hash-line" title={block.hash}>
                hash {block.hash.slice(0, 12)}…
              </div>
            </div>

            {!block.valid && (
              <div className="block-actions">
                <button
                  type="button"
                  className="mini-btn approve"
                  onClick={() => onResealBlock(block.index)}
                >
                  Re-seal
                </button>
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
