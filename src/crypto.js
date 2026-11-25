/**
 * Compute real SHA-256 hex digest using Web Crypto API.
 */
export async function sha256(message) {
  const bytes = new TextEncoder().encode(message);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Compute canonical block hash from block fields.
 */
export async function computeBlockHash({ index, prevHash, timestamp, data, nonce }) {
  return sha256(`${index}|${prevHash}|${timestamp}|${data}|${nonce}`);
}

/**
 * Mine a block (PoW with 2 leading hex zeros for snappy interactive demo)
 * or sign directly (PBFT/Raft deterministic mode).
 */
export async function sealBlock({ index, prevHash, data, isPermissioned }) {
  const timestamp = new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  if (isPermissioned) {
    const nonce = 'CA-QUORUM';
    const hash = await computeBlockHash({ index, prevHash, timestamp, data, nonce });
    return { index, prevHash, timestamp, data, nonce, hash, valid: true };
  }

  let nonce = 0;
  let hash = '';
  while (true) {
    hash = await computeBlockHash({ index, prevHash, timestamp, data, nonce });
    if (hash.startsWith('00') || nonce > 2500) break;
    nonce += 1;
  }
  return { index, prevHash, timestamp, data, nonce, hash, valid: true };
}

/**
 * Re-verify every block in a chain and flag broken links or tampered hashes.
 */
export async function validateChain(chain) {
  const validated = [];
  let allValid = true;

  for (let i = 0; i < chain.length; i += 1) {
    const block = chain[i];
    const expectedPrev = i === 0 ? '0'.repeat(64) : validated[i - 1].hash;
    const actualHash = await computeBlockHash(block);
    const linkMatches = block.prevHash === expectedPrev;
    const hashMatches = block.hash === actualHash;
    const valid = allValid && linkMatches && hashMatches;
    if (!valid) allValid = false;
    validated.push({ ...block, valid });
  }

  return { chain: validated, allValid };
}
