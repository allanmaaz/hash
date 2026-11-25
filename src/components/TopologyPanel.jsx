import { useMemo } from 'react';

const CENTER_X = 320;
const CENTER_Y = 210;
const RADIUS_X = 195;
const RADIUS_Y = 135;

export default function TopologyPanel({
  mode,
  config,
  nodes,
  selectedNodeId,
  pendingNode,
  phaseText,
  isLivePhase,
  pulsingNodeIds,
  forkNodeIds,
  onSelectNode,
  onJoinNode,
  onSecondaryAction,
  onBroadcastTx,
  onApprovePending,
  onRejectPending,
}) {
  const positionedNodes = useMemo(() => {
    const total = nodes.length;
    return nodes.map((node, index) => {
      const angle = (index / total) * Math.PI * 2 - Math.PI / 2;
      return {
        ...node,
        x: CENTER_X + Math.cos(angle) * RADIUS_X,
        y: CENTER_Y + Math.sin(angle) * RADIUS_Y,
      };
    });
  }, [nodes]);

  const edges = useMemo(() => {
    const list = [];
    for (let i = 0; i < positionedNodes.length; i += 1) {
      for (let j = i + 1; j < positionedNodes.length; j += 1) {
        const a = positionedNodes[i];
        const b = positionedNodes[j];
        const isMesh =
          mode === 'permissionless' ||
          a.role === 'Leader' ||
          b.role === 'Leader' ||
          a.role === 'Authority' ||
          b.role === 'Authority' ||
          (j - i === 1);
        if (isMesh) {
          list.push({ a, b, key: `${a.id}-${b.id}` });
        }
      }
    }
    return list;
  }, [positionedNodes, mode]);

  const selectedNode =
    nodes.find((n) => n.id === selectedNodeId) || nodes[0] || null;

  return (
    <section className="panel topology-panel" aria-label="Network topology">
      <div className="panel-head">
        <span className="panel-title">Topology</span>
        <div className="panel-controls">
          <button type="button" className="btn-secondary" onClick={onJoinNode}>
            {config.joinLabel}
          </button>
          <button type="button" className="btn-secondary" onClick={onSecondaryAction}>
            {config.secondaryLabel}
          </button>
          <button type="button" className="btn-primary" onClick={onBroadcastTx}>
            Broadcast Tx
          </button>
        </div>
      </div>

      <div className="canvas-wrap">
        <svg viewBox="0 0 640 420" role="img" aria-label="Blockchain node network">
          {edges.map(({ a, b, key }) => {
            const blocked = a.status === 'pending' || b.status === 'pending';
            const active =
              !blocked &&
              (pulsingNodeIds.includes(a.id) || pulsingNodeIds.includes(b.id));
            return (
              <line
                key={key}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                className={`edge ${blocked ? 'blocked' : ''} ${active ? 'active' : ''}`}
              />
            );
          })}

          {positionedNodes.map((node) => {
            const isSelected = selectedNode?.id === node.id;
            const isLeader = node.role === 'Leader' || node.role === 'Authority';
            const isPending = node.status === 'pending';
            const isPulsing = pulsingNodeIds.includes(node.id);
            const isFork = forkNodeIds.includes(node.id);

            return (
              <g
                key={node.id}
                className={`node-group ${isSelected ? 'is-selected' : ''}`}
                onClick={() => onSelectNode(node.id)}
              >
                <circle className="node-ring" cx={node.x} cy={node.y} r="30" />
                <circle
                  cx={node.x}
                  cy={node.y}
                  r="24"
                  className={[
                    'node-circle',
                    isLeader ? 'leader' : '',
                    isPending ? 'pending' : '',
                    isPulsing ? 'pulse' : '',
                    isFork ? 'fork' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                />
                <text x={node.x} y={node.y - 1} className="node-label">
                  {node.id}
                </text>
                <text x={node.x} y={node.y + 39} className="node-sub">
                  {isPending ? 'Pending CA' : node.role}
                </text>
              </g>
            );
          })}
        </svg>

        {pendingNode && (
          <div className="gate-banner">
            <span className="gate-dot" />
            <span>CA Approval · {pendingNode.id}</span>
            <div className="gate-actions">
              <button
                type="button"
                className="mini-btn approve"
                onClick={onApprovePending}
              >
                Approve
              </button>
              <button
                type="button"
                className="mini-btn reject"
                onClick={onRejectPending}
              >
                Reject
              </button>
            </div>
          </div>
        )}

        <div className={`phase-pill ${isLivePhase ? 'is-live' : ''}`} aria-live="polite">
          {phaseText}
        </div>
      </div>

      <div className="inspector">
        <div className="inspector-item">
          <span className="inspector-k">Node</span>
          <span className="inspector-v mono">{selectedNode?.id ?? '—'}</span>
        </div>
        <div className="inspector-item">
          <span className="inspector-k">Role</span>
          <span className="inspector-v">{selectedNode?.role ?? '—'}</span>
        </div>
        <div className="inspector-item">
          <span className="inspector-k">Identity</span>
          <span className="inspector-v mono">{selectedNode?.identity ?? '—'}</span>
        </div>
        <div className="inspector-item">
          <span className="inspector-k">Access</span>
          <span className="inspector-v">{selectedNode?.access ?? '—'}</span>
        </div>
      </div>
    </section>
  );
}
