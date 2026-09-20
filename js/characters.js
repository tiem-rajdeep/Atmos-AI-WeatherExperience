// ============================================================
//  Atmos — Weather Character System
//  GSAP-powered subtle animated characters per weather state
// ============================================================

// Character definitions per weather state
const CHARACTERS = {
  rain: {
    emoji: null,
    svg: getFrogSVG(),
    name: "frog",
    baseClass: "char-frog",
  },
  storm: {
    emoji: null,
    svg: getStormCreatureSVG(),
    name: "storm-creature",
    baseClass: "char-storm",
  },
  snow: {
    emoji: null,
    svg: getPenguinSVG(),
    name: "penguin",
    baseClass: "char-penguin",
  },
  windy: {
    emoji: null,
    svg: null,
    name: "leaves",
    baseClass: "char-leaves",
  },
  clear: {
    emoji: null,
    svg: getButterflySVG(),
    name: "butterfly",
    baseClass: "char-butterfly",
  },
  "night-clear": {
    emoji: null,
    svg: getOwlSVG(),
    name: "owl",
    baseClass: "char-owl",
  },
  cloudy: {
    emoji: null,
    svg: getCloudBirdSVG(),
    name: "bird",
    baseClass: "char-bird",
  },
  "night-cloudy": {
    emoji: null,
    svg: getOwlSVG(),
    name: "owl",
    baseClass: "char-owl",
  },
};

let currentCharacterTimeline = null;
let leafTimelines = [];

/**
 * Activate character for the given weather state
 * @param {string} weatherState
 */
function activateCharacter(weatherState) {
  clearCharacter();

  const charLayer = document.getElementById("character-layer");
  if (!charLayer) return;

  charLayer.innerHTML = "";

  if (weatherState === "windy") {
    spawnLeaves(charLayer);
    return;
  }

  const charDef = CHARACTERS[weatherState] || CHARACTERS["clear"];
  if (!charDef.svg) return;

  const wrapper = document.createElement("div");
  wrapper.className = `character-wrapper ${charDef.baseClass}`;
  wrapper.innerHTML = charDef.svg;
  charLayer.appendChild(wrapper);

  // Slight delay before animating
  setTimeout(() => {
    animateCharacter(weatherState, wrapper);
  }, 1000);
}

/**
 * Clear the current character and kill its animation timeline
 */
function clearCharacter() {
  if (currentCharacterTimeline) {
    currentCharacterTimeline.kill();
    currentCharacterTimeline = null;
  }
  leafTimelines.forEach((tl) => tl.kill());
  leafTimelines = [];

  const charLayer = document.getElementById("character-layer");
  if (charLayer) charLayer.innerHTML = "";
}

/**
 * Start the appropriate GSAP animation for the given state
 */
function animateCharacter(state, wrapper) {
  if (typeof gsap === "undefined") return;

  switch (state) {
    case "rain":
      animateFrog(wrapper);
      break;
    case "snow":
      animatePenguin(wrapper);
      break;
    case "clear":
      animateButterfly(wrapper);
      break;
    case "night-clear":
    case "night-cloudy":
      animateOwl(wrapper);
      break;
    case "storm":
      animateStormCreature(wrapper);
      break;
    case "cloudy":
      animateBird(wrapper);
      break;
  }
}

// ── Individual character animations ──────────────────────────

function animateFrog(el) {
  // Starts small/hidden, idle blink, then periodic jump
  gsap.set(el, { opacity: 0, y: 20 });
  gsap.to(el, { opacity: 0.85, y: 0, duration: 1.2, ease: "power2.out" });

  const tl = gsap.timeline({ repeat: -1, repeatDelay: 12 });
  tl.to(el, { y: -30, duration: 0.25, ease: "power2.out" })
    .to(el, { y: 0, duration: 0.3, ease: "bounce.out" })
    .to(el, { x: 20, duration: 0.2, ease: "power1.out" }, "-=0.1")
    .to(el, { y: -20, duration: 0.2, ease: "power2.out" }, "+=0.5")
    .to(el, { y: 0, x: 0, duration: 0.25, ease: "bounce.out" });

  currentCharacterTimeline = tl;
}

function animatePenguin(el) {
  gsap.set(el, { opacity: 0 });
  gsap.to(el, { opacity: 0.9, duration: 1.5, ease: "power1.out" });

  const tl = gsap.timeline({ repeat: -1, repeatDelay: 8 });
  // Waddle: slight left-right rotation + horizontal drift
  tl.to(el, { rotation: -8, x: -10, duration: 0.4, ease: "sine.inOut" })
    .to(el, { rotation: 8, x: 10, duration: 0.4, ease: "sine.inOut" })
    .to(el, { rotation: -6, x: -8, duration: 0.4, ease: "sine.inOut" })
    .to(el, { rotation: 0, x: 0, duration: 0.4, ease: "sine.inOut" });

  currentCharacterTimeline = tl;
}

function animateButterfly(el) {
  // Position off-screen left to begin the flight
  const vw = window.innerWidth;

  gsap.set(el, { opacity: 0, x: -100, y: 0 });

  // Wing-beat: continuous subtle scaleX oscillation (simulates flapping)
  gsap.to(el, {
    scaleX: 0.82,
    duration: 0.22,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut",
  });

  // Main flight timeline: enter from left, drift across with sine vertical path, exit right
  const flight = gsap.timeline({ repeat: -1, delay: 1.5 });

  flight
    // Fade in and begin drift from left
    .to(el, { opacity: 0.78, x: vw * 0.15, y: -30, duration: 3, ease: "sine.inOut" })
    // Rise and drift centre-left
    .to(el, { x: vw * 0.35, y: -80, duration: 3.5, ease: "sine.inOut" })
    // Dip slightly and cross centre
    .to(el, { x: vw * 0.55, y: -40, duration: 3, ease: "sine.inOut" })
    // Rise again toward right side
    .to(el, { x: vw * 0.75, y: -100, duration: 3, ease: "sine.inOut" })
    // Exit off-screen right, fading out
    .to(el, { x: vw + 120, y: -60, opacity: 0, duration: 2.5, ease: "sine.in" })
    // Instantly reset to left for next loop (invisible)
    .set(el, { x: -100, y: 0, opacity: 0 });

  currentCharacterTimeline = flight;
}

function animateOwl(el) {
  gsap.set(el, { opacity: 0 });
  gsap.to(el, { opacity: 0.8, duration: 2, ease: "power1.out" });

  const tl = gsap.timeline({ repeat: -1, repeatDelay: 18 });
  // Blink: scale eyes (represented by brief scale dip on whole svg)
  tl.to(el, { scaleY: 0.96, duration: 0.08, ease: "none" })
    .to(el, { scaleY: 1, duration: 0.08, ease: "none" })
    .to(el, { scaleY: 0.96, duration: 0.08, ease: "none", delay: 0.15 })
    .to(el, { scaleY: 1, duration: 0.08, ease: "none" })
    // Slight head tilt
    .to(el, { rotation: 12, duration: 0.8, ease: "sine.inOut", delay: 3 })
    .to(el, { rotation: 0, duration: 0.8, ease: "sine.inOut" });

  currentCharacterTimeline = tl;
}

function animateStormCreature(el) {
  gsap.set(el, { opacity: 0 });
  gsap.to(el, { opacity: 0.7, duration: 1, ease: "power2.out" });

  const tl = gsap.timeline({ repeat: -1, repeatDelay: 5 });
  // Flicker on lightning
  tl.to(el, { opacity: 0, duration: 0.05 })
    .to(el, { opacity: 0.9, duration: 0.05 })
    .to(el, { opacity: 0.3, duration: 0.05 })
    .to(el, { opacity: 0.7, duration: 0.1 })
    .to(el, { x: 5, duration: 0.1, ease: "rough({ strength: 3, points: 5 })" })
    .to(el, { x: 0, duration: 0.1 });

  currentCharacterTimeline = tl;
}

function animateBird(el) {
  gsap.set(el, { opacity: 0, x: -120 });
  // Fly across screen slowly
  const tl = gsap.timeline({ repeat: -1, repeatDelay: 20 });
  tl.to(el, { opacity: 0.6, duration: 1, ease: "power1.out" })
    .to(el, { x: window.innerWidth + 100, duration: 10, ease: "none" })
    .set(el, { x: -120, opacity: 0 });

  currentCharacterTimeline = tl;
}

// ── Leaf system (windy state) ──────────────────────────────

function spawnLeaves(container) {
  const leafCount = 8;
  for (let i = 0; i < leafCount; i++) {
    const leaf = document.createElement("div");
    leaf.className = "leaf";
    leaf.innerHTML = ["🍃", "🍂", "🍁"][i % 3];
    container.appendChild(leaf);

    const tl = gsap.timeline({ repeat: -1, delay: i * 1.2 });
    const startY = Math.random() * 60 + 10; // 10–70% vh
    const size = Math.random() * 20 + 14; // 14–34px
    const duration = Math.random() * 4 + 6; // 6–10s

    gsap.set(leaf, {
      position: "absolute",
      left: -40,
      top: `${startY}vh`,
      fontSize: `${size}px`,
      opacity: 0,
    });

    tl.to(leaf, { opacity: 0.8, duration: 0.5 })
      .to(leaf, {
        x: window.innerWidth + 100,
        y: Math.random() * 200 - 100,
        rotation: Math.random() * 720 - 360,
        duration: duration,
        ease: "none",
      })
      .set(leaf, { x: 0, opacity: 0, top: `${Math.random() * 60 + 10}vh` });

    leafTimelines.push(tl);
  }
}

// ── SVG Character Definitions ──────────────────────────────

function getFrogSVG() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60" width="60" height="60">
    <!-- Body -->
    <ellipse cx="30" cy="36" rx="18" ry="14" fill="#4ade80" opacity="0.9"/>
    <!-- Head -->
    <ellipse cx="30" cy="22" rx="15" ry="12" fill="#4ade80" opacity="0.9"/>
    <!-- Eye bumps -->
    <ellipse cx="22" cy="15" rx="6" ry="5" fill="#22c55e"/>
    <ellipse cx="38" cy="15" rx="6" ry="5" fill="#22c55e"/>
    <!-- Eyes -->
    <circle cx="22" cy="15" r="4" fill="white"/>
    <circle cx="38" cy="15" r="4" fill="white"/>
    <circle cx="23" cy="15" r="2" fill="#1a1a2e"/>
    <circle cx="39" cy="15" r="2" fill="#1a1a2e"/>
    <!-- Eye shine -->
    <circle cx="24" cy="14" r="0.8" fill="white"/>
    <circle cx="40" cy="14" r="0.8" fill="white"/>
    <!-- Smile -->
    <path d="M 22 28 Q 30 33 38 28" stroke="#16a34a" stroke-width="1.5" fill="none" stroke-linecap="round"/>
    <!-- Legs -->
    <ellipse cx="16" cy="46" rx="8" ry="5" fill="#22c55e" transform="rotate(-20, 16, 46)"/>
    <ellipse cx="44" cy="46" rx="8" ry="5" fill="#22c55e" transform="rotate(20, 44, 46)"/>
    <!-- Toes -->
    <circle cx="9" cy="50" r="2.5" fill="#22c55e"/>
    <circle cx="13" cy="52" r="2.5" fill="#22c55e"/>
    <circle cx="17" cy="52" r="2.5" fill="#22c55e"/>
    <circle cx="51" cy="50" r="2.5" fill="#22c55e"/>
    <circle cx="47" cy="52" r="2.5" fill="#22c55e"/>
    <circle cx="43" cy="52" r="2.5" fill="#22c55e"/>
  </svg>`;
}

function getPenguinSVG() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 70" width="55" height="70">
    <!-- Body -->
    <ellipse cx="30" cy="45" rx="18" ry="22" fill="#1e293b"/>
    <!-- White belly -->
    <ellipse cx="30" cy="48" rx="11" ry="16" fill="#f1f5f9"/>
    <!-- Head -->
    <circle cx="30" cy="22" r="14" fill="#1e293b"/>
    <!-- Face white -->
    <ellipse cx="30" cy="25" rx="9" ry="8" fill="#f1f5f9"/>
    <!-- Eyes -->
    <circle cx="26" cy="20" r="4" fill="white"/>
    <circle cx="34" cy="20" r="4" fill="white"/>
    <circle cx="27" cy="20" r="2" fill="#1a1a2e"/>
    <circle cx="35" cy="20" r="2" fill="#1a1a2e"/>
    <circle cx="27.5" cy="19.2" r="0.7" fill="white"/>
    <circle cx="35.5" cy="19.2" r="0.7" fill="white"/>
    <!-- Beak -->
    <ellipse cx="30" cy="28" rx="4" ry="2.5" fill="#f59e0b"/>
    <!-- Wings -->
    <ellipse cx="12" cy="45" rx="6" ry="14" fill="#0f172a" transform="rotate(-10, 12, 45)"/>
    <ellipse cx="48" cy="45" rx="6" ry="14" fill="#0f172a" transform="rotate(10, 48, 45)"/>
    <!-- Feet -->
    <ellipse cx="23" cy="65" rx="8" ry="4" fill="#f59e0b"/>
    <ellipse cx="37" cy="65" rx="8" ry="4" fill="#f59e0b"/>
    <!-- Scarf -->
    <rect x="18" y="33" width="24" height="6" rx="3" fill="#ef4444" opacity="0.85"/>
    <rect x="22" y="33" width="4" height="10" rx="2" fill="#ef4444" opacity="0.85"/>
  </svg>`;
}

function getButterflySVG() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 60" width="70" height="55">
    <!-- Left upper wing -->
    <ellipse cx="25" cy="22" rx="22" ry="18" fill="#fb923c" opacity="0.85" transform="rotate(-20, 25, 22)"/>
    <!-- Left lower wing -->
    <ellipse cx="20" cy="40" rx="15" ry="12" fill="#fdba74" opacity="0.8" transform="rotate(15, 20, 40)"/>
    <!-- Right upper wing -->
    <ellipse cx="55" cy="22" rx="22" ry="18" fill="#fb923c" opacity="0.85" transform="rotate(20, 55, 22)"/>
    <!-- Right lower wing -->
    <ellipse cx="60" cy="40" rx="15" ry="12" fill="#fdba74" opacity="0.8" transform="rotate(-15, 60, 40)"/>
    <!-- Wing spots -->
    <circle cx="25" cy="20" r="5" fill="#7c2d12" opacity="0.4"/>
    <circle cx="55" cy="20" r="5" fill="#7c2d12" opacity="0.4"/>
    <!-- Body -->
    <ellipse cx="40" cy="30" rx="3" ry="16" fill="#292524"/>
    <!-- Head -->
    <circle cx="40" cy="14" r="4" fill="#292524"/>
    <!-- Antennae -->
    <line x1="40" y1="11" x2="33" y2="4" stroke="#292524" stroke-width="1.2"/>
    <circle cx="33" cy="4" r="1.5" fill="#292524"/>
    <line x1="40" y1="11" x2="47" y2="4" stroke="#292524" stroke-width="1.2"/>
    <circle cx="47" cy="4" r="1.5" fill="#292524"/>
  </svg>`;
}

function getOwlSVG() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 70" width="55" height="65">
    <!-- Body -->
    <ellipse cx="30" cy="45" rx="18" ry="22" fill="#78350f"/>
    <!-- Belly -->
    <ellipse cx="30" cy="50" rx="11" ry="15" fill="#d97706" opacity="0.6"/>
    <!-- Head -->
    <circle cx="30" cy="22" r="16" fill="#92400e"/>
    <!-- Ear tufts -->
    <polygon points="20,10 16,2 24,8" fill="#78350f"/>
    <polygon points="40,10 44,2 36,8" fill="#78350f"/>
    <!-- Face disk -->
    <ellipse cx="30" cy="24" rx="13" ry="11" fill="#fde68a" opacity="0.5"/>
    <!-- Eyes -->
    <circle cx="24" cy="20" r="6" fill="#fef3c7"/>
    <circle cx="36" cy="20" r="6" fill="#fef3c7"/>
    <circle cx="24" cy="20" r="3.5" fill="#1c1917"/>
    <circle cx="36" cy="20" r="3.5" fill="#1c1917"/>
    <!-- Iris glow -->
    <circle cx="24" cy="20" r="2" fill="#f59e0b"/>
    <circle cx="36" cy="20" r="2" fill="#f59e0b"/>
    <circle cx="24.8" cy="19" r="0.8" fill="white"/>
    <circle cx="36.8" cy="19" r="0.8" fill="white"/>
    <!-- Beak -->
    <polygon points="28,27 32,27 30,32" fill="#d97706"/>
    <!-- Wings -->
    <ellipse cx="12" cy="46" rx="6" ry="16" fill="#78350f" transform="rotate(-8, 12, 46)"/>
    <ellipse cx="48" cy="46" rx="6" ry="16" fill="#78350f" transform="rotate(8, 48, 46)"/>
    <!-- Feet / branch grip -->
    <line x1="25" y1="65" x2="20" y2="70" stroke="#92400e" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="25" y1="65" x2="25" y2="70" stroke="#92400e" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="25" y1="65" x2="30" y2="70" stroke="#92400e" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="35" y1="65" x2="30" y2="70" stroke="#92400e" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="35" y1="65" x2="35" y2="70" stroke="#92400e" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="35" y1="65" x2="40" y2="70" stroke="#92400e" stroke-width="2.5" stroke-linecap="round"/>
  </svg>`;
}

function getStormCreatureSVG() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60" width="52" height="52">
    <!-- Body -->
    <ellipse cx="30" cy="36" rx="15" ry="18" fill="#4c1d95" opacity="0.9"/>
    <!-- Head -->
    <circle cx="30" cy="20" r="13" fill="#5b21b6" opacity="0.9"/>
    <!-- Glowing eyes -->
    <circle cx="24" cy="18" r="5" fill="#a78bfa"/>
    <circle cx="36" cy="18" r="5" fill="#a78bfa"/>
    <circle cx="24" cy="18" r="3" fill="white"/>
    <circle cx="36" cy="18" r="3" fill="white"/>
    <circle cx="24" cy="18" r="1.5" fill="#7c3aed"/>
    <circle cx="36" cy="18" r="1.5" fill="#7c3aed"/>
    <!-- Electric sparks -->
    <path d="M 10 20 L 16 25 L 12 28 L 20 32" stroke="#facc15" stroke-width="1.5" fill="none" stroke-linecap="round"/>
    <path d="M 50 20 L 44 25 L 48 28 L 40 32" stroke="#facc15" stroke-width="1.5" fill="none" stroke-linecap="round"/>
    <!-- Horns/spikes -->
    <polygon points="20,10 17,2 23,8" fill="#7c3aed"/>
    <polygon points="30,8 28,0 32,0 34,8" fill="#7c3aed"/>
    <polygon points="40,10 37,8 43,2" fill="#7c3aed"/>
    <!-- Small mouth -->
    <path d="M 25 26 Q 30 30 35 26" stroke="#c4b5fd" stroke-width="1.5" fill="none" stroke-linecap="round"/>
    <!-- Claws -->
    <path d="M 18 50 L 14 58 M 22 52 L 20 60 M 26 53 L 24 61" stroke="#5b21b6" stroke-width="2" stroke-linecap="round"/>
    <path d="M 42 50 L 46 58 M 38 52 L 40 60 M 34 53 L 36 61" stroke="#5b21b6" stroke-width="2" stroke-linecap="round"/>
  </svg>`;
}

function getCloudBirdSVG() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 40" width="70" height="38">
    <!-- Bird silhouette flying -->
    <path d="M 10 20 Q 20 10 30 18 Q 40 10 50 20" stroke="#94a3b8" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <circle cx="10" cy="20" r="2.5" fill="#94a3b8"/>
    <!-- Second bird smaller in background -->
    <path d="M 48 14 Q 56 7 64 14 Q 72 7 80 14" stroke="#94a3b8" stroke-width="1.8" fill="none" stroke-linecap="round" opacity="0.6"/>
  </svg>`;
}
