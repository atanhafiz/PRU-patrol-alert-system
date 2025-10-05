export async function withRetry(fn, { retries = 2, base = 400 } = {}) {
  let last;
  for (let i = 0; i <= retries; i++) {
    try { return await fn(); }
    catch (e) { last = e; if (i < retries) await new Promise(r => setTimeout(r, base * 2 ** i)); }
  }
  throw last;
}
