import { jwtVerify } from "jose";

const PUBLIC_PATHS = ["/api/auth/"];

function getLoginHTML() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Sign In — HJ Construction Command Center</title>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet"/>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{min-height:100vh;background:linear-gradient(135deg,#7C3AED 0%,#A78BFA 30%,#C4B5FD 60%,#F5F3FF 100%);display:flex;align-items:center;justify-content:center;font-family:'Inter',system-ui,sans-serif;padding:20px}
.card{background:#fff;border-radius:20px;padding:40px 36px;max-width:420px;width:100%;box-shadow:0 20px 60px rgba(124,58,237,0.2)}
.title{font-size:22px;font-weight:900;color:#1E293B;margin-bottom:4px;text-align:center}
.sub{font-size:13px;color:#94A3B8;font-weight:500;text-align:center;margin-bottom:32px}
.label{font-size:12px;font-weight:600;color:#64748B;margin-bottom:6px}
.input{background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;padding:12px 16px;color:#1E293B;font-size:14px;font-family:'Inter',sans-serif;width:100%;outline:none;transition:border-color .15s}
.input:focus{border-color:#7C3AED;box-shadow:0 0 0 3px rgba(124,58,237,0.15)}
.btn{background:#7C3AED;border:none;border-radius:10px;padding:12px 20px;color:#fff;cursor:pointer;font-size:14px;font-family:'Inter',sans-serif;font-weight:700;width:100%;letter-spacing:0.02em;transition:opacity .15s}
.btn:hover{opacity:.9}
.btn:disabled{opacity:.5;cursor:not-allowed}
.error{background:#FEF2F2;border:1px solid #FECACA;border-radius:10px;padding:10px 14px;font-size:13px;color:#DC2626;font-weight:500;display:none}
.error.show{display:block}
.field{margin-bottom:14px}
.footer{text-align:center;margin-top:20px;font-size:12px;color:#94A3B8}
.pw-wrap{position:relative}
.pw-toggle{position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;color:#94A3B8;cursor:pointer;font-size:12px;font-weight:600;font-family:'Inter',sans-serif}
.lock{font-size:13px;color:#64748B;text-align:center;margin-top:12px;padding:10px;background:#F8FAFC;border-radius:10px;border:1px solid #E2E8F0}
.lock b{color:#7C3AED}
</style>
</head>
<body>
<div class="card">
<div style="text-align:center;margin-bottom:24px">
<img src="/hj-logo.png" alt="HJ" style="height:48px;margin-bottom:16px" onerror="this.style.display='none'"/>
<div class="title">Sign In</div>
<div class="sub">225 Fifth Avenue Construction Command Center</div>
</div>
<form id="loginForm" onsubmit="return handleLogin(event)">
<div class="field">
<div class="label">Email</div>
<input class="input" type="email" id="email" placeholder="you@hj.fit" required autocomplete="email"/>
</div>
<div class="field">
<div class="label">Password</div>
<div class="pw-wrap">
<input class="input" type="password" id="password" placeholder="Enter password" required autocomplete="current-password"/>
<button type="button" class="pw-toggle" onclick="togglePw()">Show</button>
</div>
</div>
<div class="error" id="error"></div>
<div class="field" style="margin-top:8px">
<button class="btn" type="submit" id="submitBtn">Sign In</button>
</div>
</form>
<div class="lock">Only <b>@hj.fit</b> emails are authorized</div>
<div style="text-align:center;margin-top:16px;font-size:13px;color:#64748B">Forgot your password? <a href="mailto:andrey@hj.fit?subject=HJ%20Command%20Center%20-%20Password%20Reset%20Request" style="color:#7C3AED;font-weight:600;text-decoration:none">Contact Admin</a></div>
<div class="footer">Access restricted to authorized team members only.</div>
</div>
<script>
function togglePw(){const p=document.getElementById('password');const b=event.target;if(p.type==='password'){p.type='text';b.textContent='Hide'}else{p.type='password';b.textContent='Show'}}
async function handleLogin(e){
e.preventDefault();
const email=document.getElementById('email').value.trim().toLowerCase();
const password=document.getElementById('password').value;
const err=document.getElementById('error');
const btn=document.getElementById('submitBtn');
err.classList.remove('show');
btn.disabled=true;btn.textContent='Signing in...';
try{
const res=await fetch('/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})});
const data=await res.json();
if(!res.ok){err.textContent=data.error||'Login failed';err.classList.add('show');btn.disabled=false;btn.textContent='Sign In';return}
window.location.reload();
}catch(ex){err.textContent='Connection error';err.classList.add('show');btn.disabled=false;btn.textContent='Sign In';}
return false;
}
</script>
</body>
</html>`;
}

export default async function middleware(request) {
  const url = new URL(request.url);

  // Allow API auth routes and static assets
  if (PUBLIC_PATHS.some(p => url.pathname.startsWith(p))) return;
  if (url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|ico|woff|woff2|ttf|map)$/)) return;

  // Check JWT cookie
  const token = request.cookies?.get("hj_token")?.value;
  if (!token) {
    return new Response(getLoginHTML(), {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  try {
    const secret = new TextEncoder().encode(process.env.AUTH_SECRET || "hj-default-secret-change-me");
    await jwtVerify(token, secret);
    return; // Valid — continue to app
  } catch {
    // Invalid/expired token — show login
    return new Response(getLoginHTML(), {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Set-Cookie": "hj_token=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0",
      },
    });
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
