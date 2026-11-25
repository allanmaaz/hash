import { useCallback, useEffect, useState } from 'react';
import TopBar from './components/TopBar.jsx';
import TopologyPanel from './components/TopologyPanel.jsx';
import LedgerPanel from './components/LedgerPanel.jsx';
import CompareView from './components/CompareView.jsx';
import { MODE_CONFIG, createInitialNodes } from './data/modes.js';
import { sealBlock, validateChain } from './crypto.js';

function randomHex(len = 4) {
  return Math.floor(Math.random() * 16 ** len)
    .toString(16)
    .padStart(len, '0');
}

export default function App() {
  const [mode, setMode] = useState('permissionless');
  const [theme, setTheme] = useState(null);
  const [nodes, setNodes] = useState(() => createInitialNodes('permissionless'));
  const [selectedNodeId, setSelectedNodeId] = useState('N-01');
  const [chain, setChain] = useState([]);
  const [allValid, setAllValid] = useState(true);
  const [txInput, setTxInput] = useState(MODE_CONFIG.permissionless.defaultTx);
  const [phaseText, setPhaseText] = useState('Idle');
  const [isLivePhase, setIsLivePhase] = useState(false);
  const [pulsingNodeIds, setPulsingNodeIds] = useState([]);
  const [forkNodeIds, setForkNodeIds] = useState([]);

  const initLedger = useCallback(async (targetMode) => {
    const isPermissioned = targetMode === 'permissioned';
    const genesis = await sealBlock({
      index: 0,
      prevHash: '0'.repeat(64),
      data: isPermissioned ? 'Genesis · MSP Root' : 'Genesis · Public',
      isPermissioned,
    });
    const b1 = await sealBlock({
      index: 1,
      prevHash: genesis.hash,
      data: MODE_CONFIG[targetMode].defaultTx,
      isPermissioned,
    });
    setChain([genesis, b1]);
    setAllValid(true);
  }, []);

  useEffect(() => {
    initLedger('permissionless');
  }, [initLedger]);

  useEffect(() => {
    if (theme) {
      document.documentElement.setAttribute('data-theme', theme);
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [theme]);

  const handleModeChange = async (nextMode) => {
    setMode(nextMode);
    if (nextMode === 'compare') return;

    const freshNodes = createInitialNodes(nextMode);
    setNodes(freshNodes);
    setSelectedNodeId(freshNodes[0].id);
    setTxInput(MODE_CONFIG[nextMode].defaultTx);
    setPhaseText('Idle');
    setIsLivePhase(false);
    setPulsingNodeIds([]);
    setForkNodeIds([]);
    await initLedger(nextMode);
  };

  const handleReset = () => {
    const activeMode = mode === 'compare' ? 'permissionless' : mode;
    handleModeChange(activeMode);
  };

  const handleToggleTheme = () => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme((prev) => {
      if (!prev) return prefersDark ? 'light' : 'dark';
      return prev === 'dark' ? 'light' : 'dark';
    });
  };

  const handleJoinNode = () => {
    if (nodes.length >= 10) return;

    if (mode === 'permissionless') {
      const id = `N-0${nodes.length + 1}`;
      const newNode = {
        id,
        role: 'Miner',
        identity: `0x${randomHex(4)}…${randomHex(4)}`,
        access: 'Public',
        status: 'approved',
      };
      setNodes((prev) => [...prev, newNode]);
      setSelectedNodeId(id);
      setPhaseText(`${id} Joined`);
      setIsLivePhase(true);
      setPulsingNodeIds([id]);
      setTimeout(() => {
        setPulsingNodeIds([]);
        setIsLivePhase(false);
        setPhaseText('Idle');
      }, 900);
      return;
    }

    if (nodes.some((n) => n.status === 'pending')) return;
    const id = `Org-${String.fromCharCode(65 + nodes.length - 1)}`;
    const pending = {
      id,
      role: 'Validator',
      identity: `CN=${id.toLowerCase()}.msp`,
      access: 'Pending',
      status: 'pending',
    };
    setNodes((prev) => [...prev, pending]);
    setSelectedNodeId(id);
    setPhaseText('Awaiting CA');
    setIsLivePhase(true);
  };

  const handleApprovePending = () => {
    setNodes((prev) =>
      prev.map((n) =>
        n.status === 'pending' ? { ...n, status: 'approved', access: 'Channel 1' } : n
      )
    );
    setPhaseText('Cert Issued');
    setTimeout(() => {
      setIsLivePhase(false);
      setPhaseText('Idle');
    }, 900);
  };

  const handleRejectPending = () => {
    setNodes((prev) => {
      const filtered = prev.filter((n) => n.status !== 'pending');
      setSelectedNodeId(filtered[0]?.id ?? null);
      return filtered;
    });
    setPhaseText('Access Denied');
    setTimeout(() => {
      setIsLivePhase(false);
      setPhaseText('Idle');
    }, 900);
  };

  const handleSecondaryAction = () => {
    if (mode === 'permissionless') {
      const miners = nodes.filter((n) => n.role === 'Miner').slice(0, 2).map((n) => n.id);
      setForkNodeIds(miners);
      setPhaseText('Fork · Longest Chain Wins');
      setIsLivePhase(true);
      setTimeout(() => {
        setForkNodeIds([]);
        setIsLivePhase(false);
        setPhaseText('Idle');
      }, 1500);
      return;
    }

    setNodes((prev) => {
      const idx = prev.findIndex((n) => n.role === 'Leader');
      const validators = prev.filter((n) => n.role === 'Validator');
      if (idx === -1 || validators.length === 0) return prev;
      const nextLeaderId = validators[0].id;
      return prev.map((n) => {
        if (n.id === prev[idx].id) return { ...n, role: 'Validator' };
        if (n.id === nextLeaderId) return { ...n, role: 'Leader' };
        return n;
      });
    });
    setPhaseText('Leader Rotated');
    setIsLivePhase(true);
    setTimeout(() => {
      setIsLivePhase(false);
      setPhaseText('Idle');
    }, 900);
  };

  const handleBroadcastTx = async () => {
    const payload = txInput.trim() || MODE_CONFIG[mode].defaultTx;
    const isPermissioned = mode === 'permissioned';
    const approvedIds = nodes.filter((n) => n.status === 'approved').map((n) => n.id);

    setIsLivePhase(true);
    setPulsingNodeIds(approvedIds);

    if (isPermissioned) {
      setPhaseText('Pre-Prepare → Commit');
      await new Promise((r) => setTimeout(r, 380));
    } else {
      setPhaseText('Mempool → Mining');
      await new Promise((r) => setTimeout(r, 650));
    }

    const prevHash = chain[chain.length - 1]?.hash ?? '0'.repeat(64);
    const nextBlock = await sealBlock({
      index: chain.length,
      prevHash,
      data: payload,
      isPermissioned,
    });

    const { chain: validated, allValid: validState } = await validateChain([
      ...chain,
      nextBlock,
    ]);
    setChain(validated);
    setAllValid(validState);
    setPhaseText(isPermissioned ? 'Finalized (0.4s)' : 'Block Mined');

    setTimeout(() => {
      setPulsingNodeIds([]);
      setIsLivePhase(false);
      setPhaseText('Idle');
    }, 900);
  };

  const handleTamperBlock = async (index, nextData) => {
    const updated = chain.map((b) => (b.index === index ? { ...b, data: nextData } : b));
    const { chain: validated, allValid: validState } = await validateChain(updated);
    setChain(validated);
    setAllValid(validState);
  };

  const handleResealBlock = async (index) => {
    const isPermissioned = mode === 'permissioned';
    const copy = [...chain];
    for (let i = index; i < copy.length; i += 1) {
      const prevHash = i === 0 ? '0'.repeat(64) : copy[i - 1].hash;
      copy[i] = await sealBlock({
        index: copy[i].index,
        prevHash,
        data: copy[i].data,
        isPermissioned,
      });
    }
    const { chain: validated, allValid: validState } = await validateChain(copy);
    setChain(validated);
    setAllValid(validState);
  };

  const activeConfig = MODE_CONFIG[mode === 'compare' ? 'permissionless' : mode];
  const pendingNode = nodes.find((n) => n.status === 'pending') || null;
  const approvedCount = nodes.filter((n) => n.status === 'approved').length;

  return (
    <>
      <TopBar
        mode={mode}
        onModeChange={handleModeChange}
        onToggleTheme={handleToggleTheme}
        onReset={handleReset}
      />

      <main className="shell">
        {mode === 'compare' ? (
          <CompareView />
        ) : (
          <section className="view">
            <div className="hero-strip">
              <div>
                <h1>{activeConfig.title}</h1>
                <p className="tag-row">
                  {activeConfig.tags.map((tag) => (
                    <span key={tag} className="pill">
                      {tag}
                    </span>
                  ))}
                </p>
              </div>

              <div className="telemetry" aria-label="Network metrics">
                <div className="metric">
                  <span className="metric-label">Finality</span>
                  <span className="metric-value">{activeConfig.finality}</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Throughput</span>
                  <span className="metric-value">{activeConfig.tps}</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Nodes</span>
                  <span className="metric-value">{approvedCount}</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Trust</span>
                  <span className="metric-value">{activeConfig.trust}</span>
                </div>
              </div>
            </div>

            <div className="workspace">
              <TopologyPanel
                mode={mode}
                config={activeConfig}
                nodes={nodes}
                selectedNodeId={selectedNodeId}
                pendingNode={pendingNode}
                phaseText={phaseText}
                isLivePhase={isLivePhase}
                pulsingNodeIds={pulsingNodeIds}
                forkNodeIds={forkNodeIds}
                onSelectNode={setSelectedNodeId}
                onJoinNode={handleJoinNode}
                onSecondaryAction={handleSecondaryAction}
                onBroadcastTx={handleBroadcastTx}
                onApprovePending={handleApprovePending}
                onRejectPending={handleRejectPending}
              />

              <LedgerPanel
                chain={chain}
                allValid={allValid}
                txInput={txInput}
                onTxInputChange={setTxInput}
                onTamperBlock={handleTamperBlock}
                onResealBlock={handleResealBlock}
              />
            </div>
          </section>
        )}
      </main>
    </>
  );
}
