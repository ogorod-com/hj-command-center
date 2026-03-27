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

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const cookies = parseCookies(req.headers.cookie);
  const token = cookies.hj_token;

  if (!token) return res.status(401).json({ error: "Not authenticated" });

  try {
    const secret = new TextEncoder().encode(process.env.AUTH_SECRET || "hj-default-secret-change-me");
    const { payload } = await jwtVerify(token, secret);
    return res.status(200).json({
      ok: true,
      user: {
        email: payload.email,
        role: payload.role,
        name: payload.name,
      },
    });
  } catch {
    return res.status(401).json({ error: "Invalid or expired session" });
  }
}
