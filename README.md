# Maneesha Reddy: Portfolio (HTML + CSS + JS)

No server, no build step, no npm. Just static files.

## Run it

Google sign-in needs a real web address, so don't double-click the file. Start a tiny local server instead:

```bash
cd portfolio-simple
python3 -m http.server 5500
```

Open http://localhost:5500

## Files

| File | What it does |
| --- | --- |
| `index.html` | Login / sign-up / MFA screens (one card, four views) |
| `portfolio.html` | The portfolio (redirects to login if you're not signed in) |
| `style.css` | All the colours and layout |
| `auth.js` | Login, sign-up, Google sign-in, MFA flow. **Your Google Client ID goes at the top** |
| `totp.js` | Makes and checks the 6-digit authenticator codes |
| `portfolio.js` | Blocks the page without a session; sign-out button |

## Turn on Google sign-in (optional, 3 minutes)

1. Go to https://console.cloud.google.com/apis/credentials and create an **OAuth client ID** (type: Web application).
2. Under **Authorized JavaScript origins** add `http://localhost:5500` (and your real site URL later).
3. Copy the Client ID into `GOOGLE_CLIENT_ID` at the top of `auth.js`.

Until you do, the Google button shows a friendly "not set up yet" message.

## Important: what this does and doesn't protect

This is a **front-end-only** login. Accounts live in the visitor's own browser (`localStorage`), so it's great for a demo or showing the flow, but it is **not real security**: anyone can open the page source, and every browser has its own separate accounts. A real login needs a server. The earlier Node.js version in this chat does that properly.
