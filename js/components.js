function layout(content) {
  const u = current();
  document.querySelector("#app").innerHTML =
    `<nav class="navbar"><div class="container nav-inner">
    <a href="#/" class="logo">Cine<span>Book</span></a>
    <div class="nav-links">
      <a href="#/movies">Movies</a><a href="#/cinemas">Cinemas</a><a href="#/offers">Offers</a>
      ${u?.role === "admin" ? '<a href="#/admin">Admin</a>' : ""}
    </div>
    <div class="nav-right">
      ${
        u
          ? `<div class="user-menu" id="user-menu"><button class="user-button" onclick="toggleMenu()">Hi, ${esc(u.name.split(" ")[0])} ▾</button>
        <div class="dropdown"><a href="#/profile">Profile</a><a href="#/bookings">My Bookings</a>${u.role === "admin" ? '<a href="#/admin">Admin Panel</a>' : ""}<button onclick="logout()">Sign Out</button></div></div>`
          : '<a class="btn btn-primary btn-sm" href="#/login">Sign In</a>'
      }
      <button class="mobile-toggle" onclick="toggleMobile()">☰</button>
    </div>
  </div></nav>${content}<footer class="footer"><div class="container footer-inner"><span>© 2026 CineBook</span><span></span></div></footer>`;
}
function toggleMenu() {
  document.querySelector("#user-menu")?.classList.toggle("open");
}
function toggleMobile() {
  document.querySelector(".nav-links")?.classList.toggle("mobile-open");
}
function movieCard(m, compact = false) {
  return `<article class="movie-card ${compact ? "compact" : ""}"><a href="#/movies/${m.id}"><div class="poster"><img src="${esc(m.poster)}" alt="${esc(m.title)}" loading="lazy"></div><div class="movie-info"><div class="movie-title">${esc(m.title)}</div><div class="movie-meta">${esc(m.language)} · ${duration(m.duration)} ${m.rating ? `· <span class="rating">★ ${m.rating}</span>` : ""}</div></div></a></article>`;
}
function cinemaCard(c) {
  return `<a href="#/cinemas/${c.id}" class="cinema-card"><h3>${esc(c.name)}</h3><div class="cinema-location">${esc(c.location)} · ${esc(c.address)}</div><div class="chips">${c.facilities
    .slice(0, 4)
    .map((x) => `<span class="badge">${esc(x)}</span>`)
    .join("")}</div></a>`;
}
function field(n, l, v, type = "text", opts) {
  let input =
    type === "textarea"
      ? `<textarea class="input" name="${n}" rows="3">${esc(v)}</textarea>`
      : type === "select"
        ? `<select class="input" name="${n}">${opts.map((o) => `<option value="${o}" ${o === v ? "selected" : ""}>${o}</option>`).join("")}</select>`
        : `<input class="input" name="${n}" type="${type}" value="${esc(v)}">`;
  return `<div class="field ${opts === "span-2" ? "span-2" : ""}">${`<label>${l}</label>`}${input}</div>`;
}
