// ============================================================
// sounds.js - tiny sound effects made with the browser's Web Audio API.
// No audio files needed: every sound is generated from noise + simple tones.
// Docs: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
// ============================================================

// Overall loudness (0 to 1). Lower this number if the sounds are too loud.
const MASTER_VOLUME = 0.5;

let ctx = null; // the AudioContext (created the first time it's needed)
let master = null; // one volume knob that every sound goes through
let noiseBuffer = null; // a short burst of random noise we reuse
let muted = false;
const lastPlayed = {}; // remembers when each sound last played (so hovering can't spam it)

try {
  muted = localStorage.getItem("qb-muted") === "1";
} catch {
  // localStorage can be blocked (private window etc.) - just use the default
}

function getCtx() {
  if (!ctx) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    try {
      ctx = new AudioCtx();
    } catch {
      return null;
    }
  }
  return ctx;
}

// Browsers only allow sound after the person clicks/taps something.
// App.jsx calls this on the first click so audio is ready.
export function unlockAudio() {
  const c = getCtx();
  if (c && c.state === "suspended") {
    const p = c.resume();
    if (p && p.catch) p.catch(() => {});
  }
}

export function isMuted() {
  return muted;
}

export function setMuted(value) {
  muted = value;
  try {
    localStorage.setItem("qb-muted", value ? "1" : "0");
  } catch {
    // ignore
  }
}

// ---------- building blocks ----------
function out(c) {
  if (!master) {
    master = c.createGain();
    master.gain.value = MASTER_VOLUME;
    master.connect(c.destination);
  }
  return master;
}

function getNoise(c) {
  if (!noiseBuffer) {
    const length = c.sampleRate; // 1 second of noise
    noiseBuffer = c.createBuffer(1, length, c.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
  }
  return noiseBuffer;
}

// A short burst of filtered noise (clicks, rustles, hiss, scratches)
function burst(c, t, { dur = 0.04, type = "bandpass", freq = 2000, q = 1, gain = 0.1, attack = 0.003 }) {
  const src = c.createBufferSource();
  src.buffer = getNoise(c);
  const filter = c.createBiquadFilter();
  filter.type = type;
  filter.frequency.value = freq;
  filter.Q.value = q;
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(gain, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(filter);
  filter.connect(g);
  g.connect(out(c));
  src.start(t, Math.random() * 0.5);
  src.stop(t + dur + 0.02);
}

// A short musical beep that can slide from one pitch to another
function tone(c, t, { freq = 800, to = null, dur = 0.08, type = "sine", gain = 0.1 }) {
  const o = c.createOscillator();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
  const g = c.createGain();
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g);
  g.connect(out(c));
  o.start(t);
  o.stop(t + dur + 0.02);
}

const rand = (min, max) => min + Math.random() * (max - min);

// ---------- the sounds ----------
// Each sound is a function that schedules little bursts/tones starting at time t.
const SOUNDS = {
  // Machine buttons
  button(c, t) {
    tone(c, t, { freq: 700, to: 480, dur: 0.05, gain: 0.06 });
    burst(c, t, { dur: 0.015, type: "highpass", freq: 3500, gain: 0.07 });
  },
  // Printer: a row of quick mechanical clicks while the paper feeds out
  print(c, t) {
    for (let i = 0; i < 14; i++) {
      burst(c, t + i * 0.085, { dur: 0.04, freq: i % 2 ? 2300 : 1900, q: 2, gain: 0.07 });
    }
    tone(c, t, { freq: 90, dur: 1.15, type: "sawtooth", gain: 0.012 });
  },
  // Paper being scrunched up
  crumple(c, t) {
    for (let i = 0; i < 9; i++) {
      burst(c, t + rand(0, 0.38), {
        dur: rand(0.02, 0.05),
        type: "highpass",
        freq: rand(2200, 3800),
        gain: rand(0.05, 0.1),
      });
    }
  },
  // Ball dropping into the jar
  plop(c, t) {
    tone(c, t, { freq: 320, to: 110, dur: 0.13, gain: 0.1 });
    burst(c, t, { dur: 0.06, type: "lowpass", freq: 700, gain: 0.07 });
  },
  // Ball landing in the metal trash can
  clunk(c, t) {
    tone(c, t, { freq: 150, to: 70, dur: 0.2, type: "triangle", gain: 0.12 });
    burst(c, t, { dur: 0.1, freq: 520, q: 1.5, gain: 0.08 });
  },
  // Tiny glass "tink" for the jar lid
  tink(c, t) {
    tone(c, t, { freq: 2300, dur: 0.2, gain: 0.04 });
    tone(c, t, { freq: 3400, dur: 0.12, gain: 0.02 });
  },
  // Lamp switch
  lamp(c, t) {
    burst(c, t, { dur: 0.012, type: "highpass", freq: 3000, gain: 0.12 });
    tone(c, t, { freq: 1200, to: 800, dur: 0.02, type: "square", gain: 0.02 });
    burst(c, t + 0.07, { dur: 0.012, type: "highpass", freq: 2500, gain: 0.08 });
  },
  // Steam hiss
  steam(c, t) {
    burst(c, t, { dur: 0.8, freq: 3500, q: 0.4, gain: 0.03, attack: 0.2 });
  },
  // Leaves rustling
  rustle(c, t) {
    for (let i = 0; i < 8; i++) {
      burst(c, t + i * 0.08 + rand(0, 0.04), { dur: 0.07, freq: rand(3500, 5000), q: 0.8, gain: 0.035 });
    }
  },
  // Pen clicking (start and end of writing)
  penclick(c, t) {
    tone(c, t, { freq: 1800, dur: 0.015, type: "square", gain: 0.03 });
    tone(c, t + 0.05, { freq: 1300, dur: 0.015, type: "square", gain: 0.02 });
  },
  // Pen scratching on paper (starts after the pen has reached the note)
  scratch(c, t) {
    for (let i = 0; i < 22; i++) {
      burst(c, t + 1.1 + i * 0.1, { dur: 0.07, freq: rand(4200, 5600), q: 0.7, gain: 0.025 });
    }
  },
  // Knob ratchet
  ratchet(c, t) {
    for (let i = 0; i < 3; i++) {
      burst(c, t + i * 0.045, { dur: 0.015, freq: 2000, q: 2, gain: 0.09 });
    }
  },
  // Cutting the paper
  snip(c, t) {
    burst(c, t, { dur: 0.08, type: "highpass", freq: 4000, gain: 0.09 });
    burst(c, t + 0.09, { dur: 0.06, type: "highpass", freq: 4500, gain: 0.07 });
    tone(c, t, { freq: 2500, to: 1500, dur: 0.1, type: "triangle", gain: 0.025 });
  },
  // Trash lid rattle
  rattle(c, t) {
    [0, 0.07, 0.13, 0.2].forEach((d, i) => {
      burst(c, t + d, { dur: 0.05, freq: 900, q: 1.5, gain: 0.08 - i * 0.012 });
      tone(c, t + d, { freq: 230, dur: 0.05, type: "triangle", gain: 0.03 });
    });
  },
  // Copy / export / paper rustle / unmute
  copy(c, t) {
    tone(c, t, { freq: 880, dur: 0.07, gain: 0.05 });
    tone(c, t + 0.07, { freq: 1320, dur: 0.09, gain: 0.05 });
  },
  export(c, t) {
    tone(c, t, { freq: 520, dur: 0.08, gain: 0.05 });
    tone(c, t + 0.08, { freq: 780, dur: 0.1, gain: 0.05 });
    tone(c, t + 0.17, { freq: 1040, dur: 0.12, gain: 0.04 });
  },
  paper(c, t) {
    burst(c, t, { dur: 0.15, freq: 3000, q: 0.5, gain: 0.05, attack: 0.02 });
  },
  unmute(c, t) {
    tone(c, t, { freq: 700, dur: 0.07, gain: 0.05 });
  },
};

// How soon the same sound is allowed to play again (seconds)
const MIN_GAP = { tink: 0.5, button: 0.05, steam: 0.4 };

export function playSound(name) {
  if (muted || !SOUNDS[name]) return;
  const c = getCtx();
  if (!c) return;
  if (c.state === "suspended") unlockAudio();
  // If the browser still hasn't allowed audio (no click yet), skip quietly
  if (c.state !== "running") return;

  const now = c.currentTime;
  const gap = MIN_GAP[name] ?? 0.08;
  if (lastPlayed[name] !== undefined && now - lastPlayed[name] < gap) return;
  lastPlayed[name] = now;

  try {
    SOUNDS[name](c, now + 0.01);
  } catch (err) {
    console.error("Sound failed:", err);
  }
}
