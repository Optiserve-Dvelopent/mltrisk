/**
 * MT5 Lot Calculator – Application Logic
 *
 * Features:
 *  - MT5 login form (account number, password, server)
 *  - Session persistence (optional "remember me")
 *  - Lot-size calculation:
 *      Lot = (Balance × Risk%) / (StopLoss_pips × PipValue_per_lot)
 *  - Lot-type breakdown (Standard, Mini, Micro, Nano)
 */

/* ── Constants ───────────────────────────────────────────────── */
const SESSION_KEY  = 'mt5_session';
const REMEMBER_KEY = 'mt5_remember';

const CURRENCY_SYMBOLS = {
  USD: '$', EUR: '€', GBP: '£', CHF: 'Fr', JPY: '¥', AUD: 'A$', CAD: 'C$'
};

/* ── DOM References ──────────────────────────────────────────── */
const loginView   = document.getElementById('login-view');
const calcView    = document.getElementById('calc-view');

// Login form
const loginForm   = document.getElementById('login-form');
const fLogin      = document.getElementById('mt5-login');
const fPassword   = document.getElementById('mt5-password');
const fServer     = document.getElementById('mt5-server');
const fRemember   = document.getElementById('remember-me');
const togglePw    = document.getElementById('toggle-pw');

// Errors – login
const errLogin    = document.getElementById('err-login');
const errPassword = document.getElementById('err-password');
const errServer   = document.getElementById('err-server');

// Calc form
const calcForm         = document.getElementById('calc-form');
const fCurrency        = document.getElementById('account-currency');
const fBalance         = document.getElementById('account-balance');
const fRisk            = document.getElementById('risk-percent');
const riskSlider       = document.getElementById('risk-slider');
const fInstrument      = document.getElementById('instrument');
const fStopLoss        = document.getElementById('stop-loss');
const fPipValue        = document.getElementById('pip-value');
const currencyPrefix   = document.getElementById('currency-prefix');
const pipCurrencyPrefix= document.getElementById('pip-currency-prefix');
const currencyLabel    = document.getElementById('currency-label');

// Errors – calc
const errBalance  = document.getElementById('err-balance');
const errRisk     = document.getElementById('err-risk');
const errSl       = document.getElementById('err-sl');
const errPip      = document.getElementById('err-pip');

// Result
const resultPanel   = document.getElementById('result-panel');
const resLot        = document.getElementById('res-lot');
const resRiskAmount = document.getElementById('res-risk-amount');
const resUnits      = document.getElementById('res-units');
const resPipValue   = document.getElementById('res-pip-value');
const lotTableBody  = document.getElementById('lot-table-body');

// Topbar
const accountBadge = document.getElementById('account-badge');
const logoutBtn    = document.getElementById('logout-btn');

/* ── Helpers ──────────────────────────────────────────────────── */
function show(el) { el.classList.remove('hidden'); }
function hide(el) { el.classList.add('hidden'); }

function setError(inputEl, msgEl, msg) {
  msgEl.textContent = msg;
  if (msg) {
    inputEl.classList.add('error');
  } else {
    inputEl.classList.remove('error');
  }
}

function clearErrors() {
  [
    [fLogin, errLogin], [fPassword, errPassword], [fServer, errServer],
    [fBalance, errBalance], [fRisk, errRisk], [fStopLoss, errSl], [fPipValue, errPip]
  ].forEach(([inp, err]) => setError(inp, err, ''));
}

function fmt(n, decimals = 2) {
  return n.toLocaleString('de-DE', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

/* ── Session Management ──────────────────────────────────────── */
function saveSession(login, server, remember) {
  const data = { login, server };
  if (remember) {
    localStorage.setItem(SESSION_KEY,  JSON.stringify(data));
    localStorage.setItem(REMEMBER_KEY, '1');
  } else {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(REMEMBER_KEY);
  }
}

function loadSession() {
  const remember = localStorage.getItem(REMEMBER_KEY) === '1';
  const raw = remember
    ? localStorage.getItem(SESSION_KEY)
    : sessionStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(REMEMBER_KEY);
  sessionStorage.removeItem(SESSION_KEY);
}

/* ── Login ───────────────────────────────────────────────────── */
// Toggle password visibility
togglePw.addEventListener('click', () => {
  // isText reflects the state *before* the click; labels describe the *next* action
  const isText = fPassword.type === 'text';
  fPassword.type = isText ? 'password' : 'text';
  // After hiding (isText=true): next action = show → 👁 / "Passwort anzeigen"
  // After showing (isText=false): next action = hide → 🙈 / "Passwort verbergen"
  togglePw.setAttribute('aria-label', isText ? 'Passwort anzeigen' : 'Passwort verbergen');
  togglePw.textContent = isText ? '👁' : '🙈';
});

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  clearErrors();

  let valid = true;
  const loginVal    = fLogin.value.trim();
  const passwordVal = fPassword.value;
  const serverVal   = fServer.value.trim();

  if (!loginVal || isNaN(Number(loginVal)) || Number(loginVal) < 1) {
    setError(fLogin, errLogin, 'Bitte geben Sie eine gültige Kontonummer ein.');
    valid = false;
  }
  if (!passwordVal) {
    setError(fPassword, errPassword, 'Bitte geben Sie Ihr Passwort ein.');
    valid = false;
  }
  if (!serverVal) {
    setError(fServer, errServer, 'Bitte geben Sie den Server-Namen ein.');
    valid = false;
  }

  if (!valid) return;

  // Save session (credentials are stored locally only)
  saveSession(loginVal, serverVal, fRemember.checked);

  // Show calculator
  showCalculator(loginVal, serverVal);
});

function showCalculator(login, server) {
  accountBadge.textContent = `#${login} @ ${server}`;
  hide(loginView);
  show(calcView);
}

/* ── Logout ──────────────────────────────────────────────────── */
logoutBtn.addEventListener('click', () => {
  clearSession();
  clearErrors();
  loginForm.reset();
  hide(calcView);
  show(loginView);
  hide(resultPanel);
});

/* ── Currency / Prefix sync ──────────────────────────────────── */
fCurrency.addEventListener('change', () => {
  const sym = CURRENCY_SYMBOLS[fCurrency.value] || fCurrency.value;
  currencyPrefix.textContent    = sym;
  pipCurrencyPrefix.textContent = sym;
  currencyLabel.textContent     = fCurrency.value;
});

/* ── Instrument → default pip value ─────────────────────────── */
fInstrument.addEventListener('change', () => {
  const opt = fInstrument.selectedOptions[0];
  const pipUsd = parseFloat(opt.dataset.pipUsd) || 10;
  fPipValue.value = pipUsd;
});

/* ── Risk slider ↔ input sync ────────────────────────────────── */
riskSlider.addEventListener('input', () => {
  fRisk.value = riskSlider.value;
});

fRisk.addEventListener('input', () => {
  const v = parseFloat(fRisk.value);
  if (!isNaN(v) && v >= 0.1 && v <= 10) {
    riskSlider.value = v;
  }
});

/* ── Calculator ──────────────────────────────────────────────── */
calcForm.addEventListener('submit', (e) => {
  e.preventDefault();
  clearErrors();

  const balance  = parseFloat(fBalance.value);
  const riskPct  = parseFloat(fRisk.value);
  const stopLoss = parseFloat(fStopLoss.value);
  const pipVal   = parseFloat(fPipValue.value);

  let valid = true;

  if (isNaN(balance) || balance <= 0) {
    setError(fBalance, errBalance, 'Bitte geben Sie einen gültigen Kontostand ein.');
    valid = false;
  }
  if (isNaN(riskPct) || riskPct <= 0 || riskPct > 100) {
    setError(fRisk, errRisk, 'Risiko muss zwischen 0,01 % und 100 % liegen.');
    valid = false;
  }
  if (isNaN(stopLoss) || stopLoss <= 0) {
    setError(fStopLoss, errSl, 'Bitte geben Sie einen gültigen Stop-Loss ein.');
    valid = false;
  }
  if (isNaN(pipVal) || pipVal <= 0) {
    setError(fPipValue, errPip, 'Bitte geben Sie einen gültigen Pip-Wert ein.');
    valid = false;
  }

  if (!valid) return;

  const currency = fCurrency.value;
  const sym      = CURRENCY_SYMBOLS[currency] || currency + ' ';

  // ── Core formula ──────────────────────────────────────────────
  // Lot = (Balance × Risk%) / (StopLoss_pips × PipValue_per_lot)
  const riskAmount = (balance * riskPct) / 100;
  const lotSize    = riskAmount / (stopLoss * pipVal);

  // Rounded to broker-standard precision (2 decimal places = 0.01 micro lot)
  const lotRounded = Math.floor(lotSize * 100) / 100;
  const units      = Math.round(lotRounded * 100_000);
  const pipValueForTrade = lotRounded * pipVal;

  // Display results
  resLot.textContent        = fmt(lotRounded, 2);
  resRiskAmount.textContent = sym + fmt(riskAmount, 2);
  resUnits.textContent      = units.toLocaleString('de-DE');
  resPipValue.textContent   = sym + fmt(pipValueForTrade, 2);

  // Lot-type breakdown
  const rows = [
    { name: 'Standard Lot', factor: 1,     multiplier: 100_000 },
    { name: 'Mini Lot',     factor: 0.1,   multiplier: 10_000  },
    { name: 'Micro Lot',    factor: 0.01,  multiplier: 1_000   },
    { name: 'Nano Lot',     factor: 0.001, multiplier: 100     },
  ];

  lotTableBody.innerHTML = rows
    .map(r => {
      const lots     = lotSize / r.factor;
      const lotsR    = Math.floor(lots * 100) / 100;
      const unitsRow = Math.round(lotsR * r.multiplier);
      return `
        <tr>
          <td>${r.name}</td>
          <td>${fmt(lotsR, 2)}</td>
          <td>${unitsRow.toLocaleString('de-DE')}</td>
        </tr>`;
    })
    .join('');

  show(resultPanel);
  resultPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
});

// Reset clears results too
calcForm.addEventListener('reset', () => {
  hide(resultPanel);
  clearErrors();
  // Reset pip value to default for current instrument
  setTimeout(() => {
    const opt = fInstrument.selectedOptions[0];
    fPipValue.value = parseFloat(opt.dataset.pipUsd) || 10;
    riskSlider.value = '1';
  }, 0);
});

/* ── Auto-restore session on page load ───────────────────────── */
(function init() {
  const session = loadSession();
  if (session && session.login && session.server) {
    fLogin.value  = session.login;
    fServer.value = session.server;
    fRemember.checked = localStorage.getItem(REMEMBER_KEY) === '1';
  }

  // Set default pip value for the initially selected instrument
  const opt = fInstrument.selectedOptions[0];
  if (opt) fPipValue.value = parseFloat(opt.dataset.pipUsd) || 10;
}());
