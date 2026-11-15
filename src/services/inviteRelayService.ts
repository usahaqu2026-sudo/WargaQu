const ISSUED_INVITES_KEY = 'wargaqu_issued_short_invites_v1';

interface StoredShortInvite {
  code: string;
  payload: string;
  createdAt: number;
}

function loadIssuedShortInvites(): StoredShortInvite[] {
  try {
    const raw = localStorage.getItem(ISSUED_INVITES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // ignore
  }
  return [];
}

function saveIssuedShortInvite(code: string, payload: string) {
  try {
    const list = loadIssuedShortInvites().filter((x) => x.code !== code);
    list.unshift({ code, payload, createdAt: Date.now() });
    localStorage.setItem(ISSUED_INVITES_KEY, JSON.stringify(list.slice(0, 30)));
  } catch {
    // ignore
  }
}

function getLocalIssuedPayload(code: string): string | null {
  const found = loadIssuedShortInvites().find((x) => x.code === code);
  return found ? found.payload : null;
}

export function extractShortCodeCandidate(rawInput: string): string | null {
  const trimmed = (rawInput || '').trim();
  if (!trimmed) return null;

  let candidate = trimmed;
  if (trimmed.includes('t=') || trimmed.includes('trah=') || trimmed.includes('rt=') || trimmed.includes('rtInvite=')) {
    try {
      const qIdx = trimmed.indexOf('?');
      const hIdx = trimmed.indexOf('#');
      const sliceFrom = qIdx >= 0 ? trimmed.slice(qIdx) : hIdx >= 0 ? `?${trimmed.slice(hIdx + 1)}` : `?${trimmed}`;
      const params = new URLSearchParams(sliceFrom.split('#')[0]);
      const extracted =
        params.get('t') || params.get('trah') || params.get('rt') || params.get('rtInvite');
      if (extracted) candidate = extracted.trim();
    } catch {
      // ignore
    }
  }

  if (/^[QR][A-Za-z0-9]{5,12}$/.test(candidate)) {
    return candidate;
  }
  return null;
}

export const InviteRelayService = {
  async createShortInviteLink(
    prefix: 'Q' | 'R',
    queryKey: 't' | 'rt',
    fullCompressedToken: string
  ): Promise<{ url: string; shortCode: string; isShort: boolean }> {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const fallbackUrl = `${origin}/?${queryKey}=${encodeURIComponent(fullCompressedToken)}`;

    try {
      const res = await fetch('/api/relay-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prefix, payload: fullCompressedToken }),
      });
      if (res.ok) {
        const data = (await res.json()) as { code?: string };
        if (data?.code) {
          saveIssuedShortInvite(data.code, fullCompressedToken);
          return {
            url: `${origin}/?${queryKey}=${data.code}`,
            shortCode: data.code,
            isShort: true,
          };
        }
      }
    } catch {
      // offline fallback
    }

    return {
      url: fallbackUrl,
      shortCode: fullCompressedToken,
      isShort: false,
    };
  },

  async resolveInviteTokenIfShort(rawInput: string): Promise<string> {
    const shortCode = extractShortCodeCandidate(rawInput);
    if (!shortCode) return rawInput;

    // 1. Check local sender storage first (instant same-device preview/test)
    const localPayload = getLocalIssuedPayload(shortCode);
    if (localPayload) return localPayload;

    // 2. Fetch from ephemeral RAM relay ticket endpoint
    try {
      const res = await fetch(`/api/relay-ticket/${encodeURIComponent(shortCode)}`);
      if (res.ok) {
        const data = (await res.json()) as { payload?: string };
        if (data?.payload) {
          return data.payload;
        }
      }
    } catch {
      // ignore network errors
    }

    return rawInput;
  },
};
