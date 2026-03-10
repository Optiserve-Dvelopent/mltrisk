# 📈 MT5 Lot Calculator

A free, browser-based **position-size calculator** for MetaTrader 5 traders.  
Enter your account balance, risk tolerance, instrument, and stop-loss distance — get the correct lot size instantly.

---

## ✨ Features

| Feature | Details |
|---|---|
| **MT5 Login form** | Account number, password, server name with inline validation |
| **Remember me** | Credentials (account number & server only) stored in `localStorage`; password is never persisted |
| **25+ instruments** | Forex Major & Minor, Indices (US30, SPX500, NAS100, GER40, UK100), Commodities (Gold, Silver, Oil) |
| **7 account currencies** | USD, EUR, GBP, CHF, JPY, AUD, CAD |
| **Risk slider** | Interactive range slider stays in sync with the risk % input field |
| **Lot-type breakdown** | Results shown for Standard, Mini, Micro, and Nano lot sizes |
| **No backend** | Pure static HTML/CSS/JS — nothing is sent to a server |
| **Vercel-optimised** | Clean URLs, immutable asset caching, full security-header suite |

---

## 🧮 Formula

```
Lot Size = (Account Balance × Risk %) ÷ (Stop Loss in Pips × Pip Value per Lot)
```

| Lot type | Lots | Units |
|---|---|---|
| Standard Lot | 1.00 | 100 000 |
| Mini Lot | 0.10 | 10 000 |
| Micro Lot | 0.01 | 1 000 |
| Nano Lot | 0.001 | 100 |

> **Note:** Always verify the exact pip value in your MT5 terminal — it varies by broker, instrument, and account currency.

---

## 🗂 Project Structure

```
mltrisk/
├── index.html        # Single-page application (login + calculator views)
├── css/
│   └── style.css     # Dark-themed stylesheet with CSS custom properties
├── js/
│   └── app.js        # All application logic (login, session, calculation)
├── vercel.json       # Vercel deployment config (caching, security headers)
├── .vercelignore     # Files excluded from the Vercel deployment bundle
└── README.md
```

---

## 🚀 Getting Started

No build step required. Open the project directly in a browser.

### Option A — Open locally

```bash
# Clone the repository
git clone https://github.com/Optiserve-Dvelopent/mltrisk.git
cd mltrisk

# Open in your default browser
open index.html          # macOS
xdg-open index.html      # Linux
start index.html         # Windows
```

### Option B — Local dev server (recommended)

Any static file server works. Examples:

```bash
# Node.js (npx)
npx serve .

# Python 3
python3 -m http.server 8080
```

Then visit `http://localhost:8080`.

---

## ☁️ Deployment on Vercel

The repository is ready to deploy as a **static site** on [Vercel](https://vercel.com).

### One-click deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Optiserve-Dvelopent/mltrisk)

### Manual deploy

1. Push the repository to GitHub.
2. Import the project in the [Vercel dashboard](https://vercel.com/dashboard).
3. Select **"Other"** as the framework preset (no build command needed).
4. Click **Deploy**.

### What `vercel.json` configures

| Setting | Value | Effect |
|---|---|---|
| `cleanUrls` | `true` | `/index` works without `.html` extension |
| `trailingSlash` | `false` | Canonical URLs, no duplicate-content issues |
| Cache `/js/*`, `/css/*` | `max-age=31536000, immutable` | Assets cached for 1 year in browser & CDN |
| `Content-Security-Policy` | `default-src 'self'` | Blocks inline scripts and cross-origin resources |
| `X-Frame-Options` | `DENY` | Prevents clickjacking via `<iframe>` |
| `X-Content-Type-Options` | `nosniff` | Prevents MIME-type sniffing |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Limits referrer header leakage |
| `Permissions-Policy` | camera / mic / geo blocked | Minimises browser API exposure |

---

## 🔒 Privacy & Security

- **No data is ever transmitted to a server.** All calculations happen in your browser.
- The optional *"Remember me"* feature stores only the **account number** and **server name** in `localStorage`. The password is **never** saved to any storage.
- Disabling JavaScript or using a private/incognito window prevents any persistence entirely.

---

## 🛠 Tech Stack

- **HTML5** — semantic markup, `defer` script loading
- **CSS3** — CSS custom properties, CSS Grid, responsive design (no framework)
- **Vanilla JavaScript** (ES2020) — no dependencies, no bundler
- **Vercel** — global CDN, edge caching, security headers
