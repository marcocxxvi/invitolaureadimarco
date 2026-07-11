/* ==========================================================================
   INVITO DI LAUREA — MARCO
   JavaScript vanilla, nessuna libreria esterna.
   ========================================================================== */

/* ---------------------------------------------------------------------- *
 * 1. CONFIGURAZIONE — modifica solo questi valori per personalizzare
 *    l'invito. Nessun'altra riga del file va toccata per i casi d'uso
 *    normali.
 * ---------------------------------------------------------------------- */
const CONFIG = {
  name: "Marco",
  dogName: "Remì",                       // nome del cane, usato nei testi
  degree: "Economia e Finanza",

  // Evento
  date: "24 Luglio 2026",             // testo libero, es. "12 settembre 2026"
  time: "20.00",
  venueName: "Tenuta Chianchizza",
  address: "Contrada Chianchizza, 504, 70043 Monopoli BA",
  mapsUrl: "https://maps.app.goo.gl/ygzPWSmG35TyGwt28",
  dressCode: "", // lascia "" per nasconderlo

  // Conferma presenza via WhatsApp.
  // Numero in formato internazionale senza "+" (es. "393331234567").
  // Se lasciato vuoto, il pulsante apre comunque WhatsApp con il testo pronto,
  // senza destinatario preimpostato.
  whatsappNumber: "+393313085954",
  whatsappMessage:
    "Ci sarò! 🎓 Non vedo l'ora di festeggiare la laurea in {degree} di {name}, il {date}.",

  // Audio del successo: true/false per abilitarlo di default
  soundEnabledByDefault: true,
};

/* ---------------------------------------------------------------------- *
 * 2. RIFERIMENTI DOM
 * ---------------------------------------------------------------------- */
const screenIntro   = document.getElementById("screenIntro");
const screenMission = document.getElementById("screenMission");
const screenReveal  = document.getElementById("screenReveal");

const startBtn      = document.getElementById("startBtn");
const stage          = document.getElementById("stage");
const treat           = document.getElementById("treat");
const dogFrame        = document.getElementById("dogFrame");
const dropTarget      = document.getElementById("dropTarget");
const missionCaption  = document.getElementById("missionCaption");

const dogImg          = document.getElementById("dogImg");
const dogFallback      = document.getElementById("dogFallback");
const treatImg          = document.getElementById("treatImg");
const treatFallback      = document.getElementById("treatFallback");

const ledgerFill    = document.getElementById("ledgerFill");
const ledgerLabel   = document.getElementById("ledgerLabel");
const ledgerBar     = document.querySelector(".ledger-bar");

const confettiLayer = document.getElementById("confettiLayer");
const celebrationFlash = document.getElementById("celebrationFlash");
const appEl           = document.getElementById("app");
const soundToggle    = document.getElementById("soundToggle");
const soundIcon       = document.getElementById("soundIcon");

const calendarBtn   = document.getElementById("calendarBtn");
const whatsappBtn   = document.getElementById("whatsappBtn");

/* ---------------------------------------------------------------------- *
 * 3. APPLICA LA CONFIGURAZIONE AL TESTO DELLA PAGINA
 * ---------------------------------------------------------------------- */
function applyConfig() {
  document.querySelectorAll("#dogNameInline, #dogNameInline2, #dogNameInline3").forEach(el => {
    el.textContent = CONFIG.dogName;
  });
  document.getElementById("degreeInline").textContent = CONFIG.degree;

  document.getElementById("detailDate").textContent = CONFIG.date;
  document.getElementById("detailTime").textContent = CONFIG.time;
  document.getElementById("detailVenue").textContent = CONFIG.venueName;
  document.getElementById("detailAddress").textContent = CONFIG.address;
  document.getElementById("detailMapsLink").href = CONFIG.mapsUrl;

  const dressRow = document.getElementById("detailDressRow");
  if (CONFIG.dressCode && CONFIG.dressCode.trim() !== "") {
    document.getElementById("detailDress").textContent = CONFIG.dressCode;
  } else {
    dressRow.style.display = "none";
  }

  // Link WhatsApp con messaggio precompilato
  const text = CONFIG.whatsappMessage
    .replace("{degree}", CONFIG.degree)
    .replace("{name}", CONFIG.name)
    .replace("{date}", CONFIG.date);
  const base = CONFIG.whatsappNumber
    ? `https://wa.me/${CONFIG.whatsappNumber}`
    : `https://wa.me/`;
  whatsappBtn.href = `${base}?text=${encodeURIComponent(text)}`;
}
applyConfig();

/* ---------------------------------------------------------------------- *
 * 4. FALLBACK IMMAGINI
 *    Se dog.jpg / treat.png non sono presenti nella cartella, mostriamo
 *    automaticamente un'illustrazione SVG al loro posto: l'invito resta
 *    perfetto anche prima che tu sostituisca i file.
 * ---------------------------------------------------------------------- */
function useFallback(imgEl, fallbackEl) {
  imgEl.style.display = "none";
  fallbackEl.style.display = "block";
}
dogImg.addEventListener("error", () => useFallback(dogImg, dogFallback));
treatImg.addEventListener("error", () => useFallback(treatImg, treatFallback));
// Se l'immagine è un placeholder vuoto (0 byte) alcuni browser non lanciano
// "error": controlliamo anche dopo il caricamento della pagina.
window.addEventListener("load", () => {
  if (!dogImg.complete || dogImg.naturalWidth === 0) useFallback(dogImg, dogFallback);
  if (!treatImg.complete || treatImg.naturalWidth === 0) useFallback(treatImg, treatFallback);
});

/* ---------------------------------------------------------------------- *
 * 5. AUDIO — un piccolo "chime" sintetizzato via Web Audio API.
 *    Nessun file audio esterno è necessario. L'audio parte solo dopo
 *    un gesto dell'utente (il drag), quindi rispetta le policy dei browser.
 * ---------------------------------------------------------------------- */
let audioCtx = null;
let soundEnabled = CONFIG.soundEnabledByDefault;
updateSoundIcon();

function getAudioCtx() {
  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) audioCtx = new AC();
  }
  return audioCtx;
}

function playSuccessChime() {
  if (!soundEnabled) return;
  const ctx = getAudioCtx();
  if (!ctx) return;
  if (ctx.state === "suspended") ctx.resume();

  const notes = [660, 880]; // due note ascendenti, discrete ed eleganti
  notes.forEach((freq, i) => {
    const t0 = ctx.currentTime + i * 0.11;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(0.14, t0 + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.22);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + 0.24);
  });
}

function updateSoundIcon() {
  soundIcon.textContent = soundEnabled ? "♪" : "𝄽";
  soundToggle.setAttribute("aria-pressed", String(soundEnabled));
  soundToggle.setAttribute("aria-label", soundEnabled ? "Disattiva audio" : "Attiva audio");
}
soundToggle.addEventListener("click", () => {
  soundEnabled = !soundEnabled;
  updateSoundIcon();
});

/* ---------------------------------------------------------------------- *
 * 6. TRANSIZIONI TRA SCHERMATE
 * ---------------------------------------------------------------------- */
function goTo(fromEl, toEl) {
  fromEl.dataset.state = "leaving";
  fromEl.setAttribute("aria-hidden", "true");
  window.setTimeout(() => {
    fromEl.dataset.state = "idle";
    fromEl.style.position = "absolute";
  }, 600);

  toEl.style.position = "relative";
  toEl.dataset.state = "active";
  toEl.setAttribute("aria-hidden", "false");
}

startBtn.addEventListener("click", () => {
  goTo(screenIntro, screenMission);
  ledgerBar.dataset.progressVisible = "true";
  setLedger(15);
  // porta il focus sul croccantino per chi naviga da tastiera
  window.setTimeout(() => treat.focus({ preventScroll: true }), 650);
});

/* ---------------------------------------------------------------------- *
 * 7. BARRA "QUOTAZIONE TESI"
 * ---------------------------------------------------------------------- */
function setLedger(percent) {
  const clamped = Math.max(0, Math.min(100, Math.round(percent)));
  ledgerFill.style.width = clamped + "%";
  ledgerLabel.textContent = clamped + "%";
}

/* ---------------------------------------------------------------------- *
 * 8. DRAG & DROP DEL CROCCANTINO
 *    Implementato con Pointer Events: unifica mouse, touch e penna,
 *    così il drag è fluido tanto su desktop quanto su smartphone.
 * ---------------------------------------------------------------------- */
let dragState = null;   // { startX, startY, originX, originY }
let missionComplete = false;

function getRelativeTarget() {
  const stageRect = stage.getBoundingClientRect();
  const dropRect = dropTarget.getBoundingClientRect();
  return {
    x: dropRect.left - stageRect.left + dropRect.width / 2,
    y: dropRect.top - stageRect.top + dropRect.height / 2,
  };
}

function treatCenterInStage() {
  const stageRect = stage.getBoundingClientRect();
  const treatRect = treat.getBoundingClientRect();
  return {
    x: treatRect.left - stageRect.left + treatRect.width / 2,
    y: treatRect.top - stageRect.top + treatRect.height / 2,
  };
}

function onPointerDown(e) {
  if (missionComplete) return;
  treat.setPointerCapture(e.pointerId);
  treat.classList.add("is-dragging");

  const treatRect = treat.getBoundingClientRect();
  const stageRect = stage.getBoundingClientRect();

  dragState = {
    pointerId: e.pointerId,
    // offset del dito rispetto all'angolo del croccantino, per un drag naturale
    grabOffsetX: e.clientX - treatRect.left,
    grabOffsetY: e.clientY - treatRect.top,
    stageRect,
    treatW: treatRect.width,
    treatH: treatRect.height,
  };

  missionCaption.textContent = "Dai, ci sei quasi";
}

function onPointerMove(e) {
  if (!dragState || missionComplete) return;

  const { stageRect, grabOffsetX, grabOffsetY, treatW, treatH } = dragState;

  // Nuova posizione libera all'interno del palco (con un piccolo margine)
  let x = e.clientX - stageRect.left - grabOffsetX;
  let y = e.clientY - stageRect.top - grabOffsetY;
  x = Math.max(-treatW * 0.3, Math.min(stageRect.width - treatW * 0.7, x));
  y = Math.max(-treatH * 0.3, Math.min(stageRect.height - treatH * 0.7, y));

  treat.style.left = x + "px";
  treat.style.bottom = "auto";
  treat.style.top = y + "px";

  // Avanzamento della barra in base alla distanza percorsa verso il cane
  const target = getRelativeTarget();
  const center = treatCenterInStage();
  const startDist = Math.hypot(target.x - stageRect.width * 0.06, target.y - stageRect.height * 0.86);
  const currentDist = Math.hypot(target.x - center.x, target.y - center.y);
  const progress = 15 + Math.max(0, Math.min(1, 1 - currentDist / startDist)) * 70;
  setLedger(progress);

  // Successo: il croccantino ha raggiunto il muso del cane
  // (soglia generosa per un drag comodo anche su schermi piccoli)
  const successThreshold = Math.max(treatW, 48);
  if (currentDist < successThreshold) {
    completeMission();
  }
}

function onPointerUp() {
  if (!dragState) return;
  treat.classList.remove("is-dragging");
  dragState = null;
  if (!missionComplete) {
    missionCaption.textContent = "Un altro po' →";
  }
}

treat.addEventListener("pointerdown", onPointerDown);
treat.addEventListener("pointermove", onPointerMove);
treat.addEventListener("pointerup", onPointerUp);
treat.addEventListener("pointercancel", onPointerUp);

// Alternativa da tastiera: Invio/Spazio lancia automaticamente il croccantino,
// così l'esperienza resta accessibile a chi non può trascinare.
treat.addEventListener("keydown", (e) => {
  if (missionComplete) return;
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    autoDeliverTreat();
  }
});

function autoDeliverTreat() {
  const target = getRelativeTarget();
  treat.style.transition = "left .5s var(--ease-spring), top .5s var(--ease-spring)";
  treat.style.left = target.x - treat.offsetWidth / 2 + "px";
  treat.style.top = target.y - treat.offsetHeight / 2 + "px";
  setLedger(90);
  window.setTimeout(completeMission, 480);
}

/* ---------------------------------------------------------------------- *
 * 9. SUCCESSO: il cane "mangia", coriandoli, suono, poi reveal
 * ---------------------------------------------------------------------- */
function completeMission() {
  if (missionComplete) return;
  missionComplete = true;

  treat.classList.add("is-locked");
  treat.style.transition = "opacity .25s ease, transform .25s ease";
  treat.style.opacity = "0";
  treat.style.transform = "scale(.4)";

  dogFrame.classList.add("is-happy");
  missionCaption.textContent = "Fatto!";
  missionCaption.dataset.success = "true";

  setLedger(100);
  playSuccessChime();
  spawnConfetti();

  // Scossa dello schermo + flash colorato: rende il momento molto più evidente
  appEl.classList.add("is-celebrating");
  celebrationFlash.classList.add("is-active");
  window.setTimeout(() => appEl.classList.remove("is-celebrating"), 520);
  window.setTimeout(() => celebrationFlash.classList.remove("is-active"), 950);

  window.setTimeout(() => {
    dogFrame.classList.remove("is-happy");
  }, 550);

  window.setTimeout(() => {
    goTo(screenMission, screenReveal);
  }, 1250);
}

/* ---------------------------------------------------------------------- *
 * 10. CORIANDOLI — piccoli elementi eleganti in oro e salvia
 * ---------------------------------------------------------------------- */
function spawnConfetti() {
  const colors = [
    "var(--purple)", "var(--pink)", "var(--orange)", "var(--yellow)", "var(--teal)",
    "var(--purple-deep)", "var(--pink-deep)", "var(--teal-deep)",
  ];

  // Il layer è ora fisso su tutto il viewport: usiamo le coordinate della
  // finestra, non più quelle relative al palco della missione.
  const originX = window.innerWidth / 2;
  const originY = window.innerHeight * 0.4;

  const count = 70; // esplosione ben visibile su tutto lo schermo
  for (let i = 0; i < count; i++) {
    const piece = document.createElement("span");
    piece.className = "confetto";

    const angle = Math.random() * Math.PI * 2;
    // distanza proporzionata allo schermo, per coprire bene anche i desktop larghi
    const spread = Math.min(window.innerWidth, window.innerHeight) * 0.55;
    const distance = spread * (0.3 + Math.random() * 0.7);
    const tx = Math.cos(angle) * distance;
    const ty = Math.sin(angle) * distance - spread * 0.25; // spinta verso l'alto

    piece.style.setProperty("--tx", tx + "px");
    piece.style.setProperty("--ty", ty + "px");
    piece.style.setProperty("--rot", (Math.random() * 720 - 360) + "deg");
    piece.style.setProperty("--dur", (1.0 + Math.random() * 0.8) + "s");
    piece.style.setProperty("--delay", (Math.random() * 0.25) + "s");
    piece.style.setProperty("--size", (7 + Math.random() * 9) + "px");
    piece.style.setProperty("--confetto-radius", Math.random() > 0.5 ? "50%" : "3px");
    piece.style.setProperty("--confetto-color", colors[i % colors.length]);
    piece.style.left = originX + "px";
    piece.style.top = originY + "px";

    confettiLayer.appendChild(piece);
    piece.addEventListener("animationend", () => piece.remove());
  }
}

/* ---------------------------------------------------------------------- *
 * 11. AGGIUNGI AL CALENDARIO (bonus) — genera un file .ics al volo,
 *     nessun servizio esterno richiesto.
 * ---------------------------------------------------------------------- */
calendarBtn.addEventListener("click", () => {
  const parsed = parseItalianDateTime(CONFIG.date, CONFIG.time);
  const dtStart = parsed ? toICSDate(parsed) : "";
  const dtEnd = parsed ? toICSDate(new Date(parsed.getTime() + 3 * 60 * 60 * 1000)) : "";

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Invito Laurea//IT",
    "BEGIN:VEVENT",
    `SUMMARY:Laurea di ${CONFIG.name} — ${CONFIG.degree}`,
    dtStart ? `DTSTART:${dtStart}` : "",
    dtEnd ? `DTEND:${dtEnd}` : "",
    `LOCATION:${CONFIG.venueName}, ${CONFIG.address}`,
    `DESCRIPTION:Missione completata. Ci vediamo lì!`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean).join("\r\n");

  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `laurea-${CONFIG.name.toLowerCase()}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
});

// Interpreta stringhe tipo "12 settembre 2026" + "11:30" in un oggetto Date.
function parseItalianDateTime(dateStr, timeStr) {
  const months = {
    gennaio: 0, febbraio: 1, marzo: 2, aprile: 3, maggio: 4, giugno: 5,
    luglio: 6, agosto: 7, settembre: 8, ottobre: 9, novembre: 10, dicembre: 11,
  };
  const match = dateStr.toLowerCase().match(/(\d{1,2})\s+([a-zà]+)\s+(\d{4})/i);
  if (!match) return null;
  const [, day, monthName, year] = match;
  const month = months[monthName];
  if (month === undefined) return null;
  const [h, m] = (timeStr || "00:00").split(":").map(Number);
  return new Date(Number(year), month, Number(day), h || 0, m || 0);
}

function toICSDate(date) {
  const pad = (n) => String(n).padStart(2, "0");
  return (
    date.getFullYear().toString() +
    pad(date.getMonth() + 1) +
    pad(date.getDate()) +
    "T" +
    pad(date.getHours()) +
    pad(date.getMinutes()) +
    "00"
  );
}
