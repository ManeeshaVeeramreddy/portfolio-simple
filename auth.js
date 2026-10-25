// ============================================================
//  SETTINGS: paste your Google OAuth Client ID here (see README)
// ============================================================
const CONFIG = {
  GOOGLE_CLIENT_ID: '1038891144249-vjsp3so1pfgp6cr64pq65ur3teq7h9l3.apps.googleusercontent.com', // e.g. '1234567890-abc123.apps.googleusercontent.com'
  ISSUER: 'maneesha-portfolio',
};

(() => {
  const $ = (s) => document.querySelector(s);
  const enc = new TextEncoder();
  const b64e = (u8) => btoa(String.fromCharCode(...u8));
  const b64d = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

  // ---------- tiny "database" in the browser ----------
  const loadUsers = () => {
    try { return JSON.parse(localStorage.getItem('pf_users')) || {}; } catch { return {}; }
  };
  const saveUsers = (u) => localStorage.setItem('pf_users', JSON.stringify(u));

  // ---------- password hashing (PBKDF2 via Web Crypto) ----------
  async function hashPassword(password, saltB64) {
    const salt = saltB64 ? b64d(saltB64) : crypto.getRandomValues(new Uint8Array(16));
    const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
    const bits = await crypto.subtle.deriveBits(
      { name: 'PBKDF2', salt, iterations: 200000, hash: 'SHA-256' }, key, 256
    );
    return { salt: b64e(salt), hash: b64e(new Uint8Array(bits)) };
  }

  // ---------- screens ----------
  const msgBox = $('#msg');
  function message(text, type = 'error') {
    msgBox.textContent = text || '';
    msgBox.className = 'msg ' + type;
    msgBox.hidden = !text;
  }
  function show(view) {
    document.querySelectorAll('[data-view]').forEach((el) => (el.hidden = el.dataset.view !== view));
    message('');
    const focus = { login: '#l-user', register: '#r-user', 'mfa-setup': '#s-code', 'mfa-verify': '#v-code' }[view];
    if (focus) setTimeout(() => $(focus).focus(), 50);
  }
  document.addEventListener('click', (e) => {
    const go = e.target.closest('[data-go]');
    if (go) { e.preventDefault(); pending = null; show(go.dataset.go); }
  });

  // ---------- session ----------
  let pending = null;     // { id, user } waiting for MFA
  let setupSecret = null; // secret shown during MFA setup
  let tries = 0;

  function startSession(id, user) {
    sessionStorage.setItem('pf_session', JSON.stringify({
      id, name: user.name || user.username, picture: user.picture || '', at: Date.now(),
    }));
    location.href = 'portfolio.html';
  }
  if (sessionStorage.getItem('pf_session')) location.replace('portfolio.html');

  // After the first factor (password or Google) is OK, ask for the second factor.
  function nextStep(id, user) {
    pending = { id, user };
    tries = 0;
    if (user.mfaEnabled) return show('mfa-verify');
    beginMfaSetup();
  }

  // ---------- MFA setup ----------
  function beginMfaSetup() {
    setupSecret = TOTP.randomSecret();
    const account = pending.user.email || pending.user.username;
    const uri = TOTP.otpauthUri(account, CONFIG.ISSUER, setupSecret);
    $('#secret').textContent = setupSecret.match(/.{1,4}/g).join(' ');
    const qr = $('#qr');
    qr.replaceChildren();
    if (window.QRCode) new QRCode(qr, { text: uri, width: 180, height: 180, correctLevel: QRCode.CorrectLevel.M });
    else qr.textContent = 'QR library could not load. Use the key below.';
    show('mfa-setup');
  }

  $('#setup-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!(await TOTP.verify(setupSecret, $('#s-code').value))) {
      return message('That code is not right. Check your authenticator app and try again.');
    }
    const users = loadUsers();
    users[pending.id].mfaSecret = setupSecret;
    users[pending.id].mfaEnabled = true;
    saveUsers(users);
    startSession(pending.id, users[pending.id]);
  });

  // ---------- MFA verify (every login) ----------
  $('#verify-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (await TOTP.verify(pending.user.mfaSecret, $('#v-code').value)) {
      return startSession(pending.id, pending.user);
    }
    tries++;
    if (tries >= 5) { pending = null; show('login'); return message('Too many wrong codes. Please sign in again.'); }
    message('Wrong code. ' + (5 - tries) + ' tries left.');
    $('#v-code').select();
  });

  // ---------- create account ----------
  $('#register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = $('#r-user').value.trim();
    const password = $('#r-pass').value;
    if (!/^[A-Za-z0-9_]{3,20}$/.test(username)) return message('Username: 3-20 letters, numbers or underscores.');
    if (password.length < 8) return message('Password must be at least 8 characters.');
    const id = 'u:' + username.toLowerCase();
    const users = loadUsers();
    if (users[id]) return message('That username is already taken.');
    const { salt, hash } = await hashPassword(password);
    users[id] = { username, salt, hash, mfaEnabled: false };
    saveUsers(users);
    nextStep(id, users[id]);
  });

  // ---------- sign in ----------
  $('#login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = 'u:' + $('#l-user').value.trim().toLowerCase();
    const user = loadUsers()[id];
    const bad = () => message('Incorrect username or password.');
    if (!user || !user.hash) return bad();
    const { hash } = await hashPassword($('#l-pass').value, user.salt);
    if (hash !== user.hash) return bad();
    nextStep(id, user);
  });

  // ---------- Google OAuth (Google Identity Services) ----------
  function decodeJwt(token) {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(decodeURIComponent(escape(atob(payload))));
  }

  function onGoogle(response) {
    try {
      const p = decodeJwt(response.credential);
      const id = 'g:' + p.sub;
      const users = loadUsers();
      users[id] = { ...users[id], name: p.name, email: p.email, picture: p.picture, username: p.email };
      saveUsers(users);
      nextStep(id, users[id]);
    } catch {
      message('Google sign-in failed. Please try again.');
    }
  }

  function setupGoogle() {
    const holder = $('#google-btn');
    if (CONFIG.GOOGLE_CLIENT_ID && window.google && google.accounts) {
      google.accounts.id.initialize({ client_id: CONFIG.GOOGLE_CLIENT_ID, callback: onGoogle });
      google.accounts.id.renderButton(holder, { theme: 'outline', size: 'large', shape: 'pill', width: 300, text: 'continue_with' });
    } else {
      holder.innerHTML = '<button type="button" class="btn google-fake" id="google-fake">Continue with Google</button>';
      $('#google-fake').addEventListener('click', () =>
        message(
          CONFIG.GOOGLE_CLIENT_ID
            ? 'Google script could not load. Check your internet connection.'
            : 'Google sign-in is not set up yet. Add your Client ID in auth.js (see README).',
          'info'
        )
      );
    }
  }
  window.addEventListener('load', setupGoogle);
})();
