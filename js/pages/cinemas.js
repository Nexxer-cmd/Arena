function renderCinemas() {
  layout(
    `<main class="page"><div class="container"><div class="page-head"><h1 class="page-title">Cinemas</h1><p class="page-sub">Find cinemas and their show timings</p></div><div class="filters"><input id="cinema-search" class="input" placeholder="Search cinemas by name or location..."><div class="filter-row" id="loc-row" style="margin-top:14px">${["All", "Mumbai", "Delhi", "Bangalore"].map((x) => `<button class="filter-chip ${x === "All" ? "active" : ""}" data-loc="${x}">${x}</button>`).join("")}</div></div><div id="cinema-results" class="grid grid-3"></div></div></main>`,
  );
  let loc = "All";
  const run = () => {
    let q = document.querySelector("#cinema-search").value.toLowerCase(),
      a = getLocalCinemas().filter(
        (c) =>
          (loc === "All" || c.location === loc) &&
          (!q ||
            `${c.name} ${c.location} ${c.address}`.toLowerCase().includes(q)),
      );
    document.querySelector("#cinema-results").innerHTML = a.length
      ? a.map(cinemaCard).join("")
      : `<div class="empty" style="grid-column:1/-1"><div class="empty-icon">🏛️</div><h3>No cinemas found</h3></div>`;
  };
  document.querySelector("#cinema-search").oninput = run;
  document.querySelectorAll("[data-loc]").forEach(
    (b) =>
      (b.onclick = () => {
        loc = b.dataset.loc;
        document
          .querySelectorAll("[data-loc]")
          .forEach((x) => x.classList.remove("active"));
        b.classList.add("active");
        run();
      }),
  );
  run();
}
function renderCinemaDetail(id) {
  const c = getLocalCinemas().find((x) => x.id === id);
  if (!c) {
    nav("/cinemas");
    return;
  }
  const map = {};
  getShows()
    .filter((s) => s.cinemaId === id)
    .forEach((s) => {
      map[s.movieId] ??= [];
      map[s.movieId].push(s);
    });
  layout(
    `<main class="page"><div class="container"><div class="page-head"><h1 class="page-title">${esc(c.name)}</h1><p class="page-sub">${esc(c.location)} · ${esc(c.address)}</p></div><div class="cinema-detail-info"><div><div class="info-label">Screens</div><div class="chips">${c.screens.map((s) => `<span class="badge">${esc(s.name)}</span>`).join("")}</div></div><div><div class="info-label">Facilities</div><div class="chips">${c.facilities.map((s) => `<span class="badge">${esc(s)}</span>`).join("")}</div></div></div><section class="detail-section"><h2 class="section-title">Now Showing</h2>${
      Object.keys(map).length
        ? Object.entries(map)
            .map(([mid, shows]) => {
              let m = getLocalMovies().find((x) => x.id === mid);
              return `<div class="cinema-movie"><img src="${m.poster}" alt=""><div><a href="#/movies/${m.id}"><b>${esc(m.title)}</b></a><div class="small muted">${m.genre.join(", ")} · ${m.language} · ${m.certification}</div><div class="show-pills">${shows
                .slice(0, 6)
                .map(
                  (s) =>
                    `<a class="show-time" href="#/booking/${m.id}">${s.time}<small>${s.format}</small></a>`,
                )
                .join("")}</div></div></div>`;
            })
            .join("")
        : `<div class="empty">No movies currently showing.</div>`
    }</section></div></main>`,
  );
}
