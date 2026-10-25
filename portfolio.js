// Gatekeeper: only show the portfolio if the login page created a session.
(() => {
  let session = null;
  try { session = JSON.parse(sessionStorage.getItem('pf_session')); } catch {}
  if (!session) return location.replace('index.html');

  document.body.classList.remove('locked');
  document.getElementById('year').textContent = new Date().getFullYear();
  document.getElementById('who-name').textContent = session.name;

  if (session.picture) {
    const pic = document.getElementById('who-pic');
    pic.src = session.picture;
    pic.referrerPolicy = 'no-referrer';
    pic.hidden = false;
  }

  document.getElementById('photo-img').addEventListener('error', () => {
    document.getElementById('photo').textContent = 'MR';
  });

  document.getElementById('logout').addEventListener('click', () => {
    sessionStorage.removeItem('pf_session');
    location.href = 'index.html';
  });
})();
