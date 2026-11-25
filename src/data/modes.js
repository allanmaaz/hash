export const MODE_CONFIG = {
  permissionless: {
    title: 'Permissionless',
    tags: ['Open Entry', 'Proof of Work', 'Probabilistic Finality'],
    finality: '~12s',
    tps: '15 TPS',
    trust: 'Hash',
    joinLabel: '+ Join Node',
    secondaryLabel: 'Simulate Fork',
    defaultTx: '0x4a…91 → 0x8c…12 · 2.50',
  },
  permissioned: {
    title: 'Permissioned',
    tags: ['CA-Gated', 'PBFT Quorum', 'Deterministic Finality'],
    finality: '0.4s',
    tps: '3,500 TPS',
    trust: 'Identity',
    joinLabel: '+ Request Access',
    secondaryLabel: 'Rotate Leader',
    defaultTx: 'OrgA → OrgB · $25,000',
  },
};

export function createInitialNodes(mode) {
  if (mode === 'permissioned') {
    return [
      { id: 'Org-A', role: 'Leader', identity: 'CN=org-a.msp', access: 'Full Ledger', status: 'approved' },
      { id: 'Org-B', role: 'Validator', identity: 'CN=org-b.msp', access: 'Full Ledger', status: 'approved' },
      { id: 'Org-C', role: 'Validator', identity: 'CN=org-c.msp', access: 'Full Ledger', status: 'approved' },
      { id: 'Bank-1', role: 'Validator', identity: 'CN=bank-1.msp', access: 'Channel 1', status: 'approved' },
      { id: 'Audit', role: 'Auditor', identity: 'CN=audit.msp', access: 'Read Only', status: 'approved' },
      { id: 'CA', role: 'Authority', identity: 'Root-CA-X509', access: 'MSP Gate', status: 'approved' },
    ];
  }

  return [
    { id: 'N-01', role: 'Miner', identity: '0x7a3f…c102', access: 'Public', status: 'approved' },
    { id: 'N-02', role: 'Full Node', identity: '0x91e4…8b21', access: 'Public', status: 'approved' },
    { id: 'N-03', role: 'Miner', identity: '0x2c80…f49a', access: 'Public', status: 'approved' },
    { id: 'N-04', role: 'Full Node', identity: '0x5d19…3e77', access: 'Public', status: 'approved' },
    { id: 'N-05', role: 'Light', identity: '0x88b2…0a19', access: 'Public', status: 'approved' },
    { id: 'N-06', role: 'Miner', identity: '0x1f04…d66e', access: 'Public', status: 'approved' },
  ];
}

export const COMPARE_SPECS = {
  permissionless: [
    ['Entry', 'Open'],
    ['Identity', 'Pseudonymous'],
    ['Consensus', 'PoW / PoS'],
    ['Finality', 'Probabilistic'],
    ['Throughput', '15 – 100 TPS'],
    ['Privacy', 'Transparent'],
    ['Governance', 'Decentralized'],
    ['Examples', 'Bitcoin · Ethereum'],
  ],
  permissioned: [
    ['Entry', 'CA-Gated'],
    ['Identity', 'X.509 Verified'],
    ['Consensus', 'PBFT / Raft'],
    ['Finality', 'Deterministic'],
    ['Throughput', '3,000+ TPS'],
    ['Privacy', 'Channel-Scoped'],
    ['Governance', 'Consortium'],
    ['Examples', 'Fabric · Corda'],
  ],
};
