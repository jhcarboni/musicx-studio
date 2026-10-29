declare module 'soundfont-player' {
  export interface Player {
    play(note: string | number, time?: number, options?: {
      gain?: number;
      duration?: number;
      destination?: AudioNode;
      attack?: number;
      decay?: number;
      sustain?: number;
      release?: number;
    }): {
      stop(time?: number): void;
    };
    stop(time?: number): void;
  }

  export interface SoundfontOptions {
    soundfont?: 'MusyngKite' | 'FluidR3_GM';
    format?: 'mp3' | 'ogg';
    destination?: AudioNode;
  }

  export function instrument(
    ac: AudioContext,
    name: string,
    options?: SoundfontOptions
  ): Promise<Player>;

  export function nameToUrl(name: string, soundfont?: string, format?: string): string;
}
