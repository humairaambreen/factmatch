import type LenisType from "lenis";

let _instance: LenisType | null = null;

export const lenisStore = {
  set(l: LenisType | null) { _instance = l; },
  stop() { _instance?.stop(); },
  start() { _instance?.start(); },
  resize() { _instance?.resize(); },
};
