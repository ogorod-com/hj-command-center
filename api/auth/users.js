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
    const secret = new TextEncoder().encode(process.env.AUTH_SECRET || "hj-default-secret-change-me");
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    return null;
  }
}

function getUsers() {
  try {
    return JSON.parse(process.env.AUTH_USERS || "{}");
  } catch {
    return {};
  }
}

export default async function handler(req, res) {
  // Verify admin session
  const session = await getSession(req);
  if (!session || session.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }

  if (req.method === "GET") {
    const users = getUsers();
    const userList = Object.entries(users).map(([email, data]) => ({
      email,
      role: data.role || "member",
      name: data.name || email.split("@")[0],
    }));
    return res.status(200).json({ users: userList });
  }

  // For POST (add user) and DELETE (remove user):
  // These require updating the AUTH_USERS env var
  // Return instructions for the admin
  if (req.method === "POST") {
    const { email } = req.body || {};
    if (!email) return res.status(400).json({ error: "Email required" });
    if (!email.endsWith("@hj.fit")) return res.status(400).json({ error: "Only @hj.fit emails allowed" });

    const users = getUsers();
    if (users[email]) return res.status(409).json({ error: "User already exists" });

    // Generate a temporary password hash for the new user
    const tempPassword = "HJteam2026!";
    const salt = crypto.randomUUID();
    const data = new TextEncoder().encode(tempPassword + salt);
    const buf = await crypto.subtle.digest("SHA-256", data);
    const hash = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");

    const newUsers = { ...users, [email]: { hash, salt, role: "member", name: email.split("@")[0] } };
    const envValue = JSON.stringify(newUsers);

    return res.status(200).json({
      ok: true,
      message: "User config generated. Update AUTH_USERS env var in Vercel dashboard.",
      envValue,
      tempPassword,
      instructions: "Copy the envValue to your Vercel Dashboard > Settings > Environment Variables > AUTH_USERS, then redeploy.",
    });
  }

  if (req.method === "DELETE") {
    const { email } = req.body || {};
    if (!email) return res.status(400).json({ error: "Email required" });

    const users = getUsers();
    if (!users[email]) return res.status(404).json({ error: "User not found" });
    if (email === session.email) return res.status(400).json({ error: "Cannot remove yourself" });

    const newUsers = { ...users };
    delete newUsers[email];
    const envValue = JSON.stringify(newUsers);

    return res.status(200).json({
      ok: true,
      message: "User removed from config. Update AUTH_USERS env var.",
      envValue,
    });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
