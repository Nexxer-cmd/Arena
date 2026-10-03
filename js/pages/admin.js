function renderAdmin() {
  const u = current();
  if (!u || u.role !== "admin") {
    nav("/login");
    return;
  }
  window.adminTab = window.adminTab || "Movies";
  layout(
    `<main class="page"><div class="container"><div class="page-head"><h1 class="page-title">Admin Panel</h1><p class="page-sub">Manage movies, cinemas, shows, bookings, and users</p></div><div class="admin-tabs">${["Movies", "Cinemas", "Shows", "Bookings", "Users"].map((t) => `<button class="admin-tab ${window.adminTab === t ? "active" : ""}" onclick="adminTab('${t}')">${t}<span class="count">${adminCount(t)}</span></button>`).join("")}</div><div id="admin-content"></div></div></main>`,
  );
  drawAdmin();
}
function adminCount(t) {
  return t === "Movies"
    ? getLocalMovies().length
    : t === "Cinemas"
      ? getLocalCinemas().length
      : t === "Shows"
        ? getShows().length
        : t === "Bookings"
          ? get(KEY.BOOKINGS, []).length
          : get(KEY.USERS, []).length;
}
function adminTab(t) {
  window.adminTab = t;
  renderAdmin();
}
function drawAdmin() {
  const el = document.querySelector("#admin-content"),
    t = window.adminTab;
  if (t === "Movies") drawAdminMovies(el);
  if (t === "Cinemas") drawAdminCinemas(el);
  if (t === "Shows") drawAdminShows(el);
  if (t === "Bookings") drawAdminBookings(el);
  if (t === "Users") drawAdminUsers(el);
}
function drawAdminMovies(el) {
  const ms = getLocalMovies();
  el.innerHTML = `<div class="admin-head"><h3>Movies (${ms.length})</h3><button class="btn btn-primary btn-sm" onclick="showMovieForm()">Add Movie</button></div><div id="admin-movie-form"></div><div class="table-wrap"><table class="table"><thead><tr><th>Title</th><th>Genre</th><th>Language</th><th>Rating</th><th>Status</th><th>Actions</th></tr></thead><tbody>${ms.map((m) => `<tr><td>${esc(m.title)}</td><td>${m.genre.join(", ")}</td><td>${m.language}</td><td>★ ${m.rating ?? "—"}</td><td><span class="badge ${m.status === "now_showing" ? "badge-green" : "badge-yellow"}">${m.status === "now_showing" ? "Now Showing" : "Coming Soon"}</span></td><td><button class="btn btn-ghost btn-sm" onclick='editMovie(${JSON.stringify(m).replace(/'/g, "&#39;")})'>Edit</button><button class="btn btn-ghost btn-sm btn-danger" onclick="deleteMovieAdmin('${m.id}')">Delete</button></td></tr>`).join("")}</tbody></table></div>`;
}
function showMovieForm(movie = null) {
  const el = document.querySelector("#admin-movie-form");
  el.innerHTML = `<form class="admin-form" id="movie-form"><div class="admin-form-grid">
${field("title", "Title *", movie?.title || "")} ${field("director", "Director", movie?.director || "")} ${field("genre", "Genre (comma separated)", movie?.genre?.join(", ") || "")} ${field("language", "Language", movie?.language || "English", "select", ["English", "Hindi"])} ${field("duration", "Duration (minutes)", movie?.duration || "120", "number")} ${field("rating", "Rating", movie?.rating ?? "7", "number")} ${field("certification", "Certification", movie?.certification || "UA", "select", ["U", "UA", "A"])} ${field("releaseDate", "Release Date", movie?.releaseDate || "", "date")} ${field("status", "Status", movie?.status || "now_showing", "select", ["now_showing", "coming_soon"])} ${field("formats", "Formats (comma separated)", movie?.formats?.join(", ") || "2D")} ${field("cast", "Cast (comma separated)", movie?.cast?.join(", ") || "", "text", "span-2")} ${field("description", "Description *", movie?.description || "", "textarea", "span-2")} ${field("poster", "Poster URL", movie?.poster || "")} ${field("backdrop", "Backdrop URL", movie?.backdrop || "")}
</div><button class="btn btn-primary">${movie ? "Update Movie" : "Add Movie"}</button> <button type="button" class="btn btn-secondary" onclick="document.querySelector('#admin-movie-form').innerHTML=''">Cancel</button></form>`;
  document.querySelector("#movie-form").onsubmit = (e) => {
    e.preventDefault();
    const f = new FormData(e.target),
      obj = {
        title: f.get("title"),
        director: f.get("director"),
        genre: f
          .get("genre")
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean),
        language: f.get("language"),
        duration: +f.get("duration") || 120,
        rating: +f.get("rating") || 7,
        certification: f.get("certification"),
        releaseDate: f.get("releaseDate"),
        status: f.get("status"),
        formats: f
          .get("formats")
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean),
        cast: f
          .get("cast")
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean),
        description: f.get("description"),
        poster: f.get("poster"),
        backdrop: f.get("backdrop"),
      };
    let ms = getLocalMovies();
    if (movie) {
      ms = ms.map((x) => (x.id === movie.id ? { ...x, ...obj } : x));
      toast("Movie updated", "success");
    } else {
      obj.id = "m" + Date.now();
      ms.push(obj);
      toast("Movie added", "success");
    }
    set(KEY.MOVIES, ms);
    renderAdmin();
  };
}
function editMovie(m) {
  showMovieForm(m);
}
function deleteMovieAdmin(id) {
  if (!confirm("Are you sure you want to delete this movie?")) return;
  set(
    KEY.MOVIES,
    getLocalMovies().filter((m) => m.id !== id),
  );
  toast("Movie deleted", "success");
  renderAdmin();
}
function drawAdminCinemas(el) {
  const cs = getLocalCinemas();
  el.innerHTML = `<div class="admin-head"><h3>Cinemas (${cs.length})</h3><button class="btn btn-primary btn-sm" onclick="showCinemaForm()">Add Cinema</button></div><div id="cinema-form"></div><div class="table-wrap"><table class="table"><thead><tr><th>Name</th><th>Location</th><th>Screens</th><th>Facilities</th></tr></thead><tbody>${cs.map((c) => `<tr><td>${esc(c.name)}</td><td>${esc(c.location)}</td><td>${c.screens.length}</td><td>${c.facilities.slice(0, 3).join(", ")}</td></tr>`).join("")}</tbody></table></div>`;
}
function showCinemaForm() {
  document.querySelector("#cinema-form").innerHTML =
    `<form class="admin-form" id="cform"><div class="admin-form-grid">${field("name", "Name *", "")}${field("location", "Location *", "")}${field("address", "Address", "", "text", "span-2")}${field("facilities", "Facilities (comma separated)", "", "text", "span-2")}</div><button class="btn btn-primary">Add Cinema</button></form>`;
  document.querySelector("#cform").onsubmit = (e) => {
    e.preventDefault();
    let f = new FormData(e.target),
      id = "c" + Date.now();
    let c = {
      id,
      name: f.get("name"),
      location: f.get("location"),
      address: f.get("address"),
      facilities: f
        .get("facilities")
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean),
      screens: [
        {
          id: "sc" + Date.now(),
          name: "Screen 1",
          rows: 8,
          seatsPerRow: 10,
          seatTypes: {
            premium: ["A", "B"],
            standard: ["C", "D", "E", "F"],
            economy: ["G", "H"],
          },
        },
      ],
    };
    let a = getLocalCinemas();
    a.push(c);
    set(KEY.CINEMAS, a);
    toast("Cinema added", "success");
    renderAdmin();
  };
}
function drawAdminShows(el) {
  const sh = getShows(),
    ms = getLocalMovies(),
    cs = getLocalCinemas();
  el.innerHTML = `<div class="admin-head"><h3>Shows (${sh.length})</h3><button class="btn btn-primary btn-sm" onclick="showShowForm()">Create Show</button></div><div id="show-form"></div><p class="small muted" style="margin-bottom:12px">Showing latest 20 shows</p><div class="table-wrap"><table class="table"><thead><tr><th>Movie</th><th>Cinema</th><th>Date</th><th>Time</th><th>Format</th></tr></thead><tbody>${sh
    .slice(0, 20)
    .map(
      (s) =>
        `<tr><td>${esc(ms.find((m) => m.id === s.movieId)?.title || s.movieId)}</td><td>${esc(cs.find((c) => c.id === s.cinemaId)?.name || s.cinemaId)}</td><td>${s.date}</td><td>${s.time}</td><td><span class="badge">${s.format}</span></td></tr>`,
    )
    .join("")}</tbody></table></div>`;
}
function showShowForm() {
  const ms = getLocalMovies(),
    cs = getLocalCinemas();
  document.querySelector("#show-form").innerHTML =
    `<form class="admin-form" id="sform"><div class="admin-form-grid"><div class="field"><label>Movie *</label><select class="input" name="movieId">${ms.map((m) => `<option value="${m.id}">${esc(m.title)}</option>`).join("")}</select></div><div class="field"><label>Cinema *</label><select class="input" name="cinemaId">${cs.map((c) => `<option value="${c.id}">${esc(c.name)}</option>`).join("")}</select></div>${field("date", "Date *", "", "date")}${field("time", "Time *", "10:30 AM")}${field("format", "Format", "2D", "select", ["2D", "3D", "IMAX"])}${field("language", "Language", "English", "select", ["English", "Hindi"])}</div><button class="btn btn-primary">Create Show</button></form>`;
  document.querySelector("#sform").onsubmit = (e) => {
    e.preventDefault();
    let f = new FormData(e.target),
      c = cs.find((x) => x.id === f.get("cinemaId"));
    let sh = {
      _id: "sh" + Date.now(),
      movieId: f.get("movieId"),
      cinemaId: f.get("cinemaId"),
      screenId: c.screens[0].id,
      date: f.get("date"),
      time: f.get("time"),
      format: f.get("format"),
      language: f.get("language"),
      prices: {
        premium: { "2D": 350, "3D": 450, IMAX: 550 },
        standard: { "2D": 250, "3D": 320, IMAX: 420 },
        economy: { "2D": 150, "3D": 200, IMAX: 280 },
      },
    };
    let a = getShows();
    a.push(sh);
    set(KEY.SHOWS, a);
    toast("Show created", "success");
    renderAdmin();
  };
}
function drawAdminBookings(el) {
  const bs = get(KEY.BOOKINGS, []),
    ms = getLocalMovies(),
    us = get(KEY.USERS, []);
  el.innerHTML = `<div class="admin-head"><h3>Bookings (${bs.length})</h3></div>${bs.length ? `<div class="table-wrap"><table class="table"><thead><tr><th>Booking ID</th><th>User</th><th>Movie</th><th>Seats</th><th>Amount</th><th>Status</th></tr></thead><tbody>${bs.map((b) => `<tr><td>${b._id}</td><td>${esc(us.find((u) => u._id === b.userId)?.name || b.userId)}</td><td>${esc(ms.find((m) => m.id === b.movieId)?.title || b.movieId)}</td><td>${b.seats.join(", ")}</td><td>${money(b.amount)}</td><td><span class="badge badge-green">${b.status}</span></td></tr>`).join("")}</tbody></table></div>` : `<div class="empty"><h3>No bookings yet</h3></div>`}`;
}
function drawAdminUsers(el) {
  const us = get(KEY.USERS, []);
  el.innerHTML = `<div class="admin-head"><h3>Users (${us.length})</h3></div><div class="table-wrap"><table class="table"><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Created</th></tr></thead><tbody>${us.map((u) => `<tr><td>${esc(u.name)}</td><td>${esc(u.email)}</td><td><span class="badge">${u.role}</span></td><td>${u.createdAt}</td></tr>`).join("")}</tbody></table></div>`;
}
