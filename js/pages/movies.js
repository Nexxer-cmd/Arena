function renderMovies() {
  const params = new URLSearchParams(location.hash.split("?")[1] || "");
  let search = params.get("search") || "",
    status =
      params.get("status") === "now_showing"
        ? "Now Showing"
        : params.get("status") === "coming_soon"
          ? "Coming Soon"
          : "All";
  layout(`<main class="page"><div class="container"><div class="page-head"><h1 class="page-title">Movies</h1><p class="page-sub">Browse and book tickets for movies</p></div>
 <div class="filters"><input id="movie-search" class="input" placeholder="Search by name, genre, or language..." value="${esc(search)}"><div class="filter-row" id="genre-row" style="margin-top:14px">${["All", "Sci-Fi", "Drama", "Thriller", "Action", "Musical", "Mystery", "Fantasy", "Adventure", "Horror"].map((x) => `<button class="filter-chip ${x === "All" ? "active" : ""}" data-genre="${x}">${x}</button>`).join("")}</div>
 <div class="filter-controls"><select id="language" class="input"><option>All Languages</option><option>English</option><option>Hindi</option></select><select id="format" class="input"><option>All Formats</option><option>2D</option><option>3D</option><option>IMAX</option></select><select id="status" class="input"><option>All Status</option><option ${status === "Now Showing" ? "selected" : ""}>Now Showing</option><option ${status === "Coming Soon" ? "selected" : ""}>Coming Soon</option></select><select id="sort" class="input"><option value="popularity">Sort: Popularity</option><option value="rating">Sort: Rating</option><option value="release">Sort: Release Date</option></select></div></div>
 <div id="movie-results"></div></div></main>`);
  let genre = "All";
  const run = () => {
    let a = getLocalMovies(),
      q = document.querySelector("#movie-search").value.toLowerCase(),
      lang = document.querySelector("#language").value,
      fmt = document.querySelector("#format").value,
      st = document.querySelector("#status").value,
      sort = document.querySelector("#sort").value;
    if (q)
      a = a.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.genre.some((g) => g.toLowerCase().includes(q)) ||
          m.language.toLowerCase().includes(q),
      );
    if (genre !== "All") a = a.filter((m) => m.genre.includes(genre));
    if (lang !== "All Languages") a = a.filter((m) => m.language === lang);
    if (fmt !== "All Formats") a = a.filter((m) => m.formats.includes(fmt));
    if (st !== "All Status")
      a = a.filter(
        (m) =>
          m.status === (st === "Now Showing" ? "now_showing" : "coming_soon"),
      );
    a.sort((x, y) =>
      sort === "release"
        ? new Date(y.releaseDate) - new Date(x.releaseDate)
        : (y.rating || 0) - (x.rating || 0),
    );
    document.querySelector("#movie-results").innerHTML = a.length
      ? `<div class="movie-grid">${a.map((m) => movieCard(m)).join("")}</div>`
      : `<div class="empty"><div class="empty-icon">🎬</div><h3>No movies found</h3><p>Try different filters.</p></div>`;
  };
  document.querySelectorAll("[data-genre]").forEach(
    (b) =>
      (b.onclick = () => {
        genre = b.dataset.genre;
        document
          .querySelectorAll("[data-genre]")
          .forEach((x) => x.classList.remove("active"));
        b.classList.add("active");
        run();
      }),
  );
  ["movie-search", "language", "format", "status", "sort"].forEach((id) =>
    document.querySelector("#" + id).addEventListener("input", run),
  );
  run();
}

function renderMovieDetail(id) {
  const m = getLocalMovies().find((x) => x.id === id);
  if (!m) {
    layout(
      `<main class="page"><div class="container"><div class="empty"><div class="empty-icon">🎬</div><h3>Movie not found</h3><a class="btn btn-secondary" href="#/movies">Browse Movies</a></div></div></main>`,
    );
    return;
  }
  const shows = getShows().filter((s) => s.movieId === id),
    unique = [...new Set(shows.map((s) => s.cinemaId))]
      .map((cid) => getLocalCinemas().find((c) => c.id === cid))
      .filter(Boolean);
  layout(`<main class="page"><div class="detail-backdrop"><img src="${m.backdrop}" alt=""></div><div class="container"><div class="detail-top"><div class="detail-poster"><img src="${m.poster}" alt="${esc(m.title)}"></div><div><div class="chips">${m.genre.map((g) => `<span class="badge">${g}</span>`).join("")}${m.rating ? `<span class="badge badge-accent">★ ${m.rating}</span>` : ""}</div><h1 class="detail-title">${esc(m.title)}</h1><div class="detail-meta"><span>${m.language}</span><span>·</span><span>${duration(m.duration)}</span><span>·</span><span>${m.certification}</span><span>·</span><span>${dateFull(m.releaseDate)}</span></div><p class="detail-desc">${esc(m.description)}</p><div class="chips">${m.formats.map((f) => `<span class="badge">${f}</span>`).join("")}</div><div style="margin-top:22px">${m.status === "now_showing" ? `<a class="btn btn-primary btn-lg" href="#/booking/${m.id}">Book Tickets</a>` : `<span class="badge badge-yellow">Coming Soon — ${dateFull(m.releaseDate)}</span>`}</div></div></div>
 <section class="detail-section"><h2 class="section-title">Cast & Crew</h2><div class="crew"><div class="crew-item"><span class="crew-role">Director</span><b>${esc(m.director)}</b></div>${m.cast.map((a) => `<div class="crew-item"><span class="crew-role">Cast</span><b>${esc(a)}</b></div>`).join("")}</div></section>
 ${unique.length ? `<section class="detail-section"><h2 class="section-title">Available at</h2>${unique.map((c) => `<div class="available"><div><b>${esc(c.name)}</b><div class="small muted">${esc(c.location)} · ${esc(c.address)}</div></div><a class="btn btn-secondary btn-sm" href="#/booking/${m.id}">View Shows</a></div>`).join("")}</section>` : ""}</div></main>`);
}
