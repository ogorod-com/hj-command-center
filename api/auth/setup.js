// One-time setup utility — generates AUTH_USERS env var value
// This endpoint is intentionally public for initial setup only
// After setup, it should be disabled by setting SETUP_DISABLED=true in env vars

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  if (process.env.SETUP_DISABLED === "true") {
    return res.status(403).json({ error: "Setup is disabled. Manage users through the Access tab." });
  }

  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: "Email and password required" });
  if (!email.endsWith("@hj.fit")) return res.status(400).json({ error: "Only @hj.fit emails allowed" });
  if (password.length < 6) return res.status(400).json({ error: "Password must be at least 6 characters" });

  const salt = crypto.randomUUID();
  const data = new TextEncoder().encode(password + salt);
  const buf = await crypto.subtle.digest("SHA-256", data);
  const hash = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");

  const emailLower = email.trim().toLowerCase();
  const userEntry = {
    [emailLower]: {
      hash,
      salt,
      role: "admin",
      name: emailLower.split("@")[0],
    },
  };

  return res.status(200).json({
    ok: true,
    instructions: [
      "1. Go to Vercel Dashboard > your project > Settings > Environment Variables",
      "2. Add AUTH_SECRET with a random string (e.g., generate at randomkeygen.com)",
      "3. Add AUTH_USERS with the value below",
      "4. Redeploy the project",
    ],
    AUTH_USERS: JSON.stringify(userEntry),
    note: "After setup, add SETUP_DISABLED=true to env vars to lock this endpoint.",
  });
}
