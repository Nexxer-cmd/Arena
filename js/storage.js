const get = (k, f) => {
  try {
    const x = localStorage.getItem(k);
    return x ? JSON.parse(x) : f;
  } catch {
    return f;
  }
};
const set = (k, v) => localStorage.setItem(k, JSON.stringify(v));
function init() {
  if (localStorage.getItem(KEY.VERSION) !== VERSION) {
    set(KEY.MOVIES, movies);
    set(KEY.CINEMAS, cinemas);
    set(KEY.USERS, users);
    set(KEY.SHOWS, makeShows());
    set(KEY.BOOKINGS, []);
    set(KEY.SEATS, {});
    localStorage.setItem(KEY.VERSION, VERSION);
  }
  [
    KEY.MOVIES,
    KEY.CINEMAS,
    KEY.USERS,
    KEY.SHOWS,
    KEY.BOOKINGS,
    KEY.SEATS,
  ].forEach((k) => {
    if (!localStorage.getItem(k)) set(k, k === KEY.SEATS ? {} : []);
  });
}
function makeShows() {
  const out = [],
    times = ["10:30 AM", "1:30 PM", "4:30 PM", "7:30 PM", "10:30 PM"],
    today = new Date();
  let n = 1;
  for (let d = 0; d < 7; d++) {
    const date = new Date(today);
    date.setDate(today.getDate() + d);
    const ds = date.toISOString().slice(0, 10);
    getLocalMovies()
      .filter((m) => m.status === "now_showing")
      .forEach((m, mi) => {
        const c = cinemas[(mi + d) % cinemas.length],
          screen = c.screens[(mi + d) % c.screens.length];
        const count = 2 + ((mi + d) % 3);
        for (let j = 0; j < count; j++)
          out.push({
            _id: "sh" + n++,
            movieId: m.id,
            cinemaId: c.id,
            screenId: screen.id,
            date: ds,
            time: times[(j + mi) % times.length],
            format: m.formats[(j + mi) % m.formats.length],
            language: m.language,
            prices: {
              premium: { "2D": 350, "3D": 450, IMAX: 550 },
              standard: { "2D": 250, "3D": 320, IMAX: 420 },
              economy: { "2D": 150, "3D": 200, IMAX: 280 },
            },
          });
      });
  }
  return out;
}
const getLocalMovies = () => get(KEY.MOVIES, movies);
const getLocalCinemas = () => get(KEY.CINEMAS, cinemas);
const getShows = () => get(KEY.SHOWS, []);
const current = () => get(KEY.CURRENT, null);
