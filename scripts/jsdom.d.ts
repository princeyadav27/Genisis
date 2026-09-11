// Minimal ambient types for the jsdom test harness (the package ships no types
// and is installed ad-hoc with --no-save, so we keep a local declaration).
declare module 'jsdom' {
  export class JSDOM {
    constructor(html: string, options?: any);
    window: any;
  }
}
