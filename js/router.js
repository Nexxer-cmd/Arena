function render() {
  const p = parseRoute(),
    base = p[0] || "";
  if (base === "movies" && p[1]) return renderMovieDetail(p[1]);
  if (base === "movies") return renderMovies();
  if (base === "booking" && p[1]) return renderBooking(p[1]);
  if (base === "cinemas" && p[1]) return renderCinemaDetail(p[1]);
  if (base === "cinemas") return renderCinemas();
  if (base === "login") return renderLogin();
  if (base === "profile") return renderProfile();
  if (base === "bookings") return renderBookings();
  if (base === "offers") return renderOffers();
  if (base === "admin") return renderAdmin();
  renderHome();
}
window.addEventListener("hashchange", render);
init();
render();
