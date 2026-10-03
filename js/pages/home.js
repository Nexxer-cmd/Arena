function renderHome() {
  const ms = getLocalMovies(),
    now = ms.filter((m) => m.status === "now_showing"),
    soon = ms.filter((m) => m.status === "coming_soon"),
    cs = getLocalCinemas().slice(0, 3),
    hero = now.filter((m) => (m.rating || 0) >= 7).slice(0, 5);
  layout(`<main class="page"><section class="hero">${hero.map((m, i) => `<div class="hero-slide ${i === 0 ? "active" : ""}" data-slide="${i}"><img src="${m.backdrop}" alt=""></div>`).join("")}
   <div class="container hero-content"><div class="hero-info" id="hero-info">${hero.length ? heroInfo(hero[0]) : ""}</div></div>
   <div class="hero-dots">${hero.map((_, i) => `<button class="dot ${i === 0 ? "active" : ""}" onclick="heroGo(${i})"></button>`).join("")}</div></section>
   <section class="section"><div class="container"><div class="section-head"><h2 class="section-title">Now Showing</h2><a class="section-link" href="#/movies?status=now_showing">View All →</a></div><div class="hscroll">${now.map((m) => movieCard(m, true)).join("")}</div></div></section>
   <section class="section"><div class="container"><div class="section-head"><h2 class="section-title">Coming Soon</h2><a class="section-link" href="#/movies?status=coming_soon">View All →</a></div><div class="hscroll">${soon.map((m) => movieCard(m, true)).join("")}</div></div></section>
   <section class="section"><div class="container"><div class="section-head"><h2 class="section-title">Popular Movies</h2><a class="section-link" href="#/movies">Browse All →</a></div><div class="grid grid-4">${now
     .slice(0, 4)
     .map((m) => movieCard(m))
     .join("")}</div></div></section>
   <section class="section"><div class="container"><div class="section-head"><h2 class="section-title">Popular Cinemas</h2><a class="section-link" href="#/cinemas">View All →</a></div><div class="grid grid-3">${cs.map(cinemaCard).join("")}</div></div></section>
   <section class="section"><div class="container"><div class="promo"><h3>Get 20% off on your first booking</h3><p>Sign up today and enjoy discounted tickets on your first movie booking.</p><a href="#/login" class="btn btn-primary">Sign Up Now</a></div></div></section>
 </main>`);
  if (hero.length) {
    window.heroIndex = 0;
    clearInterval(window.heroTimer);
    window.heroTimer = setInterval(
      () => heroGo((window.heroIndex + 1) % hero.length),
      6000,
    );
  }
}
function heroInfo(m) {
  return `<div class="chips">${m.genre.map((g) => `<span class="badge">${g}</span>`).join("")}${m.rating ? `<span class="badge badge-accent">★ ${m.rating}</span>` : ""}</div><h1 class="hero-title">${esc(m.title)}</h1><div class="hero-meta">${esc(m.language)} · ${duration(m.duration)} · ${m.certification}</div><p class="hero-desc">${esc(m.description)}</p><div class="hero-actions"><a class="btn btn-primary btn-lg" href="#/booking/${m.id}">Book Tickets</a><a class="btn btn-secondary btn-lg" href="#/movies/${m.id}">View Details</a></div>`;
}
function heroGo(i) {
  const slides = document.querySelectorAll(".hero-slide"),
    dots = document.querySelectorAll(".dot"),
    ms = getLocalMovies()
      .filter((m) => m.status === "now_showing")
      .filter((m) => (m.rating || 0) >= 7)
      .slice(0, 5);
  if (!slides.length) return;
  window.heroIndex = i;
  slides.forEach((x, n) => x.classList.toggle("active", n === i));
  dots.forEach((x, n) => x.classList.toggle("active", n === i));
  document.querySelector("#hero-info").innerHTML = heroInfo(ms[i]);
}
