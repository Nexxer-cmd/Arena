function renderBookings() {
  const u = current();
  if (!u) {
    nav("/login");
    return;
  }
  const bs = get(KEY.BOOKINGS, [])
      .filter((b) => b.userId === u._id)
      .reverse(),
    ms = getLocalMovies(),
    cs = getLocalCinemas();
  layout(
    `<main class="page"><div class="container"><div class="page-head"><h1 class="page-title">My Bookings</h1><p class="page-sub">View your ticket history</p></div>${
      bs.length
        ? bs
            .map((b) => {
              let m = ms.find((x) => x.id === b.movieId),
                c = cs.find((x) => x.id === b.cinemaId);
              return `<div class="booking-card"><div class="booking-card-head"><div><h3>${esc(m?.title || b.movieId)}</h3><div class="small muted">${esc(c?.name || b.cinemaId)}</div></div><span class="badge badge-green">${b.status}</span></div><div class="booking-details"><span>🎟 ${b._id}</span><span>📅 ${dateFull(b.date)}</span><span>🕒 ${b.time}</span><span>💺 ${b.seats.join(", ")}</span><span>💰 ${money(b.amount)}</span></div></div>`;
            })
            .join("")
        : `<div class="empty"><div class="empty-icon">🎟️</div><h3>No bookings yet</h3><p>Book a movie and your tickets will appear here.</p><a class="btn btn-primary" href="#/movies" style="margin-top:18px">Browse Movies</a></div>`
    }</div></main>`,
  );
}
