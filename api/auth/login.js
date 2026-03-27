import { SignJWT } from "jose";

const RATE_LIMIT = new Map(); // IP -> { count, resetAt }
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

async function hashPw(password, salt) {
  const data = new TextEncoder().encode(password + salt);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

function getUsers() {
  try {
    return JSON.parse(process.env.AUTH_USERS || "{}");
  } catch {
    return {};
  }
}

function checkRateLimit(ip) {
  const now = Date.now();
  const entry = RATE_LIMIT.get(ip);
  if (!entry || now > entry.resetAt) {
    RATE_LIMIT.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (entry.count >= MAX_ATTEMPTS) return false;
  entry.count++;
  return true;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  // Rate limiting
  const ip = req.headers["x-forwarded-for"]?.split(",")[0] || req.headers["x-real-ip"] || "unknown";
  if (!checkRateLimit(ip)) {
    return res.status(429).json({ error: "Too many login attempts. Please wait 15 minutes." });
  }

  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: "Email and password required" });

  const emailLower = email.trim().toLowerCase();

  // Domain restriction
  if (!emailLower.endsWith("@hj.fit")) {
    return res.status(403).json({ error: "Only @hj.fit emails are authorized" });
  }

  // Get users from env var
  const users = getUsers();
  const user = users[emailLower];

  if (!user) {
    // Constant-time-ish response to prevent email enumeration
    await new Promise(r => setTimeout(r, 200 + Math.random() * 300));
    return res.status(401).json({ error: "Invalid email or password" });
  }

  // Validate password
  const inputHash = await hashPw(password, user.salt);
  if (inputHash !== user.hash) {
    await new Promise(r => setTimeout(r, 200 + Math.random() * 300));
    return res.status(401).json({ error: "Invalid email or password" });
  }

  // Create JWT
  const secret = new TextEncoder().encode(process.env.AUTH_SECRET || "hj-default-secret-change-me");
  const token = await new SignJWT({
    email: emailLower,
    role: user.role || "member",
    name: user.name || emailLower.split("@")[0],
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);

  // Set HttpOnly secure cookie
  const isProduction = process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production";
  const cookieFlags = `Path=/; HttpOnly; SameSite=Strict; Max-Age=${7 * 24 * 3600}${isProduction ? "; Secure" : ""}`;

  res.setHeader("Set-Cookie", `hj_token=${token}; ${cookieFlags}`);
  return res.status(200).json({
    ok: true,
    user: { email: emailLower, role: user.role, name: user.name || emailLower.split("@")[0] },
  });
}
