function renderLogin() {
  layout(
    `<main class="page auth"><div class="auth-card"><h1 id="auth-title">Welcome back</h1><div class="sub" id="auth-sub">Sign in to continue booking movies</div><form id="auth-form"></form><div class="auth-switch"><span id="switch-text">Don't have an account?</span> <a id="switch-link" href="javascript:toggleAuth()">Create one</a></div></div></main>`,
  );
  window.authRegister = false;
  drawAuth();
}
function toggleAuth() {
  window.authRegister = !window.authRegister;
  drawAuth();
}
function drawAuth() {
  const r = window.authRegister;
  document.querySelector("#auth-title").textContent = r
    ? "Create account"
    : "Welcome back";
  document.querySelector("#auth-sub").textContent = r
    ? "Register to start booking movies"
    : "Sign in to continue booking movies";
  document.querySelector("#switch-text").textContent = r
    ? "Already have an account?"
    : "Don't have an account?";
  document.querySelector("#switch-link").textContent = r
    ? "Sign in"
    : "Create one";
  document.querySelector("#auth-form").innerHTML = r
    ? `<div class="field"><label>Name</label><input class="input" id="name" required></div><div class="field"><label>Email</label><input class="input" id="email" type="email" required></div><div class="field"><label>Password</label><input class="input" id="password" type="password" required></div><button class="btn btn-primary btn-full">Create Account</button>`
    : `<div class="field"><label>Email</label><input class="input" id="email" type="email" required></div><div class="field"><label>Password</label><input class="input" id="password" type="password" required></div><button class="btn btn-primary btn-full">Sign In</button>`;
  document.querySelector("#auth-form").onsubmit = authSubmit;
}
function authSubmit(e) {
  e.preventDefault();
  const email = document.querySelector("#email").value.trim(),
    pass = document.querySelector("#password").value;
  if (window.authRegister) {
    const name = document.querySelector("#name").value.trim();
    if (!name) return toast("Name is required", "warning");
    let us = get(KEY.USERS, []);
    if (us.some((u) => u.email === email))
      return toast("Email already registered", "error");
    const u = {
      _id: "u" + Date.now(),
      name,
      email,
      password: pass,
      role: "user",
      createdAt: new Date().toISOString().slice(0, 10),
    };
    us.push(u);
    set(KEY.USERS, us);
    const { password, ...safe } = u;
    set(KEY.CURRENT, safe);
    toast("Account created", "success");
    nav("/");
  } else {
    const u = get(KEY.USERS, []).find(
      (x) => x.email === email && x.password === pass,
    );
    if (!u) return toast("Invalid email or password", "error");
    const { password, ...safe } = u;
    set(KEY.CURRENT, safe);
    toast("Signed in successfully", "success");
    nav("/");
  }
}
function logout() {
  localStorage.removeItem(KEY.CURRENT);
  toast("Signed out", "success");
  nav("/");
}
function renderProfile() {
  const u = current();
  if (!u) {
    nav("/login");
    return;
  }
  layout(
    `<main class="page"><div class="container"><div class="page-head"><h1 class="page-title">Profile</h1><p class="page-sub">Manage your CineBook account</p></div><div class="profile-card"><div class="profile-row"><span class="muted">Name</span><b>${esc(u.name)}</b></div><div class="profile-row"><span class="muted">Email</span><b>${esc(u.email)}</b></div><div class="profile-row"><span class="muted">Role</span><span class="badge ${u.role === "admin" ? "badge-accent" : ""}">${u.role}</span></div><div class="profile-row"><span class="muted">Member since</span><b>${u.createdAt}</b></div><button class="btn btn-secondary" onclick="logout()" style="margin-top:18px">Sign Out</button></div></div></main>`,
  );
}
