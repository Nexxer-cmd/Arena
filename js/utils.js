const esc = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (m) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[m],
  );
const money = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");
const duration = (m) => `${Math.floor(m / 60)}h ${m % 60}m`;
const dateFull = (s) =>
  new Date(s + "T00:00:00").toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
const showDate = (d) => new Date(d + "T00:00:00");
function toast(msg, type = "info") {
  const el = document.createElement("div");
  el.className = "toast " + type;
  el.textContent = msg;
  document.querySelector("#toast-container").appendChild(el);
  setTimeout(() => el.remove(), 2800);
}
function nav(path) {
  location.hash = "#" + path;
  window.scrollTo(0, 0);
}
function parseRoute() {
  let p = location.hash.replace(/^#/, "") || "/";
  return p.split("/").filter(Boolean);
}
function dates7() {
  const a = [],
    now = new Date();
  for (let i = 0; i < 7; i++) {
    let d = new Date(now);
    d.setDate(now.getDate() + i);
    a.push(d.toISOString().slice(0, 10));
  }
  return a;
}
function seatType(screen, row) {
  if (screen.seatTypes.premium.includes(row)) return "premium";
  if (screen.seatTypes.standard.includes(row)) return "standard";
  return "economy";
}
function priceFor(type, format) {
  return (
    ({
      premium: { "2D": 350, "3D": 450, IMAX: 550 },
      standard: { "2D": 250, "3D": 320, IMAX: 420 },
      economy: { "2D": 150, "3D": 200, IMAX: 280 },
    }[type] || {})[format] || 250
  );
}
