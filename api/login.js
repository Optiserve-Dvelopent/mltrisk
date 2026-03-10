/**
 * POST /api/login
 *
 * Authenticates a user against the SQL database.
 * Expects a JSON body: { "username": "...", "password": "..." }
 * Returns 200 + { "username": "..." } on success,
 * or 4xx/5xx + { "error": "..." } on failure.
 *
 * Requires the following environment variable:
 *   DATABASE_URL  – PostgreSQL connection string (Neon / Vercel Postgres)
 */

const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcryptjs');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, password } = req.body || {};

  if (
    !username || typeof username !== 'string' ||
    !password || typeof password !== 'string'
  ) {
    return res.status(400).json({ error: 'Benutzername und Passwort sind erforderlich.' });
  }

  const normalizedUsername = username.trim().toLowerCase();

  if (normalizedUsername.length === 0 || password.length === 0) {
    return res.status(400).json({ error: 'Benutzername und Passwort dürfen nicht leer sein.' });
  }

  try {
    const sql = neon(process.env.DATABASE_URL);
    const rows = await sql`
      SELECT id, username, password_hash
      FROM users
      WHERE username = ${normalizedUsername}
      LIMIT 1
    `;

    if (rows.length === 0) {
      // Constant-time response to prevent user-enumeration via timing differences
      await bcrypt.compare(password, '$2a$12$invalidhashplaceholderXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');
      return res.status(401).json({ error: 'Ungültige Zugangsdaten.' });
    }

    const user = rows[0];
    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!isValid) {
      return res.status(401).json({ error: 'Ungültige Zugangsdaten.' });
    }

    return res.status(200).json({ username: user.username });
  } catch (err) {
    console.error('[login] DB error:', err);
    return res.status(500).json({ error: 'Interner Serverfehler. Bitte versuchen Sie es später erneut.' });
  }
};
