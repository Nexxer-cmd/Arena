function renderOffers() {
  layout(
    `<main class="page"><div class="container" style="max-width:850px"><div class="page-head"><h1 class="page-title">Offers & Deals</h1><p class="page-sub">Save more on every booking</p></div>${offers.map((o) => `<div class="offer"><div class="offer-head"><span class="badge badge-accent">${o[4]}</span><span class="small muted">Valid till ${o[3]}</span></div><h3>${o[0]}</h3><p>${o[1]}</p><span class="offer-code">Use code: ${o[2]}</span></div>`).join("")}<p class="small muted center" style="padding:20px">Offers cannot be combined with other promotions. Terms & conditions apply.</p></div></main>`,
  );
}
