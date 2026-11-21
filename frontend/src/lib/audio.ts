/**
 * Yangi buyurtma kelganda yoqimli xabar tovushi (Audio Chime) chalish.
 * Web Audio API yordamida brauzerning o'zida toza va professional sintez qilinadi.
 */
const SOFT_SOUND_KEY = 'mujiza_soft_sound';

/** Do‘kon ovozi sukut bo‘yicha o‘chiq. Headerdagi tugma 'on' qiladi. */
export function isSoftSoundEnabled() {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(SOFT_SOUND_KEY) === 'on';
  } catch {
    return false;
  }
}

export function setSoftSoundEnabled(enabled: boolean) {
  try {
    localStorage.setItem(SOFT_SOUND_KEY, enabled ? 'on' : 'off');
  } catch {}
}

/** Savatga qo‘shilganda juda past, qisqa shisha ohang. */
export function playSoftAddChime() {
  if (!isSoftSoundEnabled()) return;
  if (typeof window === 'undefined') return;

  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    gain.gain.setValueAtTime(0.035, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.12);
    osc.onended = () => ctx.close();
  } catch {}
}

export function playNewOrderChime() {
  if (typeof window === 'undefined') return;

  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();

    // 1-ohang (E5 - 659.25 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, ctx.currentTime);
    gain1.gain.setValueAtTime(0.15, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.4);

    // 2-ohang (G#5 - 830.61 Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(830.61, ctx.currentTime + 0.12);
    gain2.gain.setValueAtTime(0.2, ctx.currentTime + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.12);
    osc2.stop(ctx.currentTime + 0.6);

    // 3-ohang (B5 - 987.77 Hz - oltin akkord)
    const osc3 = ctx.createOscillator();
    const gain3 = ctx.createGain();
    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(987.77, ctx.currentTime + 0.25);
    gain3.gain.setValueAtTime(0.25, ctx.currentTime + 0.25);
    gain3.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.9);
    osc3.connect(gain3);
    gain3.connect(ctx.destination);
    osc3.start(ctx.currentTime + 0.25);
    osc3.stop(ctx.currentTime + 0.9);
  } catch {
    // brauzer ruxsat bermagan bo'lsa xato bermaydi
  }
}
