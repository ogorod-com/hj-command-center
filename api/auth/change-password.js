import { jwtVerify } from "jose";

function parseCookies(cookieHeader) {
  const cookies = {};
  if (!cookieHeader) return cookies;
  cookieHeader.split(";").forEach(c => {
    const [k, ...v] = c.trim().split("=");
    if (k) cookies[k] = v.join("=");
  });
  return cookies;
}

async function hashPw(password, salt) {
  const data = new TextEncoder().encode(password + salt);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

async function getSession(req) {
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies.hj_token;
  if (!token) return null;
  try {
    const secret = new TextEncoder().encode(process.env.AUTH_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch { return null; }
}

async function updateVercelEnv(key, value) {
  const token = process.env.VERCEL_API_TOKEN;
  const projectId = process.env.VERCEL_PROJECT_ID;
  const teamId = process.env.VERCEL_TEAM_ID;
  if (!token || !projectId) throw new Error("Vercel API not configured");

  const base = "https://api.vercel.com";
  const teamQ = teamId ? `?teamId=${teamId}` : "";

  // Get existing env var ID
  const listRes = await fetch(`${base}/v9/projects/${projectId}/env${teamQ}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const listData = await listRes.json();
  const existing = listData.envs?.find(e => e.key === key && e.target?.includes("production"));

  if (existing) {
    // Update existing
    await fetch(`${base}/v9/projects/${projectId}/env/${existing.id}${teamQ}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ value }),
    });
  } else {
    // Create new
    await fetch(`${base}/v10/projects/${projectId}/env${teamQ}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ key, value, type: "encrypted", target: ["production"] }),
    });
  }
}

async function triggerRedeploy() {
  const token = process.env.VERCEL_API_TOKEN;
  const projectId = process.env.VERCEL_PROJECT_ID;
  const teamId = process.env.VERCEL_TEAM_ID;
  if (!token || !projectId) return;

  const teamQ = teamId ? `?teamId=${teamId}` : "";

  // Get latest deployment
  const listRes = await fetch(`https://api.vercel.com/v6/deployments?projectId=${projectId}&limit=1&target=production${teamId ? `&teamId=${teamId}` : ""}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const listData = await listRes.json();
  const latestId = listData.deployments?.[0]?.uid;
  if (!latestId) return;

  // Redeploy
  await fetch(`https://api.vercel.com/v13/deployments${teamQ}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ name: "hj-command-center", deploymentId: latestId, target: "production" }),
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const session = await getSession(req);
  if (!session) return res.status(401).json({ error: "Not authenticated" });

  const { currentPassword, newPassword, targetEmail } = req.body || {};

  // Admin resetting another user's password
  if (targetEmail && session.role === "admin" && targetEmail !== session.email) {
    if (!newPassword || newPassword.length < 6) return res.status(400).json({ error: "New password must be at least 6 characters" });
    if (!targetEmail.endsWith("@hj.fit")) return res.status(400).json({ error: "Only @hj.fit emails" });

    const users = JSON.parse(process.env.AUTH_USERS || "{}");
    if (!users[targetEmail]) return res.status(404).json({ error: "User not found" });

    const salt = crypto.randomUUID();
    const hash = await hashPw(newPassword, salt);
    users[targetEmail] = { ...users[targetEmail], hash, salt };

    try {
      await updateVercelEnv("AUTH_USERS", JSON.stringify(users));
      await triggerRedeploy();
      return res.status(200).json({ ok: true, message: "Password reset. New deployment rolling out (~30s)." });
    } catch (e) {
      return res.status(500).json({ error: "Failed to update. Check Vercel API config." });
    }
  }

  // User changing their own password
  if (!currentPassword || !newPassword) return res.status(400).json({ error: "Current and new password required" });
  if (newPassword.length < 6) return res.status(400).json({ error: "New password must be at least 6 characters" });
  if (currentPassword === newPassword) return res.status(400).json({ error: "New password must be different" });

  const users = JSON.parse(process.env.AUTH_USERS || "{}");
  const user = users[session.email];
  if (!user) return res.status(404).json({ error: "User not found" });

  // Verify current password
  const currentHash = await hashPw(currentPassword, user.salt);
  if (currentHash !== user.hash) return res.status(401).json({ error: "Current password is incorrect" });

  // Generate new hash
  const newSalt = crypto.randomUUID();
  const newHash = await hashPw(newPassword, newSalt);
  users[session.email] = { ...user, hash: newHash, salt: newSalt };

  try {
    await updateVercelEnv("AUTH_USERS", JSON.stringify(users));
    await triggerRedeploy();
    return res.status(200).json({ ok: true, message: "Password changed. New deployment rolling out (~30s). Your current session remains active." });
  } catch (e) {
    return res.status(500).json({ error: "Failed to update. Check Vercel API config." });
  }
}
