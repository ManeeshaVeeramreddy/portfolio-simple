// Tiny TOTP (the 6-digit codes used by Google Authenticator, Authy, etc.)
// Uses the browser's built-in Web Crypto, no libraries needed.
(function (root) {
  const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

  function base32Encode(bytes) {
    let bits = 0, value = 0, out = '';
    for (const b of bytes) {
      value = (value << 8) | b;
      bits += 8;
      while (bits >= 5) {
        out += ALPHABET[(value >>> (bits - 5)) & 31];
        bits -= 5;
      }
      value &= (1 << bits) - 1;
    }
    if (bits > 0) out += ALPHABET[(value << (5 - bits)) & 31];
    return out;
  }

  function base32Decode(str) {
    str = str.replace(/=+$/, '').replace(/\s/g, '').toUpperCase();
    let bits = 0, value = 0;
    const out = [];
    for (const ch of str) {
      const i = ALPHABET.indexOf(ch);
      if (i < 0) throw new Error('Invalid base32 character');
      value = (value << 5) | i;
      bits += 5;
      if (bits >= 8) {
        out.push((value >>> (bits - 8)) & 255);
        bits -= 8;
      }
      value &= (1 << bits) - 1;
    }
    return new Uint8Array(out);
  }

  function randomSecret(bytes = 20) {
    return base32Encode(crypto.getRandomValues(new Uint8Array(bytes)));
  }

  async function hotp(secret, counter) {
    const key = await crypto.subtle.importKey(
      'raw', base32Decode(secret), { name: 'HMAC', hash: 'SHA-1' }, false, ['sign']
    );
    const buf = new ArrayBuffer(8);
    const view = new DataView(buf);
    view.setUint32(0, Math.floor(counter / 2 ** 32));
    view.setUint32(4, counter >>> 0);
    const h = new Uint8Array(await crypto.subtle.sign('HMAC', key, buf));
    const o = h[19] & 15;
    const code = ((h[o] & 0x7f) << 24) | (h[o + 1] << 16) | (h[o + 2] << 8) | h[o + 3];
    return String(code % 1000000).padStart(6, '0');
  }

  // Code for the current 30-second window
  const totp = (secret, time = Date.now()) => hotp(secret, Math.floor(time / 30000));

  // Accept the previous, current and next window (clock drift tolerance)
  async function verify(secret, token, time = Date.now()) {
    token = String(token).replace(/\s/g, '');
    if (!/^\d{6}$/.test(token)) return false;
    for (const drift of [-1, 0, 1]) {
      if ((await totp(secret, time + drift * 30000)) === token) return true;
    }
    return false;
  }

  function otpauthUri(account, issuer, secret) {
    return (
      'otpauth://totp/' + encodeURIComponent(issuer) + ':' + encodeURIComponent(account) +
      '?secret=' + secret + '&issuer=' + encodeURIComponent(issuer)
    );
  }

  const api = { randomSecret, base32Encode, base32Decode, totp, verify, otpauthUri };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.TOTP = api;
})(typeof window !== 'undefined' ? window : globalThis);
