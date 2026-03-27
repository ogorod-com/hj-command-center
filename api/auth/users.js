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

async function hashPw(password, salt) {
  const data = new TextEncoder().encode(password + salt);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

function getUsers() {
  try { return JSON.parse(process.env.AUTH_USERS || "{}"); } catch { return {}; }
}

async function updateVercelEnv(key, value) {
  const token = process.env.VERCEL_API_TOKEN;
  const projectId = process.env.VERCEL_PROJECT_ID;
  const teamId = process.env.VERCEL_TEAM_ID;
  if (!token || !projectId) throw new Error("Vercel API not configured");

  const base = "https://api.vercel.com";
  const teamQ = teamId ? `?teamId=${teamId}` : "";

  const listRes = await fetch(`${base}/v9/projects/${projectId}/env${teamQ}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const listData = await listRes.json();
  const existing = listData.envs?.find(e => e.key === key && e.target?.includes("production"));

  if (existing) {
    await fetch(`${base}/v9/projects/${projectId}/env/${existing.id}${teamQ}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ value }),
    });
  } else {
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

  const listRes = await fetch(`https://api.vercel.com/v6/deployments?projectId=${projectId}&limit=1&target=production${teamId ? `&teamId=${teamId}` : ""}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const listData = await listRes.json();
  const latestId = listData.deployments?.[0]?.uid;
  if (!latestId) return;

  await fetch(`https://api.vercel.com/v13/deployments${teamId ? `?teamId=${teamId}` : ""}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ name: "hj-command-center", deploymentId: latestId, target: "production" }),
  });
}

export default async function handler(req, res) {
  const session = await getSession(req);
  if (!session || session.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }

  if (req.method === "GET") {
    const users = getUsers();
    const userList = Object.entries(users).map(([email, data]) => ({
      email, role: data.role || "member", name: data.name || email.split("@")[0],
    }));
    return res.status(200).json({ users: userList });
  }

  if (req.method === "POST") {
    const { email, password } = req.body || {};
    if (!email) return res.status(400).json({ error: "Email required" });
    if (!email.endsWith("@hj.fit")) return res.status(400).json({ error: "Only @hj.fit emails allowed" });

    const users = getUsers();
    if (users[email]) return res.status(409).json({ error: "User already exists" });

    const tempPw = password || "HJteam2026!";
    const salt = crypto.randomUUID();
    const hash = await hashPw(tempPw, salt);
    users[email] = { hash, salt, role: "member", name: email.split("@")[0] };

    try {
      await updateVercelEnv("AUTH_USERS", JSON.stringify(users));
      await triggerRedeploy();
      return res.status(200).json({ ok: true, tempPassword: tempPw, message: "User added. Deploying (~30s)." });
    } catch (e) {
      return res.status(500).json({ error: "Failed to update. " + e.message });
    }
  }

  if (req.method === "DELETE") {
    const { email } = req.body || {};
    if (!email) return res.status(400).json({ error: "Email required" });
    if (email === session.email) return res.status(400).json({ error: "Cannot remove yourself" });

    const users = getUsers();
    if (!users[email]) return res.status(404).json({ error: "User not found" });
    delete users[email];

    try {
      await updateVercelEnv("AUTH_USERS", JSON.stringify(users));
      await triggerRedeploy();
      return res.status(200).json({ ok: true, message: "User removed. Deploying (~30s)." });
    } catch (e) {
      return res.status(500).json({ error: "Failed to update. " + e.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
