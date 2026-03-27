export default function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const isProduction = process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production";
  const cookieFlags = `Path=/; HttpOnly; SameSite=Strict; Max-Age=0${isProduction ? "; Secure" : ""}`;

  res.setHeader("Set-Cookie", `hj_token=; ${cookieFlags}`);
  return res.status(200).json({ ok: true });
}
