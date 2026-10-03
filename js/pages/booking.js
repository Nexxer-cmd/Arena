let bookingState = {
  movie: null,
  date: null,
  show: null,
  seats: [],
  step: "date",
};
function renderBooking(movieId) {
  const m = getLocalMovies().find((x) => x.id === movieId);
  if (!m) {
    nav("/movies");
    return;
  }
  bookingState = {
    movie: m,
    date: dates7()[0],
    show: null,
    seats: [],
    step: "date",
  };
  drawBooking();
}
function drawBooking() {
  const b = bookingState,
    m = b.movie,
    dates = dates7(),
    shows = getShows().filter((s) => s.movieId === m.id && s.date === b.date),
    groups = {};
  shows.forEach((s) => (groups[s.cinemaId] ??= []).push(s));
  const active = (x) =>
    b.step === x ||
    ["show", "seats", "summary"].indexOf(b.step) >=
      ["date", "show", "seats", "summary"].indexOf(x);
  const steps = ["date", "show", "seats", "summary"];
  const canClick = (target) => steps.indexOf(b.step) > steps.indexOf(target);
  layout(`<main class="page"><div class="container booking-wrap"><div class="booking-crumb"><b>${esc(m.title)}</b><span class="meta">${m.language} · ${duration(m.duration)} · ${m.certification}</span></div>
 <div class="progress">${["Date", "Show", "Seats", "Summary"].map((x, i) => `<div class="step ${active(steps[i]) ? "active" : ""} ${canClick(steps[i]) ? "clickable" : ""}" ${canClick(steps[i]) ? `onclick="goToStep('${steps[i]}')"` : ""}><span class="step-num">${i + 1}</span><span class="step-label">${x}</span></div>`).join("")}</div>
 ${b.step === "date" || b.step === "show" ? bookingShowStep(dates, groups) : b.step === "seats" ? bookingSeats() : bookingSummary()}</div></main>`);
}
function bookingShowStep(dates, groups) {
  const b = bookingState;
  return `<section><h3>Select Date</h3><div class="date-selector">${dates
    .map((d) => {
      let x = showDate(d);
      return `<button class="date-item ${b.date === d ? "active" : ""}" onclick="selectBookingDate('${d}')"><div class="date-day">${x.toLocaleDateString("en-US", { weekday: "short" })}</div><div class="date-num">${x.getDate()}</div><div class="date-day">${x.toLocaleDateString("en-US", { month: "short" })}</div></button>`;
    })
    .join("")}</div>
 <h3 style="margin-bottom:14px">Select Show</h3>${
   Object.keys(groups).length
     ? Object.entries(groups)
         .map(([cid, arr]) => {
           let c = getLocalCinemas().find((x) => x.id === cid);
           return `<div class="cinema-show"><div class="show-head"><div><b>${esc(c.name)}</b><div class="small muted">${esc(c.location)}</div></div></div><div class="show-times">${arr.map((s) => `<button class="show-time" onclick="selectShow('${s._id}')">${s.time}<small>${s.format} · ${s.language}</small></button>`).join("")}</div></div>`;
         })
         .join("")
     : `<div class="empty"><div class="empty-icon">🎞️</div><h3>No shows available</h3><p>Try another date.</p></div>`
 }</section>`;
}
function selectBookingDate(d) {
  bookingState.date = d;
  bookingState.show = null;
  bookingState.seats = [];
  bookingState.step = "date";
  drawBooking();
}
function selectShow(id) {
  bookingState.show = getShows().find((s) => s._id === id);
  bookingState.seats = [];
  bookingState.step = "seats";
  drawBooking();
}
function bookingSeats() {
  const b = bookingState,
    s = b.show,
    c = getLocalCinemas().find((x) => x.id === s.cinemaId),
    screen = c.screens.find((x) => x.id === s.screenId) || c.screens[0],
    booked = get(KEY.SEATS, {})[s._id] || [];
  let html = `<div class="booking-grid"><section><h3>${esc(c.name)} · ${esc(screen.name)}</h3><p class="small muted" style="margin:5px 0 18px">${s.time} · ${s.format}</p><div class="seat-layout"><div class="screen"></div><div class="screen-label">SCREEN</div>`;
  for (let r = 0; r < screen.rows; r++) {
    let row = String.fromCharCode(65 + r),
      type = seatType(screen, row);
    html += `<div class="seat-row"><span class="row-label">${row}</span>`;
    for (let n = 1; n <= screen.seatsPerRow; n++) {
      let label = row + n,
        isBooked = booked.includes(label),
        sel = b.seats.some((x) => x.label === label);
      html += `<button class="seat ${type} ${isBooked ? "booked" : ""} ${sel ? "selected" : ""}" ${isBooked ? "disabled" : ""} onclick="toggleSeat('${label}','${type}',${priceFor(type, s.format)})">${n}</button>`;
    }
    html += `</div>`;
  }
  html += `<div class="legend"><span><i></i>Available</span><span><i class="l-selected"></i>Selected</span><span><i class="l-booked"></i>Booked</span></div><button class="btn btn-secondary" style="margin-top:18px" onclick="goToStep('date')">← Back to Shows</button></div></section>${seatSummary()}</div>`;
  return html;
}
function toggleSeat(label, type, price) {
  const i = bookingState.seats.findIndex((x) => x.label === label);
  if (i >= 0) bookingState.seats.splice(i, 1);
  else if (bookingState.seats.length >= 10) {
    toast("Maximum 10 seats per booking", "warning");
    return;
  } else bookingState.seats.push({ label, type, price });
  drawBooking();
}
function priceBreak() {
  const b = bookingState,
    t = b.seats.reduce((a, x) => a + x.price, 0),
    fee = b.seats.length * 30,
    tax = Math.round((t + fee) * 0.18);
  return { ticket: t, fee, tax, total: t + fee + tax };
}
function seatSummary() {
  const p = priceBreak();
  return `<aside class="summary"><h3>Booking Summary</h3><div class="small muted">${esc(bookingState.movie.title)}</div><div class="sum-line"><span>Date</span><b>${dateFull(bookingState.date)}</b></div><div class="sum-line"><span>Show</span><b>${bookingState.show.time}</b></div><div class="sum-line"><span>Seats</span><b>${bookingState.seats.map((x) => x.label).join(", ") || "—"}</b></div><div class="sum-line"><span>Tickets</span><span>${money(p.ticket)}</span></div><div class="sum-line"><span>Convenience</span><span>${money(p.fee)}</span></div><div class="sum-line"><span>GST (18%)</span><span>${money(p.tax)}</span></div><div class="sum-line sum-total"><span>Total</span><span>${money(p.total)}</span></div><div style="display:flex;gap:10px;margin-top:15px"><button class="btn btn-secondary" style="flex:1" onclick="goToStep('date')">← Back</button><button class="btn btn-primary" style="flex:2" ${!bookingState.seats.length ? "disabled" : ""} onclick="bookingState.step='summary';drawBooking()">Proceed</button></div></aside>`;
}
function bookingSummary() {
  const b = bookingState,
    p = priceBreak(),
    c = getLocalCinemas().find((x) => x.id === b.show.cinemaId);
  return `<div class="booking-grid"><section><div class="summary" style="position:static"><h3>Review Booking</h3><div class="sum-line"><span>Movie</span><b>${esc(b.movie.title)}</b></div><div class="sum-line"><span>Cinema</span><b>${esc(c.name)}</b></div><div class="sum-line"><span>Date</span><b>${dateFull(b.date)}</b></div><div class="sum-line"><span>Show</span><b>${b.show.time} · ${b.show.format}</b></div><div class="sum-line"><span>Seats</span><b>${b.seats.map((x) => x.label).join(", ")}</b></div><div class="sum-line"><span>Ticket total</span><span>${money(p.ticket)}</span></div><div class="sum-line"><span>Convenience fee</span><span>${money(p.fee)}</span></div><div class="sum-line"><span>GST</span><span>${money(p.tax)}</span></div><div class="sum-line sum-total"><span>Total</span><span>${money(p.total)}</span></div><div style="display:flex;gap:10px;margin-top:18px"><button class="btn btn-secondary" onclick="bookingState.step='seats';drawBooking()">Back</button><button class="btn btn-primary" onclick="confirmBooking()">Confirm Booking</button></div></div></section></div>`;
}
function confirmBooking() {
  const u = current();
  if (!u) {
    toast("Please login to book tickets", "warning");
    nav("/login");
    return;
  }
  const b = bookingState,
    p = priceBreak(),
    id = "CB" + Date.now().toString().slice(-8),
    booking = {
      _id: id,
      userId: u._id,
      movieId: b.movie.id,
      showId: b.show._id,
      cinemaId: b.show.cinemaId,
      date: b.date,
      time: b.show.time,
      format: b.show.format,
      language: b.show.language,
      seats: b.seats.map((x) => x.label),
      seatDetails: b.seats,
      amount: p.total,
      ticketTotal: p.ticket,
      convenienceFee: p.fee,
      tax: p.tax,
      bookingDate: new Date().toISOString(),
      status: "confirmed",
    };
  const bs = get(KEY.BOOKINGS, []);
  bs.push(booking);
  set(KEY.BOOKINGS, bs);
  const all = get(KEY.SEATS, {});
  all[b.show._id] = [...(all[b.show._id] || []), ...booking.seats];
  set(KEY.SEATS, all);
  b.confirmed = booking;
  b.step = "confirmed";
  renderConfirmation();
}
function renderConfirmation() {
  const b = bookingState,
    x = b.confirmed,
    c = getLocalCinemas().find((v) => v.id === x.cinemaId);
  layout(
    `<main class="page"><div class="container"><div class="confirm"><div class="check">✓</div><h1>Booking Confirmed!</h1><p class="muted" style="margin-top:6px">Your movie tickets have been booked successfully.</p><div class="ticket"><div class="ticket-row"><span>Booking ID</span><strong>${x._id}</strong></div><div class="ticket-row"><span>Movie</span><strong>${esc(b.movie.title)}</strong></div><div class="ticket-row"><span>Cinema</span><strong>${esc(c.name)}</strong></div><div class="ticket-row"><span>Date & Time</span><strong>${dateFull(x.date)} · ${x.time}</strong></div><div class="ticket-row"><span>Seats</span><strong>${x.seats.join(", ")}</strong></div><div class="ticket-row"><span>Amount</span><strong>${money(x.amount)}</strong></div></div><div style="display:flex;gap:10px;justify-content:center;margin-top:22px"><a class="btn btn-secondary" href="#/bookings">My Bookings</a><a class="btn btn-primary" href="#/">Back Home</a></div></div></div></main>`,
  );
}
function goToStep(step) {
  if (step === "date" || step === "show") {
    bookingState.show = null;
    bookingState.seats = [];
    bookingState.step = "date";
  } else if (step === "seats" && bookingState.show) {
    bookingState.seats = [];
    bookingState.step = "seats";
  } else if (step === "summary" && bookingState.seats.length) {
    bookingState.step = "summary";
  }
  drawBooking();
}
